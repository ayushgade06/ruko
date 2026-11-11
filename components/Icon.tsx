// Line icons (24px grid, 2px stroke) in place of emoji, so they inherit colour and size with the text.
const P = {
  mic: "M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zM19 11a7 7 0 0 1-14 0M12 18v3",
  message: "M4 5h16v11H9l-5 4z",
  play: "M8 5v14l11-7z",
  stop: "M7 7h10v10H7z",
  sound: "M4 9v6h4l5 4V5L8 9zM16.5 8.5a5 5 0 0 1 0 7",
  muted: "M4 9v6h4l5 4V5L8 9zM17 9l5 6M22 9l-5 6",
  image: "M4 5h16v14H4zM4 16l5-5 4 4 2-2 5 5M15 9.5h.01",
  alert: "M12 4 2.5 20h19zM12 10v4M12 17h.01",
  check: "M5 12.5 10 17l9-10",
  x: "M6 6l12 12M18 6 6 18",
  people: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 6",
  lock: "M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3",
  arrow: "M5 12h14M13 6l6 6-6 6",
} as const;

export type IconName = keyof typeof P;

export function Icon({ name, className = "size-6", filled }: { name: IconName; className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d={P[name]} />
    </svg>
  );
}
