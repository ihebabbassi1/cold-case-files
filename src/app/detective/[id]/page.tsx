import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCase } from "@/data/cases";
import { CASE_BADGES, computeScore } from "@/data/badges";
import { Crosshair } from "@/components/crosshair";
import { Stamp } from "@/components/stamp";
import { BadgeGlyph } from "@/components/badge-icon";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { name: true },
  });
  return {
    title: user
      ? `Det. ${user.name} — Cold Case Files`
      : "Detective — Cold Case Files",
  };
}

export default async function DetectivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, createdAt: true },
  });
  if (!user) notFound();

  const [investigations, accusations] = await Promise.all([
    prisma.investigation.findMany({ where: { userId: id } }),
    prisma.accusation.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const solvedByCase = new Map(
    investigations.map((i) => [i.caseId, i.solvedStages])
  );
  const accusationByCase = new Map<string, string>();
  for (const a of accusations) {
    if (!accusationByCase.has(a.caseId)) accusationByCase.set(a.caseId, a.suspectName);
  }

  // Build a board for every case that has a badge set.
  const boards = Object.keys(CASE_BADGES).map((cid) => {
    const solved = solvedByCase.get(cid) ?? [];
    return {
      cid,
      file: getCase(cid),
      score: computeScore(cid, solved),
      accusation: accusationByCase.get(cid) ?? null,
    };
  });

  const totalScore = boards.reduce((s, b) => s + b.score.score, 0);
  const totalBadges = boards.reduce((s, b) => s + b.score.earnedCount, 0);
  const totalPossibleBadges = boards.reduce((s, b) => s + b.score.total, 0);
  const joinedYear = new Date(user.createdAt).getFullYear();

  return (
    <div className="vignette">
      <div className="container py-12">
        {/* Detective ID card */}
        <div className="noir relative overflow-hidden rounded-md border border-primary/40 p-7 sm:p-9">
          <Crosshair className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 text-primary/5" />
          <p className="font-type text-[0.65rem] uppercase tracking-[0.4em] text-primary/80">
            Detective Service Record · Cold Case Files
          </p>
          <h1 className="mt-2 font-headline text-4xl font-black text-[hsl(40,40%,90%)] sm:text-5xl">
            Det. {user.name}
          </h1>
          <p className="mt-1 font-type text-xs uppercase tracking-widest text-[hsl(40,22%,58%)]">
            Badge issued {joinedYear}
          </p>

          <div className="mt-6 grid gap-4 font-type sm:grid-cols-3">
            <div className="rounded border border-ink/60 bg-black/30 p-4">
              <p className="text-[0.6rem] uppercase tracking-widest text-[hsl(40,20%,55%)]">
                Total score
              </p>
              <p className="mt-1 font-headline text-3xl font-black text-primary">
                {totalScore.toLocaleString()}
              </p>
            </div>
            <div className="rounded border border-ink/60 bg-black/30 p-4">
              <p className="text-[0.6rem] uppercase tracking-widest text-[hsl(40,20%,55%)]">
                Badges earned
              </p>
              <p className="mt-1 font-headline text-3xl font-black text-[hsl(40,40%,90%)]">
                {totalBadges}{" "}
                <span className="text-lg text-[hsl(40,22%,55%)]">
                  / {totalPossibleBadges}
                </span>
              </p>
            </div>
            <div className="rounded border border-ink/60 bg-black/30 p-4">
              <p className="text-[0.6rem] uppercase tracking-widest text-[hsl(40,20%,55%)]">
                Cases worked
              </p>
              <p className="mt-1 font-headline text-3xl font-black text-[hsl(40,40%,90%)]">
                {boards.filter((b) => b.score.earnedCount > 0).length}
              </p>
            </div>
          </div>
        </div>

        {/* Badge shelves, per case */}
        {boards.map((board) => (
          <div key={board.cid} className="mt-10">
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <h2 className="font-type text-sm uppercase tracking-[0.3em] text-ink">
                {board.file?.codename ?? board.cid} — Badge shelf
              </h2>
              <hr className="rule-double flex-1" />
              <span className="font-type text-xs uppercase tracking-widest text-primary">
                {board.score.earnedCount}/{board.score.total} ·{" "}
                {board.score.score.toLocaleString()} pts
              </span>
            </div>

            {board.score.complete && (
              <div className="mb-5 inline-flex items-center gap-3 rounded border border-primary/50 bg-primary/10 px-4 py-2">
                <Stamp straight>Case Closed</Stamp>
                <span className="font-type text-xs uppercase tracking-wider text-ink">
                  Every chapter cleared
                </span>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {board.score.badges.map((b) => {
                const earned = board.score.earnedStageIds.has(b.stageId);
                return earned ? (
                  <div
                    key={b.stageId}
                    className="sheet flex flex-col rounded-md border border-primary/40 p-5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary/50 bg-primary/10">
                        <BadgeGlyph icon={b.icon} className="h-5 w-5 text-primary" />
                      </span>
                      <Stamp straight className="text-[0.5rem]">
                        Cleared
                      </Stamp>
                    </div>
                    <h3 className="mt-3 font-headline text-lg font-bold text-ink">
                      {b.name}
                    </h3>
                    <p className="mt-1 flex-1 font-serif text-sm text-ink/80">
                      {b.tagline}
                    </p>
                    <p className="mt-3 font-type text-[0.65rem] uppercase tracking-widest text-primary">
                      Chapter {b.chapter} · {b.points} pts
                    </p>
                  </div>
                ) : (
                  <div
                    key={b.stageId}
                    className="flex flex-col items-center justify-center rounded-md border border-dashed border-ink/30 bg-ink/5 p-5 text-center opacity-70"
                  >
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/30 bg-ink/10">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </span>
                    <p className="mt-3 font-type text-xs uppercase tracking-widest text-muted-foreground">
                      Chapter {b.chapter}
                    </p>
                    <p className="mt-1 font-serif text-sm italic text-ink/45">
                      Sealed badge
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 font-type text-xs uppercase tracking-widest text-muted-foreground">
              {board.accusation ? (
                <span>
                  Accusation on file:{" "}
                  <span className="text-ink">{board.accusation}</span>
                </span>
              ) : (
                <span>No accusation filed yet.</span>
              )}
              {board.file && !board.file.locked && (
                <Link
                  href={`/cases/${board.cid}`}
                  className="text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Open the case →
                </Link>
              )}
            </div>
          </div>
        ))}

        <div className="mt-10 text-center">
          <Link
            href="/cases"
            className="font-type text-xs uppercase tracking-widest text-primary underline underline-offset-4 hover:text-primary/80"
          >
            ← Back to the case archive
          </Link>
        </div>
      </div>
    </div>
  );
}
