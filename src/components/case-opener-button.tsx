"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Crosshair } from "@/components/crosshair";
import { Button } from "@/components/ui/button";

// Must match the storageKey the case page uses for the Chapter 1 welcome, so
// the case page doesn't replay an intro the moment we land after the opener.
const WELCOME_KEYS: Record<string, string> = {
  zodiac: "ccf:intro:zodiac:lake-herman",
};

// Real case evidence fanned across the 3D board, per case.
type EvidenceCard = {
  src: string;
  /** resting placement in the 3D world */
  x: number;
  y: number;
  z: number;
  rot: number;
  /** entrance stagger (seconds) */
  delay: number;
  label: string;
};

const CASE_EVIDENCE: Record<string, EvidenceCard[]> = {
  zodiac: [
    { src: "/zodiac/wanted-poster.png", x: -260, y: -78, z: 40, rot: -8, delay: 0.9, label: "Wanted" },
    { src: "/zodiac/z408-cipher.png", x: 255, y: -92, z: 95, rot: 6, delay: 1.1, label: "Cipher Z408" },
    { src: "/zodiac/lake-herman-road.jpg", x: -250, y: 116, z: 0, rot: 5, delay: 1.3, label: "Lake Herman Rd" },
    { src: "/zodiac/zodiac-letter-jul1969.jpg", x: 248, y: 108, z: 60, rot: -6, delay: 1.5, label: "Jul 1969 Letter" },
  ],
};

const AUTO_ADVANCE_MS = 8600;

interface CaseOpenerButtonProps {
  caseId: string;
  href: string;
  codename: string;
  tagline: string;
  years: string;
  /** Date label for the opening chapter, e.g. "December 20, 1968". */
  chapterLabel?: string;
  /** Title of the opening chapter, e.g. "The first blood on Lake Herman Road". */
  chapterName?: string;
  /** Logged-in detective's name, for the welcome beat. */
  detectiveName?: string;
  label?: string;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
}

export function CaseOpenerButton({
  caseId,
  href,
  codename,
  tagline,
  years,
  chapterLabel,
  chapterName,
  detectiveName,
  label = "Open the file",
  className,
  variant,
}: CaseOpenerButtonProps) {
  const router = useRouter();
  const [showing, setShowing] = useState(false);
  const [closing, setClosing] = useState(false);

  const evidence = CASE_EVIDENCE[caseId] ?? [];
  const storageKey = WELCOME_KEYS[caseId] ?? null;

  function handleClick() {
    if (evidence.length === 0) {
      router.push(href);
      return;
    }
    // Suppress the case-page welcome so it doesn't double up after we land.
    try {
      if (storageKey) localStorage.setItem(storageKey, "1");
    } catch {
      // storage unavailable — fine
    }
    setShowing(true);
  }

  function navigate() {
    if (closing) return;
    setClosing(true);
    setTimeout(() => router.push(href), 650);
  }

  // Auto-advance once the sequence has played out.
  useEffect(() => {
    if (!showing) return;
    const t = setTimeout(navigate, AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showing]);

  return (
    <>
      <Button onClick={handleClick} className={className} variant={variant}>
        {label}
      </Button>

      {showing && (
        <div
          className={`opener-overlay fixed inset-0 z-[70] overflow-hidden bg-[#0a0705] ${
            closing ? "opener-overlay-out" : "opener-overlay-in"
          }`}
        >
          {/* ── 3D stage ── */}
          <div className="opener-stage absolute inset-0 flex items-center justify-center">
            <div className="opener-scale">
              <div className="opener-world">
                {/* back glow + giant slow crosshair */}
                <div className="opener-depth" style={{ transform: "translateZ(-340px)" }}>
                  <div className="opener-glow" />
                  <Crosshair className="opener-bigcross h-[120vmin] w-[120vmin] text-primary/10" />
                </div>

                {/* the evidence board */}
                <div className="opener-board" style={{ transform: "translateZ(-150px)" }} />

                {/* red string connecting the pins */}
                <svg
                  className="opener-string"
                  viewBox="-360 -220 720 440"
                  style={{ transform: "translateZ(70px)" }}
                  aria-hidden
                >
                  <polyline
                    points="-260,-78 255,-92 248,108 -250,116 -260,-78 255,-92"
                    fill="none"
                    stroke="hsl(0 70% 42%)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* evidence photo cards */}
                {evidence.map((c, i) => (
                  <div
                    key={i}
                    className="opener-card"
                    style={{
                      transform: `translate(-50%, -50%) translate3d(${c.x}px, ${c.y}px, ${c.z}px) rotateZ(${c.rot}deg)`,
                    }}
                  >
                    <div
                      className="opener-card-in"
                      style={{ animationDelay: `${c.delay}s` }}
                    >
                      <span className="opener-pin" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.src} alt={c.label} className="opener-photo" />
                      <span className="opener-cap">{c.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── film grain + vignette + scanlines ── */}
          <div className="pointer-events-none absolute inset-0 case-opener-grain opacity-[0.06]" />
          <div className="pointer-events-none absolute inset-0 opener-scanlines opacity-[0.07]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_38%,rgba(0,0,0,0.82)_100%)]" />

          {/* ── cinematic letterbox bars ── */}
          <div className="case-opener-bar-top pointer-events-none absolute inset-x-0 top-0 h-[9vh] bg-black" />
          <div className="case-opener-bar-bottom pointer-events-none absolute inset-x-0 bottom-0 h-[9vh] bg-black" />

          {/* ── top corners ── */}
          <div
            className="case-opener-line absolute left-6 top-[10vh] font-type text-xs uppercase tracking-[0.35em] text-primary/90"
            style={{ animationDelay: "0.3s" }}
          >
            Cold Case Files · Detective Division
          </div>
          <div
            className="case-opener-line absolute right-6 top-[10vh] text-right font-type text-xs uppercase tracking-[0.3em] text-white/55"
            style={{ animationDelay: "0.5s" }}
          >
            Case Ref · {years}
          </div>

          {/* ── welcome beat ── */}
          {detectiveName && (
            <div className="pointer-events-none absolute inset-x-0 top-[13vh] flex flex-col items-center text-center">
              <p
                className="case-opener-line font-type text-sm uppercase tracking-[0.4em] text-primary"
                style={{ animationDelay: "0.5s" }}
              >
                Welcome, Detective
              </p>
              <p
                className="case-opener-line mt-2 font-headline text-3xl font-black text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.95)] sm:text-4xl"
                style={{ animationDelay: "0.8s" }}
              >
                {detectiveName}
              </p>
              <span
                className="case-opener-line mt-3 h-px w-20 bg-primary/50"
                style={{ animationDelay: "1.05s" }}
              />
            </div>
          )}

          {/* ── center title block ── */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <div className="opener-titlewrap rounded-lg px-10 py-8">
              <div className="opener-stamp" style={{ animationDelay: "2s" }}>
                <span className="inline-block -rotate-[3deg] border-2 border-primary/70 px-6 py-2 font-type text-sm uppercase tracking-[0.45em] text-primary">
                  Classified
                </span>
              </div>

              <h1
                className="case-opener-line mt-6 font-headline text-5xl font-black text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)] sm:text-7xl"
                style={{ animationDelay: "2.3s" }}
              >
                {codename}
              </h1>

              <p
                className="case-opener-line mt-4 font-type text-sm uppercase tracking-[0.35em] text-primary"
                style={{ animationDelay: "2.7s" }}
              >
                {years} · Northern California
              </p>

              <div
                className="case-opener-line mx-auto mt-5 h-px w-24 bg-primary/50"
                style={{ animationDelay: "3s" }}
              />

              <p
                className="case-opener-line mx-auto mt-5 max-w-lg font-serif text-lg italic leading-relaxed text-white/90"
                style={{ animationDelay: "3.2s" }}
              >
                {tagline}
              </p>

              {/* ── chapter plate (closing beat) ── */}
              {chapterName && (
                <div className="mt-9">
                  <div
                    className="case-opener-line flex items-center justify-center gap-4"
                    style={{ animationDelay: "4.6s" }}
                  >
                    <span className="h-px w-12 bg-primary/60" />
                    <span className="font-type text-base uppercase tracking-[0.45em] text-primary">
                      Chapter I
                    </span>
                    <span className="h-px w-12 bg-primary/60" />
                  </div>
                  <h2
                    className="case-opener-line mt-4 font-headline text-3xl font-bold text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.95)] sm:text-4xl"
                    style={{ animationDelay: "4.95s" }}
                  >
                    {chapterName}
                  </h2>
                  {chapterLabel && (
                    <p
                      className="case-opener-line mt-3 font-type text-sm uppercase tracking-[0.35em] text-white/70"
                      style={{ animationDelay: "5.25s" }}
                    >
                      {chapterLabel}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── bottom HUD ── */}
          <div className="absolute inset-x-0 bottom-[9vh] flex items-end justify-between px-6 pb-4">
            <div className="case-opener-line" style={{ animationDelay: "3.6s" }}>
              {chapterLabel && (
                <p className="font-type text-xs uppercase tracking-widest text-white/60">
                  Chapter I · {chapterLabel}
                </p>
              )}
            </div>
            <Button
              onClick={navigate}
              variant="outline"
              className="font-type text-sm uppercase tracking-widest border-white/40 bg-black/40 text-white hover:bg-white/10"
            >
              Enter the file →
            </Button>
          </div>

          {/* ── auto-advance progress line ── */}
          <div className="absolute inset-x-0 bottom-[9vh] h-px bg-white/10">
            <div className="opener-progress h-full bg-primary" />
          </div>
        </div>
      )}
    </>
  );
}
