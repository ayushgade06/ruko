"use client";

import Link from "next/link";
import { Mark } from "@/components/Header";
import { usePrefs } from "@/components/Prefs";
import { T } from "@/lib/i18n";

export default function Home() {
  const { lang } = usePrefs();
  const t = T[lang];
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-12 pt-10">
      <div className="flex items-center gap-3">
        <Mark className="size-12" />
        <div>
          <h1 className="font-display text-5xl font-bold leading-none tracking-tight">Ruko</h1>
          <p lang="hi" className="text-muted">रुको · wait</p>
        </div>
      </div>

      <p className="mt-8 max-w-xl font-display text-[1.75rem] font-semibold leading-snug">{t.tagline}</p>

      <nav className="mt-8 grid gap-4" aria-label="Start">
        <Link href="/listen" className="group flex min-h-24 items-center gap-4 rounded-3xl bg-accent px-6 py-5 text-accent-ink shadow-sm transition-transform active:scale-[0.99]">
          <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/15 text-3xl">🎧</span>
          <span>
            <span className="block text-2xl font-bold">{t.listen}</span>
            <span className="block opacity-90">{t.listenSub}</span>
          </span>
          <span aria-hidden className="ml-auto text-3xl transition-transform group-hover:translate-x-1">→</span>
        </Link>
        <Link href="/check" className="group flex min-h-24 items-center gap-4 rounded-3xl border-2 border-line bg-card px-6 py-5 transition-transform active:scale-[0.99]">
          <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-2xl bg-accent-soft text-3xl">💬</span>
          <span>
            <span className="block text-2xl font-bold">{t.check}</span>
            <span className="block text-muted">{t.checkSub}</span>
          </span>
          <span aria-hidden className="ml-auto text-3xl text-muted transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </nav>

      <Link href="/listen?demo=digital-arrest" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full border border-line bg-card px-5 font-semibold text-accent">
        ▶ {t.tryDemo}
      </Link>

      <ul className="mt-12 grid gap-3 text-muted sm:grid-cols-3">
        {(lang === "hi"
          ? [["🇮🇳", "“डिजिटल अरेस्ट”, नकली CBI, पार्सल और KYC ठगी"], ["🇺🇸", "IRS, Social Security, टेक-सपोर्ट और ‘पोते की इमरजेंसी’ ठगी"], ["⚡", "कुछ सेकंड में चेतावनी — AI बंद हो तब भी"]]
          : [["🇮🇳", "“Digital arrest”, fake CBI, parcel & KYC scams"], ["🇺🇸", "IRS, Social Security, tech-support & grandparent scams"], ["⚡", "Warns within seconds, even if the AI is down"]]
        ).map(([i, s]) => (
          <li key={s} className="rounded-2xl border border-line p-4 text-[0.95rem]"><span aria-hidden className="mr-1">{i}</span>{s}</li>
        ))}
      </ul>
    </main>
  );
}
