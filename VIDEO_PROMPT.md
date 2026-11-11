/make-video

Make the IceHacks 2026 demo film for **Ruko**, the project in `D:\icehacks`. Before writing anything, read `PRD.md` (especially §1, §8, §9 and the "Demo video structure" table in §12), `README.md`, `lib/demos.ts`, `lib/rules.ts` and `eval/results.json`. Those files are the source of truth for every claim in the film.

## Hard constraints (do not break)
- **Length 2:40–2:55, never over 3:00.** Devpost rule: projects without a working ≤3-min video aren't judged. 1920×1080, 30 fps, MP4 (H.264 + AAC), loudness −16 LUFS integrated, true peak ≤ −1 dBTP.
- **Local only.** Never deploy the app, never push to any server, never upload the video anywhere. Run the app only on `127.0.0.1` (`npm run build && npx next start -H 127.0.0.1 -p 3100`). The final MP4 stays on disk; I'll upload it to YouTube myself.
- **Honest claims only.** Every number on screen or in the voiceover must come from `eval/results.json` or a public source that you cite on screen (FTC Consumer Sentinel, FBI IC3 Elder Fraud Report, India I4C / PIB). If you can't verify a loss figure, leave it out. Never invent stats, quotes or testimonials.
- **Don't fake the product.** All product shots are real screen captures of the running app. If `.env.local` has no `AI_GATEWAY_API_KEY`, the app shows "Basic check only". In that case, either stop and ask me to add the key before capturing, or capture in rules-only mode and say only what's true ("instant on-device rules; an AI layer double-checks when connected"). Never mock up an AI verdict that the app didn't produce.
- **No real brands or people.** No IRS seal, FedEx, Microsoft or bank logos, and no real faces. Use text, icons and fictional names (as in `lib/demos.ts`). Music and SFX must be original or explicitly royalty-free/CC0, with credits written to `video/CREDITS.md`.

## Voice: Microsoft "Ava" via edge-tts
- **Narrator:** `en-US-AvaMultilingualNeural`, falling back to `en-US-AvaNeural` if it's unavailable. Rate about −4%, pitch +0Hz. The tone is warm, calm and confident, like a trusted friend and not an ad. Write for the ear: short sentences, contractions, one idea per line. Use SSML-style pauses (commas, "…") around the reveal moments.
- **Character voices for the dramatized calls** (also edge-tts, fictional characters):
  - Fake "CBI officer": `en-IN-PrabhatNeural`, slightly low pitch.
  - Grandmother Kamala: `en-IN-NeerjaNeural`, slower rate.
  - Fake "IRS agent": `en-US-GuyNeural` or `en-US-AndrewNeural`.
  - Frank, the US grandfather: `en-US-ChristopherNeural`, slower rate.
  - Run a light phone-line EQ (300 Hz–3.4 kHz band-pass plus a little saturation) on the caller lines only.
- **Captions:** generate word-timed captions from edge-tts **WordBoundary** events (offsets are in 100-ns units, so convert correctly). If a voice returns sparse or missing boundaries, run forced alignment instead (faster-whisper with word timestamps) and use those. Captions should be big, high-contrast and accessibility-first, with 2 lines max and the current word highlighted. Export `ruko.srt`.
- **Humanize it:** natural breaths and pauses between sections, no wall-to-wall talking, and music ducking −10 dB under the voice.

## Story (map every beat to the five judging criteria)
Theme: **"Same script. Every country."** The one decision Ruko makes: **during** the call, it decides "this is a scam" and tells you what to say, before money moves.

| Time | Beat | What's on screen |
|---|---|---|
| 0:00–0:18 | Cold open, split screen: Ohio and Pune at the same moment | Two stylized phone UIs ringing ("Unknown caller"). Caller audio: "This is the IRS. There's a warrant for your arrest…" / "This is CBI officer Sharma. You are under digital arrest…" Kinetic type: **Same script. Every country.** |
| 0:18–0:38 | The problem: authority + fear + isolation + an unusual payment | Four words build up as a formula. One cited stat per country (only if verified). "Caller ID only knows numbers that were already reported. Awareness only helps before the call. Nothing helps *during* it." |
| 0:38–0:48 | Reveal | Ruko logo and "रुको · wait". VO: "Ruko is a calm second voice in the room." |
| 0:48–1:45 | **Live demo, the hero.** Real capture of `/listen` running the "Digital arrest" sample call (then a quick cut to IRS) | The phone sits in a device frame with the camera slowly pushing in. Highlight one thing at a time: the transcript line, then the flag card with the quoted words, the meter climbing Safe → Caution → Danger, the "Say this" line (Kamala reads it out loud and hangs up), the red **"Hang up. This is a scam."** banner, and *Tell family* |
| 1:45–2:00 | No false alarm | The "Real bank call" sample stays green. VO: "And when it's real, Ruko stays quiet." |
| 2:00–2:10 | Check a message | Paste a fake "electricity disconnected" SMS on `/check` and show the verdict |
| 2:10–2:35 | How it's built, laid out as CLAIM → EVIDENCE → VERDICT | Diagram: mic → on-device rules (13 tactics, EN/HI/Hinglish) + Claude via AI Gateway → `max()` → a meter that never drops. Show the eval table from `/how-it-works` with the real numbers. Privacy line: "No accounts. No audio leaves the device." Accessibility line: big type, screen-reader announcements, Hindi |
| 2:35–2:52 | Impact + what's next + close | Android call screening, more languages, bank/NGO partners. End card: **Ruko — wait before you pay.**, the repo name, and "Built with Next.js · AI SDK · Claude · Web Speech API". Credit Claude Code as an AI tool used (IceHacks rule) |

## Capture
- Use Playwright against `http://127.0.0.1:3100`, viewport 430×932 (phone) at `deviceScaleFactor: 3` for the hero shots and 1440×900 for desktop shots. Use dark mode and light mode deliberately; pick one per sequence.
- The app's demo calls use browser text-to-speech. **Mute it during capture** and replace it with the edge-tts character tracks in the edit, timed to when each transcript line appears.
- Capture clean: no cursor, no dev overlays, and wait for fonts to load. Record one take per sample call, plus stills for the camera moves.

## Craft bar
Art-directed, not a slideshow. Kinetic type, slow camera pushes over real screenshots, one highlight at a time, and a consistent palette taken from `app/globals.css` (teal accent #0d5c6b / #6cc0cf, danger #b3261e, paper #f7f4ee) with the Fraunces + Noto Sans fonts the app uses. Sound design: a phone ring, a soft "tick" each time a flag appears, and a low swell at Danger, then silence on the hang-up. An original, understated music bed.

## Deliverables (in `D:\icehacks\video\`)
`ruko-demo.mp4` (with captions burned in), `ruko-demo-clean.mp4`, `ruko.srt`, the Remotion source, `PLAN.md`, `VOICEOVER.md` (script, with a source next to every fact), `CREDITS.md`, and `QA.md`. Add `video/out/` and any large files to `.gitignore`. Don't commit renders unless I ask.

## QA before you call it done
Watch every second of the render. Transcribe the final audio and diff it against `VOICEOVER.md`. Check caption sync (within ±80 ms), runtime under 3:00, loudness, no black frames, no clipped words or cut-off UI, and that no logo or real person appears. Then re-render and validate. Report the final runtime, LUFS and any cuts you made.
