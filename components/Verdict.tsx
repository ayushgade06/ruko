"use client";

import { useState } from "react";
import { HELP, T, type Region } from "@/lib/i18n";
import { flagLabel, type Flag, type Level } from "@/lib/rules";
import type { View } from "@/lib/verdict";
import { usePrefs } from "./Prefs";

const TONE: Record<Level, { fg: string; bg: string; icon: string }> = {
  safe: { fg: "text-safe", bg: "bg-safe-bg", icon: "✓" },
  caution: { fg: "text-caution", bg: "bg-caution-bg", icon: "!" },
  danger: { fg: "text-danger", bg: "bg-danger-bg", icon: "✕" },
};
const STROKE: Record<Level, string> = { safe: "var(--safe)", caution: "var(--caution)", danger: "var(--danger)" };

export function RiskMeter({ score, level }: { score: number; level: Level }) {
  const { lang } = usePrefs();
  const t = T[lang];
  const tone = TONE[level];
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 112" className="w-full max-w-[280px]" role="img" aria-label={`${t.risk} ${score} / 100: ${t[`level_${level}`]}`}>
        <path d="M14 100 A86 86 0 0 1 186 100" fill="none" stroke="var(--line)" strokeWidth="16" strokeLinecap="round" />
        <path
          d="M14 100 A86 86 0 0 1 186 100" fill="none" stroke={STROKE[level]} strokeWidth="16" strokeLinecap="round"
          pathLength={100} strokeDasharray="100" strokeDashoffset={100 - Math.max(score, 1)}
          style={{ transition: "stroke-dashoffset 700ms cubic-bezier(.2,.8,.2,1), stroke 400ms" }}
        />
        <text x="100" y="86" textAnchor="middle" className="fill-ink" style={{ font: "700 44px var(--font-display)" }}>{score}</text>
        <text x="100" y="106" textAnchor="middle" className="fill-muted" style={{ font: "600 12px var(--font-noto)", letterSpacing: "0.12em" }}>{t.risk.toUpperCase()}</text>
      </svg>
      <p className={`mt-1 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-lg font-bold ${tone.fg} ${tone.bg}`}>
        <span aria-hidden className="grid size-6 place-items-center rounded-full border-2 border-current text-sm leading-none">{tone.icon}</span>
        {t[`level_${level}`]}
      </p>
    </div>
  );
}

export function FlagList({ flags }: { flags: Flag[] }) {
  const { lang } = usePrefs();
  const t = T[lang];
  return (
    <section aria-labelledby="flags-h">
      <h2 id="flags-h" className="mb-3 text-sm font-bold uppercase tracking-widest text-muted">{t.redFlags}</h2>
      {flags.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-4 py-5 text-muted">{t.noFlags}</p>
      ) : (
        <ul className="space-y-3">
          {[...flags].reverse().map((f) => (
            <li key={f.id} className="rise rounded-2xl border border-line bg-card p-4">
              <p className="flex items-start gap-2 font-bold">
                <span aria-hidden className="mt-0.5 text-danger">⚠</span>
                {flagLabel(f.id, lang)}
              </p>
              {f.quote && <blockquote className="mt-2 border-l-4 border-line pl-3 italic text-muted">“{f.quote}”</blockquote>}
              {f.why && <p className="mt-2 text-[0.95rem]">{f.why}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function Advice({ view }: { view: View }) {
  const { lang } = usePrefs();
  const t = T[lang];
  return (
    <div className="grid gap-3">
      <section className="rounded-2xl bg-accent-soft p-5">
        <h2 className="text-sm font-bold uppercase tracking-widest text-accent">💬 {t.sayThis}</h2>
        <p className="mt-2 font-display text-2xl leading-snug">“{view.sayThis}”</p>
      </section>
      <section className="rounded-2xl border border-line bg-card p-5">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted">{t.doNow}</h2>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5">
          {view.doNow.map((s) => <li key={s}>{s}</li>)}
        </ol>
      </section>
    </div>
  );
}

export function DangerActions({ view, region: forced }: { view: View; region?: Region }) {
  const { lang, region: pref } = usePrefs();
  const region = forced ?? pref;
  const t = T[lang];
  const [copied, setCopied] = useState(false);

  async function share() {
    const text = `Ruko: ${view.summary}${view.flags[0]?.quote ? `\n“${view.flags[0].quote}”` : ""}`;
    try {
      if (navigator.share) return await navigator.share({ title: "Ruko alert", text });
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {}
  }

  if (view.level !== "danger") return null;
  return (
    <section className="rise rounded-3xl bg-danger-solid p-5 text-white shadow-lg" aria-labelledby="hangup-h">
      <h2 id="hangup-h" className="font-display text-3xl font-bold">{t.hangUp}</h2>
      <p className="mt-1 text-white/90">{t.hangUpSub}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button onClick={share} className="min-h-12 rounded-xl bg-white px-4 font-bold text-[#7a1a14]">
          👪 {copied ? t.shared : t.tellFamily}
        </button>
        {HELP[region].map((h) => (
          <a key={h.href} href={h.href} target={h.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
            className="flex min-h-12 items-center justify-center rounded-xl border-2 border-white/70 px-4 text-center font-semibold">
            {h.label[lang]}
          </a>
        ))}
      </div>
    </section>
  );
}

export function Announcer({ view }: { view: View }) {
  const { lang } = usePrefs();
  const t = T[lang];
  const top = view.flags.at(-1);
  return (
    <div className="sr-only" aria-live="assertive" aria-atomic="true">
      {t[`level_${view.level}`]}. {view.level === "danger" ? t.hangUp : ""} {top ? flagLabel(top.id, lang) : ""}
    </div>
  );
}
