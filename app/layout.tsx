import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next, Noto_Sans_Devanagari } from "next/font/google";
import { Prefs } from "@/components/Prefs";
import "./globals.css";

const atk = Atkinson_Hyperlegible_Next({ variable: "--font-atk", subsets: ["latin"] });
const deva = Noto_Sans_Devanagari({ variable: "--font-noto-deva", subsets: ["devanagari"], weight: ["400", "600", "700"] });

export const metadata: Metadata = {
  title: "Ruko — scam-call copilot",
  description: "Put a suspicious call on speaker. Ruko listens, flags scam tactics live, and tells you exactly what to say and do.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef1f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${atk.variable} ${deva.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Prefs>{children}</Prefs>
      </body>
    </html>
  );
}
