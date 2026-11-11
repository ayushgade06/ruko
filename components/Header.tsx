import Link from "next/link";

export function Mark({ className = "size-9" }: { className?: string }) {
  // A raised palm inside a circle: "wait".
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <circle cx="20" cy="20" r="19" fill="var(--accent)" />
      <path
        d="M14.5 21.5v-6a1.6 1.6 0 0 1 3.2 0v4.5-7.5a1.6 1.6 0 0 1 3.2 0V20v-6.5a1.6 1.6 0 0 1 3.2 0V20v-4a1.6 1.6 0 0 1 3.2 0v8.2c0 4.4-3.2 7.3-7 7.3-2.6 0-4.4-1.2-5.8-3.3l-2.7-4.2a1.6 1.6 0 0 1 2.6-1.8z"
        fill="var(--accent-ink)"
      />
    </svg>
  );
}

export function Header({ right }: { right?: React.ReactNode }) {
  return (
    <header className="px-4 pt-4">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 rounded-lg" aria-label="Ruko home">
          <Mark />
          <span className="font-display text-2xl font-bold tracking-tight">Ruko</span>
        </Link>
        {right}
      </div>
    </header>
  );
}
