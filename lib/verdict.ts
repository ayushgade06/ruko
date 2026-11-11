import { z } from "zod";
import { flagWhy, levelOf, type Flag, type FlagId, type Lang, type Level } from "./rules";
import { FALLBACK } from "./i18n";

export const FLAG_IDS = [
  "authority", "arrest_threat", "isolation", "money_move", "credentials", "parcel", "urgency",
  "too_good", "kyc", "gov_agency", "tech_support", "odd_payment", "family_emergency", "other",
] as const satisfies readonly FlagId[];

// No length/range constraints in the schema itself (not every provider's structured
// output supports them); we clamp in `clampVerdict` instead.
export const VerdictSchema = z.object({
  score: z.number().describe("0-100 likelihood this is a scam"),
  level: z.enum(["safe", "caution", "danger"]),
  flags: z.array(z.object({
    id: z.enum(FLAG_IDS),
    quote: z.string().describe("Exact words from the input that show this red flag"),
    explanation: z.string().describe("One plain sentence, in the user's language, explaining why this is a red flag"),
  })).describe("At most 6 red flags, empty if none"),
  sayThis: z.string().describe("One short sentence the user can say out loud right now"),
  doNow: z.array(z.string()).describe("1-3 short imperative next steps"),
  summary: z.string().describe("One or two sentences a family member can read to understand what happened"),
});
export type Verdict = z.infer<typeof VerdictSchema>;

const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

export function clampVerdict(v: Verdict): Verdict {
  const score = Math.max(0, Math.min(100, Math.round(v.score)));
  return {
    score,
    level: levelOf(score),
    flags: v.flags.slice(0, 6).map((f) => ({ id: f.id, quote: cut(f.quote, 200), explanation: cut(f.explanation, 220) })),
    sayThis: cut(v.sayThis, 180),
    doNow: v.doNow.slice(0, 3).map((s) => cut(s, 140)),
    summary: cut(v.summary, 280),
  };
}

// Fold a newer LLM verdict into the running one for a live call: the score only ratchets up,
// flags accumulate, and the advice comes from whichever verdict was more alarmed.
export function accumulate(prev: Verdict | null, next: Verdict): Verdict {
  if (!prev) return next;
  const flags = new Map(prev.flags.map((f) => [f.id, f]));
  for (const f of next.flags) flags.set(f.id, f);
  const advice = next.score >= prev.score ? next : prev;
  const score = Math.max(prev.score, next.score);
  return { ...advice, score, level: levelOf(score), flags: [...flags.values()].slice(0, 8) };
}

export type View = {
  score: number; level: Level; flags: Flag[];
  sayThis: string; doNow: string[]; summary: string; smart: boolean;
};

// The rules score is a floor: the LLM can raise risk, never hide a rule hit.
// `floor` lets a live call keep its peak score so the meter never drops mid-scam.
export function merge(rules: { score: number; flags: Flag[] }, llm: Verdict | null, lang: Lang, floor = 0): View {
  const flags = new Map<FlagId, Flag>();
  for (const f of rules.flags) flags.set(f.id, { ...f, why: flagWhy(f.id, lang) });
  for (const f of llm?.flags ?? []) flags.set(f.id, { id: f.id, quote: f.quote, why: f.explanation || flagWhy(f.id, lang) });
  const score = Math.max(rules.score, llm?.score ?? 0, floor);
  const level = levelOf(score);
  const useLlm = llm && levelOf(llm.score) === level;
  const fb = FALLBACK[lang][level];
  return {
    score, level, flags: [...flags.values()],
    sayThis: useLlm && llm.sayThis ? llm.sayThis : fb.sayThis,
    doNow: useLlm && llm.doNow.length ? llm.doNow : fb.doNow,
    summary: llm?.summary || fb.summary,
    smart: !!llm,
  };
}
