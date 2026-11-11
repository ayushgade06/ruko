"""Write ruko.srt from src/timeline.json (same phrases/timings as the burned-in captions), with speaker tags."""
import json, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
tl = json.loads((ROOT / "src/timeline.json").read_text(encoding="utf8"))
FPS = tl["fps"]
ts = lambda x: f"{int(x // 3600):02d}:{int(x % 3600 // 60):02d}:{int(x % 60):02d},{int(round(x % 1 * 1000)) % 1000:03d}"
cues = []
for l in tl["lines"]:
    for p in l["phrases"]:
        a = (l["from"] + round(p["start"] * FPS)) / FPS
        b = (l["from"] + round(p["end"] * FPS) + 4) / FPS
        cues.append([a, b, (f"[{l['who']}] " if l["who"] else "") + p["text"]])
for i in range(len(cues) - 1):
    cues[i][1] = min(cues[i][1], cues[i + 1][0] - 0.001)
out = "\n".join(f"{i}\n{ts(a)} --> {ts(b)}\n{t}\n" for i, (a, b, t) in enumerate(cues, 1))
(ROOT / "ruko.srt").write_text(out, encoding="utf8")
print(len(cues), "cues ->", ROOT / "ruko.srt")
