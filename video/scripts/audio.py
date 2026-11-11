"""Original music bed + sound design, synthesized from scratch (no third-party audio, no licences).

Cues come from narration.json:
  scene "reveal": true            -> low impact on its first line; the arpeggio starts here (default: 3rd scene)
  "clicks": [[line, word], ...]   -> soft camera-shutter clicks (e.g. on the hook's key words)
  "ticks":  [[line, word], ...]   -> quiet UI ticks (e.g. as numbers are revealed)
The first scene gets a low heartbeat pulse; the last scene gets the resolution chord and an impact.

  python scripts/audio.py     # reads src/timeline.json, writes public/audio/bed.wav and public/noise.png

Everything is cued from the same timeline the video uses: transitions get a soft whoosh, the
hook and the product reveal get a low impact, a few spoken words get a quiet tick, and the music
ducks under every narration line."""
import json, pathlib
import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt

ROOT = pathlib.Path(__file__).resolve().parent.parent
tl = json.loads((ROOT / "src/timeline.json").read_text(encoding="utf8"))
cfg = json.loads((ROOT / "narration.json").read_text(encoding="utf8"))
SR, FPS = 48000, tl["fps"]
N = int((tl["total"] / FPS + 0.5) * SR)
rng = np.random.default_rng(7)
sec = lambda f: f / FPS
scene = {s["id"]: s for s in tl["scenes"]}
line = {l["id"]: l for l in tl["lines"]}


def word_at(lid, word, nth=0):
    nth = int(nth)
    hits = [w for w in line[lid]["words"] if w["w"].lower().strip(",.?!:;") == word.lower()]
    return sec(line[lid]["from"] + hits[nth]["f"])


def env(n, a, r):
    e = np.ones(n)
    a, r = int(a * SR), int(r * SR)
    e[:a] = np.linspace(0, 1, a) ** 2
    if r:
        e[-r:] *= np.linspace(1, 0, r) ** 2
    return e


def hz(midi):
    return 440 * 2 ** ((midi - 69) / 12)


# ---------------- music ----------------
def pad_voice(f, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    out = np.zeros(n)
    for det in (-0.06, 0.0, 0.07):  # three detuned voices, soft harmonic roll-off
        ff = f * 2 ** (det / 12)
        for h in range(1, 7):
            out += np.sin(2 * np.pi * ff * h * t + rng.uniform(0, 6.28)) / h ** 1.8
    return out * (1 + 0.12 * np.sin(2 * np.pi * 0.17 * t))


def pluck(f, dur=2.2):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) * np.exp(-t * 6) + 0.12 * np.sin(6 * np.pi * f * t) * np.exp(-t * 9)
    return s * np.exp(-t * 2.4) * np.minimum(1, t * 400)


music = np.zeros((N, 2))
# Am(add9) - Fmaj7 - C(add9) - G6, voiced low; one chord per 4.8 s
prog = [[45, 52, 57, 59, 60], [41, 48, 53, 57, 64], [48, 55, 60, 62, 64], [43, 50, 55, 59, 64]]
CH = 4.8
REVEAL = next((s["id"] for s in cfg["scenes"] if s.get("reveal")), tl["scenes"][min(2, len(tl["scenes"]) - 1)]["id"])
FIRST, LAST = tl["scenes"][0]["id"], tl["scenes"][-1]["id"]
reveal_t = sec(scene[REVEAL]["from"] + 6)
close_t = sec(scene[LAST]["from"])
t0 = 0.0
k = 0
while t0 < close_t - 0.5:
    dur = min(CH, close_t - t0) + 2.2
    chord = prog[k % 4]
    v = sum(pad_voice(hz(m), dur) for m in chord) * env(int(dur * SR), 1.6, 2.2)
    a = int(t0 * SR); b = min(N, a + len(v))
    music[a:b, 0] += v[: b - a] * 0.9
    music[a:b, 1] += v[: b - a]
    # sparse arpeggio after the product reveal
    if t0 >= reveal_t - 0.1:
        for j, m in enumerate([chord[2] + 12, chord[3] + 12, chord[4] + 12, chord[3] + 12]):
            p = pluck(hz(m)); s = int((t0 + j * CH / 4) * SR); e = min(N, s + len(p))
            pan = 0.35 + 0.3 * (j % 2)
            music[s:e, 0] += p[: e - s] * 0.55 * (1 - pan)
            music[s:e, 1] += p[: e - s] * 0.55 * pan
    t0 += CH; k += 1
# resolution: C major add9 with a high bell on the end card
res = [36, 48, 55, 60, 64, 67, 74]
dur = N / SR - close_t
v = sum(pad_voice(hz(m), dur) for m in res) * env(int(dur * SR), 0.8, 3.0)
a = int(close_t * SR); music[a:a + len(v), 0] += v[: N - a]; music[a:a + len(v), 1] += v[: N - a]
for j, m in enumerate([72, 76, 79, 84]):
    p = pluck(hz(m), 3.5); s = int((close_t + 0.25 + j * 0.18) * SR); e = min(N, s + len(p))
    music[s:e] += (p[: e - s] * 0.5)[:, None]

# low heartbeat pulse under the hook only
for bt in np.arange(0.3, sec(scene[FIRST]["dur"]) - 0.3, 1.25):
    n = int(0.35 * SR); t = np.arange(n) / SR
    thump = np.sin(2 * np.pi * (55 - 20 * t) * t) * np.exp(-t * 14)
    s = int(bt * SR); music[s:s + n] += (thump * 0.9)[:, None]

# gentle low-pass and room
sos = butter(2, 3800, "low", fs=SR, output="sos")
music = sosfilt(sos, music, axis=0)
ir_n = int(2.6 * SR); ir_t = np.arange(ir_n) / SR
ir = np.stack([rng.standard_normal(ir_n), rng.standard_normal(ir_n)], 1) * np.exp(-ir_t / 0.75)[:, None]
ir[0] += 6
wet = np.stack([fftconvolve(music[:, c], ir[:, c])[:N] for c in range(2)], 1)
music = music + 0.25 * wet / np.abs(ir).sum(0) * 40

# ducking: -9 dB under narration, smoothed
speech = np.zeros(N)
for l in tl["lines"]:
    a = int(sec(l["from"]) * SR); b = int(sec(l["from"] + l["dur"]) * SR)
    speech[a:b] = 1
k = int(0.35 * SR)
c = np.concatenate([[0], np.cumsum(speech)])
speech = (c[np.clip(np.arange(N) + k // 2, 0, N)] - c[np.clip(np.arange(N) - k // 2, 0, N)]) / k
gain = 10 ** (-10 * np.clip(speech * 1.6, 0, 1) / 20)
music *= gain[:, None]
music *= 10 ** (-20 / 20) / (np.abs(music).max() + 1e-9)  # music peaks at -20 dBFS (bed level)
HANG = cfg.get("hangup")  # [line that ends just before the hang-up, line that follows]
if HANG:
    h0 = sec(line[HANG[0]]["from"] + line[HANG[0]]["dur"]); h1 = sec(line[HANG[1]]["from"])
    t = np.arange(N) / SR
    mute = np.clip(np.minimum((h0 + 0.05 - t) / 0.25 + 0, 1), 0, 1)  # fast fade out at the hang-up
    mute = np.maximum(mute, np.clip((t - (h1 + 0.3)) / 2.5, 0, 1))      # slow return under the next line
    music *= mute[:, None]

# ---------------- sound effects ----------------
sfx = np.zeros((N, 2))


def put(sig, t, g=1.0, pan=0.5):
    s = int(t * SR); e = min(N, s + len(sig))
    if s >= N or e <= 0:
        return
    sfx[s:e, 0] += sig[: e - s] * g * (1 - pan) * 2
    sfx[s:e, 1] += sig[: e - s] * g * pan * 2


def whoosh(d=0.7):
    n = int(d * SR); t = np.arange(n) / SR
    x = rng.standard_normal(n)
    out, y = np.zeros(n), 0.0
    for i in range(n):  # one-pole low-pass with a swept cutoff
        c = 0.02 + 0.22 * np.sin(np.pi * i / n) ** 2
        y += c * (x[i] - y); out[i] = y
    return out * np.sin(np.pi * t / d) ** 2 * 1.6


def impact(d=2.2):
    n = int(d * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * (48 * t - 6 * t * t)) * np.exp(-t * 2.2)
    nz = sosfilt(butter(2, 900, "low", fs=SR, output="sos"), rng.standard_normal(n)) * np.exp(-t * 9) * 0.6
    return (body + nz) * np.minimum(1, t * 300)


def click():
    n = int(0.06 * SR); t = np.arange(n) / SR
    nz = sosfilt(butter(2, 2500, "high", fs=SR, output="sos"), rng.standard_normal(n))
    return nz * (np.exp(-t * 160) + 0.6 * np.exp(-np.maximum(0, t - 0.028) * 200) * (t > 0.028))


def tick(f=1650):
    n = int(0.09 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 55)


first_line = {l["scene"]: l for l in reversed(tl["lines"])}
put(impact(), 0.05, 0.55)
for lid, w in cfg.get("clicks", []):
    put(click(), word_at(lid, w) - 0.02, 0.22, 0.45)
for s in tl["scenes"][1:]:
    if s["id"] in (REVEAL, LAST):
        continue
    put(whoosh(), sec(s["from"]) - 0.1, 0.10, 0.45)
put(whoosh(1.1), sec(scene[REVEAL]["from"]) - 0.4, 0.14)
if REVEAL in first_line:
    put(impact(), sec(scene[REVEAL]["from"] + first_line[REVEAL]["local"]) - 0.02, 0.45)
put(whoosh(1.0), sec(scene[LAST]["from"]) - 0.3, 0.12)
if LAST in first_line:
    put(impact(3.0), sec(scene[LAST]["from"] + first_line[LAST]["local"]) - 0.02, 0.4)
for i, tk in enumerate(cfg.get("ticks", [])):
    put(tick(1500 - 100 * (i % 4)), word_at(*tk), 0.16)


def ring(f1, f2, on, off, reps, start, pan):
    """Telephone ringback: two summed tones, gated (US: 440+480 Hz 2s on; India: 375+425 Hz double ring)."""
    t0 = start
    for _ in range(reps):
        for d in on:
            n = int(d * SR); tt = np.arange(n) / SR
            sig = (np.sin(2 * np.pi * f1 * tt) + np.sin(2 * np.pi * f2 * tt)) * 0.5 * env(n, 0.01, 0.03)
            sig = sosfilt(butter(2, [300, 3400], "band", fs=SR, output="sos"), sig)
            put(sig, t0, 0.10, pan); t0 += d + 0.2
        t0 += off


# cold open: Ohio rings on the left, Pune on the right, until the callers speak
c1 = sec(line[cfg["ring_until"]]["from"])
ring(440, 480, [1.0], 0.5, 1, 0.15, 0.25)
ring(375, 425, [0.4, 0.4], 0.3, 1, 0.55, 0.75)


def swell(d=3.2):
    n = int(d * SR); tt = np.arange(n) / SR
    s1 = sum(np.sin(2 * np.pi * f * tt) / (k + 1) for k, f in enumerate([41.2, 61.7, 82.4]))
    return s1 * np.sin(np.pi * tt / d) ** 2


def hangup_click():
    n = int(0.12 * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * 900 * tt) * np.exp(-tt * 40) + sosfilt(butter(2, 1200, "high", fs=SR, output="sos"), rng.standard_normal(n)) * np.exp(-tt * 90) * 0.4)


if cfg.get("swell"):
    put(swell(), word_at(*cfg["swell"]) - 0.4, 0.5)
if HANG:
    put(hangup_click(), sec(line[HANG[0]]["from"] + line[HANG[0]]["dur"]) + 0.15, 0.25)

mix = music + sfx * 10 ** (-12 / 20)
peak = np.abs(mix).max()
mix *= min(1.0, 10 ** (-6 / 20) / peak)
out = ROOT / "public/audio"; out.mkdir(parents=True, exist_ok=True)
import wave
with wave.open(str(out / "bed.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype("<i2").tobytes())
print(f"bed.wav {N/SR:.1f}s peak {20*np.log10(np.abs(mix).max()):.1f} dBFS")

# film grain tile for the background
from PIL import Image
g = rng.normal(128, 40, (512, 512)).clip(0, 255).astype("uint8")
Image.fromarray(g, "L").save(ROOT / "public/noise.png")
