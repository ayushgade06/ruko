# Credits and licences

## Audio
- **Music bed and all sound effects** (pads, plucks, ringback tones, impacts, ticks, swell, hang-up click): synthesized from scratch in `scripts/audio.py` (numpy/scipy). Original, no samples, no third-party audio, no licence needed.
- **Voices**: Microsoft neural text-to-speech via the open-source `edge-tts` Python package. Narrator `en-US-AvaMultilingualNeural`; characters `en-US-GuyNeural`, `en-IN-PrabhatNeural`, `en-IN-NeerjaNeural`, `en-IN-NeerjaExpressiveNeural`, `en-US-ChristopherNeural`. All characters (Kamala, Frank, "Inspector Sharma", the bank caller) are fictional, taken from `lib/demos.ts`. The film's voices are synthetic; no real person's voice is used.

## Fonts (SIL Open Font License 1.1)
- Fraunces (Undercase Type), Noto Sans and Noto Sans Devanagari (Google). The same files the app ships through `next/font/google`.

## Images
- Every product image is a screen capture of Ruko itself (this repo), made with Playwright on `127.0.0.1`.
- The phone frames, the cold-open call screens and the diagram are drawn in code. No logos, seals or brand marks, and no photos of people.

## Data cited on screen
- FBI Internet Crime Complaint Center, *2025 IC3 Annual Report* (Elder Fraud section). https://www.ic3.gov/AnnualReport/Reports/2025_IC3Report.pdf
- Ministry of Home Affairs, written reply in Rajya Sabha, PIB, 12 Mar 2025. https://pib.gov.in/PressReleasePage.aspx?PRID=2110809
- Ruko's own eval: `eval/results.json` (32 cases written by the team).

## Software
Remotion 4 (video), Playwright (capture), ffmpeg (mastering), faster-whisper (transcript QA), edge-tts (voices). The app is built with Next.js, the AI SDK, Claude Haiku 5.5 and the Web Speech API.

## AI tools used (IceHacks disclosure)
Claude Code helped plan, script, capture, build, render and QA this film, as well as build the app.
