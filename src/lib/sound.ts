// Ambient + SFX sound controller.
//
// Module-level singleton so the ambient loop survives client-side navigation
// and any component can fire a one-shot without context plumbing. It is fully
// opt-in (off by default, choice persisted) and no-ops gracefully if an audio
// file is missing — so the app works with or without the assets present.

const STORAGE_KEY = "ccf:sound";
const AMBIENT_SRC = "/audio/ambient.mp3";
const AMBIENT_VOLUME = 0.32;

export type Sfx =
  | "examine"
  | "pin"
  | "cut"
  | "correct"
  | "wrong"
  | "unlock";

const SFX_SRC: Record<Sfx, string> = {
  examine: "/audio/examine.mp3",
  pin: "/audio/pin.mp3",
  cut: "/audio/cut.mp3",
  correct: "/audio/correct.mp3",
  wrong: "/audio/wrong.mp3",
  unlock: "/audio/unlock.mp3",
};

let enabled = false;
let initialized = false;
let ambient: HTMLAudioElement | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function ensureAmbient(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!ambient) {
    ambient = new Audio(AMBIENT_SRC);
    ambient.loop = true;
    ambient.volume = AMBIENT_VOLUME;
    ambient.preload = "auto";
  }
  return ambient;
}

/** Call once on the client (the toggle does this on mount). */
export function initSound() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  try {
    enabled = window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    enabled = false;
  }
  // Browsers block autoplay until a user gesture — if sound was on last visit,
  // resume the ambient bed on the first interaction.
  if (enabled) {
    const resume = () => {
      ensureAmbient()
        ?.play()
        .catch(() => {});
      window.removeEventListener("pointerdown", resume);
    };
    window.addEventListener("pointerdown", resume, { once: true });
  }
}

export function isSoundEnabled() {
  return enabled;
}

export function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function setSoundEnabled(value: boolean) {
  enabled = value;
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    // ignore
  }
  const a = ensureAmbient();
  if (a) {
    if (value) a.play().catch(() => {});
    else a.pause();
  }
  notify();
}

export function toggleSound() {
  setSoundEnabled(!enabled);
}

/** Fire a one-shot effect. No-ops when sound is off or the file is missing. */
export function playSfx(name: Sfx, volume = 0.6) {
  if (!enabled || typeof window === "undefined") return;
  try {
    const a = new Audio(SFX_SRC[name]);
    a.volume = volume;
    a.play().catch(() => {});
  } catch {
    // ignore
  }
}
