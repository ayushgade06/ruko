# Ruko — the scam-call copilot

> **Ruko** (रुको, Hindi for "wait") listens to a suspicious phone call on speaker, flags scam tactics live, and tells you exactly what to say and do — before you lose your savings.

**Live:** _add Vercel URL here_ · **Demo video:** _add YouTube link here_ · Built for **IceHacks 2026**

## The problem

Phone impersonation scams target older adults worldwide, and they all follow the same script:
**authority + fear + isolation + an unusual payment.**

- 🇺🇸 Fake **IRS / Social Security / Medicare** agents, **"Microsoft support"**, and **"Grandma, I'm in jail"** calls demanding gift cards, crypto or wire transfers.
- 🇮🇳 **"Digital arrest"**: fake CBI / police / customs officers keep victims on video calls for hours and drain their savings. (It doesn't exist in law.)

Caller ID only knows already-reported numbers. Awareness campaigns only help *before* the call. **Nothing helps during the call** — when the victim is scared, alone, and being told "don't tell anyone." Ruko is that calm second voice in the room.

## What it does

| | |
|---|---|
| 🎧 **Listen to a call** | Put the call on speaker. Ruko transcribes it live in the browser, shows a risk meter that only ratchets up, red-flag cards quoting the caller's exact words, a one-line **"Say this"** script, and — at Danger — a full-screen **"Hang up. This is a scam."** with one-tap helplines and *Tell family*. |
| 💬 **Check a message** | Paste an SMS / WhatsApp / email, or upload a screenshot. Same verdict in seconds. |
| ▶ **Sample calls** | Four scripted calls (India digital arrest, US IRS, US tech support, and a *real* bank call that stays green) so anyone can try it without a real scam. |
| 🌐 **English & हिंदी**, India & US helplines | 1930 / cybercrime.gov.in · ReportFraud.ftc.gov / ic3.gov / AARP Fraud Watch. |

## How it works

```
Browser                                              Vercel (Node.js)
 mic ─▶ Web Speech API ─▶ transcript ─┬─▶ rules engine (instant, on-device)
                                      └─▶ POST /api/analyze ─▶ AI Gateway ─▶ Claude Haiku 5.5
                                                               (structured output: score, quoted flags, sayThis, doNow)
 verdict = max(rules, AI)  →  meter never drops during a call
```

- **Hybrid detection.** A rules engine (`lib/rules.ts`) checks 13 scam tactics in English, Hindi and Hinglish in milliseconds, with negation handling ("we will *never* ask for your OTP" is a good sign, not a red flag). The AI reads intent the way a person would. The rules score is a **floor**, so if the AI is down, slow, or *talked into* saying "safe" by the scammer, the warning still fires.
- **Structured output.** `/api/analyze` uses AI SDK `generateText` + `Output.object` with a Zod schema; every flag must quote the input verbatim.
- **Privacy.** No accounts, no database. Audio never leaves the device. Transcript text / screenshots are sent only to be analyzed and are never logged.
- **Accessibility.** 18px base type, AA+ contrast in light & dark, `aria-live` announcements on risk changes, keyboard-reachable, ≥48px targets, respects reduced motion, color is never the only signal.

## Accuracy

`npm run eval` runs 32 labeled cases we wrote (18 scams / 14 legitimate, US + India, EN/HI/Hinglish) and writes `eval/results.json`, which `/how-it-works` renders. The cases were written after the rules, not tuned against them.

| Detector | Scams caught | False alarms |
|---|---|---|
| Rules only | 16 / 18 | 2 / 14 |
| Ruko (rules + AI) | _run with AI key_ | _run with AI key_ |

## Run it

```bash
npm install
echo "AI_GATEWAY_API_KEY=..." > .env.local   # Vercel AI Gateway key (or `vercel env pull` on a linked project)
npm run dev          # http://localhost:3000
npm run check        # rules-engine self-check
npm run eval         # accuracy eval against a running app (BASE_URL=... to target prod)
```

Optional: `RUKO_MODEL` overrides the model (default `anthropic/claude-haiku-5.5`).
In production, add a Vercel Firewall rate-limit rule on `/api/analyze` (e.g. 30 req/min per IP).

## Built with

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Vercel AI SDK 7 · Vercel AI Gateway · Claude Haiku 5.5 (Anthropic) · Zod · Web Speech API · Vercel.
Fonts: Noto Sans, Noto Sans Devanagari, Fraunces (Google Fonts, OFL).

**AI tools used (disclosed per IceHacks rules):** Claude Code was used to help plan, write and test this code. Claude Haiku 5.5 powers the in-app analysis.

## What's next

Android call-screening integration (no speakerphone needed), on-device models, a family dashboard with alerts, more languages (Marathi, Tamil, Bengali, Spanish), and partnerships with banks and senior-care NGOs.

## License

MIT
