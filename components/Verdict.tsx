"use client";

import { useState } from "react";
import { HELP, T, type Region } from "@/lib/i18n";
import { flagLabel, type Flag, type Level } from "@/lib/rules";
import type { View } from "@/lib/verdict";
import { Icon, type IconName } from "./Icon";
import { usePrefs } from "./Prefs";

const TONE: Record<Level, { fg: string; bg: string; icon: IconName }> = {
  safe: { fg: "text-safe", bg: "bg-safe-bg", icon: "check" },
  caution: { fg: "text-caution", bg: "bg-caution-bg", icon: "alert" },
  danger: { fg: "text-danger", bg: "bg-danger-bg", icon: "x" },
};
const STROKE: Record<Level, string> = { safe: "var(--safe)", caution: "var(--caution)", danger: "var(--danger)" };

export function RiskMeter({ score, level }: { score: number; level: Level }) {
  const { lang } = usePrefs();
  const t = T[lang];
  const tone = TONE[level];
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 112" className="w-full max-w-[280px]" role="img" aria-label={`${t.risk} ${score} / 100: ${t[`level_${level}`]}`}>
        <path d="M14 100 A86 86 0 0 1 186 100" fill="none" stroke="var(--line)" strokeWidth="14" strokeLinecap="round" />
        <path
          d="M14 100 A86 86 0 0 1 186 100" fill="none" stroke={STROKE[level]} strokeWidth="14" strokeLinecap="round"
          pathLength={100} strokeDasharray="100" strokeDashoffset={100 - Math.max(score, 1)}
          style={{ transition: "stroke-dashoffset 700ms cubic-bezier(.2,.8,.2,1), stroke 400ms" }}
        />
        <text x="100" y="86" textAnchor="middle" className="fill-ink" style={{ font: "800 46px var(--font-atk)", letterSpacing: "-0.02em" }}>{score}</text>
        <text x="100" y="106" textAnchor="middle" className="fill-muted" style={{ font: "600 13px var(--font-atk)" }}>{t.risk} / 100</text>
      </svg>
      <p className={`mt-1 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-lg font-bold ${tone.fg} ${tone.bg}`}>
        <Icon name={tone.icon} className="size-5" />
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
      <h2 id="flags-h" className="mb-3 text-xl font-bold">{t.redFlags}</h2>
      {flags.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-4 py-5 text-muted">{t.noFlags}</p>
      ) : (
        <ul className="space-y-3">
          {[...flags].reverse().map((f) => (
            <li key={f.id} className="rise rounded-r-2xl border-l-4 border-danger bg-card py-4 pl-5 pr-4">
              <p className="font-bold text-danger">{flagLabel(f.id, lang)}</p>
              {f.quote && <blockquote className="mt-2 text-lg font-semibold leading-snug">“{f.quote}”</blockquote>}
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
      <section className="rounded-[22px] bg-accent p-6 text-accent-ink">
        <h2 className="flex items-center gap-2 font-bold opacity-90"><Icon name="message" className="size-5" />{t.sayThis}</h2>
        <p className="mt-2 text-[1.6rem] font-bold leading-snug text-balance">“{view.sayThis}”</p>
      </section>
      <section className="rounded-[22px] border-2 border-line p-5">
        <h2 className="text-xl font-bold">{t.doNow}</h2>
        <ol className="mt-2 list-decimal space-y-1.5 pl-6 text-lg marker:font-bold marker:text-accent">
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
    <section className="rise rounded-[22px] bg-danger-solid p-6 text-white shadow-[0_16px_40px_-16px_rgba(179,38,30,.7)]" aria-labelledby="hangup-h">
      <h2 id="hangup-h" className="text-[2rem] font-extrabold leading-tight tracking-[-0.01em]">{t.hangUp}</h2>
      <p className="mt-1 text-white/90">{t.hangUpSub}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button onClick={share} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-4 font-bold text-[#7a1a14]">
          <Icon name="people" className="size-5" />{copied ? t.shared : t.tellFamily}
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
