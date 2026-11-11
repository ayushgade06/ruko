# Ruko — production plan (IceHacks 2026 demo film)

**Theme:** *Same script. Every country.* **The one decision Ruko makes:** during the call, it decides "this is a scam" and tells you what to say, before money moves.
**Length:** 2:53.9 (rule: ≤ 3:00). 1920×1080, 30 fps. All product footage is real captures of the app running locally on `127.0.0.1:3100` with the AI check on (Claude Haiku 5.5).

| # | Scene | Time | Judging criterion it earns | What's on screen | Honesty notes |
|---|---|---|---|---|---|
| 1 | `cold` | 0:00–0:14 | Presentation, problem | Split screen, two drawn phones ringing (Ohio 9:30 AM / Pune 8:00 PM, the same moment). Callers answer; their words appear as they're spoken. Kinetic type: **Same script. Every country.** | Drawn, not app footage; labelled "DRAMATIZED · FICTIONAL CALLERS". No numbers, brands or faces. |
| 2 | `problem` (paper) | 0:14–0:37 | Problem / impact | Formula builds word by word (Authority + Fear + Isolation + an unusual payment). Two cited stat cards. Then BEFORE THE CALL (Caller ID, Awareness) vs an empty DURING THE CALL box: "Nothing." | Stats verified on primary pages (see VOICEOVER.md). India loss figures left out because they couldn't be verified. |
| 3 | `reveal` | 0:37–0:44 | Innovation | The app's own mark + **Ruko**, `रुको · wait`, "A calm second voice in the room, during the call." | Mark copied from `components/Header.tsx`. |
| 4 | `demo` (hero) | 0:44–1:34 | Technical, AI use, completeness | Real `/listen` captures of the "Digital arrest" sample call in a device frame. One highlight at a time: transcript line (HEARD) → meter: rules 25 Safe → Claude 45 Be careful → flag card quoting the caller → meter DANGER 100 → "Asks you to move money" → **Say this** (Kamala reads it) → hang-up silence → red **Hang up. This is a scam.** banner → Tell family / Call 1930. Right column repeats each value in big type. | Each state is a settled still (`public/shots/da_*.png`) captured line by line under Playwright's fake clock, with the real `/api/analyze` response awaited before each still. Labelled "CONDENSED": four of nine call lines are voiced. App TTS muted; the callers are edge-tts voices. |
| 5 | `irs` | 1:34–1:47 | Global use | IRS sample call final state: gift-card flag, then Frank reads the "Say this" line. | Real capture `irs_07a`. "Apple" appears only as text in the app's sample transcript; no logo. |
| 6 | `bank` (paper) | 1:47–1:59 | Usefulness / trust | Real bank call: **no red flags, no hang-up warning**, meter 35 "Be careful" (rules 0, Claude 35). | The brief asked for "stays green"; the real app doesn't (see *Product finding* below), so the film says exactly what it shows. |
| 7 | `check` (paper) | 1:59–2:05 | Completeness | `/check`: pasted fake electricity SMS → 62 "Likely a scam" + banner. "Claude answered in 4.8 s on this capture." | Real captures `check_01` / `check_03`; latency from `capture/check_ai.json`. |
| 8 | `how` (paper) | 2:05–2:21 | Technical complexity | Diagram: the call → on-device rules engine (13 tactics, EN · हिंदी · Hinglish) + Claude Haiku 5.5 (intent, quotes) → `max()` → meter that only goes up. | Redrawn diagram; source tag lists the files it describes. |
| 9 | `proof` | 2:21–2:35 | AI rigor | CLAIM ("Catches the scam. Doesn't cry wolf.") → EVIDENCE (real `/how-it-works` eval table crop; rows highlighted: rules 16/18, hybrid 18/18, false alarms 2/14) → VERDICT stamp. | Numbers from `eval/results.json`, run on 2026-11-11 against this local build. |
| 10 | `trust` | 2:35–2:42 | Design / accessibility | No accounts · No audio leaves the device · Big type · Screen-reader announcements (with the real aria-live text) · Hindi, beside the Hindi capture of the same call. | `hi_09a` is the app in Hindi with Claude replying in Hindi. |
| 11 | `close` | 2:42–2:54 | Presentation | What's next (Android call screening · More languages · Bank & NGO partners) → end card: mark, **Ruko — Wait, before you pay.**, `github.com/ayushgade06/ruko`, built-with line, Claude Code disclosure. Fade to black. | Next steps are plans (PRD §4 P2), worded as "next". No live URL: the app isn't deployed. |

**Wipes** into the two paper "turn" scenes (`problem`, `how`); fades elsewhere.

## Sound
Original synthesized bed (`scripts/audio.py`: pads, sparse plucks after the reveal, resolution chord on the end card), ducked −10 dB under every line. SFX: two ringback tones panned Ohio-left / Pune-right, a low impact on the reveal and end card, soft ticks on the score words, a low swell on "danger", **the music cuts to silence after Kamala's line** with a line-drop click, then returns under the next line.

## Product finding (not fixed; flagged to the owner)
With the AI on, the "Real bank call" sample ends at **35 "Be careful"**, not Safe, which misses PRD §8 ("Expected result: SAFE"). Cause: the system prompt tells the model to return *caution* for inputs too short to judge, so the opening line scores 35, and the live meter only ratchets up (`accumulate()` keeps the max). The rules alone score 0. The film shows this honestly instead of claiming green.

## App changes made to film it (all local)
- `app/api/analyze/route.ts`: if `AI_GATEWAY_API_KEY` is unset and `OPENROUTER_API_KEY` is set, the same model id goes through OpenRouter (`@ai-sdk/openai-compatible`). Also `maxOutputTokens: 1500`, because OpenRouter otherwise reserves the model's full 65,536-token output budget per request.
- `app/how-it-works/page.tsx`: step 3 says "Claude Haiku 5.5" instead of "via Vercel AI Gateway", because the film's run used OpenRouter.
- `eval/results.json`: re-run with the AI on (it previously had only the rules row).
- `tsconfig.json` / `eslint.config.mjs`: exclude `video/`.
