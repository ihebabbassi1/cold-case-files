"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PuzzleType } from "@/types/case";
import { submitPuzzleAnswer } from "@/lib/actions";
import { Crosshair } from "@/components/crosshair";
import { Stamp } from "@/components/stamp";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/** The sanitized puzzle shape sent to the client — no answers. */
export interface ClientPuzzle {
  type: PuzzleType;
  question: string;
  options?: string[];
  hint?: string;
}

/** The sanitized stage shape sent to the client. Locked stages carry only id + label. */
export interface ClientStage {
  id: string;
  label: string;
  title?: string;
  narrative?: string;
  locked: boolean;
  solved?: boolean;
  puzzle?: ClientPuzzle;
  explanation?: string;
}

type Phase = "idle" | "checking" | "solved";

export function InvestigationFlow({
  caseId,
  codename,
  stages,
  completed,
  detective,
}: {
  caseId: string;
  codename: string;
  stages: ClientStage[];
  completed: boolean;
  detective: string;
}) {
  const router = useRouter();

  const solvedCount = useMemo(
    () => stages.filter((s) => s.solved).length,
    [stages]
  );
  const total = stages.length;

  const current = stages.find((s) => !s.locked && !s.solved) ?? null;

  const [answer, setAnswer] = useState("");
  const [choice, setChoice] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [wrong, setWrong] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [reveal, setReveal] = useState<string | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);

  async function handleSubmit() {
    if (!current?.puzzle) return;
    const value = current.puzzle.type === "multiple-choice" ? choice ?? "" : answer;
    if (!value.trim()) return;

    setError(null);
    setWrong(false);
    setPhase("checking");

    const result = await submitPuzzleAnswer({
      caseId,
      stageId: current.id,
      answer: value,
    });

    if (!result.ok) {
      setError(result.error ?? "Something went wrong.");
      setPhase("idle");
      return;
    }

    if (!result.correct) {
      setAttempts((n) => n + 1);
      setWrong(true);
      setPhase("idle");
      return;
    }

    // Correct — hold the suspense beat, then reveal the truth of the event.
    setReveal(result.explanation ?? null);
    setJustCompleted(Boolean(result.completed));
    setTimeout(() => setPhase("solved"), 2200);
  }

  function continueToNext() {
    // Reset local state and let the server-rendered page advance the rail.
    setAnswer("");
    setChoice(null);
    setWrong(false);
    setAttempts(0);
    setReveal(null);
    setPhase("idle");
    router.refresh();
  }

  // ---------- CHECKING ----------
  if (phase === "checking") {
    return (
      <div className="noir mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center rounded-md border border-primary/40 p-10 text-center">
        <Crosshair className="h-14 w-14 animate-flicker text-primary" />
        <p className="mt-6 font-type text-sm uppercase tracking-[0.4em] text-[hsl(40,30%,75%)]">
          Checking it against the record…
        </p>
        <p className="mt-2 font-cipher text-xs text-[hsl(40,25%,55%)]">
          re-reading the file · pulling the evidence · matching the dates
        </p>
      </div>
    );
  }

  // ---------- SOLVED (reveal the event truth) ----------
  if (phase === "solved" && current) {
    return (
      <div className="mx-auto max-w-2xl animate-fade-up">
        <div className="sheet rounded-md border border-ink/40 p-7 sm:p-9">
          <div className="flex items-center gap-3">
            <Stamp>Cleared</Stamp>
            <span className="font-type text-xs uppercase tracking-widest text-muted-foreground">
              {current.label}
            </span>
          </div>
          <h1 className="mt-3 font-headline text-3xl font-black text-ink sm:text-4xl">
            {current.title}
          </h1>

          <div className="noir mt-6 rounded border border-ink/60 p-5">
            <p className="font-type text-xs uppercase tracking-[0.3em] text-primary/80">
              What the record shows
            </p>
            <p className="mt-2 typed text-sm leading-relaxed text-[hsl(40,30%,80%)]">
              {reveal}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {justCompleted ? (
            <Button
              onClick={continueToNext}
              size="lg"
              className="font-type uppercase tracking-widest"
            >
              Close the investigation
            </Button>
          ) : (
            <Button
              onClick={continueToNext}
              size="lg"
              className="font-type uppercase tracking-widest"
            >
              Move to the next event →
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ---------- COMPLETED (whole track solved) ----------
  if (completed && !current) {
    return (
      <div className="mx-auto max-w-2xl animate-fade-up">
        <div className="noir rounded-md border border-primary/40 p-8 text-center sm:p-10">
          <Crosshair className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 font-headline text-4xl font-black text-[hsl(40,38%,85%)]">
            Case file unlocked
          </h1>
          <p className="mx-auto mt-3 max-w-xl typed text-sm leading-relaxed text-[hsl(40,28%,76%)]">
            You worked every event in order, Detective {detective} — from Lake
            Herman Road to the codes no one could break. You have earned the one
            thing no investigator in 1969 ever got: the right to name him.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="font-type uppercase tracking-widest">
              <Link href={`/cases/${caseId}/accuse`}>Name the Zodiac</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="font-type uppercase tracking-widest"
            >
              <Link href={`/cases/${caseId}`}>Back to the case file</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- WORKING A STAGE ----------
  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_1.7fr]">
      {/* Progress rail */}
      <aside>
        <div className="text-center lg:text-left">
          <p className="font-type text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Detective {detective} · Case {codename}
          </p>
          <h1 className="mt-1 font-headline text-3xl font-black text-ink">
            The Investigation
          </h1>
          <p className="mt-2 font-type text-xs uppercase tracking-widest text-primary">
            {solvedCount} of {total} events solved
          </p>
        </div>

        <ol className="relative mt-6 border-l-2 border-ink/30 pl-6">
          {stages.map((s) => {
            const isCurrent = current?.id === s.id;
            return (
              <li key={s.id} className="mb-6 last:mb-0">
                <span className="absolute -left-[7px]">
                  <span
                    className={cn(
                      "block h-3 w-3 rounded-full",
                      s.solved
                        ? "bg-emerald-500"
                        : isCurrent
                          ? "bg-primary"
                          : "bg-ink/30"
                    )}
                  />
                </span>
                <p
                  className={cn(
                    "font-type text-xs uppercase tracking-widest",
                    isCurrent ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {s.label}
                </p>
                {s.locked ? (
                  <p className="mt-0.5 font-serif text-sm italic text-ink/40">
                    Sealed — solve the prior event
                  </p>
                ) : (
                  <p
                    className={cn(
                      "mt-0.5 font-serif text-sm",
                      s.solved ? "text-ink/60" : "text-ink/90"
                    )}
                  >
                    {s.title}
                  </p>
                )}
                {s.solved && (
                  <Stamp straight className="mt-1 text-[0.5rem]">
                    Cleared
                  </Stamp>
                )}
              </li>
            );
          })}
        </ol>
      </aside>

      {/* Active stage */}
      <section>
        {current && current.puzzle ? (
          <div className="sheet rounded-md border border-ink/40 p-7 sm:p-9">
            <div className="flex items-center gap-3">
              <Stamp straight>Active lead</Stamp>
              <span className="font-type text-xs uppercase tracking-widest text-muted-foreground">
                {current.label}
              </span>
            </div>
            <h2 className="mt-3 font-headline text-3xl font-black text-ink">
              {current.title}
            </h2>

            <div className="mt-4 space-y-4 font-serif text-[1.05rem] leading-relaxed text-ink/90">
              {(current.narrative ?? "").split("\n\n").filter(Boolean).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="noir mt-6 rounded border border-ink/60 p-5">
              <p className="font-type text-xs uppercase tracking-[0.3em] text-primary/80">
                {current.puzzle.type === "cipher"
                  ? "Decode it"
                  : current.puzzle.type === "multiple-choice"
                    ? "Make the call"
                    : "Answer for the record"}
              </p>
              <p className="mt-2 font-serif text-[1.05rem] leading-relaxed text-[hsl(40,32%,82%)]">
                {current.puzzle.question}
              </p>

              {/* Multiple choice */}
              {current.puzzle.type === "multiple-choice" && current.puzzle.options && (
                <div className="mt-4 grid gap-3">
                  {current.puzzle.options.map((opt) => {
                    const active = choice === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setChoice(opt);
                          setWrong(false);
                        }}
                        className={cn(
                          "rounded-md border p-3 text-left font-serif text-sm transition-all",
                          active
                            ? "border-primary bg-primary/10 text-[hsl(40,35%,88%)] ring-1 ring-primary"
                            : "border-ink/40 text-[hsl(40,28%,74%)] hover:border-primary/60"
                        )}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Cipher / free text */}
              {current.puzzle.type !== "multiple-choice" && (
                <Textarea
                  value={answer}
                  onChange={(e) => {
                    setAnswer(e.target.value);
                    setWrong(false);
                  }}
                  placeholder={
                    current.puzzle.type === "cipher"
                      ? "Type the decoded word…"
                      : "Type your answer…"
                  }
                  className={cn(
                    "mt-4",
                    current.puzzle.type === "cipher" ? "font-cipher" : "font-type"
                  )}
                />
              )}

              {wrong && (
                <p className="mt-4 font-type text-xs uppercase tracking-wider text-destructive">
                  That doesn&apos;t match the record, Detective. Read the scene
                  again.
                </p>
              )}

              {wrong && attempts >= 1 && current.puzzle.hint && (
                <p className="mt-2 font-serif text-sm italic text-[hsl(40,28%,68%)]">
                  Hint: {current.puzzle.hint}
                </p>
              )}

              {error && (
                <p className="mt-4 font-type text-xs uppercase tracking-wider text-destructive">
                  {error}
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button
                onClick={handleSubmit}
                disabled={
                  current.puzzle.type === "multiple-choice" ? !choice : !answer.trim()
                }
                size="lg"
                className="font-type uppercase tracking-widest"
              >
                {current.puzzle.type === "cipher" ? "Decode" : "Submit"}
              </Button>
              <Button
                asChild
                variant="outline"
                className="font-type uppercase tracking-widest"
              >
                <Link href={`/cases/${caseId}`}>Consult the file</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="sheet rounded-md border border-ink/40 p-9 text-center">
            <p className="font-serif text-ink/70">
              No active lead. Return to{" "}
              <Link href={`/cases/${caseId}`} className="text-primary underline">
                the case file
              </Link>
              .
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
