"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { usePrefs } from "@/components/Prefs";
import { Advice, Announcer, DangerActions, FlagList, RiskMeter } from "@/components/Verdict";
import { DEMOS, type Demo } from "@/lib/demos";
import { T } from "@/lib/i18n";
import { scoreRules } from "@/lib/rules";
import { accumulate, merge, type Verdict } from "@/lib/verdict";

type Line = { who?: "caller" | "you"; text: string };
type Status = "idle" | "listening" | "demo" | "stopped" | "unsupported" | "denied";

// Minimal typing for the (still prefixed in Chrome) Web Speech API.
type SR = {
  lang: string; continuous: boolean; interimResults: boolean;
  start(): void; stop(): void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
const getSR = (): (new () => SR) | undefined =>
  typeof window === "undefined" ? undefined : ((window as unknown as Record<string, unknown>).SpeechRecognition ?? (window as unknown as Record<string, unknown>).webkitSpeechRecognition) as (new () => SR) | undefined;

export default function ListenPage() {
  return (
    <Suspense>
      <Listen />
    </Suspense>
  );
}

function Listen() {
  const { lang, region } = usePrefs();
  const t = T[lang];
  const params = useSearchParams();
  const demoId = params.get("demo");

  const [status, setStatus] = useState<Status>("idle");
  const [lines, setLines] = useState<Line[]>([]);
  const [interim, setInterim] = useState("");
  const [llm, setLlm] = useState<Verdict | null>(null);
  const [smartDown, setSmartDown] = useState(false);
  const [muted, setMuted] = useState(false);
  const [typed, setTyped] = useState("");
  const [activeDemo, setActiveDemo] = useState<Demo | null>(null);

  const recRef = useRef<SR | null>(null);
  const wantRef = useRef(false);
  const runRef = useRef(0); // bumps to cancel a running demo
  const mutedRef = useRef(false);

  const text = useMemo(
    () => lines.map((l) => (l.who ? `${l.who === "caller" ? "Caller" : "You"}: ${l.text}` : l.text)).join("\n"),
    [lines],
  );
  const rules = useMemo(() => scoreRules(text), [text]);
  // The meter never drops during a call (a reassuring dip mid-scam would be dangerous). This holds
  // by construction: rules scan the whole growing transcript and `accumulate` keeps the max LLM score.
  const shown = useMemo(() => merge(rules, llm, lang), [rules, llm, lang]);
  const { score, level } = shown;

  const wasDanger = useRef(false);
  useEffect(() => {
    if (level === "danger" && !wasDanger.current) navigator.vibrate?.([250, 120, 250]);
    wasDanger.current = level === "danger";
  }, [level]);

  // LLM pass: debounced after each new line. In-flight requests aren't aborted — results only
  // ever ratchet the verdict up, so a late answer is still useful.
  useEffect(() => {
    if (!text.trim()) return;
    const id = setTimeout(async () => {
      try {
        const r = await fetch("/api/analyze", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ mode: "live", text: text.slice(-9000), lang }),
        });
        if (!r.ok) throw new Error(String(r.status));
        const v = (await r.json()) as Verdict;
        setLlm((prev) => accumulate(prev, v));
        setSmartDown(false);
      } catch {
        setSmartDown(true);
      }
    }, 900);
    return () => clearTimeout(id);
  }, [text, lang]);

  const addLine = useCallback((text: string, who?: Line["who"]) => {
    if (text.trim()) setLines((ls) => [...ls, { who, text: text.trim() }]);
  }, []);

  function reset() {
    setLines([]); setInterim(""); setLlm(null); setSmartDown(false);
  }

  function stopAll() {
    wantRef.current = false;
    recRef.current?.stop();
    runRef.current++;
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
    setInterim("");
    setStatus("stopped");
  }

  function startListening() {
    const SR = getSR();
    if (!SR) return setStatus("unsupported");
    reset(); setActiveDemo(null);
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang === "hi" ? "hi-IN" : region === "IN" ? "en-IN" : "en-US";
    rec.onresult = (e) => {
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) addLine(r[0].transcript); else live += r[0].transcript;
      }
      setInterim(live);
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") { wantRef.current = false; setStatus("denied"); }
    };
    // Chrome ends recognition after silence; keep it going until the user presses Stop.
    rec.onend = () => { if (wantRef.current) try { rec.start(); } catch {} };
    wantRef.current = true;
    recRef.current = rec;
    try { rec.start(); setStatus("listening"); } catch { setStatus("unsupported"); }
  }

  const speak = useCallback((line: Line, voiceLang: string) => new Promise<void>((resolve) => {
    const n = line.text.length;
    const silent = mutedRef.current || typeof speechSynthesis === "undefined";
    const fallback = setTimeout(resolve, silent ? 700 + n * 45 : 1500 + n * 95);
    if (silent) return;
    const u = new SpeechSynthesisUtterance(line.text);
    u.lang = voiceLang;
    const voices = speechSynthesis.getVoices().filter((v) => v.lang.replace("_", "-").startsWith(voiceLang));
    if (voices.length) u.voice = voices[line.who === "caller" ? 0 : Math.min(1, voices.length - 1)];
    u.pitch = line.who === "caller" ? 0.8 : 1.2;
    u.rate = 1.05;
    u.onend = u.onerror = () => { clearTimeout(fallback); resolve(); };
    speechSynthesis.speak(u);
  }), []);

  const playDemo = useCallback(async (d: Demo) => {
    wantRef.current = false; recRef.current?.stop();
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
    const run = ++runRef.current;
    setLines([]); setInterim(""); setLlm(null); setSmartDown(false);
    setActiveDemo(d); setStatus("demo");
    for (const line of d.lines) {
      if (runRef.current !== run) return;
      setInterim(line.text);
      await speak(line, d.voice);
      if (runRef.current !== run) return;
      setInterim("");
      addLine(line.text, line.who);
      await new Promise((r) => setTimeout(r, 300));
    }
    if (runRef.current === run) setStatus("stopped");
  }, [addLine, speak]);

  // Autoplay is blocked without a user gesture, so ?demo= opens the picker preselected.
  const pre = DEMOS.find((d) => d.id === demoId);
  useEffect(() => () => { wantRef.current = false; recRef.current?.stop(); runRef.current++; if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel(); }, []);

  const live = status === "listening" || status === "demo";
  const started = lines.length > 0 || live;

  return (
    <>
      <Header
        right={
          live ? (
            <button onClick={stopAll} className="min-h-11 rounded-full border-2 border-ink px-5 font-bold">■ {t.stop}</button>
          ) : null
        }
      />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-12 pt-4">
        <Announcer view={shown} />

        {/* Status line */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {live && (
            <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 font-semibold">
              <span className="pulse-ring relative size-2.5 rounded-full bg-danger text-danger" />
              {status === "demo" ? `${t.demo} · ${activeDemo?.title}` : t.listening}
            </span>
          )}
          {status === "stopped" && <span className="rounded-full bg-card px-3 py-1.5 font-semibold text-muted">{t.stopped}</span>}
          {started && (
            <span className={`rounded-full px-3 py-1.5 font-semibold ${smartDown ? "bg-caution-bg text-caution" : "bg-accent-soft text-accent"}`}>
              {smartDown ? t.smartDown : t.smartOn}
            </span>
          )}
          {status === "demo" && (
            <button onClick={() => { mutedRef.current = !muted; setMuted(!muted); }} aria-pressed={!muted} className="rounded-full border border-line px-3 py-1.5 font-semibold">
              {muted ? "🔇" : "🔊"} {t.sound}
            </button>
          )}
        </div>

        {!started && (
          <section className="mt-4 rounded-3xl border border-line bg-card p-6">
            <h1 className="font-display text-3xl font-bold">{t.micTitle}</h1>
            <p className="mt-3 text-lg">{t.micBody}</p>
            {(status === "unsupported" || status === "denied") && (
              <p role="alert" className="mt-4 rounded-xl bg-caution-bg p-3 font-semibold text-caution">{t[status]}</p>
            )}
            <button onClick={startListening} className="mt-5 min-h-16 w-full rounded-2xl bg-accent text-xl font-bold text-accent-ink">
              🎧 {t.start}
            </button>
          </section>
        )}

        {started && (
          <div className="mt-4 grid gap-5">
            <DangerActions view={shown} region={activeDemo ? (activeDemo.place === "India" ? "IN" : "US") : undefined} />
            <div className="rounded-3xl border border-line bg-card px-4 pb-5 pt-6">
              <RiskMeter score={score} level={level} />
            </div>
            <Advice view={shown} />
            <FlagList flags={shown.flags} />
          </div>
        )}

        {/* Transcript */}
        {started && (
          <details open className="mt-6 rounded-2xl border border-line bg-card p-4">
            <summary className="cursor-pointer font-bold">{t.transcript}</summary>
            <ol className="mt-3 max-h-72 space-y-2 overflow-y-auto text-[0.95rem]">
              {lines.map((l, i) => (
                <li key={i} className={l.who === "you" ? "text-muted" : ""}>
                  {l.who && <span className="mr-1 font-bold">{l.who === "caller" ? "📞" : "🙋"}</span>}
                  {l.text}
                </li>
              ))}
              {interim && <li className="italic text-muted">{interim}…</li>}
            </ol>
          </details>
        )}

        {/* Type-it fallback: always available, and the main input when speech isn't. */}
        <form
          className="mt-6"
          onSubmit={(e) => { e.preventDefault(); if (status === "idle") setStatus("stopped"); addLine(typed); setTyped(""); }}
        >
          <label htmlFor="typed" className="font-semibold">{t.typeLabel}</label>
          <div className="mt-2 flex gap-2">
            <input id="typed" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={t.typePlaceholder}
              className="min-h-12 w-full rounded-xl border-2 border-line bg-card px-3 placeholder:text-muted/70" />
            <button className="min-h-12 rounded-xl bg-ink px-5 font-bold text-paper">{t.add}</button>
          </div>
        </form>

        {/* Demo picker */}
        <section className="mt-8" aria-labelledby="demos-h">
          <h2 id="demos-h" className="text-sm font-bold uppercase tracking-widest text-muted">▶ {t.pickDemo}</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {DEMOS.map((d) => (
              <button key={d.id} onClick={() => playDemo(d)}
                className={`min-h-16 rounded-2xl border-2 px-4 py-3 text-left transition-colors ${pre?.id === d.id && status === "idle" ? "border-accent bg-accent-soft" : "border-line bg-card hover:border-accent"}`}>
                <span className="block font-bold">{d.title}</span>
                <span className="text-sm text-muted">{d.place}</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
