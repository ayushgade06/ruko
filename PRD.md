# Ruko: Product Requirements Document

> **Ruko** (रुको, Hindi for "wait / stop") is a scam-call copilot. You put a suspicious call on speaker, and Ruko listens, writes out the call as it happens, and shows red flags with a live risk meter. It also tells you exactly what to say and do next. It catches phone impersonation scams **worldwide**: IRS, Social Security, Medicare and tech-support scams in the US, and "digital arrest" and courier scams in India. It works in English, Hindi and Hinglish, with nothing to install, from a public URL.

| | |
|---|---|
| Event | IceHacks 2026 (submissions close **Sun Nov 15, 6:00 PM PT = Mon Nov 16, 7:30 AM IST**) |
| Build window | One focused session (~10–12 h) + 2 h for video and submission |
| Primary tracks | Best AI Hack · Best Deployed/Shipped App · Overall · Best Design & UX |
| Skipped track | Best Hardware (a physical part can't be built and documented well in one session) |
| Status | Draft v1, 2026-11-11 |

---

## 1. Why this idea wins

**Track math.** A project can win only one track, so the goal is to qualify strongly for as many as possible:

- **Best Deployed / Shipped App** has **3 winning slots** and is judged on a working public URL, reliability, completeness and docs. Most hackathon teams lose here because their demo breaks. Ruko is built to never break: a built-in demo call, a rules engine that works offline, and no login.
- **Best AI Hack** is judged on usefulness, technical depth, polish and smart use of tools. Ruko uses real-time streaming, structured LLM output, a hybrid rules + LLM design, vision for screenshots, and a **published evaluation** of its own accuracy. The evaluation matters because several judges work on LLM reliability.
- **Design & UX** is judged on usability, accessibility and polish. The target user is an anxious 65-year-old on a phone call, which pushes the design toward large text, high contrast, one action per screen and calm language. That is an accessibility story judges can see.
- **Overall** is five equally weighted criteria. A tense, dramatized scam call that Ruko catches live makes the strongest **Presentation** score of any of the ideas considered.

**Problem.** Phone impersonation scams target older adults worldwide, and every version follows the same script: **authority + fear + isolation + an unusual payment.**
- **United States:** callers pose as the IRS, Social Security, Medicare, a bank's fraud department, "Microsoft/Apple tech support," or a grandchild "in jail," then demand gift cards, wire transfers, crypto or remote access. The FTC (reportfraud.ftc.gov) and FBI IC3 (ic3.gov) both publish older adults as the group losing the most per incident.
- **India:** "digital arrest" is the most extreme version. Fake CBI, police or customs officers keep victims on video calls for hours and drain their savings. The government has said publicly that "digital arrest" does not exist in law; the national helpline is **1930**.

IceHacks is a global, US-hosted event (times in PT, mostly US-based judges), so the pitch is global: *"Ruko catches phone impersonation scams during the call. We started with India's digital-arrest wave, the most extreme version, and it also catches IRS, Social Security and tech-support scams."* *(Before citing any loss figures in the video or write-up, take current numbers from FTC Consumer Sentinel, FBI IC3's Elder Fraud Report, and I4C/PIB, and link the source.)*

**What's missing today.** Spam-caller ID only knows numbers that were already reported. Awareness campaigns only work before the call. **Nothing helps during the call**, which is when the victim is scared, alone and being told "don't tell anyone." Ruko is a calm second voice in the room at that moment.

### Ideas considered and set aside
| Idea | Why not |
|---|---|
| Government scheme eligibility finder | Many teams build it, the demo isn't exciting, and it depends on scheme data |
| Prescription / discharge-summary explainer | Medical-advice liability; judges have seen it often |
| Food-label allergy scanner | Common idea with a smaller impact story |
| Hardware fall-detector for elders | Needs physical parts and fabrication; can't ship in one session |
| **Ruko (chosen)** | Real-time, emotional demo, huge impact, deploys as a plain website, qualifies for 4 tracks |

---

## 2. Users

| Persona | Situation | Job to be done |
|---|---|---|
| **Kamala, 67**, retired teacher, Pune | Gets a "CBI officer" video call saying her Aadhaar is linked to money laundering | *When an official-sounding caller threatens me, I want someone to tell me if it's real so I don't lose my savings or get "arrested."* |
| **Rohan, 21**, her grandson in another city | Worried about his grandparents | *I want to set up something once that protects them when I'm not there.* |
| **Priya, 34**, working professional | Gets a "FedEx parcel with drugs" call or a fake "KYC expiry" SMS | *I want a 10-second answer: scam or not, and what to do.* |
| **Frank, 74**, retired mechanic, Ohio | "IRS agent" says he owes back taxes and will be arrested today unless he pays with gift cards | *When someone official says I'm in trouble, I want to know if it's real before I go to the store.* |

The design centers on Kamala and Frank. If it works for them, it works for everyone.

---

## 3. Goals and non-goals

**Goals (judged at submission)**
1. A live call on speaker is turned into text and given a risk score, with the first red flag showing **≤ 3 s** after the phrase is spoken.
2. A pasted message or screenshot is classified in **≤ 6 s**.
3. On the eval set (§9): **≥ 90 % recall on scams** and **≥ 85 % precision**, published on the `/how-it-works` page.
4. A public URL that runs with no sign-in, works on mobile Chrome, and includes a one-tap demo.
5. Lighthouse accessibility score **≥ 95**.

**Non-goals (v1)**
- Intercepting calls at the phone-system level, or building a native app.
- Storing audio or transcripts on a server.
- Identifying or blocking phone numbers.
- User accounts.

---

## 4. Feature scope

### P0: must ship
| # | Feature | Description |
|---|---|---|
| F1 | **Live Call Guard** | Microphone → browser speech-to-text (Web Speech API, `en-IN` / `hi-IN`) → rolling transcript → analysis → risk meter + red-flag cards + "Say this" script |
| F2 | **Hybrid detection** | An instant client-side **rules engine** (keyword/regex patterns in English, Hindi and Hinglish) plus an **LLM pass** that reads intent. The meter shows the higher of the two scores, so it still works if the LLM call fails |
| F3 | **Check a Message** | Paste text **or** upload a screenshot (SMS, WhatsApp, email) → the same verdict card |
| F4 | **Demo call** | A "▶ Try a sample scam call" button plays a scripted call (audio + timed transcript lines fed into the same pipeline). Judges can see it working without a real call. Includes 2 scam scripts and 1 legit bank call |
| F5 | **Danger actions** | At DANGER level: a full-width red banner reading **"Hang up. This is a scam."** plus region-aware buttons. **India:** *Call 1930*, *Report on cybercrime.gov.in*. **US / elsewhere:** *Report at reportfraud.ftc.gov*, *Report at ic3.gov*. Always: *Tell family* (Web Share API with a short summary). The region is detected from the browser time zone (`Asia/Kolkata` → India, otherwise US/global) and can be switched in the footer |
| F6 | **Verdict card** | Level (Safe / Caution / Danger), score 0–100, quoted phrases that triggered each flag, a plain-language explanation, and 1–3 "Do now" steps |
| F7 | **Language toggle** | UI and responses in English or Hindi; the LLM replies in the language the user picked. Speech recognition uses `en-US` or `en-IN` depending on region, and `hi-IN` for Hindi |

### P1: ship if time allows (in this order)
| # | Feature |
|---|---|
| P1-a | `/how-it-works` page: architecture diagram, red-flag taxonomy, **published eval results table** |
| P1-b | Eval script `npm run eval` that runs the eval set against `/api/analyze` and writes `eval/results.json` |
| P1-c | Large-text mode and haptic vibration on DANGER (`navigator.vibrate`) |
| P1-d | Installable PWA (manifest + icon) so grandparents get a home-screen icon |

### P2: listed as "What's next" in the write-up only
Native Android call-screening integration, on-device models, a family dashboard with alerts, number-reputation lookup, regional languages (Marathi, Tamil, Bengali), and an NGO/bank partnership channel.

---

## 5. User flows and screens

### 5.1 Home (`/`)
- The **Ruko** wordmark and one line: *"On a suspicious call? Put it on speaker. Ruko will listen with you."*
- Two very large buttons, at least 64 px tall and stacked:
  1. 🎧 **Listen to a call**
  2. 💬 **Check a message**
- A smaller link: ▶ *Try a sample scam call*
- Footer: language toggle (EN / हिं), a *How it works* link, and the privacy line *"Nothing is recorded or stored."*

### 5.2 Live Call Guard (`/listen`)
```
┌──────────────────────────────────┐
│  ● Listening…            [Stop]  │
│                                  │
│      ╭───────────────╮           │
│      │   RISK  82    │  DANGER   │  ← semicircle meter, animated
│      ╰───────────────╯           │
│                                  │
│  ⚠ Claims to be police / CBI     │  ← flag cards, newest on top
│    "this is CBI officer Sharma"  │
│  ⚠ Tells you to stay on the call │
│    "do not disconnect the call"  │
│                                  │
│  💬 SAY THIS                     │
│  "I will call the police station │
│   myself. Goodbye."              │
│                                  │
│  [ Hang up & call family ]       │
│  ─ transcript (collapsible) ─    │
└──────────────────────────────────┘
```
- On the first visit, a single full-screen explanation appears **before** the browser's microphone prompt: *"Ruko needs the microphone to hear the call. Put your phone on speaker and place it near this device."*
- If Web Speech isn't supported (e.g. Firefox), show *"Live listening works in Chrome or Edge. You can still type what the caller is saying."* and fall back to a text box. The text box goes through the same analysis.
- The meter only animates upward during a call (it is sticky to the maximum score). It never drops from Danger to Safe in the middle of a call, because a reassuring drop would be dangerous.

### 5.3 Check a Message (`/check`)
- A textarea, plus an "Upload screenshot" control (accepts images, max 4 MB, resized on the client to ≤ 1600 px).
- A **Check** button → skeleton loading → the verdict card (F6) → danger actions if needed.

### 5.4 Demo (`/listen?demo=digital-arrest`)
- The same screen as 5.2, with a "DEMO" pill. Transcript lines appear at their script timings and the audio plays. No microphone is needed.

### 5.5 How it works (`/how-it-works`) [P1]
- A 3-step diagram, the taxonomy table, the eval table, the privacy statement, and helpline links.

### Design system
- **Feel:** calm and trustworthy, not alarming, until the moment it needs to alarm.
- **Colors (tokens):** `--safe #1F8A5B`, `--caution #C98A00`, `--danger #C62828`, `--ink #14171A`, `--paper #FAF8F4`, plus a dark-mode set. Every pairing must meet WCAG AA, and AAA for body text.
- **Type:** Noto Sans + Noto Sans Devanagari (Google Fonts). Base 18 px, verdict 28–32 px.
- **Accessibility:** risk changes announced through an `aria-live="assertive"` region, all controls reachable by keyboard, visible focus rings, `prefers-reduced-motion` respected, color never the only signal (always an icon plus a word), tap targets ≥ 48 px.
- **Copy rules:** short sentences, no jargon, imperative verbs ("Hang up." not "You may wish to consider ending the call").

---

## 6. Detection design

### 6.1 Red-flag taxonomy (shared by rules and LLM)
| id | Label (EN) | Example triggers (EN / HI / Hinglish) | Weight |
|---|---|---|---|
| `authority` | Claims to be police / CBI / ED / customs / TRAI / court | "CBI officer", "cyber cell", "aapke naam pe FIR", "सीबीआई" | 25 |
| `arrest_threat` | Threatens arrest or legal action | "digital arrest", "warrant", "गिरफ्तार", "jail ho jayegi" | 30 |
| `isolation` | Tells you to stay on the call / keep it secret | "do not disconnect", "kisi ko mat batana", "stay on video" | 30 |
| `money_move` | Asks you to transfer money / "verify" funds | "safe account", "RBI verification", "UPI", "paise transfer" | 35 |
| `credentials` | Asks for OTP / PIN / Aadhaar / card / remote access | "OTP", "AnyDesk", "screen share", "CVV" | 35 |
| `parcel` | Parcel with drugs / illegal items | "parcel", "FedEx", "drugs", "MDMA", "courier" | 20 |
| `urgency` | Extreme time pressure | "within 2 hours", "abhi turant", "account will be blocked today" | 15 |
| `too_good` | Prize / refund / job / investment returns | "lottery", "refund", "work from home", "guaranteed returns" | 20 |
| `kyc` | Fake KYC / SIM / electricity disconnection | "KYC expired", "SIM band", "bijli kaat di jayegi" | 25 |
| `gov_agency` | Claims to be the IRS / Social Security / Medicare / a government benefits office | "IRS", "Social Security number suspended", "Medicare card", "back taxes" | 25 |
| `tech_support` | "Your computer has a virus" / Microsoft / Apple / Amazon support | "Microsoft support", "virus on your computer", "Amazon order", "refund team" | 25 |
| `odd_payment` | Demands gift cards, crypto, wire or cash courier | "gift card", "Google Play card", "Bitcoin ATM", "wire transfer", "someone will pick up cash" | 40 |
| `family_emergency` | "Grandma, it's me, I'm in jail / hurt, don't tell Mom" | "it's me, your grandson", "bail money", "don't tell mom" | 30 |

**Rules score** = min(100, Σ weights of distinct flags hit), with a ×1.3 multiplier when an authority-type flag (`authority`, `gov_agency`, `tech_support`, `family_emergency`) appears together with a pressure-type flag (`isolation`, `money_move`, `odd_payment`, `credentials`). That pairing is the impersonation signature everywhere.

**Levels:** 0–29 Safe · 30–59 Caution · 60–100 Danger.

### 6.2 LLM pass
- **When:** in live mode, after each finalized speech segment, debounced to at most one call every 4 s, sending the last ~1,500 words of transcript. In message mode, once.
- **Model:** a fast Claude model through Vercel AI Gateway (`"anthropic/claude-haiku-5-5"`) for live calls. Screenshots use the same model's vision input. Confirm model IDs against the AI Gateway at build time.
- **Output:** structured (AI SDK `generateObject`/`streamObject` with a Zod schema):
```ts
const Verdict = z.object({
  score: z.number().min(0).max(100),
  level: z.enum(["safe", "caution", "danger"]),
  flags: z.array(z.object({
    id: z.enum(["authority","arrest_threat","isolation","money_move","credentials","parcel","urgency","too_good","kyc","gov_agency","tech_support","odd_payment","family_emergency","other"]),
    quote: z.string().max(160),       // exact words from the transcript/message
    explanation: z.string().max(200), // plain language, in the user's language
  })).max(6),
  sayThis: z.string().max(160),       // one sentence the user can say out loud
  doNow: z.array(z.string().max(120)).min(1).max(3),
  summary: z.string().max(240),       // used in the "Tell family" share
});
```
- **System prompt rules (abridged):** You are a calm fraud-safety assistant for older adults in the US, India and elsewhere. Real police, CBI, the IRS, Social Security, banks and courts never ask for money over a call, never demand gift cards, crypto or wire transfers, never ask you to stay on the line or keep a secret, and never ask for an OTP or remote access. "Digital arrest" does not exist. The IRS first contacts people by mail. Quote exact words. Do not invent flags. If the transcript is too short to judge, return `caution` with score ≤ 40, not `danger`. A legitimate bank call that asks for **no** credentials and **no** transfer should be `safe`. Reply in `{lang}`.
- **Merge:** `finalScore = max(rulesScore, llmScore)`. The flags shown are the union, de-duplicated by `id` (the LLM's quote and explanation win when both exist). `sayThis`/`doNow` come from the LLM, with static fallbacks per level when the LLM is unavailable.

### 6.3 Failure behavior
| Failure | Behavior |
|---|---|
| LLM timeout (> 8 s) / 5xx | Keep showing the rules verdict, plus a small note "Smart check unavailable, basic check active" |
| Rate limited | Same as above |
| Speech recognition stops (Chrome ends sessions after silence) | Restart it automatically in `onend` while the user hasn't pressed Stop |
| Mic permission denied | Explain how to re-enable it, and offer the type-it fallback |

---

## 7. Architecture

```
Browser (Next.js App Router, React)
 ├─ /listen  ─ Web Speech API ─▶ transcript ─▶ rules.ts (instant)
 │                                      └─▶ POST /api/analyze (debounced) ─▶ AI Gateway ─▶ Claude
 ├─ /check   ─ text | image ─▶ POST /api/analyze
 └─ demo     ─ scripted lines + <audio> ─▶ same pipeline

Vercel (Node.js, Fluid Compute)
 └─ /api/analyze  → validate (zod) → size limits → generateObject → JSON
```

- **Stack:** Next.js (App Router, TypeScript), Tailwind, AI SDK 7 + Vercel AI Gateway, Zod. No database.
- **Hosting:** Vercel (production URL). *Optional sponsor tie-in:* also deploy a mirror to DeployXA if it's quick, and say so in the write-up.
- **Files (kept small on purpose):**
```
app/page.tsx               Home
app/listen/page.tsx        Live guard + demo
app/check/page.tsx         Message check
app/how-it-works/page.tsx  [P1]
app/api/analyze/route.ts   LLM endpoint
lib/rules.ts               Taxonomy + rules engine (+ inline self-check)
lib/verdict.ts             Zod schema, merge(), level thresholds
lib/i18n.ts                EN/HI strings
components/RiskMeter.tsx, FlagCard.tsx, VerdictCard.tsx, DangerBar.tsx
public/demo/*.mp3 + demo/*.json   Scripted calls
eval/cases.json, eval/run.ts      [P1]
```

### 7.1 API contract: `POST /api/analyze`
Request:
```json
{ "mode": "live" | "text" | "image",
  "text": "string (≤ 12,000 chars, required unless image)",
  "image": "data:image/jpeg;base64,... (≤ 4 MB, image mode only)",
  "lang": "en" | "hi" }
```
Response `200`: a `Verdict` object (§6.2). Errors: `400` invalid input, `413` too large, `429` rate limited, `502` model failure. The client treats every non-200 response as "use the rules verdict."

### 7.2 Security and privacy
- No audio ever leaves the browser. The live-mode transcript text and screenshots are sent only to `/api/analyze`, used for that request, and not logged or stored. (Disable body logging. Choose a zero-data-retention option in AI Gateway if one is available.)
- Validate input on the server with Zod. Enforce size caps.
- **Rate limit** `/api/analyze` with a Vercel Firewall rule (e.g. 30 req/min per IP) so the public URL survives judging traffic and abuse. No custom limiter code.
- The API key lives only in Vercel env (`AI_GATEWAY_API_KEY` or OIDC). Nothing secret goes into the client bundle.
- Disclaimer on the verdict card: *"Ruko gives guidance, not legal advice. When in doubt, hang up and call 1930."*

---

## 8. Content to prepare

- **Demo scripts (4):**
  1. *Digital arrest (India)*: "CBI officer" → Aadhaar linked to money laundering → "stay on video" → "transfer to RBI safe account." Expected result: DANGER by ~line 4.
  2. *IRS (US)*: "IRS agent" → back taxes → arrest warrant today → "don't hang up" → pay with Apple gift cards. Expected result: DANGER.
  3. *Tech support (US)*: "Microsoft support" → virus → install AnyDesk → "refund" into bank account. Expected result: DANGER.
  4. *Legit bank call*: card dispatched, confirms the city only, asks for no OTP or transfer. Expected result: SAFE. This shows the tool doesn't cry wolf.
- **Audio:** v1 uses the browser's built-in text-to-speech (`speechSynthesis`), so there are no audio files to manage. Recording team voices is a stretch goal for the video.
- **Helplines:** India: 1930 · https://cybercrime.gov.in · Sanchar Saathi "Chakshu". US: https://reportfraud.ftc.gov · https://www.ic3.gov · AARP Fraud Watch Helpline 877-908-3360. Verify all links on the build day.

---

## 9. Evaluation (an AI-track differentiator)

- `eval/cases.json`: **≥ 30 labeled cases**. About 18 scams (digital arrest, parcel, KYC, OTP, IRS, Social Security, tech support, grandparent, gift card, job, investment, lottery, in EN/HI/Hinglish) and about 12 legitimate cases (real bank alerts, delivery OTP *that the user requested*, doctor's appointment, family call, a genuine police-verification visit SMS). All are written by the team, with no real victims' data.
- `npm run eval`: calls the production endpoint, computes the confusion matrix, precision/recall for "danger-or-caution vs. safe", and the rules-only vs. hybrid comparison.
- Publish the table on `/how-it-works` and in the README. Mention it in the video ("Hybrid detection catches X/18 scams with Y false alarms; rules alone catch Z").

---

## 10. Success metrics

| Metric | Target |
|---|---|
| Time from spoken phrase to first flag (demo) | ≤ 3 s |
| Message verdict latency (p50) | ≤ 6 s |
| Scam recall (eval) | ≥ 90 % |
| Precision (eval) | ≥ 85 % |
| Lighthouse Accessibility / Performance (mobile) | ≥ 95 / ≥ 85 |
| Demo works on a fresh device, mobile Chrome, no login | 100 % |

---

## 11. Build plan (single session)

| Block | Time | Deliverable | Done when |
|---|---|---|---|
| 0 | 0:00–0:30 | Scaffold Next.js + Tailwind, deploy an empty app to Vercel, set the env key | Production URL live |
| 1 | 0:30–1:45 | `lib/rules.ts` + `lib/verdict.ts` + self-check | Self-check passes on 6 sample strings |
| 2 | 1:45–3:00 | `/api/analyze` with `generateObject`, validation, limits | curl returns a valid Verdict for scam and legit text |
| 3 | 3:00–5:00 | `/listen`: speech-to-text, debounce, merge, RiskMeter, FlagCard, DangerBar | Speaking a scam script on a laptop reaches DANGER |
| 4 | 5:00–6:00 | Demo mode + 4 scripts (speechSynthesis voice) | One-tap demo works on a phone |
| 5 | 6:00–7:00 | `/check` text + screenshot | A screenshot of a fake KYC SMS returns DANGER |
| 6 | 7:00–8:30 | Design polish, Hindi strings, a11y pass, dark mode, failure states | Lighthouse a11y ≥ 95 |
| 7 | 8:30–9:30 | [P1] Eval set + script + `/how-it-works` | Results table published |
| 8 | 9:30–10:00 | Firewall rate limit, README, final deploy, test on 2 devices | Checklist §12 green |
| 9 | +2 h | Demo video + Devpost write-up | Submitted **before Nov 15, 6 PM PT** |

**Cut order if behind:** P1-d → P1-c → Hindi UI strings (keep Hindi detection) → screenshot upload → `/how-it-works` (keep eval numbers in the README).

---

## 12. Submission checklist

- [ ] Public GitHub repo (MIT license) with README covering problem, live URL, screenshots, architecture, how to run, eval results, **AI tools used** (Claude Code, Claude via AI Gateway), credits for libraries/fonts/audio
- [ ] Live URL works in an incognito window on mobile Chrome
- [ ] Demo video ≤ 3:00, public on YouTube (structure below)
- [ ] Devpost write-up: what it does, how we built it, challenges, what we learned, what's next
- [ ] "Built with": Next.js, TypeScript, Tailwind, Vercel, AI SDK, Vercel AI Gateway, Claude, Web Speech API, Zod
- [ ] Tracks selected: **Best AI Hack, Best Deployed/Shipped App, Best Design & UX** (Overall is automatic)
- [ ] Team members registered on Devpost; eligibility confirmed with organizers (see §14)

### Demo video structure (≤ 3:00)
| Time | Beat |
|---|---|
| 0:00–0:20 | Cold open, split screen: in Ohio, "This is the IRS, there's a warrant for your arrest…"; in Pune, "This is CBI officer Sharma…". Text on screen: *Same script. Every country.* + one sourced loss figure each from the FTC/IC3 and I4C |
| 0:20–0:40 | The problem: caller ID only knows reported numbers, and awareness only helps before the call. Nothing helps *during* the call |
| 0:40–1:50 | **Live demo**: phone on speaker, Ruko climbs Caution → DANGER, flags appear with quotes, she reads the "Say this" line and hangs up, then taps *Tell family* |
| 1:50–2:10 | Legit bank call stays SAFE: no false alarm |
| 2:10–2:35 | How it's built: hybrid rules + LLM diagram, eval numbers, privacy (no audio stored), accessibility |
| 2:35–3:00 | Impact + what's next (Android call screening, regional languages, bank/NGO partners) + URL on screen |

---

## 13. Risks and mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Web Speech accuracy on speakerphone / Hindi | Med | Demo mode doesn't depend on it; rules include Hinglish spellings; a type-it fallback exists |
| False alarms on legit calls hurt trust | Med | Legit cases in the eval; prompt rule for short transcripts; the legit bank demo |
| LLM latency on judging day | Low–Med | The rules engine reacts instantly; 8 s timeout; fast model |
| Public URL abused / costs | Low | Firewall rate limit; input size caps |
| Judges think "just a ChatGPT wrapper" | Med | Real-time pipeline, hybrid design, published eval, accessibility-first UX: all called out explicitly |
| Ethical concern: listening to the other party | Low | The user activates it, nothing is stored, and the purpose is protecting the user; stated in the privacy note |

---

## 14. Open questions

1. **Eligibility:** the Devpost page says "students, 13+" and the guidelines doc says "high school students." Confirm with outreach@codestarters.org or on Discord that a 3rd-year undergrad from India is eligible **before** submitting.
2. Are there sponsor-tool bonus points (Momen, Anakin, DeployXA)? If Anakin offers an API that drops into the LLM call easily, consider it for the AI track. Don't let it block the build.
3. Who records the demo-call voices? A team member who can do a convincing "officer" voice in Hindi/English.
