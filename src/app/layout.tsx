import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Cold Case Files — The Zodiac",
  description:
    "Step into the unsolved. Read the real evidence, study the suspects, and name the Zodiac Killer yourself.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,700&family=IM+Fell+English:ital@0;1&family=Special+Elite&family=Rock+Salt&family=Cutive+Mono&family=UnifrakturCook:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <SiteHeader />
        <main className="relative">{children}</main>
        <footer className="border-t border-border/60 py-8 text-center font-type text-xs text-muted-foreground">
          <p className="mx-auto max-w-2xl px-4">
            COLD CASE FILES is a true-crime investigation experience based on
            publicly documented history. No accusation made here constitutes a
            claim of guilt. The Zodiac case remains officially unsolved.
          </p>
        </footer>
      </body>
    </html>
  );
}
