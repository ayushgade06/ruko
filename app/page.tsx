"use client";

import Link from "next/link";
import { Mark } from "@/components/Header";
import { Icon } from "@/components/Icon";
import { usePrefs } from "@/components/Prefs";
import { T } from "@/lib/i18n";

const CATCHES = {
  en: [
    ["India", "“Digital arrest”, fake CBI officers, parcel and KYC scams"],
    ["United States", "Fake IRS, Social Security and tech-support calls, and the grandchild-in-jail scam"],
    ["Even offline", "The basic check runs on your phone, so you are warned within seconds even if the AI is down"],
  ],
  hi: [
    ["भारत", "“डिजिटल अरेस्ट”, नकली CBI, पार्सल और KYC ठगी"],
    ["अमेरिका", "नकली IRS, Social Security, टेक-सपोर्ट और ‘पोते की इमरजेंसी’ ठगी"],
    ["AI के बिना भी", "बुनियादी जाँच आपके फ़ोन पर चलती है, इसलिए AI बंद हो तब भी कुछ सेकंड में चेतावनी"],
  ],
} as const;

export default function Home() {
  const { lang } = usePrefs();
  const t = T[lang];
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-14 pt-8">
      <div className="flex items-center gap-3">
        <Mark className="size-11" />
        <p className="text-2xl font-bold tracking-tight">
          Ruko <span lang="hi" className="ml-1 font-normal text-muted">रुको, “wait”</span>
        </p>
      </div>

      <h1 className="mt-14 text-[2.6rem] font-extrabold leading-[1.05] tracking-[-0.02em] text-balance sm:text-[3.4rem]">{t.tagline}</h1>

      <nav className="mt-10 grid gap-3" aria-label="Start">
        <Link
          href="/listen"
          className="flex min-h-24 items-center gap-5 rounded-[22px] bg-accent px-6 py-5 text-accent-ink shadow-[0_1px_0_rgba(0,0,0,.08),0_12px_30px_-12px_rgba(42,63,176,.55)] active:translate-y-px"
        >
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-accent-ink/15">
            <Icon name="mic" className="size-7" />
          </span>
          <span>
            <span className="block text-2xl font-bold">{t.listen}</span>
            <span className="block opacity-90">{t.listenSub}</span>
          </span>
        </Link>
        <Link href="/check" className="flex min-h-24 items-center gap-5 rounded-[22px] border-2 border-ink/80 px-6 py-5 hover:bg-card active:translate-y-px">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
            <Icon name="message" className="size-7" />
          </span>
          <span>
            <span className="block text-2xl font-bold">{t.check}</span>
            <span className="block text-muted">{t.checkSub}</span>
          </span>
        </Link>
      </nav>

      <Link href="/listen?demo=digital-arrest" className="mt-5 inline-flex min-h-12 items-center gap-2.5 font-bold text-accent underline decoration-2 underline-offset-[6px]">
        <Icon name="play" filled className="size-4" />
        {t.tryDemo}
      </Link>

      <dl className="mt-16 grid gap-6 border-t-2 border-ink pt-6 sm:grid-cols-3 sm:gap-8">
        {CATCHES[lang].map(([k, v]) => (
          <div key={k}>
            <dt className="font-bold">{k}</dt>
            <dd className="mt-1 text-muted">{v}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
