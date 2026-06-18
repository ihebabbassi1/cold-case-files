"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { submitPuzzleAnswer } from "@/lib/actions";
import type { ClientChapter } from "@/data/chapters";
import { Crosshair } from "@/components/crosshair";
import { Stamp } from "@/components/stamp";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Phase = "idle" | "checking" | "solved";

/**
 * The floating, bottom-right control that drives the chapter game on the case
 * page. It pops the current chapter's puzzle; a correct answer reveals the
 * next chapter by refreshing the server-rendered page.
 */
export function ChapterGate({
  caseId,
  solvedCount,
  total,
  completed,
  currentChapter,
}: {
  caseId: string;
  solvedCount: number;
  total: number;
  completed: boolean;
  currentChapter: ClientChapter | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const [choice, setChoice] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [wrong, setWrong] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [reveal, setReveal] = useState<string | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);

  // ---------- Case complete: send them to the accusation ----------
  if (completed || !currentChapter) {
    if (!completed) return null;
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          asChild
          size="lg"
          className="font-type uppercase tracking-widest shadow-lg shadow-black/40"
        >
          <Link href={`/cases/${caseId}/accuse`}>Name the Zodiac →</Link>
        </Button>
      </div>
    );
  }

  const puzzle = currentChapter.puzzle;

  function resetPuzzleState() {
    setAnswer("");
    setChoice(null);
    setWrong(false);
    setAttempts(0);
    setError(null);
    setReveal(null);
    setPhase("idle");
    setJustCompleted(false);
  }

  async function handleSubmit() {
    if (!currentChapter) return;
    const value = puzzle.type === "multiple-choice" ? choice ?? "" : answer;
    if (!value.trim()) return;

    setError(null);
    setWrong(false);
    setPhase("checking");

    const result = await submitPuzzleAnswer({
      caseId,
      stageId: currentChapter.stageId,
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

    setReveal(result.explanation ?? null);
    setJustCompleted(Boolean(result.completed));
    setTimeout(() => setPhase("solved"), 1800);
  }

  function revealNextChapter() {
    setOpen(false);
    // Let the close animation play, then advance the server-rendered rail.
    setTimeout(() => {
      resetPuzzleState();
      router.refresh();
    }, 200);
  }

  const nextNumber = currentChapter.number + 1;

  return (
    <>
      {/* Floating control */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        <span className="rounded-full border border-primary/40 bg-background/90 px-3 py-1 font-type text-[0.6rem] uppercase tracking-widest text-primary shadow-sm backdrop-blur">
          Chapter {currentChapter.number} of {total} · {solvedCount} cleared
        </span>
        <Button
          onClick={() => setOpen(true)}
          size="lg"
          className="font-type uppercase tracking-widest shadow-lg shadow-black/40"
        >
          <Crosshair className="mr-2 h-4 w-4" />
          Crack the case to unlock Chapter {nextNumber} →
        </Button>
      </div>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          // Don't let an outside-click discard a freshly solved reveal.
          if (!o && phase === "solved") {
            revealNextChapter();
            return;
          }
          setOpen(o);
        }}
      >
        <DialogContent className="noir max-h-[90vh] max-w-2xl overflow-y-auto border-2 border-primary/60 bg-[hsl(28,18%,8%)] text-[hsl(40,33%,84%)] shadow-2xl shadow-black/70">
          {/* ---------- CHECKING ---------- */}
          {phase === "checking" && (
            <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
              <Crosshair className="h-14 w-14 animate-flicker text-primary" />
              <p className="mt-6 font-type text-sm uppercase tracking-[0.4em] text-[hsl(40,30%,75%)]">
                Checking it against the record…
              </p>
              <p className="mt-2 font-cipher text-xs text-[hsl(40,25%,55%)]">
                re-reading the file · pulling the evidence · matching the dates
              </p>
            </div>
          )}

          {/* ---------- SOLVED ---------- */}
          {phase === "solved" && (
            <div className="animate-fade-up">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Stamp>Cleared</Stamp>
                  <span className="font-type text-xs uppercase tracking-widest text-[hsl(40,22%,58%)]">
                    {currentChapter.label}
                  </span>
                </div>
                <DialogTitle className="mt-2 font-headline text-2xl font-black text-[hsl(40,38%,85%)]">
                  {currentChapter.title}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  The record behind this chapter.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 rounded border border-ink/60 bg-black/30 p-5">
                <p className="font-type text-xs uppercase tracking-[0.3em] text-primary/80">
                  What the record shows
                </p>
                <p className="mt-2 typed text-sm leading-relaxed text-[hsl(40,30%,80%)]">
                  {reveal}
                </p>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={revealNextChapter}
                  size="lg"
                  className="font-type uppercase tracking-widest"
                >
                  {justCompleted
                    ? "Close the case file →"
                    : `Reveal Chapter ${nextNumber} →`}
                </Button>
              </div>
            </div>
          )}

          {/* ---------- THE PUZZLE ---------- */}
          {phase === "idle" && (
            <div>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Stamp straight>Chapter {currentChapter.number}</Stamp>
                  <span className="font-type text-xs uppercase tracking-widest text-[hsl(40,22%,58%)]">
                    {currentChapter.label}
                  </span>
                </div>
                <DialogTitle className="mt-2 font-headline text-2xl font-black text-[hsl(40,38%,85%)]">
                  {currentChapter.title}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Solve this puzzle to unlock the next chapter.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-3 space-y-3 font-serif text-sm leading-relaxed text-[hsl(40,28%,76%)]">
                {currentChapter.narrative
                  .split("\n\n")
                  .filter(Boolean)
                  .map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
              </div>

              <div className="mt-5 rounded border border-ink/60 bg-black/30 p-5">
                <p className="font-type text-xs uppercase tracking-[0.3em] text-primary/80">
                  {puzzle.type === "cipher"
                    ? "Decode it"
                    : puzzle.type === "multiple-choice"
                      ? "Make the call"
                      : "Answer for the record"}
                </p>
                <p className="mt-2 font-serif text-[1.02rem] leading-relaxed text-[hsl(40,32%,82%)]">
                  {puzzle.question}
                </p>

                {puzzle.type === "multiple-choice" && puzzle.options && (
                  <div className="mt-4 grid gap-3">
                    {puzzle.options.map((opt) => {
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
                              ? "border-primary bg-primary/25 text-[hsl(40,40%,92%)] ring-1 ring-primary"
                              : "border-[hsl(40,20%,38%)] bg-black/20 text-[hsl(40,32%,82%)] hover:border-primary/70 hover:bg-black/40"
                          )}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {puzzle.type !== "multiple-choice" && (
                  <Textarea
                    value={answer}
                    onChange={(e) => {
                      setAnswer(e.target.value);
                      setWrong(false);
                    }}
                    placeholder={
                      puzzle.type === "cipher"
                        ? "Type the decoded word…"
                        : "Type your answer…"
                    }
                    className={cn(
                      "mt-4 bg-black/20",
                      puzzle.type === "cipher" ? "font-cipher" : "font-type"
                    )}
                  />
                )}

                {wrong && (
                  <p className="mt-4 font-type text-xs uppercase tracking-wider text-destructive">
                    That doesn&apos;t match the record, Detective. Read the scene
                    again.
                  </p>
                )}

                {wrong && attempts >= 1 && puzzle.hint && (
                  <p className="mt-2 font-serif text-sm italic text-[hsl(40,28%,68%)]">
                    Hint: {puzzle.hint}
                  </p>
                )}

                {error && (
                  <p className="mt-4 font-type text-xs uppercase tracking-wider text-destructive">
                    {error}
                  </p>
                )}
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="border-[hsl(40,20%,42%)] bg-transparent font-type uppercase tracking-widest text-[hsl(40,32%,82%)] hover:bg-[hsl(40,18%,16%)] hover:text-[hsl(40,38%,90%)]"
                >
                  Keep reading
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    puzzle.type === "multiple-choice" ? !choice : !answer.trim()
                  }
                  size="lg"
                  className="font-type uppercase tracking-widest"
                >
                  {puzzle.type === "cipher" ? "Decode" : "Submit"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
