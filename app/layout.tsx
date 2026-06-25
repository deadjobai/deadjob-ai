import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "deadjob.ai — Übernimmt KI deinen Job?",
  description: "KI analysiert dein Job-Automatisierungsrisiko — personalisiert nach Alter, Sektor und Erfahrung. Finde es in 10 Sekunden heraus.",
  keywords: "KI, Automatisierung, Job, Zukunft, Risiko, Umschulung, Weiterbildung",
  openGraph: {
    title: "deadjob.ai — Übernimmt KI deinen Job?",
    description: "Personalisierte KI-Analyse deines Job-Automatisierungsrisikos",
    url: "https://deadjob.ai",
    siteName: "deadjob.ai",
    locale: "de_AT",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
