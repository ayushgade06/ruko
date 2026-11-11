"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { Icon } from "./Icon";
import { T, type Region } from "@/lib/i18n";
import type { Lang } from "@/lib/rules";

type Ctx = { lang: Lang; region: Region; setLang: (l: Lang) => void; setRegion: (r: Region) => void };
const PrefsCtx = createContext<Ctx>({ lang: "en", region: "US", setLang: () => {}, setRegion: () => {} });
export const usePrefs = () => useContext(PrefsCtx);

// Tiny external store: in-memory first (works when storage is blocked), localStorage to persist.
const mem: Record<string, string> = {};
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };
const read = (k: string) => { if (k in mem) return mem[k]; try { return localStorage.getItem(k); } catch { return null; } };
const write = (k: string, v: string) => { mem[k] = v; try { localStorage.setItem(k, v); } catch {} listeners.forEach((cb) => cb()); };

const getLang = (): Lang => (read("ruko-lang") === "hi" ? "hi" : "en");
const getRegion = (): Region => {
  const r = read("ruko-region");
  if (r === "IN" || r === "US") return r;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return tz === "Asia/Kolkata" || tz === "Asia/Calcutta" ? "IN" : "US";
};

export function Prefs({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getLang, () => "en" as Lang);
  const region = useSyncExternalStore(subscribe, getRegion, () => "US" as Region);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const setLang = (l: Lang) => write("ruko-lang", l);
  const setRegion = (r: Region) => write("ruko-region", r);

  return (
    <PrefsCtx.Provider value={{ lang, region, setLang, setRegion }}>
      {children}
      <Footer />
    </PrefsCtx.Provider>
  );
}

function Toggle<V extends string>({ label, value, options, onChange }: { label: string; value: V; options: [V, string][]; onChange: (v: V) => void }) {
  return (
    <fieldset className="flex items-center gap-2">
      <legend className="sr-only">{label}</legend>
      <span aria-hidden className="text-sm text-muted">{label}</span>
      <div className="flex rounded-full border border-line bg-card p-0.5">
        {options.map(([v, text]) => (
          <button
            key={v}
            type="button"
            aria-pressed={value === v}
            onClick={() => onChange(v)}
            className={`min-h-11 rounded-full px-4 font-semibold ${value === v ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}
          >
            {text}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Footer() {
  const { lang, region, setLang, setRegion } = usePrefs();
  const t = T[lang];
  return (
    <footer className="mt-auto border-t border-line px-5 py-7">
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <Toggle label={t.language} value={lang} options={[["en", "English"], ["hi", "हिंदी"]]} onChange={setLang} />
          <Toggle label={t.region} value={region} options={[["IN", t.regionIN], ["US", t.regionUS]]} onChange={setRegion} />
        </div>
        <div className="flex gap-4 text-sm">
          <Link href="/how-it-works" className="font-semibold text-accent underline-offset-4 hover:underline">{t.howItWorks}</Link>
        </div>
      </div>
      <p className="mx-auto mt-5 flex max-w-2xl gap-2 text-sm text-muted"><Icon name="lock" className="mt-0.5 size-4 shrink-0" /><span>{t.privacy} {t.disclaimer}</span></p>
    </footer>
  );
}
