// Instant, offline red-flag detector. Runs in the browser on every transcript change,
// and is the floor the LLM can only raise (never lower). Self-contained so
// `node scripts/check-rules.mjs` can import it directly.

export type Lang = "en" | "hi";
export type FlagId =
  | "authority" | "arrest_threat" | "isolation" | "money_move" | "credentials"
  | "parcel" | "urgency" | "too_good" | "kyc" | "gov_agency" | "tech_support"
  | "odd_payment" | "family_emergency" | "other";

export type Flag = { id: FlagId; quote: string; why?: string };
export type Level = "safe" | "caution" | "danger";

type Rule = { id: FlagId; weight: number; label: Record<Lang, string>; why: Record<Lang, string>; re: RegExp[] };

export const RULES: Rule[] = [
  {
    id: "authority", weight: 25,
    label: { en: "Claims to be police, CBI or another authority", hi: "पुलिस, CBI या सरकारी अफ़सर होने का दावा" },
    why: { en: "Real police and investigators don't question you or settle cases over a phone or video call.", hi: "असली पुलिस या जाँच एजेंसी फ़ोन या वीडियो कॉल पर जाँच नहीं करती।" },
    re: [
      /\b(cbi|police|cyber ?(crime|cell)|crime branch|enforcement directorate|customs (officer|department)|narcotics|\bncb\b|trai|income tax (officer|department)|supreme court|high court|inspector)\b/i,
      /\bfir\b.{0,25}(registered|darj|filed|lodged)|(registered|filed|lodged|darj).{0,25}\bfir\b/i,
      /सीबीआई|पुलिस|साइबर क्राइम|कस्टम|इंस्पेक्टर/,
    ],
  },
  {
    id: "arrest_threat", weight: 30,
    label: { en: "Threatens arrest or legal action", hi: "गिरफ़्तारी या केस की धमकी" },
    why: { en: "\"Digital arrest\" doesn't exist. No agency arrests you by phone or lets you pay to avoid it.", hi: "\"डिजिटल अरेस्ट\" जैसा कुछ नहीं होता। कोई एजेंसी फ़ोन पर गिरफ़्तार नहीं करती।" },
    re: [
      /\b(digital arrest|arrest(ed)?|warrant|jail|giraft?ar|girftar|lawsuit|legal action|prosecut\w*|handcuff\w*)\b/i,
      /गिरफ्तार|गिरफ़्तार|जेल|वारंट|डिजिटल अरेस्ट/,
    ],
  },
  {
    id: "isolation", weight: 30,
    label: { en: "Tells you to stay on the call or keep it secret", hi: "कॉल पर बने रहने या किसी को न बताने को कहा" },
    why: { en: "Scammers cut you off from family so nobody can warn you. A real official never forbids you from hanging up.", hi: "ठग आपको परिवार से अलग रखते हैं ताकि कोई आपको सावधान न कर सके।" },
    re: [
      /\b(do not|don'?t|never) (disconnect|hang up|cut (the|this) call|tell anyone|tell your|inform|discuss)/i,
      /\bstay on (the |this )?(line|call|video)\b|keep (this|it) (secret|confidential)|confidential investigation/i,
      /\bkisi ko (bhi )?mat bata\w*|(call|phone) mat kaat\w*|camera (on rakh\w*|band mat)/i,
      /किसी को (भी )?मत बता|फ़?फोन मत काट|कॉल मत काट/,
    ],
  },
  {
    id: "money_move", weight: 35,
    label: { en: "Asks you to move money", hi: "पैसे ट्रांसफर करने को कहा" },
    why: { en: "No government agency or bank asks you to move savings to a \"safe\" or \"verification\" account.", hi: "कोई सरकारी एजेंसी या बैंक \"सेफ़ अकाउंट\" में पैसे भेजने को नहीं कहता।" },
    re: [
      /\b(safe|secure|verification|rbi) account\b|rbi verification/i,
      /\btransfer (the |your |all )?(money|funds|amount|savings|balance)|send (the |your )?money|paise? (transfer|bhej\w*)|paisa bhej\w*/i,
      /fixed deposit.{0,25}(break|transfer)|\b(upi|neft|rtgs)\b/i,
      /पैसे (ट्रांसफर|भेज)|सेफ अकाउंट/,
    ],
  },
  {
    id: "credentials", weight: 35,
    label: { en: "Asks for OTP, PIN, ID or remote access", hi: "OTP / PIN / आधार / स्क्रीन शेयर माँगा" },
    why: { en: "Anyone who asks for an OTP, PIN or screen access can empty your account.", hi: "OTP, PIN या स्क्रीन एक्सेस माँगने वाला आपका खाता खाली कर सकता है।" },
    re: [
      /\b(otp|pin|cvv|password|one[- ]time password)\b/i,
      /\b(aadhaa?r|pan card|card|social security|ssn) (number|details)\b|\bssn\b/i,
      /\b(anydesk|teamviewer|quick ?support|screen ?shar\w*|remote access|log ?in to your bank)\b/i,
      /ओटीपी|पिन नंबर|आधार नंबर/,
    ],
  },
  {
    id: "parcel", weight: 20,
    label: { en: "Parcel or courier with illegal items", hi: "पार्सल या कूरियर में गैरकानूनी सामान" },
    why: { en: "\"Your parcel had drugs\" is a classic opener used to scare people into the rest of the scam.", hi: "\"आपके पार्सल में ड्रग्स हैं\" — यह ठगी की आम शुरुआत है।" },
    re: [
      /\b(parcel|fedex|dhl|blue ?dart)\b/i,
      /\b(drugs|mdma|narcotic\w*|contraband|fake passports?)\b/i,
      /पार्सल|ड्रग्स/,
    ],
  },
  {
    id: "urgency", weight: 15,
    label: { en: "Extreme time pressure", hi: "बहुत जल्दबाज़ी का दबाव" },
    why: { en: "Pressure to act right now is meant to stop you from thinking or checking.", hi: "तुरंत करने का दबाव इसलिए बनाया जाता है ताकि आप सोच या जाँच न सकें।" },
    re: [
      /\b(immediately|right now|right away|urgent(ly)?|today itself|abhi|turant|jaldi)\b/i,
      /\bwithin (\d+|one|two|three|24|48) (hours?|minutes?)\b|\blast chance\b/i,
      /तुरंत|अभी के अभी|जल्दी/,
    ],
  },
  {
    id: "too_good", weight: 20,
    label: { en: "Prize, refund or easy-money lure", hi: "इनाम, रिफ़ंड या पक्की कमाई का लालच" },
    why: { en: "Unexpected prizes, refunds and guaranteed returns are bait.", hi: "अचानक इनाम, रिफ़ंड या पक्का मुनाफ़ा — यह चारा होता है।" },
    re: [
      /\b(lottery|lucky draw|you (have )?won|prize|refund|cashback|work from home|part[- ]time job|kbc)\b/i,
      /\b(guaranteed (returns?|profit)|double your money|crypto (trading|investment))\b/i,
      /लॉटरी|इनाम|रिफंड/,
    ],
  },
  {
    id: "kyc", weight: 25,
    label: { en: "Account, SIM or power will be cut off", hi: "KYC / सिम / बिजली / खाता बंद होने की धमकी" },
    why: { en: "Banks and utilities send written notices. They don't threaten to cut you off on a surprise call.", hi: "बैंक और बिजली विभाग लिखित नोटिस भेजते हैं, अचानक कॉल पर धमकी नहीं देते।" },
    re: [
      /\bkyc\b|\bsim (card )?(will be )?(blocked|band|deactivat\w*)/i,
      /\b(account|card) (will be |has been |is )?(blocked|frozen|suspended|band)\b/i,
      /\b(electricity|power|bijli) .{0,30}(disconnect\w*|cut|kaat\w*|kat)\b/i,
      /केवाईसी|सिम बंद|खाता बंद|बिजली (कट|काट)/,
    ],
  },
  {
    id: "gov_agency", weight: 25,
    label: { en: "Claims to be the IRS, Social Security or Medicare", hi: "IRS / Social Security / Medicare होने का दावा" },
    why: { en: "The IRS and Social Security contact you by mail first and never demand payment by phone.", hi: "IRS और Social Security पहले चिट्ठी भेजते हैं, फ़ोन पर पैसे नहीं माँगते।" },
    re: [
      /\b(irs|internal revenue|social security|ssa|medicare|medicaid|back taxes|treasury department|homeland security|dea|fbi|u\.?s\.? marshals?)\b/i,
      /\btax (debt|fraud|evasion)\b/i,
    ],
  },
  {
    id: "tech_support", weight: 25,
    label: { en: "\"Tech support\" or \"your computer has a virus\"", hi: "कंप्यूटर में वायरस / टेक सपोर्ट" },
    why: { en: "Microsoft, Apple and Amazon never call you about viruses or refunds.", hi: "Microsoft, Apple या Amazon कभी वायरस या रिफ़ंड के लिए कॉल नहीं करते।" },
    re: [
      /\b(microsoft|windows (support|technician|defender)|apple (support|care)|amazon (support|refund)|geek squad|norton|mcafee)\b/i,
      /\b(virus|malware|hacked|tech(nical)? support)\b/i,
    ],
  },
  {
    id: "odd_payment", weight: 40,
    label: { en: "Demands gift cards, crypto or wire transfer", hi: "गिफ़्ट कार्ड, क्रिप्टो या वायर से भुगतान" },
    why: { en: "Only scammers ask for payment in gift cards, crypto or cash couriers. It can't be traced or reversed.", hi: "गिफ़्ट कार्ड या क्रिप्टो से पैसे सिर्फ़ ठग माँगते हैं — ये वापस नहीं मिलते।" },
    re: [
      /\b(gift ?cards?|google play (cards?)?|itunes|apple (gift )?cards?|steam cards?|bitcoin|crypto(currency)? (atm|wallet)|btc|usdt)\b/i,
      /\b(wire (transfer|the money)|western union|moneygram|zelle|venmo|cash ?app)\b/i,
      /\b(pick up (the )?cash|courier (will|to) (pick|collect)|cash in (a|the) (box|envelope))\b/i,
    ],
  },
  {
    id: "family_emergency", weight: 30,
    label: { en: "\"Family member\" in an emergency", hi: "परिवार के सदस्य की इमरजेंसी" },
    why: { en: "Voices can be faked. Hang up and call your family member on their usual number.", hi: "आवाज़ नकली हो सकती है। फ़ोन रखें और परिवार के सदस्य को उनके नंबर पर ख़ुद कॉल करें।" },
    re: [
      /\bit'?s me,? (your )?(grand(son|daughter)|son|daughter|nephew|niece)\b/i,
      /\b(grandma|grandpa|nani|dadi|nana|dada),? it'?s me\b|\bbail (money)?\b|\bdon'?t tell (mom|dad|mum)\b/i,
      /\bi'?m in (jail|trouble|the hospital)\b/i,
    ],
  },
];

export const OTHER_LABEL: Record<Lang, string> = { en: "Other suspicious sign", hi: "अन्य संदिग्ध बात" };

const BY_ID = Object.fromEntries(RULES.map((r) => [r.id, r])) as Record<string, Rule>;
export const flagLabel = (id: FlagId, lang: Lang) => BY_ID[id]?.label[lang] ?? OTHER_LABEL[lang];
export const flagWhy = (id: FlagId, lang: Lang) => BY_ID[id]?.why[lang] ?? "";

const AUTHORITY: FlagId[] = ["authority", "gov_agency", "tech_support", "family_emergency"];
const PRESSURE: FlagId[] = ["isolation", "money_move", "odd_payment", "credentials"];

// A match preceded in the same sentence by a protective negation ("we will never ask for your OTP")
// is a legit warning, not a red flag.
const NEGATION = /\b(never|will not|won't|would not|do not share|don'?t share|not ask|not need|nahi (maang|puch)\w*|kabhi nahi)\b[^.!?\n]*$/i;

export function levelOf(score: number): Level {
  return score >= 60 ? "danger" : score >= 30 ? "caution" : "safe";
}

function sentenceAround(text: string, start: number, len: number) {
  const before = text.slice(0, start);
  const s = Math.max(before.search(/[^.!?\n]*$/), 0);
  const tail = text.slice(start + len).search(/[.!?\n]/);
  const e = tail === -1 ? text.length : start + len + tail + 1;
  let q = text.slice(s, e).replace(/^\s*(caller|you):\s*/i, "").trim();
  if (q.length > 160) {
    const mid = start - s;
    q = "…" + q.slice(Math.max(0, mid - 70), mid + len + 70).trim() + "…";
  }
  return q;
}

export function scoreRules(text: string): { score: number; level: Level; flags: Flag[] } {
  const hits: { at: number; flag: Flag }[] = [];
  for (const rule of RULES) {
    let best: { at: number; len: number } | null = null; // earliest hit across this rule's patterns
    for (const re of rule.re) {
      const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
      for (let m = g.exec(text); m; m = g.exec(text)) {
        if (m[0].length === 0) { g.lastIndex++; continue; }
        if (NEGATION.test(text.slice(Math.max(0, m.index - 50), m.index))) continue;
        if (!best || m.index < best.at) best = { at: m.index, len: m[0].length };
        break;
      }
    }
    if (best) hits.push({ at: best.at, flag: { id: rule.id, quote: sentenceAround(text, best.at, best.len) } });
  }
  // Order by where they appear, so the UI can show the newest red flag first.
  const flags = hits.sort((a, b) => a.at - b.at).map((h) => h.flag);
  const ids = new Set(flags.map((f) => f.id));
  let score = flags.reduce((s, f) => s + BY_ID[f.id].weight, 0);
  if (AUTHORITY.some((i) => ids.has(i)) && PRESSURE.some((i) => ids.has(i))) score *= 1.3;
  score = Math.min(100, Math.round(score));
  return { score, level: levelOf(score), flags };
}
