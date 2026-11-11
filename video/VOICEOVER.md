# Ruko — voiceover script

Runtime **173.87 s** (2:53.9). Narrator: `en-US-AvaMultilingualNeural` at -2%. Character voices (edge-tts, fictional people):

- **Caller · Ohio**: `en-US-GuyNeural`, rate +4%, pitch -4Hz, phone-line EQ (300 Hz–3.4 kHz band-pass + soft saturation)
- **Caller · Pune**: `en-IN-PrabhatNeural`, rate +2%, pitch -6Hz, phone-line EQ (300 Hz–3.4 kHz band-pass + soft saturation)
- **Bank caller**: `en-IN-NeerjaExpressiveNeural`, rate +4%, pitch +0Hz, phone-line EQ (300 Hz–3.4 kHz band-pass + soft saturation)
- **Kamala**: `en-IN-NeerjaNeural`, rate -8%, pitch -2Hz
- **Frank**: `en-US-ChristopherNeural`, rate -6%, pitch -2Hz

Timestamps are when each line starts in the film (generated from `src/timeline.json`).

## cold · 0:00.00–0:14.13

- `0:01.87` **Caller · Ohio:** A warrant has been issued for your arrest. Do not hang up.
  - *Source:* Dramatized, adapted from the IRS sample call in `lib/demos.ts` (lines 3 and 5). Fictional caller.
- `0:06.87` **Caller · Pune:** Madam, you are under digital arrest.
  - *Source:* Dramatized, adapted from the digital-arrest sample call in `lib/demos.ts` (line 6). Fictional caller.
- `0:10.67` Same script. Every country.

## problem · 0:13.53–0:37.43

- `0:14.00` Authority… fear… isolation… and an unusual payment.
  - *Source:* PRD §1; `/how-it-works` intro ("authority + fear + isolation + an unusual payment").
- `0:18.40` Last year, Americans over sixty reported $7.7 billion in losses to the FBI.
  - *Source:* FBI IC3 **2025 Annual Report**, "IC3 Elder Fraud" section: "60+: 201,266 complaints, $7.7 billion in losses" (p. 6; $7.748 B on p. 44). Covers all cyber-enabled crime reported by people 60+, which is why the on-screen card says so. https://www.ic3.gov/AnnualReport/Reports/2025_IC3Report.pdf
- `0:25.63` India has blocked over 83,000 WhatsApp accounts used for digital arrest.
  - *Source:* MHA written reply in Rajya Sabha, PIB, 12 Mar 2025 (PRID 2110809): "I4C proactively identify and blocked more than 3,962 Skype IDs and 83,668 Whatsapp accounts used for Digital Arrest." https://pib.gov.in/PressReleasePage.aspx?PRID=2110809
- `0:31.17` Caller ID and awareness only work before the call.
  - *Source:* PRD §1 "What's missing today" (a framing claim, not a statistic).
- `0:35.27` Nothing helps during it.

## reveal · 0:36.83–0:45.77

- `0:37.37` So we built Ruko. In Hindi, it means: wait.
  - *Source:* रुको = "wait / stop" (README, home page `रुको · wait`).
- `0:42.03` A calm second voice in the room, during the call.

## demo · 0:45.17–1:35.93

- `0:45.50` **Caller · Pune:** This is Inspector Rajesh Sharma, from Mumbai Cyber Crime.
  - *Source:* `lib/demos.ts` digital-arrest line 1 (shortened). Screen: `capture/da_01r.txt`.
- `0:50.67` Ruko hears it. On the device, the rules call it safe. Seconds later, Claude says: be careful.
  - *Source:* Rules 25 "Looks safe": `capture/da_01r.txt`. Claude 45 "Be careful": `capture/da_01a.txt` and `capture/da_ai.json` line 1.
- `0:58.83` **Caller · Pune:** You are under digital arrest. Do not disconnect, and do not tell anyone.
  - *Source:* `lib/demos.ts` digital-arrest line 6 (shortened). The flag card quotes the full line: `capture/da_06a.txt`.
- `1:05.73` Every flag quotes the caller's own words. The meter hits danger, and never drops.
  - *Source:* Flag card with the caller's exact quote, meter 100 "Likely a scam": `capture/da_06a.txt`. "Never drops": `lib/verdict.ts` `accumulate()` + rules scan the whole transcript (`app/listen/page.tsx`).
- `1:12.00` **Caller · Pune:** Transfer your savings to an RBI verification account.
  - *Source:* `lib/demos.ts` digital-arrest line 8 (shortened). Flag "Asks you to move money": `capture/da_08a.txt`.
- `1:16.90` Before any money moves, Ruko tells her what to say.
  - *Source:* "Say this" card: `components/Verdict.tsx` `Advice`; text from Claude in `capture/da_09a.txt`.
- `1:21.17` **Kamala:** I will not transfer any money, and I am hanging up now to call my family and the police directly.
  - *Source:* Verbatim the "Say this" text Claude produced on this capture: `capture/da_09a.txt` / `capture/da_ai.json` line 9.
- `1:29.90` Hang up. This is a scam. Help, and family, are one tap away.
  - *Source:* Banner "Hang up. This is a scam.", Tell family, Call 1930: `capture/da_09a.txt`, `lib/i18n.ts` (`hangUp`, `HELP.IN`).

## irs · 1:35.33–1:48.50

- `1:35.60` **Caller · Ohio:** You can settle the balance right now with Apple gift cards.
  - *Source:* `lib/demos.ts` IRS line 7 (shortened). Flag "Demands gift cards…": `capture/irs_07a.txt`.
- `1:39.63` Same script in Ohio. Same catch.
- `1:43.03` **Frank:** I am not paying anything over the phone, and I am hanging up now.
  - *Source:* Verbatim the "Say this" text on `capture/irs_07a.txt` / `capture/irs_ai.json` line 7.

## bank · 1:47.90–1:59.90

- `1:48.23` **Bank caller:** Please remember, the bank will never ask for your PIN or OTP.
  - *Source:* `lib/demos.ts` legit-bank line 5 (shortened).
- `1:53.57` And a real call? No red flags, no warning. Just a gentle be careful.
  - *Source:* `capture/bank_end.txt`: "No red flags yet.", no hang-up banner, meter 35 "Be careful" (rules 0 on `bank_01r`, Claude 35 from line 1, `capture/bank_ai.json`). Deliberately NOT "stays green": it doesn't with the AI on.

## check · 1:59.30–2:05.17

- `1:59.57` A strange text? Paste it in. Same verdict, in seconds.
  - *Source:* `capture/check_03.txt`: 62 "Likely a scam"; Claude answered in 4.8 s (`capture/check_ai.json`, `ms: 4764`).

## how · 2:04.57–2:21.37

- `2:04.90` On your device, rules for 13 scam tactics, in English, Hindi and Hinglish, react instantly.
  - *Source:* `lib/rules.ts`: 13 `RULES` with English, Hindi (Devanagari) and Hinglish patterns; runs in the browser.
- `2:12.67` Claude reads the intent, and quotes the caller.
  - *Source:* `app/api/analyze/route.ts`: Claude Haiku 5.5, `Output.object` with `VerdictSchema`; each flag's `quote` must be exact words.
- `2:16.53` Ruko shows the higher score, so a scammer can't talk it back to green.
  - *Source:* `lib/verdict.ts` `merge()`: `score = max(rules, llm, floor)`; `/how-it-works` step 4.

## proof · 2:20.77–2:35.03

- `2:21.10` On 32 cases we wrote:
  - *Source:* `eval/cases.json` (32 cases: 18 scam, 14 legit), `eval/results.json` (ranAt 2026-11-11).
- `2:23.80` Rules alone caught 16 of 18 scams. With Claude, all 18.
  - *Source:* `eval/results.json`: Rules only 16/18; Ruko (hybrid) 18/18.
- `2:29.97` 2 of 14 real ones still got a caution. We show that too.
  - *Source:* `eval/results.json`: hybrid falseAlarms 2/14 (precision 90 %). Shown on `/how-it-works` (`shots/how_desk.png`).

## trust · 2:34.43–2:42.37

- `2:34.70` No accounts. No audio leaves the device. Big type, screen-reader announcements, and Hindi.
  - *Source:* README Privacy/Accessibility; `components/Verdict.tsx` `Announcer` (aria-live=assertive); Hindi UI `lib/i18n.ts`; Hindi capture `capture/hi_09a.txt`.

## close · 2:41.77–2:53.87

- `2:42.10` Next: Android call screening, more languages, and bank and NGO partners.
  - *Source:* PRD §4 P2 / README "What's next" (plans, not built).
- `2:47.87` Ruko. Wait, before you pay.

## On-screen facts that are not spoken

- "$7.7 billion reported lost by Americans aged 60+ in 2025 (all cyber-enabled fraud)": FBI IC3 2025 Annual Report (see p3).
- "83,668 WhatsApp accounts blocked for 'digital arrest' scams in India": MHA reply in Rajya Sabha, PIB, 12 Mar 2025 (see p4).
- Meter values 25 / 45 / 100 / 35 / 62 and every quote on the right-hand panels: read off the captured page text in `capture/*.txt`.
- Eval table: real screenshot of `/how-it-works` (`public/shots/how_desk.png`) rendering `eval/results.json`.
- "Claude answered in 4.8 s on this capture": `capture/check_ai.json` (`ms: 4764`, click to response).
- aria-live text "Likely a scam. Hang up. This is a scam. Asks you to move money": the sr-only announcer text in `capture/irs_07a.txt` (line 2).

## Left out on purpose

- India loss figures (₹1,935 crore / 1,23,672 digital-arrest cases in 2024, Rajya Sabha Q1505): the answer PDF couldn't be opened to verify, so they're not in the film.
- "Stays green" for the real bank call: untrue with the AI on (it ends at 35 "Be careful").
- A ≤ 3 s flag latency claim: not measured for this film.
