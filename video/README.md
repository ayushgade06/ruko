# Ruko demo film (IceHacks 2026)

| File | What |
|---|---|
| `ruko-demo.mp4` | Final film, captions burned in (not committed) |
| `ruko-demo-clean.mp4` | Same film, no captions (not committed) |
| `ruko.srt` | Subtitles (same phrases and timings as the burned-in captions, with speaker tags) |
| `PLAN.md` | Scene-by-scene plan, judging-criteria mapping, honesty notes |
| `VOICEOVER.md` | Script with timestamps and a source next to every fact |
| `CREDITS.md` | Voices, fonts, music, data sources, AI-tool disclosure |
| `QA.md` | Every check, method and result |
| `src/` | Remotion source (one component per scene in `src/scenes/`) |
| `narration.json` | The script: lines, cast (voices), pauses, sound cues |

## Reproduce (local only; nothing is deployed or uploaded)
```bash
# 1. the app, with an AI key in ../.env.local (AI_GATEWAY_API_KEY or OPENROUTER_API_KEY)
cd .. && npm run build && npx next start -H 127.0.0.1 -p 3100
# 2. the film
cd video && npm install
node scripts/capture-ruko.mjs          # real captures -> public/shots/*.png + *.json boxes, capture/*.txt
python scripts/voiceover.py            # edge-tts voices + word timings -> src/timeline.json
python scripts/audio.py                # original music + SFX -> public/audio/bed.wav
python scripts/sync.py                 # snap caption starts to audible onsets
python scripts/srt.py                  # ruko.srt
node scripts/stills.mjs && python scripts/sheet.py   # preview stills
bash scripts/master.sh                 # render + master (captioned and clean), ~20-40 min
python scripts/asr_check.py out/film.mp4             # transcript + caption-sync check
```
`master.sh` writes `out/film.mp4` / `out/film_clean.mp4`; the deliverables are those files copied to `video/ruko-demo.mp4` and `video/ruko-demo-clean.mp4`.
Captures depend on live AI answers, so a re-capture can word the "Say this" lines differently. If it does, update `d7`/`i3` in `narration.json` and the quotes in `src/scenes/Demo.tsx` / `Calls.tsx` to match.
