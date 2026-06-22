"use client";

import { useEffect, useState } from "react";
import { playSfx } from "@/lib/sound";
import type { BadgeIcon } from "@/data/badges";
import { Crosshair } from "@/components/crosshair";
import { BadgeGlyph } from "@/components/badge-icon";
import { Button } from "@/components/ui/button";

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export interface CinematicPayload {
  /** localStorage key that makes this entrance play exactly once per device. */
  storageKey: string;
  kind: "welcome" | "unlock" | "finale";
  /** Stage slug — selects the per-chapter scene. */
  stageId?: string;
  chapterNumber: number;
  total: number;
  chapterTitle?: string;
  chapterLabel?: string;
  /** The badge celebrated in this entrance (the one just earned), if any. */
  badge?: { name: string; tagline: string; icon: BadgeIcon } | null;
  /** Final score, shown on the finale. */
  score?: number;
}

type Variant =
  | "spotlight"
  | "decode"
  | "newspaper"
  | "filmstrip"
  | "slam"
  | "dossier";

interface Scene {
  variant: Variant;
  images: string[];
  /** One evocative noir line for this chapter. */
  line: string;
}

/**
 * Each chapter gets its own cinematic: a distinct motion treatment + the real
 * evidence imagery tied to that chapter. Same noir theme throughout, but no two
 * play the same way.
 */
const CHAPTER_SCENES: Record<string, Scene> = {
  "blue-rock-springs": {
    variant: "spotlight",
    images: ["/zodiac/zodiac-letter-jul1969.jpg"],
    line: "A voice on the line takes credit for murder.",
  },
  "the-408": {
    variant: "decode",
    images: ["/zodiac/z408-cipher.png"],
    line: "Four hundred and eight symbols, daring you to read them.",
  },
  "this-is-the-zodiac": {
    variant: "newspaper",
    images: ["/zodiac/wanted-poster.png"],
    line: "Three words on a letter — the killer christens himself.",
  },
  "lake-berryessa": {
    variant: "filmstrip",
    images: [
      "/zodiac/lake-berryessa.jpg",
      "/zodiac/hartnell-car-door.jpg",
      "/zodiac/berryessa-sketch.jpg",
    ],
    line: "A hooded figure at the water's edge. He signs the car door.",
  },
  "paul-stine": {
    variant: "slam",
    images: ["/zodiac/stine-crime-scene.jpg"],
    line: "A cab driver in San Francisco. A swatch torn from his shirt.",
  },
  "the-340": {
    variant: "dossier",
    images: ["/zodiac/z340-cipher.jpg"],
    line: "Three hundred forty symbols. Fifty-one years of silence.",
  },
  "the-prime-suspect": {
    variant: "spotlight",
    images: ["/zodiac/berryessa-sketch.jpg"],
    line: "One name sat at the center of the file for thirty years.",
  },
};

const AUTO_DISMISS_MS = 6800;

export function ChapterCinematic({
  cinematic,
  force = false,
}: {
  cinematic: CinematicPayload | null;
  /** When true (e.g. arriving via "Open the file"), replay regardless of the
   * one-time localStorage gate, then clean the URL so refreshes don't repeat. */
  force?: boolean;
}) {
  const [show, setShow] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!cinematic) return;
    if (typeof window === "undefined") return;

    if (force) {
      // Always play, and drop the ?intro flag so a later refresh won't replay.
      try {
        window.localStorage.setItem(cinematic.storageKey, "1");
        const url = new URL(window.location.href);
        if (url.searchParams.has("intro")) {
          url.searchParams.delete("intro");
          window.history.replaceState(null, "", url.toString());
        }
      } catch {
        // ignore
      }
    } else {
      try {
        if (window.localStorage.getItem(cinematic.storageKey)) return;
        window.localStorage.setItem(cinematic.storageKey, "1");
      } catch {
        // If storage is unavailable, just play it this once.
      }
    }

    setShow(true);
    playSfx("unlock", 0.5);
    const t = setTimeout(() => dismiss(), AUTO_DISMISS_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cinematic?.storageKey, force]);

  function dismiss() {
    setClosing(true);
    setTimeout(() => {
      setShow(false);
      setClosing(false);
    }, 550);
  }

  if (!cinematic || !show) return null;

  const {
    kind,
    stageId,
    chapterNumber,
    total,
    chapterTitle,
    chapterLabel,
    badge,
    score,
  } = cinematic;
  const isFinale = kind === "finale";
  const scene = stageId ? CHAPTER_SCENES[stageId] : undefined;

  return (
    <div
      role="dialog"
      aria-label="Chapter entrance"
      onClick={dismiss}
      className={`opener-overlay fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden bg-[#0a0705] px-6 ${
        closing ? "opener-overlay-out" : "opener-overlay-in"
      }`}
    >
      {/* ── ambient layers ── */}
      <div className="pointer-events-none absolute inset-0 case-opener-grain opacity-[0.06]" />
      <div className="pointer-events-none absolute inset-0 opener-scanlines opacity-[0.06]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(0,0,0,0.85)_100%)]" />
      <div className="case-opener-bar-top pointer-events-none absolute inset-x-0 top-0 h-[8vh] bg-black" />
      <div className="case-opener-bar-bottom pointer-events-none absolute inset-x-0 bottom-0 h-[8vh] bg-black" />

      {/* corners */}
      <div
        className="case-opener-line absolute left-6 top-[9vh] font-type text-xs uppercase tracking-[0.35em] text-primary/90"
        style={{ animationDelay: "0.3s" }}
      >
        Cold Case Files · Detective Division
      </div>
      <div
        className="case-opener-line absolute right-6 top-[9vh] font-type text-xs uppercase tracking-[0.3em] text-white/55"
        style={{ animationDelay: "0.45s" }}
      >
        {isFinale ? "Case Closed" : `Chapter ${ROMAN[chapterNumber] ?? chapterNumber} / ${total}`}
      </div>

      <div className="relative flex w-full max-w-3xl flex-col items-center text-center">
        {/* ── badge-earned beat ── */}
        {badge && (
          <div
            className="case-opener-line flex flex-col items-center"
            style={{ animationDelay: "0.5s" }}
          >
            <p className="font-type text-xs uppercase tracking-[0.4em] text-primary">
              {isFinale ? "Final badge earned" : "Badge earned"}
            </p>
            <div className="mt-3 flex items-center gap-3 rounded-md border border-primary/50 bg-primary/15 px-5 py-2.5">
              <BadgeGlyph icon={badge.icon} className="h-6 w-6 text-primary" />
              <span className="font-headline text-xl font-black text-[hsl(40,40%,92%)]">
                {badge.name}
              </span>
            </div>
          </div>
        )}

        {/* ── centerpiece scene ── */}
        {!isFinale && scene && (
          <div className="mt-7">
            <Centerpiece variant={scene.variant} images={scene.images} />
          </div>
        )}
        {!isFinale && !scene && (
          <div className="mt-7">
            <Crosshair className="h-12 w-12 text-primary" />
          </div>
        )}

        {/* ── titles ── */}
        {!isFinale ? (
          <>
            <p
              className="case-opener-line mt-7 flex items-center justify-center gap-3 font-type text-sm uppercase tracking-[0.4em] text-primary"
              style={{ animationDelay: "0.7s" }}
            >
              <span className="h-px w-8 bg-primary/55" />
              Chapter {ROMAN[chapterNumber] ?? chapterNumber}
              <span className="h-px w-8 bg-primary/55" />
            </p>
            <h2
              className="case-opener-line mt-3 font-headline text-3xl font-black text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.95)] sm:text-5xl"
              style={{ animationDelay: "0.85s" }}
            >
              {chapterTitle}
            </h2>
            {chapterLabel && (
              <p
                className="case-opener-line mt-3 font-type text-sm uppercase tracking-[0.35em] text-white/65"
                style={{ animationDelay: "1s" }}
              >
                {chapterLabel}
              </p>
            )}
            <p
              className="case-opener-line mx-auto mt-5 max-w-lg font-serif text-lg italic leading-relaxed text-white/90"
              style={{ animationDelay: "1.2s" }}
            >
              {scene?.line ?? "New evidence has been unsealed in the file below."}
            </p>
          </>
        ) : (
          <>
            <div
              className="opener-stamp mt-7"
              style={{ animationDelay: "0.7s" }}
            >
              <span className="inline-block -rotate-[3deg] border-2 border-primary/70 px-6 py-2 font-type text-base uppercase tracking-[0.45em] text-primary">
                Case Closed
              </span>
            </div>
            <h2
              className="case-opener-line mt-6 font-headline text-4xl font-black text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.95)] sm:text-6xl"
              style={{ animationDelay: "0.95s" }}
            >
              Every chapter cleared
            </h2>
            {typeof score === "number" && (
              <p
                className="case-opener-line mt-4 font-type text-base uppercase tracking-[0.35em] text-primary"
                style={{ animationDelay: "1.15s" }}
              >
                Final score · {score.toLocaleString()} pts
              </p>
            )}
            <p
              className="case-opener-line mx-auto mt-4 max-w-lg font-serif text-lg italic leading-relaxed text-white/90"
              style={{ animationDelay: "1.3s" }}
            >
              You earned the right no detective in 1969 ever did — to name him.
            </p>
          </>
        )}

        {/* ── action ── */}
        <div
          className="case-opener-line mt-9"
          style={{ animationDelay: "1.5s" }}
        >
          <Button
            onClick={(e) => {
              e.stopPropagation();
              dismiss();
            }}
            size="lg"
            className="font-type uppercase tracking-widest"
          >
            {isFinale ? "Name the Zodiac →" : "Enter the chapter →"}
          </Button>
        </div>
      </div>

      {/* progress */}
      <div className="absolute inset-x-0 bottom-[8vh] h-px bg-white/10">
        <div className="cine-progress h-full bg-primary" />
      </div>
    </div>
  );
}

/** The per-chapter animated visual. Each variant moves differently. */
function Centerpiece({
  variant,
  images,
}: {
  variant: Variant;
  images: string[];
}) {
  // eslint-disable-next-line @next/next/no-img-element
  const img = (src: string, cls: string) => (
    <img src={src} alt="" className={cls} />
  );

  if (variant === "filmstrip") {
    return (
      <div className="cine-strip flex items-center gap-4">
        {images.map((src, i) => (
          <div
            key={i}
            className="cine-strip-frame"
            style={{ animationDelay: `${0.5 + i * 0.18}s` }}
          >
            {img(src, "cine-img h-40 w-40 sm:h-44 sm:w-44")}
          </div>
        ))}
      </div>
    );
  }

  if (variant === "decode") {
    return (
      <div className="cine-frame cine-decode">
        {img(images[0], "cine-img cine-decode-img h-52 w-72 sm:h-56 sm:w-80")}
        <span className="cine-scan pointer-events-none" />
      </div>
    );
  }

  if (variant === "dossier") {
    return (
      <div className="cine-frame cine-dossier">
        {img(images[0], "cine-img h-52 w-72 sm:h-56 sm:w-80")}
        <span className="cine-redact cine-redact-1" />
        <span className="cine-redact cine-redact-2" />
        <span className="cine-redact cine-redact-3" />
      </div>
    );
  }

  // spotlight / newspaper / slam share a single framed photo, different motion
  const motion =
    variant === "newspaper"
      ? "cine-news"
      : variant === "slam"
        ? "cine-slam"
        : "cine-spot";

  return (
    <div className={`cine-frame ${motion}`}>
      {variant === "spotlight" && (
        <span className="cine-beam pointer-events-none" />
      )}
      {img(images[0], "cine-img h-52 w-72 sm:h-60 sm:w-80")}
    </div>
  );
}
