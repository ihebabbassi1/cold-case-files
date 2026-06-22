"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import {
  initSound,
  isSoundEnabled,
  setSoundEnabled,
  subscribe,
} from "@/lib/sound";

/** Header control that turns the noir ambience + effects on/off (persisted). */
export function SoundToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    initSound();
    setOn(isSoundEnabled());
    return subscribe(() => setOn(isSoundEnabled()));
  }, []);

  return (
    <button
      type="button"
      onClick={() => setSoundEnabled(!on)}
      aria-pressed={on}
      aria-label={on ? "Turn case ambience off" : "Turn case ambience on"}
      title={on ? "Sound on" : "Sound off"}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink/70 transition-colors hover:bg-ink/10 hover:text-ink"
    >
      {on ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </button>
  );
}
