"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";

const EXAMINED_EVENT = "ccf:examined";

function examinedKey(caseId: string, clueId: string) {
  return `ccf:examined:${caseId}:${clueId}`;
}

/**
 * Wraps the substance of an exhibit (evidence / cipher). The detective sees a
 * sealed, redacted panel and must click "Examine" to uncover it — turning
 * passive reading into active discovery. Once examined it stays open on return
 * (persisted in localStorage). The title/tag stay visible outside this wrapper.
 */
export function ClueCard({
  caseId,
  clueId,
  action = "Examine exhibit",
  variant = "light",
  children,
}: {
  caseId: string;
  clueId: string;
  action?: string;
  variant?: "light" | "dark";
  children: React.ReactNode;
}) {
  const [examined, setExamined] = useState(false);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(examinedKey(caseId, clueId))) setExamined(true);
    } catch {
      // storage unavailable — leave it sealed; clicking still works
    }
  }, [caseId, clueId]);

  function examine() {
    try {
      localStorage.setItem(examinedKey(caseId, clueId), "1");
    } catch {
      // ignore
    }
    setRevealing(true);
    setExamined(true);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(EXAMINED_EVENT));
    }
  }

  if (!examined) {
    const dark = variant === "dark";
    return (
      <button
        type="button"
        onClick={examine}
        aria-label={action}
        className={`group mt-3 flex w-full flex-col gap-3 rounded border border-dashed p-4 text-left transition-colors ${
          dark
            ? "border-[hsl(40,20%,30%)]/60 bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.5)_0_8px,rgba(0,0,0,0.3)_8px_16px)] hover:border-primary/70"
            : "border-ink/30 bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.22)_0_8px,rgba(0,0,0,0.1)_8px_16px)] hover:border-primary/70"
        }`}
      >
        <span className="flex flex-col gap-1.5" aria-hidden>
          <span className="h-3 w-[92%] rounded-sm bg-[#0c0a08]" />
          <span className="h-3 w-[78%] rounded-sm bg-[#0c0a08]" />
          <span className="h-3 w-[85%] rounded-sm bg-[#0c0a08]" />
        </span>
        <span className="inline-flex items-center gap-2 font-type text-[0.7rem] uppercase tracking-[0.18em] text-primary transition-transform group-hover:translate-x-0.5">
          <Lock className="h-3.5 w-3.5" />
          {action} →
        </span>
      </button>
    );
  }

  return <div className={revealing ? "clue-reveal" : undefined}>{children}</div>;
}

/** Thin "X of N examined" progress strip for a tab of exhibits. */
export function ExhibitProgress({
  caseId,
  ids,
  noun = "exhibit",
}: {
  caseId: string;
  ids: string[];
  noun?: string;
}) {
  const [count, setCount] = useState(0);
  const idsKey = ids.join("|");

  useEffect(() => {
    function recount() {
      let n = 0;
      try {
        for (const id of ids) {
          if (localStorage.getItem(examinedKey(caseId, id))) n++;
        }
      } catch {
        // ignore
      }
      setCount(n);
    }
    recount();
    window.addEventListener(EXAMINED_EVENT, recount);
    return () => window.removeEventListener(EXAMINED_EVENT, recount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId, idsKey]);

  const total = ids.length;
  if (total === 0) return null;
  const pct = Math.round((count / total) * 100);
  const done = count === total;

  return (
    <div className="mb-5">
      <div className="mb-1.5 flex items-center justify-between font-type text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
        <span>{done ? `All ${noun}s examined` : `${noun}s examined`}</span>
        <span className={done ? "text-primary" : undefined}>
          {count} / {total}
        </span>
      </div>
      <div className="h-[3px] w-full overflow-hidden rounded-sm bg-ink/15">
        <div
          className="h-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
