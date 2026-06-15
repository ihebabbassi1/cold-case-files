"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Suspect } from "@/types/case";
import { submitAccusation, analyzeAccusation } from "@/lib/actions";
import { Crosshair } from "@/components/crosshair";
import { Stamp } from "@/components/stamp";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Stage = "choosing" | "revealing" | "revealed";

export function AccusationFlow({
  caseId,
  codename,
  suspects,
  verdict,
  detective,
}: {
  caseId: string;
  codename: string;
  suspects: Suspect[];
  verdict: string[];
  detective: string;
}) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("choosing");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiRating, setAiRating] = useState<"strong" | "plausible" | "weak" | null>(null);

  const selected = suspects.find((s) => s.id === selectedId) ?? null;

  async function handleAccuse() {
    if (!selected) return;
    setError(null);
    setAiAnalysis(null);
    setAiRating(null);
    setStage("revealing");

    const [submitResult, analysisResult] = await Promise.all([
      submitAccusation({
        caseId,
        suspectId: selected.id,
        suspectName: selected.name,
        reasoning,
      }),
      analyzeAccusation({
        caseId,
        suspectId: selected.id,
        reasoning,
      }),
    ]);

    if (!submitResult.ok) {
      setError(submitResult.error ?? "Something went wrong.");
      setStage("choosing");
      return;
    }

    if (analysisResult.analysis) setAiAnalysis(analysisResult.analysis);
    if (analysisResult.rating) setAiRating(analysisResult.rating);

    setTimeout(() => setStage("revealed"), 2200);
    router.refresh();
  }

  const ratingMeta = {
    strong: {
      label: "Strongest available call",
      blurb: "You named the prime suspect — the most defensible accusation in the entire file.",
      className: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
      stamp: "Good instinct",
    },
    plausible: {
      label: "A defensible — but not the strongest — call",
      blurb: "There was real documented support for this name, but a stronger suspect was on the board.",
      className: "border-amber-500/50 bg-amber-500/10 text-amber-300",
      stamp: "Arguable",
    },
    weak: {
      label: "A long shot",
      blurb: "This was a fringe pick — thin on hard evidence and largely discredited by investigators.",
      className: "border-destructive/50 bg-destructive/10 text-red-300",
      stamp: "Cold lead",
    },
  } as const;

  // ---------- REVEALING ----------
  if (stage === "revealing") {
    return (
      <div className="noir mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center rounded-md border border-primary/40 p-10 text-center">
        <Crosshair className="h-14 w-14 animate-flicker text-primary" />
        <p className="mt-6 font-type text-sm uppercase tracking-[0.4em] text-[hsl(40,30%,75%)]">
          Cross-referencing the record…
        </p>
        <p className="mt-2 font-cipher text-xs text-[hsl(40,25%,55%)]">
          matching prints · re-reading the letters · pulling the file
        </p>
      </div>
    );
  }

  // ---------- REVEALED ----------
  if (stage === "revealed" && selected) {
    return (
      <div className="mx-auto max-w-3xl animate-fade-up">
        <div className="sheet rounded-md border border-ink/40 p-7 sm:p-9">
          <div className="flex items-center gap-3">
            <Stamp>Verdict filed</Stamp>
            <span className="font-type text-xs uppercase tracking-widest text-muted-foreground">
              Det. {detective} · Case {codename}
            </span>
          </div>
          <p className="mt-4 font-type text-xs uppercase tracking-[0.3em] text-muted-foreground">
            You accused
          </p>
          <h1 className="font-headline text-4xl font-black text-ink sm:text-5xl">
            {selected.name}
          </h1>

          {/* Did they pick well? */}
          {aiRating && (
            <div className={`mt-6 rounded border p-4 ${ratingMeta[aiRating].className}`}>
              <div className="flex items-center gap-3">
                <Stamp straight className="text-[0.55rem]">{ratingMeta[aiRating].stamp}</Stamp>
                <p className="font-type text-xs uppercase tracking-[0.25em]">
                  {ratingMeta[aiRating].label}
                </p>
              </div>
              <p className="mt-2 font-serif text-sm leading-relaxed opacity-90">
                {ratingMeta[aiRating].blurb}
              </p>
            </div>
          )}

          <div className="noir mt-6 rounded border border-ink/60 p-5">
            <p className="font-type text-xs uppercase tracking-[0.3em] text-primary/80">
              What really happened to your suspect
            </p>
            <p className="mt-2 typed text-sm leading-relaxed text-[hsl(40,30%,80%)]">
              {selected.whatHappened}
            </p>
          </div>

          {/* AI Detective Analysis */}
          {aiAnalysis && (
            <div className="mt-5 rounded border border-primary/30 bg-primary/5 p-5">
              <p className="font-type text-xs uppercase tracking-[0.3em] text-primary">
                Senior detective&apos;s assessment of your reasoning
              </p>
              <div className="mt-3 space-y-3">
                {aiAnalysis.split("\n\n").filter(Boolean).map((para, i) => (
                  <p key={i} className="font-serif text-sm leading-relaxed text-ink/85">
                    {para}
                  </p>
                ))}
              </div>
              <p className="mt-3 font-type text-[0.6rem] uppercase tracking-widest text-muted-foreground">
                Assessment generated by AI · the Zodiac case remains officially unsolved
              </p>
            </div>
          )}
        </div>

        {/* The full record */}
        <div className="mt-6 flex items-center gap-4">
          <h2 className="font-type text-sm uppercase tracking-[0.3em] text-ink">
            The rest of the record
          </h2>
          <hr className="rule-double flex-1" />
        </div>
        <div className="mt-4 grid gap-4">
          {suspects
            .filter((s) => s.id !== selected.id)
            .map((s) => (
              <div key={s.id} className="sheet rounded-md border border-ink/40 p-5">
                <h3 className="font-headline text-lg font-bold text-ink">
                  {s.name}{" "}
                  <span className="font-type text-xs uppercase tracking-widest text-muted-foreground">
                    — {s.fate}
                  </span>
                </h3>
                <p className="mt-2 font-serif text-sm leading-relaxed text-ink/85">
                  {s.whatHappened}
                </p>
              </div>
            ))}
        </div>

        {/* The truth */}
        <div className="noir mt-8 rounded-md border border-primary/40 p-8">
          <Crosshair className="mx-auto h-10 w-10 text-primary" />
          <div className="mx-auto mt-4 max-w-2xl space-y-4 text-center">
            {verdict.slice(0, -1).map((p, i) => (
              <p
                key={i}
                className="font-serif text-[1.05rem] leading-relaxed text-[hsl(40,30%,82%)]"
              >
                {p}
              </p>
            ))}
            <p className="scrawl pt-2 text-3xl text-[hsl(0,55%,52%)]">
              {verdict[verdict.length - 1]}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button
            onClick={() => {
              setStage("choosing");
              setSelectedId(null);
              setReasoning("");
              setAiAnalysis(null);
              setAiRating(null);
            }}
            variant="outline"
            className="font-type uppercase tracking-widest"
          >
            Name a different suspect
          </Button>
          <Button asChild className="font-type uppercase tracking-widest">
            <Link href={`/cases/${caseId}`}>Back to the case file</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ---------- CHOOSING ----------
  return (
    <div className="mx-auto max-w-4xl">
      <div className="text-center">
        <Crosshair className="mx-auto h-10 w-10 text-primary" />
        <p className="mt-3 font-type text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Detective {detective} · Case {codename}
        </p>
        <h1 className="mt-1 font-headline text-4xl font-black text-ink sm:text-5xl">
          Name the Zodiac
        </h1>
        <p className="mx-auto mt-3 max-w-xl font-serif text-ink/80">
          Select the person you believe did it. When you file, the real outcome
          of every suspect will be unsealed — and a senior detective will
          evaluate your reasoning.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {suspects.map((s) => {
          const active = s.id === selectedId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedId(s.id)}
              className={cn(
                "sheet rounded-md border p-5 text-left transition-all",
                active
                  ? "border-primary ring-2 ring-primary"
                  : "border-ink/40 hover:border-primary/60"
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-headline text-xl font-bold text-ink">
                  {s.name}
                </h3>
                {active && <Stamp straight className="text-[0.55rem]">Selected</Stamp>}
              </div>
              <p className="mt-1 font-type text-[0.65rem] uppercase tracking-widest text-primary">
                {s.alias}
              </p>
              <p className="mt-2 font-serif text-sm text-ink/80">{s.summary}</p>
            </button>
          );
        })}
      </div>

      <div className="sheet mt-6 rounded-md border border-ink/40 p-6">
        <label
          htmlFor="reasoning"
          className="font-type text-xs uppercase tracking-[0.3em] text-ink"
        >
          Detective&apos;s notes (optional — but the AI will read them)
        </label>
        <p className="mb-2 mt-1 font-serif text-sm text-muted-foreground">
          Why this suspect? A senior detective will evaluate your reasoning against the evidence.
        </p>
        <Textarea
          id="reasoning"
          value={reasoning}
          onChange={(e) => setReasoning(e.target.value)}
          placeholder="The watch, the flashlight on the gun, the proximity to Vallejo…"
          className="font-type"
        />
      </div>

      {error && (
        <p className="mt-4 text-center font-type text-xs uppercase tracking-wider text-destructive">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <Button asChild variant="outline" className="font-type uppercase tracking-widest">
          <Link href={`/cases/${caseId}`}>Back to the file</Link>
        </Button>
        <Button
          onClick={handleAccuse}
          disabled={!selected}
          size="lg"
          className="font-type uppercase tracking-widest"
        >
          File this verdict
        </Button>
      </div>
    </div>
  );
}
