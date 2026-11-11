"""Narration -> per-line voice clips + caption phrases + absolute timeline.

  python scripts/voiceover.py          # synthesize changed lines, rebuild src/timeline.json

Writes public/vo/<line>.mp3 (edge-tts, cached by text hash) and src/timeline.json:
scenes (from/dur in frames, mirroring TransitionSeries overlap) and lines (absolute frame,
duration, caption phrases timed from the engine's own word boundaries)."""
import asyncio, hashlib, json, math, pathlib, re, subprocess

ROOT = pathlib.Path(__file__).resolve().parent.parent
cfg = json.loads((ROOT / "narration.json").read_text(encoding="utf8"))
VO = ROOT / "public/vo"
VO.mkdir(parents=True, exist_ok=True)
FPS, T = cfg["fps"], cfg["transition"]
TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}")
MAX_PHRASE = 52  # chars per caption line


def segments(text):
    """[(display, spoken)] so caption positions can be mapped to spoken positions."""
    out, i = [], 0
    for m in TOK.finditer(text):
        out.append((text[i:m.start()], text[i:m.start()]))
        out.append((m[1], m[2]))
        i = m.end()
    out.append((text[i:], text[i:]))
    return out


def disp_to_spoken(segs, pos):
    d = s = 0
    for disp, spok in segs:
        if pos <= d + len(disp):
            off = pos - d
            return s + (off if disp == spok else round(off * len(spok) / max(1, len(disp))))
        d += len(disp); s += len(spok)
    return s


async def synth(line, spoken, mp3, meta, rate, voice, pitch):
    import edge_tts
    words = []
    com = edge_tts.Communicate(spoken, voice, rate=rate, pitch=pitch, boundary="WordBoundary")
    with open(mp3, "wb") as f:
        async for ch in com.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                words.append({"t": ch["offset"] / 1e7, "d": ch["duration"] / 1e7, "w": ch["text"]})
    if line.get("phone"):  # caller on a phone line: 300 Hz-3.4 kHz band-pass + a little saturation
        tmp = mp3.with_suffix(".raw.mp3"); mp3.replace(tmp)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-af",
                        "highpass=f=300:poles=2,lowpass=f=3400:poles=2,volume=4dB,asoftclip=type=tanh,volume=-2dB",
                        "-c:a", "libmp3lame", "-q:a", "2", str(mp3)], check=True)
        tmp.unlink()
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(mp3)]).decode())
    meta.write_text(json.dumps({"spoken": spoken, "voice": voice, "rate": rate, "duration": dur, "words": words}, indent=1), encoding="utf8")


def phrases(display, segs, spoken, words):
    # locate every boundary word inside the spoken string
    pos, marks = 0, []
    for w in words:
        k = spoken.find(w["w"], pos)
        if k < 0:
            continue
        marks.append((k, k + len(w["w"]), w["t"], w["t"] + w["d"]))
        pos = k + len(w["w"])

    def t_at(sp, end=False):
        if end:
            cands = [m for m in marks if m[0] < sp]
            return cands[-1][3] if cands else marks[0][3]
        cands = [m for m in marks if m[1] > sp]
        return cands[0][2] if cands else marks[-1][2]

    # split display text at sentence / clause boundaries, then by length
    parts, chunks = re.split(r"(?<=[.?!:;,])\s+", display.strip()), []
    for p in parts:
        if chunks and len(chunks[-1]) + 1 + len(p) <= MAX_PHRASE and not re.search(r"[.?!]$", chunks[-1]):
            chunks[-1] += " " + p
        elif len(p) <= MAX_PHRASE:
            chunks.append(p)
        else:  # wrap long clause into balanced pieces
            ws, n = p.split(), math.ceil(len(p) / MAX_PHRASE)
            per = math.ceil(len(ws) / n)
            chunks += [" ".join(ws[i:i + per]) for i in range(0, len(ws), per)]
    out, cur = [], 0
    for c in chunks:
        a = display.index(c, cur); b = a + len(c); cur = b
        out.append({"text": c, "start": round(t_at(disp_to_spoken(segs, a)), 3),
                    "end": round(t_at(disp_to_spoken(segs, b), end=True), 3)})
    for i in range(len(out) - 1):  # hold each phrase until the next begins (no flicker)
        out[i]["end"] = max(out[i]["end"], out[i + 1]["start"] - 0.001)
    return out


async def main():
    scenes, lines, start, prev_dur = [], [], 0, None
    for si, sc in enumerate(cfg["scenes"]):
        if prev_dur is not None:
            start += prev_dur - T
        cursor = sc["lead"]
        for ln in sc["lines"]:
            segs = segments(ln["text"])
            display = "".join(d for d, _ in segs)
            spoken = "".join(s for _, s in segs)
            ch = cfg.get("cast", {}).get(ln.get("who", ""), {})
            voice = ch.get("voice", cfg["voice"])
            rate = ln.get("rate", ch.get("rate", cfg["rate"]))
            pitch = ch.get("pitch", "+0Hz")
            phone = ch.get("phone", False); ln = {**ln, "phone": phone}
            h = hashlib.sha1(f'{voice}|{rate}|{pitch}|{phone}|{spoken}'.encode()).hexdigest()[:10]
            mp3, meta = VO / f'{ln["id"]}.mp3', VO / f'{ln["id"]}.json'
            old = json.loads(meta.read_text(encoding="utf8")) if meta.exists() else {}
            if old.get("hash") != h or not mp3.exists():
                await synth(ln, spoken, mp3, meta, rate, voice, pitch)
                m = json.loads(meta.read_text(encoding="utf8")); m["hash"] = h
                meta.write_text(json.dumps(m, indent=1), encoding="utf8")
                print("synth", ln["id"])
            m = json.loads(meta.read_text(encoding="utf8"))
            dur_f = math.ceil(m["duration"] * FPS)
            lines.append({"id": ln["id"], "scene": sc["id"], "from": start + cursor, "local": cursor,
                          "dur": dur_f, "src": f'vo/{ln["id"]}.mp3', "text": display, "who": ch.get("label", ""),
                          "phrases": phrases(display, segs, spoken, m["words"]),
                          "words": [{"w": w["w"], "f": round(w["t"] * FPS)} for w in m["words"]]})
            cursor += dur_f + ln.get("gap", cfg.get("gap", 0))
        dur = cursor + sc["tail"]
        scenes.append({"id": sc["id"], "from": start, "dur": dur})
        prev_dur = dur
    total = scenes[-1]["from"] + scenes[-1]["dur"]
    out = {"fps": FPS, "transition": T, "total": total, "scenes": scenes, "lines": lines}
    (ROOT / "src").mkdir(exist_ok=True)
    (ROOT / "src/timeline.json").write_text(json.dumps(out, indent=1), encoding="utf8")
    # subtitle file for players/platforms (same phrases and timings as the burned-in captions)
    ts = lambda x: f"{int(x // 3600):02d}:{int(x % 3600 // 60):02d}:{int(x % 60):02d},{int(round(x % 1 * 1000)) % 1000:03d}"
    cues = [(l["from"] / FPS + p["start"], l["from"] / FPS + p["end"] + 4 / FPS, p["text"]) for l in lines for p in l["phrases"]]
    srt = "\n".join(f"{i}\n{ts(a)} --> {ts(min(b, cues[i][0] if i < len(cues) else b))}\n{t}\n" for i, (a, b, t) in enumerate(cues, 1))
    (ROOT / "captions").mkdir(exist_ok=True)
    (ROOT / "captions/film.srt").write_text(srt, encoding="utf8")
    for s in scenes:
        print(f'{s["id"]:9s} {s["from"]/FPS:6.2f}s  +{s["dur"]/FPS:5.2f}s')
    print(f"total {total} frames = {total/FPS:.2f}s, speech {sum(l['dur'] for l in lines)/FPS:.1f}s")

asyncio.run(main())
