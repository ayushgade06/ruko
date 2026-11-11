"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { Header } from "@/components/Header";
import { usePrefs } from "@/components/Prefs";
import { Advice, Announcer, DangerActions, FlagList, RiskMeter } from "@/components/Verdict";
import { T } from "@/lib/i18n";
import { scoreRules } from "@/lib/rules";
import { merge, type Verdict, type View } from "@/lib/verdict";

// Downscale screenshots client-side: keeps uploads well under the API's size cap.
async function toDataUrl(file: File, max = 1600): Promise<string> {
  const img = await createImageBitmap(file);
  const k = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * k);
  c.height = Math.round(img.height * k);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.85);
}

export default function CheckPage() {
  const { lang } = usePrefs();
  const t = T[lang];
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [view, setView] = useState<View | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function check(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() && !image) return;
    setError("");
    setBusy(true);
    const rules = scoreRules(text);
    setView(text.trim() ? merge(rules, null, lang) : null); // instant answer while the AI double-checks
    try {
      const r = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(image ? { mode: "image", image, lang } : { mode: "text", text, lang }),
      });
      if (!r.ok) throw new Error(String(r.status));
      setView(merge(rules, (await r.json()) as Verdict, lang));
    } catch {
      // Text still has the rules verdict on screen, so a soft note is enough there.
      setError(image ? t.imageNeedsAi : text.trim() ? t.smartDown : t.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-12 pt-6">
        <h1 className="text-[2.4rem] font-extrabold leading-tight tracking-[-0.01em]">{t.checkTitle}</h1>
        <p className="mt-2 text-lg text-muted">{t.checkHint}</p>

        <form onSubmit={check} className="mt-6 grid gap-3">
          <label htmlFor="msg" className="sr-only">{t.checkPlaceholder}</label>
          {image ? (
            <div className="flex items-center gap-3 rounded-2xl border-2 border-line bg-card p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" className="h-24 w-auto rounded-lg border border-line object-cover" />
              <button type="button" onClick={() => setImage(null)} className="min-h-11 rounded-xl border border-line px-4 font-semibold">{t.remove}</button>
            </div>
          ) : (
            <textarea id="msg" value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder={t.checkPlaceholder}
              className="w-full rounded-2xl border-2 border-line bg-card p-4 text-lg placeholder:text-muted/70" />
          )}
          <div className="flex flex-wrap gap-3">
            <button disabled={busy || (!text.trim() && !image)} className="min-h-16 flex-1 rounded-[22px] bg-accent px-6 text-xl font-bold text-accent-ink disabled:opacity-50">
              {busy ? t.checking : t.checkBtn}
            </button>
            {!image && (
              <label className="flex min-h-16 cursor-pointer items-center gap-2 rounded-[22px] border-2 border-ink/80 px-5 font-bold hover:bg-card focus-within:outline-3 focus-within:outline-accent">
                <Icon name="image" />{t.upload}
                <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only"
                  onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setImage(await toDataUrl(f)); setView(null); } e.target.value = ""; }} />
              </label>
            )}
          </div>
        </form>

        {error && <p role="alert" className="mt-5 rounded-xl bg-caution-bg p-4 font-semibold text-caution">{error}</p>}

        {view && (
          <div className="mt-8 grid gap-5" aria-busy={busy}>
            <Announcer view={view} />
            {busy && <p className="text-sm font-semibold text-accent">{t.aiChecking}</p>}
            <DangerActions view={view} />
            <div className="rounded-[22px] bg-card px-4 pb-5 pt-6 shadow-[0_1px_2px_rgba(15,27,45,.06)]">
              <RiskMeter score={view.score} level={view.level} />
            </div>
            <Advice view={view} />
            <FlagList flags={view.flags} />
          </div>
        )}
      </main>
    </>
  );
}
