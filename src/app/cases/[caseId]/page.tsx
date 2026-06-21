import Link from "next/link";
import Image from "next/image";
import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCase } from "@/data/cases";
import { getInvestigationState } from "@/lib/actions";
import { resolveRevealState } from "@/data/chapters";
import { getBadges, computeScore } from "@/data/badges";
import type { CasePhoto, CaseSource } from "@/types/case";
import { Crosshair } from "@/components/crosshair";
import { Stamp } from "@/components/stamp";
import { ChapterGate } from "@/components/chapter-gate";
import { ClueCard, ExhibitProgress } from "@/components/clue-card";
import {
  InvestigationBoard,
  type BoardCard,
} from "@/components/investigation-board";
import {
  ChapterCinematic,
  type CinematicPayload,
} from "@/components/chapter-cinematic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

function PhotoCard({ photo }: { photo: CasePhoto }) {
  return (
    <div className="sheet rounded-md border border-ink/40 overflow-hidden">
      <div className="relative w-full bg-ink/10" style={{ minHeight: "200px" }}>
        <Image
          src={photo.url}
          alt={photo.caption}
          width={600}
          height={400}
          className="w-full h-auto object-contain"
          unoptimized
        />
      </div>
      <div className="p-4">
        <p className="font-serif text-sm leading-relaxed text-ink/90">{photo.caption}</p>
        <p className="mt-2 font-type text-[0.6rem] uppercase tracking-widest text-muted-foreground">
          {photo.year} · {photo.credit}
        </p>
      </div>
    </div>
  );
}

function SourceList({ sources }: { sources: CaseSource[] }) {
  return (
    <div className="mt-8 sheet rounded-md border border-ink/40 p-6">
      <h3 className="font-type text-xs uppercase tracking-[0.3em] text-ink">
        Primary sources & references
      </h3>
      <hr className="rule-double my-3" />
      <div className="grid gap-3 sm:grid-cols-2">
        {sources.map((src, i) => (
          <a
            key={i}
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded border border-ink/20 p-3 transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            <p className="font-type text-[0.65rem] uppercase tracking-widest text-primary group-hover:text-primary/80">
              ↗ {src.label}
            </p>
            <p className="mt-1 font-serif text-xs text-ink/70">{src.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

export default async function CasePage({
  params,
  searchParams,
}: {
  params: Promise<{ caseId: string }>;
  searchParams: Promise<{ intro?: string }>;
}) {
  const { caseId } = await params;
  const { intro } = await searchParams;
  const forceIntro = intro === "1";
  const session = await auth.api.getSession({
    headers: (await headers()) as unknown as Headers,
  });
  if (!session?.user) redirect("/login");

  const file = getCase(caseId);
  if (!file || file.locked) notFound();

  const priorAccusation = await prisma.accusation.findFirst({
    where: { userId: session.user.id, caseId: file.id },
    orderBy: { createdAt: "desc" },
  });

  const hasInvestigation = Boolean(file.investigation?.length);
  const totalStages = file.investigation?.length ?? 0;
  const { solvedStageIds, completed: investigationComplete } = hasInvestigation
    ? await getInvestigationState(file.id)
    : { solvedStageIds: [], completed: false };
  const solvedCount = solvedStageIds.length;

  // Resolve the chapter game: which content has the detective unlocked so far?
  const reveal = resolveRevealState(file, solvedStageIds, investigationComplete);
  const gated = reveal.hasChapters;

  // Build the one-time 3D entrance payload for the chapter the detective is on
  // (or the finale once the case is closed). The component itself enforces the
  // "play only once" rule via localStorage.
  const caseBadges = getBadges(file.id);
  const scoreState = computeScore(file.id, solvedStageIds);
  let cinematic: CinematicPayload | null = null;
  if (gated && hasInvestigation) {
    if (investigationComplete) {
      cinematic = {
        storageKey: `ccf:finale:${file.id}`,
        kind: "finale",
        chapterNumber: scoreState.total,
        total: scoreState.total,
        badge: caseBadges[caseBadges.length - 1] ?? null,
        score: scoreState.score,
      };
    } else if (reveal.currentChapter) {
      const n = reveal.currentChapter.number;
      cinematic = {
        storageKey: `ccf:intro:${file.id}:${reveal.currentChapter.stageId}`,
        kind: n === 1 ? "welcome" : "unlock",
        stageId: reveal.currentChapter.stageId,
        chapterNumber: n,
        total: reveal.currentChapter.total,
        chapterTitle: reveal.currentChapter.title,
        chapterLabel: reveal.currentChapter.label,
        // The badge just earned is the one for the previous chapter.
        badge: n > 1 ? caseBadges[n - 2] ?? null : null,
      };
    }
  }

  // Apply the chapter gate to every content section. Nothing is removed — locked
  // items simply stay sealed until their chapter is reached.
  const visibleVictims = gated
    ? file.victims.filter((v) => reveal.victimNames.has(v.name))
    : file.victims;
  const lockedVictims = file.victims.length - visibleVictims.length;

  const visibleTimeline = gated
    ? file.timeline.filter((t) => reveal.timelineDates.has(t.date))
    : file.timeline;
  const lockedTimeline = file.timeline.length - visibleTimeline.length;

  const visibleEvidence = gated
    ? file.evidence.filter((e) => reveal.evidenceIds.has(e.id))
    : file.evidence;
  const lockedEvidence = file.evidence.length - visibleEvidence.length;

  const visibleCiphers = gated
    ? file.ciphers.filter((c) => reveal.cipherIds.has(c.id))
    : file.ciphers;
  const lockedCiphers = file.ciphers.length - visibleCiphers.length;

  const suspectsRevealed = !gated || reveal.suspectsRevealed;
  const visibleSuspects = suspectsRevealed ? file.suspects : [];

  // Group photos by where they belong (chapter-gated)
  const allowedPhotos = (file.photos ?? []).filter(
    (p) => !gated || reveal.photoIds.has(p.id)
  );
  const victimPhotos = allowedPhotos.filter((p) =>
    ["lake-herman-road", "hartnell-car-door", "lake-berryessa", "stine-crime-scene"].includes(p.id)
  );
  const evidencePhotos = allowedPhotos.filter((p) =>
    ["zodiac-letter-jul1969", "zodiac-letter-nov1969"].includes(p.id)
  );
  const cipherPhotos = allowedPhotos.filter((p) =>
    ["z408-cipher", "z340-cipher"].includes(p.id)
  );

  // Cards the detective can pin on the Investigation Board — only what the
  // chapter game has already unlocked. Each card maps to the closest VERIFIED
  // real case image; cards with no genuine match fall back to a themed
  // placeholder (no invented faces).
  const VICTIM_IMG: Record<string, string> = {
    "David Faraday & Betty Lou Jensen": "/zodiac/lake-herman-road.jpg",
    "Darlene Ferrin": "/zodiac/darlene-ferrin.png",
    "Michael Mageau": "/zodiac/michael-mageau.jpg",
    "Cecelia Shepard": "/zodiac/lake-berryessa.jpg",
    "Bryan Hartnell": "/zodiac/hartnell-car-door.jpg",
    "Paul Lee Stine": "/zodiac/stine-crime-scene.jpg",
  };
  const EVIDENCE_IMG: Record<string, string> = {
    symbol: "/zodiac/wanted-poster.png", // bulletin showing the crossed-circle sign
    letters: "/zodiac/zodiac-letter-jul1969.jpg",
    shirt: "/zodiac/stine-crime-scene.jpg", // swatch torn from Stine's shirt
    costume: "/zodiac/lake-berryessa.jpg", // the Berryessa hooded attack
    sketch: "/zodiac/berryessa-sketch.jpg",
  };
  const CIPHER_IMG: Record<string, string> = {
    z408: "/zodiac/z408-cipher.png",
    z340: "/zodiac/z340-cipher.jpg",
  };

  const boardCards: BoardCard[] = [
    ...visibleSuspects.map((s) => ({
      id: `suspect:${s.id}`,
      kind: "suspect" as const,
      title: s.name,
      subtitle: s.alias,
    })),
    ...allowedPhotos.map((p) => ({
      id: `photo:${p.id}`,
      kind: "photo" as const,
      title: p.caption.length > 38 ? p.caption.slice(0, 36) + "…" : p.caption,
      image: p.url,
    })),
    ...visibleVictims.map((v) => ({
      id: `victim:${v.name}`,
      kind: "victim" as const,
      title: v.name,
      image: VICTIM_IMG[v.name],
    })),
    ...visibleEvidence.map((e) => ({
      id: `evidence:${e.id}`,
      kind: "evidence" as const,
      title: e.title,
      subtitle: e.tag,
      image: EVIDENCE_IMG[e.id],
    })),
    ...visibleCiphers.map((c) => ({
      id: `cipher:${c.id}`,
      kind: "cipher" as const,
      title: c.name,
      image: CIPHER_IMG[c.id],
    })),
  ];
  const suspectPhotos = allowedPhotos.filter((p) =>
    ["wanted-poster", "berryessa-sketch"].includes(p.id)
  );

  const SealedNotice = ({ count, noun }: { count: number; noun: string }) =>
    count > 0 ? (
      <div className="mt-6 flex items-center gap-3 rounded-md border border-dashed border-ink/40 bg-ink/5 px-5 py-4">
        <Crosshair className="h-5 w-5 shrink-0 text-primary/60" />
        <p className="font-type text-xs uppercase tracking-widest text-muted-foreground">
          {count} {noun}
          {count === 1 ? "" : "s"} still sealed — crack the next chapter to unlock
          {count === 1 ? " it" : " them"}.
        </p>
      </div>
    ) : null;

  return (
    <div className="vignette">
      <div className="container py-10">
        {/* File header */}
        <div className="sheet relative overflow-hidden rounded-md border border-ink/40 p-7 sm:p-9">
          <Crosshair className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 text-ink/5" />
          <div className="flex flex-wrap items-center gap-3">
            <Stamp>{file.status}</Stamp>
            <span className="font-type text-xs uppercase tracking-widest text-muted-foreground">
              Case No. CCF-001
            </span>
          </div>
          <h1 className="mt-3 font-headline text-4xl font-black text-ink sm:text-6xl">
            {file.codename}
          </h1>
          <p className="mt-2 font-headline text-lg italic text-ink/80">
            {file.tagline}
          </p>

          <dl className="mt-5 grid gap-4 font-type text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Active years</dt>
              <dd className="text-ink">{file.years}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Jurisdiction</dt>
              <dd className="text-ink">{file.jurisdiction}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Casualties</dt>
              <dd className="text-ink">{file.bodyCount}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {priorAccusation && (
              <div className="inline-flex items-center gap-3 rounded border border-primary/50 bg-primary/10 px-4 py-2">
                <Stamp straight>On file</Stamp>
                <span className="font-type text-xs uppercase tracking-wider text-ink">
                  You named {priorAccusation.suspectName}
                </span>
              </div>
            )}
            {gated && (
              <Link
                href={`/detective/${session.user.id}`}
                className="inline-flex items-center gap-4 rounded border border-ink/40 bg-ink/5 px-4 py-2 transition-colors hover:border-primary/50 hover:bg-primary/5"
                title="View your public detective profile"
              >
                <span className="font-type text-xs uppercase tracking-widest text-muted-foreground">
                  Badges{" "}
                  <span className="text-ink">
                    {scoreState.earnedCount}/{scoreState.total}
                  </span>
                </span>
                <span className="font-type text-xs uppercase tracking-widest text-muted-foreground">
                  Score{" "}
                  <span className="text-primary">
                    {scoreState.score.toLocaleString()}
                  </span>
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="briefing" className="mt-8">
          <TabsList className="flex-wrap font-type text-xs uppercase tracking-wider">
            <TabsTrigger value="briefing">Briefing</TabsTrigger>
            <TabsTrigger value="victims">Victims</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
            <TabsTrigger value="ciphers">Ciphers</TabsTrigger>
            <TabsTrigger value="suspects">Suspects</TabsTrigger>
          </TabsList>

          {/* Briefing */}
          <TabsContent value="briefing">
            <div className="sheet rounded-md border border-ink/40 p-7">
              <h2 className="font-type text-sm uppercase tracking-[0.3em] text-ink">
                Detective&apos;s briefing
              </h2>
              <hr className="rule-double my-4" />
              <div className="space-y-4 font-serif text-[1.05rem] leading-relaxed text-ink/90">
                {file.briefing.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <div className="noir mt-6 rounded border border-ink/60 p-5">
                <p className="font-type text-xs uppercase tracking-[0.3em] text-primary/80">
                  Your assignment
                </p>
                <p className="mt-2 typed text-sm text-[hsl(40,30%,78%)]">
                  {file.mission}
                </p>
              </div>
            </div>
            {file.sources && <SourceList sources={file.sources} />}
          </TabsContent>

          {/* Victims */}
          <TabsContent value="victims">
            <div className="grid gap-5 md:grid-cols-2">
              {visibleVictims.map((v) => (
                <div key={v.name} className="sheet rounded-md border border-ink/40 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline text-xl font-bold text-ink">
                      {v.sourceUrl ? (
                        <a
                          href={v.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline decoration-primary/40 decoration-dotted underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
                          title="Open the documented record for this victim"
                        >
                          {v.name}
                        </a>
                      ) : (
                        v.name
                      )}
                    </h3>
                    <Badge
                      variant={v.status === "SURVIVED" ? "secondary" : "destructive"}
                      className="font-type text-[0.6rem] uppercase tracking-widest"
                    >
                      {v.status}
                    </Badge>
                  </div>
                  <p className="mt-1 font-type text-xs uppercase tracking-widest text-muted-foreground">
                    Age {v.age} · {v.date}
                  </p>
                  <p className="font-type text-xs uppercase tracking-wider text-primary">
                    {v.location}
                  </p>
                  <p className="mt-3 font-serif text-sm leading-relaxed text-ink/90">{v.details}</p>
                  {v.sourceUrl && (
                    <a
                      href={v.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 font-type text-[0.65rem] uppercase tracking-widest text-primary/70 transition-colors hover:text-primary"
                    >
                      ↗ Real photos &amp; full documented record
                    </a>
                  )}
                </div>
              ))}
            </div>

            <SealedNotice count={lockedVictims} noun="victim record" />

            {victimPhotos.length > 0 && (
              <div className="mt-8">
                <div className="mb-4 flex items-center gap-4">
                  <h2 className="font-type text-sm uppercase tracking-[0.3em] text-ink">Crime scene photographs</h2>
                  <hr className="rule-double flex-1" />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  {victimPhotos.map((p) => <PhotoCard key={p.id} photo={p} />)}
                </div>
                <p className="mt-4 text-center font-type text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                  All photographs are public domain government or archival documents.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Timeline */}
          <TabsContent value="timeline">
            <div className="sheet rounded-md border border-ink/40 p-7">
              <ol className="relative border-l-2 border-ink/30 pl-6">
                {visibleTimeline.map((t, i) => (
                  <li key={i} className="mb-6 last:mb-0">
                    <span className="absolute -left-[7px]">
                      <span className="block h-3 w-3 rounded-full bg-primary" />
                    </span>
                    <p className="font-type text-xs uppercase tracking-widest text-primary">{t.date}</p>
                    <p className="mt-1 font-serif text-[1.02rem] leading-relaxed text-ink/90">
                      {t.sourceUrl ? (
                        <a
                          href={t.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline decoration-ink/30 decoration-dotted underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
                          title="Open the documented source for this event"
                        >
                          {t.event}
                        </a>
                      ) : (
                        t.event
                      )}
                    </p>
                  </li>
                ))}
              </ol>
              <SealedNotice count={lockedTimeline} noun="timeline event" />
            </div>
          </TabsContent>

          {/* Evidence */}
          <TabsContent value="evidence">
            <ExhibitProgress
              caseId={file.id}
              ids={visibleEvidence.map((e) => e.id)}
              noun="exhibit"
            />
            <div className="grid gap-5 md:grid-cols-2">
              {visibleEvidence.map((e) => (
                <div key={e.id} className="sheet rounded-md border border-ink/40 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-headline text-lg font-bold text-ink">
                      {e.sourceUrl ? (
                        <a
                          href={e.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline decoration-primary/40 decoration-dotted underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
                          title="Open the documented source for this evidence"
                        >
                          {e.title}
                        </a>
                      ) : (
                        e.title
                      )}
                    </h3>
                    <Badge variant="outline" className="shrink-0 border-primary/60 font-type text-[0.55rem] uppercase tracking-widest text-primary">
                      {e.tag}
                    </Badge>
                  </div>
                  <ClueCard caseId={file.id} clueId={e.id}>
                    {e.date && (
                      <p className="mt-1 font-type text-xs uppercase tracking-widest text-muted-foreground">{e.date}</p>
                    )}
                    <p className="mt-3 font-serif text-sm leading-relaxed text-ink/90">{e.description}</p>
                    {e.quote && (
                      <p className="mt-3 scrawl text-lg text-[hsl(0,50%,30%)]">&ldquo;{e.quote}&rdquo;</p>
                    )}
                    {e.sourceUrl && (
                      <a
                        href={e.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 font-type text-[0.65rem] uppercase tracking-widest text-primary/70 hover:text-primary transition-colors"
                      >
                        ↗ {e.sourceLabel ?? "Source"}
                      </a>
                    )}
                  </ClueCard>
                </div>
              ))}
            </div>

            <SealedNotice count={lockedEvidence} noun="piece of evidence" />

            {evidencePhotos.length > 0 && (
              <div className="mt-8">
                <div className="mb-4 flex items-center gap-4">
                  <h2 className="font-type text-sm uppercase tracking-[0.3em] text-ink">The letters — original documents</h2>
                  <hr className="rule-double flex-1" />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  {evidencePhotos.map((p) => <PhotoCard key={p.id} photo={p} />)}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Ciphers */}
          <TabsContent value="ciphers">
            <ExhibitProgress
              caseId={file.id}
              ids={visibleCiphers.map((c) => c.id)}
              noun="cipher"
            />
            <div className="grid gap-5 md:grid-cols-2">
              {visibleCiphers.map((c) => (
                <div key={c.id} className="noir rounded-md border border-ink/60 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline text-lg font-bold text-[hsl(40,35%,82%)]">
                      {c.sourceUrl ? (
                        <a
                          href={c.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline decoration-primary/40 decoration-dotted underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
                          title="Open the documented record for this cipher"
                        >
                          {c.name}
                        </a>
                      ) : (
                        c.name
                      )}
                    </h3>
                    <Badge
                      variant={c.status === "SOLVED" ? "secondary" : "destructive"}
                      className="font-type text-[0.55rem] uppercase tracking-widest"
                    >
                      {c.status}
                    </Badge>
                  </div>
                  <ClueCard caseId={file.id} clueId={c.id} variant="dark" action="Decrypt the exhibit">
                  <p className="mt-1 font-type text-xs uppercase tracking-widest text-[hsl(40,20%,55%)]">{c.date}</p>
                  <p className="mt-3 font-serif text-sm leading-relaxed text-[hsl(40,28%,76%)]">{c.description}</p>
                  {c.solution && (
                    <p className="mt-3 font-cipher rounded bg-black/40 p-3 text-xs leading-relaxed text-[hsl(40,40%,70%)]">
                      {c.solution}
                    </p>
                  )}
                  {c.solvedBy && (
                    <p className="mt-2 font-type text-[0.7rem] uppercase tracking-widest text-primary/80">
                      Cracked by {c.solvedBy}
                    </p>
                  )}
                  {c.status === "UNSOLVED" && (
                    <p className="mt-2 font-type text-[0.7rem] uppercase tracking-widest text-destructive">
                      Still unbroken
                    </p>
                  )}
                  {c.sourceUrl && (
                    <a
                      href={c.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 font-type text-[0.65rem] uppercase tracking-widest text-primary/70 transition-colors hover:text-primary"
                    >
                      ↗ Real cipher scans &amp; full analysis
                    </a>
                  )}
                  </ClueCard>
                </div>
              ))}
            </div>

            <SealedNotice count={lockedCiphers} noun="cipher" />

            {cipherPhotos.length > 0 && (
              <div className="mt-8">
                <div className="mb-4 flex items-center gap-4">
                  <h2 className="font-type text-sm uppercase tracking-[0.3em] text-ink">The ciphers — original scans</h2>
                  <hr className="rule-double flex-1" />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  {cipherPhotos.map((p) => <PhotoCard key={p.id} photo={p} />)}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Suspects */}
          <TabsContent value="suspects">
            {!suspectsRevealed && (
              <div className="noir mb-6 flex items-center gap-3 rounded-md border border-dashed border-primary/40 p-6">
                <Crosshair className="h-6 w-6 shrink-0 text-primary/70" />
                <p className="font-type text-xs uppercase tracking-widest text-[hsl(40,28%,74%)]">
                  The suspect roster stays sealed until you have worked every
                  event. Crack the chapters in order to earn the right to name him.
                </p>
              </div>
            )}
            <div className="grid gap-5">
              {visibleSuspects.map((s) => (
                <div key={s.id} className="sheet rounded-md border border-ink/40 p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-headline text-2xl font-bold text-ink">
                      {s.sourceUrl ? (
                        <a
                          href={s.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline decoration-primary/40 decoration-dotted underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
                          title="Open the documented record for this suspect"
                        >
                          {s.name}
                        </a>
                      ) : (
                        s.name
                      )}
                    </h3>
                    <Stamp straight className="text-[0.6rem]">{s.alias}</Stamp>
                  </div>
                  <p className="mt-1 font-type text-xs uppercase tracking-widest text-muted-foreground">
                    {s.lived} · {s.fate}
                  </p>
                  <p className="mt-3 font-serif text-sm leading-relaxed text-ink/90">{s.summary}</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="font-type text-xs uppercase tracking-widest text-primary">Points toward guilt</p>
                      <ul className="mt-2 space-y-1.5 font-serif text-sm text-ink/85">
                        {s.pointsFor.map((p, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-primary">▸</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-type text-xs uppercase tracking-widest text-muted-foreground">Points to innocence</p>
                      <ul className="mt-2 space-y-1.5 font-serif text-sm text-ink/85">
                        {s.pointsAgainst.map((p, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-muted-foreground">▸</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {s.sourceUrl && (
                    <a
                      href={s.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1 font-type text-[0.65rem] uppercase tracking-widest text-primary/70 transition-colors hover:text-primary"
                    >
                      ↗ Real photos, documents &amp; full investigation file
                    </a>
                  )}
                </div>
              ))}
            </div>

            {suspectPhotos.length > 0 && (
              <div className="mt-8">
                <div className="mb-4 flex items-center gap-4">
                  <h2 className="font-type text-sm uppercase tracking-[0.3em] text-ink">Official composite sketches & wanted poster</h2>
                  <hr className="rule-double flex-1" />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  {suspectPhotos.map((p) => <PhotoCard key={p.id} photo={p} />)}
                </div>
              </div>
            )}
            {file.sources && (
              <div className="mt-8 sheet rounded-md border border-ink/40 p-6">
                <h3 className="font-type text-xs uppercase tracking-[0.3em] text-ink">
                  Research resources — help identify the killer
                </h3>
                <p className="mt-1 mb-4 font-serif text-sm text-muted-foreground">
                  These are the most trusted primary sources investigators and researchers use. Visit them to dig deeper into the evidence and suspects before making your accusation.
                </p>
                <hr className="rule-double mb-4" />
                <div className="grid gap-3 sm:grid-cols-2">
                  {file.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block rounded border border-ink/20 p-3 transition-colors hover:border-primary/50 hover:bg-primary/5"
                    >
                      <p className="font-type text-[0.65rem] uppercase tracking-widest text-primary group-hover:text-primary/80">
                        ↗ {src.label}
                      </p>
                      <p className="mt-1 font-serif text-xs text-ink/70">{src.description}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Investigation / Accusation CTA */}
        {hasInvestigation && !investigationComplete ? (
          <div className="noir mt-10 rounded-md border border-primary/40 p-8 text-center">
            <Crosshair className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-3 font-headline text-3xl font-black text-[hsl(40,38%,85%)]">
              Work the case, event by event
            </h2>
            <p className="mx-auto mt-2 max-w-xl typed text-sm text-[hsl(40,28%,74%)]">
              Start at Lake Herman Road and solve your way forward. Each event
              stays sealed until you crack the one before it. Close every lead
              and you earn the right to name him.
            </p>
            <p className="mt-3 font-type text-xs uppercase tracking-widest text-primary">
              {solvedCount} of {totalStages} events solved
            </p>
            <Button asChild size="lg" className="mt-5 font-type uppercase tracking-widest">
              <Link href={`/cases/${file.id}/investigate`}>
                {solvedCount > 0 ? "Resume the investigation" : "Begin the investigation"}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="noir mt-10 rounded-md border border-primary/40 p-8 text-center">
            <Crosshair className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-3 font-headline text-3xl font-black text-[hsl(40,38%,85%)]">
              Ready to name the Zodiac?
            </h2>
            <p className="mx-auto mt-2 max-w-xl typed text-sm text-[hsl(40,28%,74%)]">
              {hasInvestigation
                ? "You worked every event. Make the call no detective in 1969 could — your verdict goes on the record."
                : "You have read the file. Make the call no detective in 1969 could. Your verdict goes on the record."}
            </p>
            <Button asChild size="lg" className="mt-5 font-type uppercase tracking-widest">
              <Link href={`/cases/${file.id}/accuse`}>
                {priorAccusation ? "Revisit your verdict" : "Make your accusation"}
              </Link>
            </Button>
          </div>
        )}
      </div>

      {hasInvestigation && gated && (
        <ChapterGate
          caseId={file.id}
          solvedCount={solvedCount}
          total={totalStages}
          completed={investigationComplete}
          currentChapter={reveal.currentChapter}
        />
      )}

      {boardCards.length > 0 && (
        <InvestigationBoard caseId={file.id} cards={boardCards} />
      )}

      <ChapterCinematic
        cinematic={cinematic}
        force={forceIntro && !investigationComplete}
      />
    </div>
  );
}
