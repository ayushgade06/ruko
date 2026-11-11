"""Snap each line's first caption phrase to the measured audible onset of its voice clip.
edge-tts word boundaries can start up to ~180 ms before the sound is audible; this keeps captions within ±80 ms.
Run after voiceover.py:  python scripts/sync.py   (rewrites src/timeline.json phrase starts, then run srt.py)"""
import json, pathlib, subprocess, numpy as np
ROOT = pathlib.Path(__file__).resolve().parent.parent
p = ROOT / "src/timeline.json"; tl = json.loads(p.read_text(encoding="utf8"))

def onset(src):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ROOT / "public" / src), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, "<i2").astype(np.float32) / 32768
    rms = np.sqrt(np.convolve(x ** 2, np.ones(160) / 160, "same"))
    return np.argmax(20 * np.log10(rms + 1e-9) > -35) / 16000

errs = []
for l in tl["lines"]:
    o = onset(l["src"])
    l["onset"] = round(o, 3)
    first = l["phrases"][0]
    # the frame closest to the onset, never more than one frame early
    first["start"] = round(max(first["start"], round(o * 30 - 0.5) / 30), 3)
    errs.append(round(first["start"] * 30) / 30 - o)
p.write_text(json.dumps(tl, indent=1), encoding="utf8")
e = np.array(errs)
print(f"first-phrase caption vs audible onset: median {np.median(e)*1000:+.0f} ms, min {e.min()*1000:+.0f}, max {e.max()*1000:+.0f}, within ±80 ms: {(abs(e) <= 0.08).sum()}/{len(e)}")
