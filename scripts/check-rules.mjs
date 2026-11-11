// Self-check for the rules engine: `node scripts/check-rules.mjs`
import assert from "node:assert/strict";
import { scoreRules } from "../lib/rules.ts";
import { DEMOS, demoText } from "../lib/demos.ts";

for (const d of DEMOS) {
  const r = scoreRules(demoText(d));
  assert.equal(r.level, d.expect, `${d.id}: expected ${d.expect}, got ${r.level} (${r.score}) ${r.flags.map((f) => f.id)}`);
  console.log(`ok  ${d.id.padEnd(15)} ${r.level.padEnd(7)} ${r.score}  [${r.flags.map((f) => f.id).join(", ")}]`);
}

const has = (t, id) => scoreRules(t).flags.some((f) => f.id === id);
assert.ok(has("Please share the OTP you just received.", "credentials"));
assert.ok(!has("Do not share your OTP with anyone.", "credentials"), "negated OTP warning flagged");
assert.ok(has("आपके खिलाफ गिरफ्तारी वारंट है, किसी को मत बताना", "arrest_threat"));
assert.ok(has("आपके खिलाफ गिरफ्तारी वारंट है, किसी को मत बताना", "isolation"));
assert.ok(has("Aapke naam pe FIR darj hai, call mat kaatna", "isolation"));
assert.ok(has("Grandma, it's me. I'm in jail and need bail money, don't tell Mom", "family_emergency"));
assert.equal(scoreRules("Hi Mom, I'll be home late for dinner.").level, "safe");
assert.equal(scoreRules("Your Amazon package is out for delivery today.").level, "safe");
console.log("ok  all rule checks passed");
