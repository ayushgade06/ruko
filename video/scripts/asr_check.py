"""QA: transcribe the rendered film with Whisper and check caption timing against what is heard.

  python scripts/asr_check.py out/film.mp4

Prints the transcript per narration line and, for every caption phrase, the gap between the
caption appearing and the first matching word actually being spoken."""
import json, pathlib, re, subprocess, sys, tempfile
from faster_whisper import WhisperModel

ROOT = pathlib.Path(__file__).resolve().parent.parent
tl = json.loads((ROOT / "src/timeline.json").read_text(encoding="utf8"))
video = sys.argv[1]
wav = pathlib.Path(tempfile.gettempdir()) / "cs_asr.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", str(wav)], check=True)

model = WhisperModel("small.en", device="cpu", compute_type="int8")
import wave, numpy as np
with wave.open(str(wav)) as w:
    pcm = np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(np.float32) / 32768
segs, _ = model.transcribe(pcm, word_timestamps=True, vad_filter=False, beam_size=5)
words = [(w.start, w.end, re.sub(r"[^a-z0-9']", "", w.word.lower())) for s in segs for w in s.words]
print("ASR words:", len(words))

norm = lambda t: [re.sub(r"[^a-z0-9']", "", x.lower()) for x in t.split()]
offs = []
for l in tl["lines"]:
    a, b = l["from"] / tl["fps"], (l["from"] + l["dur"]) / tl["fps"]
    heard = " ".join(w[2] for w in words if a - 0.3 <= w[0] <= b + 0.3)
    print(f"\n[{l['id']}] {l['text']}\n   heard: {heard}")
    for p in l["phrases"]:
        t = a + p["start"]
        first = norm(p["text"])[0]
        near = [w for w in words if abs(w[0] - t) < 1.5 and (w[2] == first or w[2].startswith(first[:4]))]
        if near:
            d = min((w[0] - t for w in near), key=abs)
            offs.append(d)
            if abs(d) > 0.25:
                print(f"   ! phrase '{p['text']}' caption {t:.2f}s, spoken {t + d:.2f}s ({d:+.2f}s)")
        else:
            print(f"   ? no ASR match for phrase start '{first}' near {t:.2f}s")
if offs:
    offs.sort()
    print(f"\ncaption->speech offset over {len(offs)} phrases: median {offs[len(offs)//2]:+.3f}s, "
          f"min {offs[0]:+.3f}s, max {offs[-1]:+.3f}s")
