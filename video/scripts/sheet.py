"""Tile QA stills (scene order) into contact sheets: python scripts/sheet.py [prefix]"""
import json, pathlib, sys
from PIL import Image, ImageDraw
root = pathlib.Path(__file__).resolve().parent.parent
tl = json.loads((root / "src/timeline.json").read_text())
qa = root / "out/qa"
names = [f"{s['id']}_{p}" for s in tl["scenes"] for p in (20, 55, 90)]
for k in range(0, len(names), 12):
    sheet = Image.new("RGB", (1920, 1440), "black")
    for i, n in enumerate(names[k:k + 12]):
        im = Image.open(qa / f"{n}.jpg").resize((640, 360))
        ImageDraw.Draw(im).text((8, 6), n, fill="yellow")
        sheet.paste(im, ((i % 3) * 640, (i // 3) * 360))
    sheet.save(root / f"out/sheet{k // 12 + 1}.jpg", quality=88)
    print(f"out/sheet{k // 12 + 1}.jpg")
