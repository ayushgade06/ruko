import { Header } from "@/components/Header";
import { RULES } from "@/lib/rules";
import results from "@/eval/results.json";

export const metadata = { title: "How Ruko works" };

type Row = { name: string; recall: number; precision: number; falseAlarms: number; caught: number; scams: number; legit: number };

export default function HowItWorks() {
  const rows = (results as { rows: Row[]; ranAt?: string; cases: number }).rows;
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-14 pt-8 leading-relaxed">
        <h1 className="text-[2.4rem] font-extrabold leading-tight tracking-[-0.01em]">How Ruko works</h1>
        <p className="mt-3 text-lg text-muted">
          Every phone scam follows the same script: <strong className="text-ink">authority + fear + isolation + an unusual payment</strong>.
          Ruko listens for that script while the call is happening.
        </p>

        <ol className="mt-8 grid gap-6 border-l-2 border-ink pl-5">
          {[
            ["Hear", "Your browser turns the call into text using built-in speech recognition. Audio never leaves your device."],
            ["Instant rules", "A rules engine checks every new sentence for 13 scam tactics in English, Hindi and Hinglish, in milliseconds, on your device. It still works if the AI is down."],
            ["AI check", "The text so far goes to Claude Haiku 5.5, which reads intent the way a person would and returns a structured verdict: score, quoted red flags, what to say, what to do."],
            ["Never downgrade", "The rules score is a floor and the meter only goes up during a call. A scammer can't talk the meter back to green."],
          ].map(([h, b]) => (
            <li key={h}>
              <p className="text-lg font-bold">{h}</p>
              <p className="mt-1 text-muted">{b}</p>
            </li>
          ))}
        </ol>

        <h2 className="mt-10 text-2xl font-bold">Accuracy</h2>
        <p className="mt-2 text-muted">
          Tested on {results.cases} labeled cases we wrote (scam and real calls/messages from the US and India, in English, Hindi and Hinglish).
          “Caught” means rated Caution or Danger. “False alarm” means a real message rated Caution or Danger.
        </p>
        {rows.length ? (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[480px] bg-card text-left">
              <thead className="text-sm text-muted">
                <tr><th className="p-3">Detector</th><th className="p-3">Scams caught</th><th className="p-3">Recall</th><th className="p-3">Precision</th><th className="p-3">False alarms</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.name} className="border-t border-line">
                    <td className="p-3 font-semibold">{r.name}</td>
                    <td className="p-3">{r.caught}/{r.scams}</td>
                    <td className="p-3">{Math.round(r.recall * 100)}%</td>
                    <td className="p-3">{Math.round(r.precision * 100)}%</td>
                    <td className="p-3">{r.falseAlarms}/{r.legit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-line p-4 text-muted">Run <code>npm run eval</code> to generate results.</p>
        )}

        <h2 className="mt-10 text-2xl font-bold">The 13 red flags</h2>
        <ul className="mt-2">
          {RULES.map((r) => (
            <li key={r.id} className="border-b border-line py-3">
              <p className="font-semibold">{r.label.en}</p>
              <p className="text-[0.95rem] text-muted">{r.why.en}</p>
            </li>
          ))}
        </ul>

        <h2 className="mt-10 text-2xl font-bold">Privacy</h2>
        <p className="mt-2 text-muted">
          No accounts. No audio is sent anywhere. Transcript text and screenshots are sent only to analyze them, and are not logged or stored.
        </p>
      </main>
    </>
  );
}
