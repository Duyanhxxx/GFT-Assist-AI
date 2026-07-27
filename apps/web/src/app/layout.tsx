import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";

import { AppProviders } from "@/providers/app-providers";
import { getServerLocale } from "@/lib/i18n/server";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "GFT-Assist-AI",
  description: "AI-powered customer support and intelligent ticket routing platform.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  const localePromise = getServerLocale();

  return <RootLayoutInner children={children} localePromise={localePromise} />;
}

async function RootLayoutInner({
  children,
  localePromise,
}: {
  children: ReactNode;
  localePromise: Promise<"en" | "vi">;
}) {
  const locale = await localePromise;

  return (
    <html lang={locale}>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} min-h-screen antialiased`}
      >
        <AppProviders locale={locale}>{children}</AppProviders>
      </body>
    </html>
  );
}
