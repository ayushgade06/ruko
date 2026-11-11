// Accuracy eval: `npm run eval` (needs the app running; BASE_URL defaults to http://localhost:3000)
// "Positive" = Caution or Danger. Writes eval/results.json, which /how-it-works renders.
import { readFileSync, writeFileSync } from "node:fs";
import { scoreRules } from "../lib/rules.ts";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const cases = JSON.parse(readFileSync(new URL("../eval/cases.json", import.meta.url), "utf8"));
const flagged = (score) => score >= 30;

async function ai(text) {
  try {
    const r = await fetch(`${BASE}/api/analyze`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mode: "text", text, lang: "en" }) });
    return r.ok ? (await r.json()).score : null;
  } catch { return null; }
}

const out = [];
for (const c of cases) {
  const rules = scoreRules(c.text).score;
  const llm = await ai(c.text);
  const hybrid = Math.max(rules, llm ?? 0);
  out.push({ ...c, rules, llm, hybrid });
  console.log(`${c.label.padEnd(5)} rules=${String(rules).padStart(3)} ai=${String(llm ?? "-").padStart(3)} hybrid=${String(hybrid).padStart(3)}  ${c.id}`);
}

function row(name, key) {
  const scams = out.filter((c) => c.label === "scam");
  const legit = out.filter((c) => c.label === "legit");
  const caught = scams.filter((c) => flagged(c[key])).length;
  const falseAlarms = legit.filter((c) => flagged(c[key])).length;
  return { name, caught, scams: scams.length, falseAlarms, legit: legit.length, recall: caught / scams.length, precision: caught / Math.max(1, caught + falseAlarms) };
}

const aiOk = out.every((c) => c.llm !== null);
const rows = [row("Rules only", "rules"), ...(aiOk ? [row("AI only", "llm"), row("Ruko (hybrid)", "hybrid")] : [])];
console.table(rows);
if (!aiOk) console.warn("AI endpoint failed for some cases: only the rules row was written.");
writeFileSync(new URL("../eval/results.json", import.meta.url), JSON.stringify({ cases: cases.length, ranAt: new Date().toISOString(), rows }, null, 2) + "\n");
