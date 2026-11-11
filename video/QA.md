# QA report — Ruko demo film

Final file: `ruko-demo.mp4` (captioned, final pass). `ruko-demo-clean.mp4` is from the **first** pass (see *Known limitations*).

| Check | Method | Result |
|---|---|---|
| Runtime | ffprobe | **173.90 s (2:53.9)**; rule ≤ 3:00, target 2:40–2:55 ✔ |
| Format | ffprobe | H.264 High, 1920×1080, 30/1 fps, yuv420p, TV range, bt709; AAC-LC 48 kHz stereo ✔ |
| Loudness | `ebur128=peak=true` | **−16.0 LUFS** integrated, LRA 3.8 LU, true peak **−1.5 dBTP** (limit ≤ −1) ✔ |
| Black frames | `blackdetect=d=0.25:pic_th=0.98` | Final pass: **none** (first pass had 3 near-empty dark moments of 0.27–0.7 s at 0:37, 2:42 and 2:47; fixed) ✔ |
| Freezes | `freezedetect=n=0.001:d=4` | none ✔ |
| Dead air | `silencedetect=n=-45dB:d=2` | none. The deliberate hang-up silence (music cut after Kamala's line) lasts about 1 s, under the 2 s threshold ✔ |
| Watched every second | 1-fps contact sheets of the whole film (`out/qa/fps_1..5.jpg`), plus 20/55/90 % stills of every scene | Found and fixed: a phone covering the scene label (IRS, Trust), the bank meter row wrapping, the meter value shown as 98 when the screen said 100, "$7.7 billion" wrapping, the eval proof sitting too high, a small how-it-works diagram, and the empty frames above. No cut-off UI, collisions or stray cursors in the final sheets. |
| Transcript vs script | faster-whisper `small.en` on the rendered audio (`scripts/asr_check.py`, output `out/qa/asr.txt`) | All 33 lines match `VOICEOVER.md` word for word. Only ASR normalization differs: "Hinglish" heard as "english", "I am" as "I'm", digits for numbers. "Ruko" recognized correctly every time. |
| Mishearings fixed before render | Whisper on each voice clip | "Hindi for wait" → "weight"; "rules say safe" → "stay safe"; "the instant rules" → "Insta rules"; "No alarm" → "No, Aladdin". All rephrased and re-checked. |
| Caption sync | (1) Exact: each line's first caption frame vs the audible onset of its voice clip (−35 dBFS RMS, 10 ms window), `scripts/sync.py`. (2) Whisper phrase starts. | (1) **33/33 lines within ±80 ms** (−30 to −2 ms: the caption leads the sound by at most one frame). (2) Whisper median +0.094 s, range ±0.58 s, which is within Whisper's own phrase-start drift. Mid-line phrase changes use the engine's WordBoundary times. |
| Captions | visual | Max 2 lines (all phrases ≤ 52 chars fit on one), 46 px Noto Sans on a dark pill, current word highlighted, speaker tag on character lines, "Ruko" in the accent colour. `ruko.srt`: 65 cues, same timings, speaker tags. |
| No logos or real people | visual + source review | No logos, seals or brand marks. Brand names appear only as words inside the app's own sample transcripts ("FedEx", "Apple gift cards", "WhatsApp"). The callers' phones are drawn; no faces or photos. |
| Honest claims | `VOICEOVER.md` sources | Every number is from `eval/results.json`, the captured page text (`capture/*.txt`), or a primary source cited on screen (FBI IC3 2025 Annual Report; MHA reply via PIB). Unverifiable India loss figures were left out. |
| Real footage | capture log | Every product image is a Playwright capture of the app on `127.0.0.1:3100` with Claude Haiku 5.5 responding live (`capture/*_ai.json`: 32 of 32 AI calls returned 200). |

## Cuts and changes made during QA
- Script cut from 3:52 (first draft) to 2:53.9: callers voice only the line that matters, and "here's the sample call" became an on-screen label.
- The brief's "Real bank call stays green" became "No red flags, no warning. Just a gentle be careful", because the real app ends that call at 35 "Be careful" with the AI on. See PLAN.md, *Product finding*.
- The demo meter was relabelled to 100 to match the screen (rules saturate at 100; Claude said 98).

## Known limitations (stated plainly)
- **`ruko-demo-clean.mp4` is from the first render pass.** The final clean render was killed by the system for low memory. Compared with the final captioned film, it still has the three short near-empty dark moments (0.27–0.7 s at 0:37, 2:42, 2:47). Content, audio and length are otherwise identical. Re-render it with `CLEAN=1 bash scripts/master.sh` (or render only the clean composition) when the machine has memory to spare.
- **Audio was not judged by ear.** It was checked by loudness, silence detection and transcription only. Listen once yourself, especially the phone-EQ caller voices and the hang-up silence.
- The voices are synthetic (edge-tts) and could be read as such.
- File size is 360 MB (CRF 18, mostly from the animated film grain). Fine for a YouTube upload.
- The capture ran the AI through OpenRouter (same model id) instead of Vercel AI Gateway, because that was the key available.
