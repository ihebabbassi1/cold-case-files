import { CASE_CHAPTERS } from "@/data/chapters";

/**
 * A badge is earned by clearing a chapter. Because each chapter maps 1:1 to a
 * solved investigation stage, the set of earned badges is fully derivable from
 * the user's `solvedStages` array — no extra persistence is required.
 */
export interface Badge {
  /** Matches the chapter's stageId. */
  stageId: string;
  /** 1-based chapter number, for ordering and display. */
  chapter: number;
  /** Short badge name, e.g. "Codebreaker". */
  name: string;
  /** One-line flavor describing what earning it meant. */
  tagline: string;
  /** Icon key resolved to a lucide icon by the UI. */
  icon: BadgeIcon;
  /** Points awarded for clearing this chapter. */
  points: number;
}

export type BadgeIcon =
  | "crosshair"
  | "phone"
  | "key"
  | "feather"
  | "skull"
  | "scissors"
  | "clock"
  | "gavel";

/** Bonus added to the score once every chapter in a case is cleared. */
export const COMPLETION_BONUS = 500;

export const CASE_BADGES: Record<string, Badge[]> = {
  zodiac: [
    {
      stageId: "lake-herman",
      chapter: 1,
      name: "First Blood",
      tagline: "Read the scene at Lake Herman Road.",
      icon: "crosshair",
      points: 100,
    },
    {
      stageId: "blue-rock-springs",
      chapter: 2,
      name: "The Confession Call",
      tagline: "Tied two crime scenes to a single hunter.",
      icon: "phone",
      points: 150,
    },
    {
      stageId: "the-408",
      chapter: 3,
      name: "Codebreaker",
      tagline: "Cracked the killer's first words in the 408.",
      icon: "key",
      points: 250,
    },
    {
      stageId: "this-is-the-zodiac",
      chapter: 4,
      name: "The Name",
      tagline: "Witnessed the killer christen himself.",
      icon: "feather",
      points: 200,
    },
    {
      stageId: "lake-berryessa",
      chapter: 5,
      name: "The Gunsight",
      tagline: "Identified the crossed-circle on the hood.",
      icon: "skull",
      points: 250,
    },
    {
      stageId: "paul-stine",
      chapter: 6,
      name: "The Swatch",
      tagline: "Linked the letters to a body in Presidio Heights.",
      icon: "scissors",
      points: 300,
    },
    {
      stageId: "the-340",
      chapter: 7,
      name: "Fifty-One Years",
      tagline: "Outlasted the cipher no one could break.",
      icon: "clock",
      points: 400,
    },
    {
      stageId: "the-prime-suspect",
      chapter: 8,
      name: "The Warrant",
      tagline: "Earned the right to name the prime suspect.",
      icon: "gavel",
      points: 500,
    },
  ],
};

export function getBadges(caseId: string): Badge[] {
  return CASE_BADGES[caseId] ?? [];
}

export interface ScoreState {
  badges: Badge[];
  earnedStageIds: Set<string>;
  earnedCount: number;
  total: number;
  /** True once every chapter is cleared. */
  complete: boolean;
  /** Points from earned chapters, plus the completion bonus when finished. */
  score: number;
  /** Highest reachable score for the case (all chapters + bonus). */
  maxScore: number;
}

/**
 * Derive earned badges and the running score from solved stage ids. The score
 * is authoritative server-side data — it only ever reflects real progress.
 */
export function computeScore(
  caseId: string,
  solvedStageIds: string[]
): ScoreState {
  const badges = getBadges(caseId);
  const total = CASE_CHAPTERS[caseId]?.length ?? badges.length;
  const earned = new Set(solvedStageIds);

  const earnedBadges = badges.filter((b) => earned.has(b.stageId));
  const complete = total > 0 && earnedBadges.length === total;

  const base = earnedBadges.reduce((sum, b) => sum + b.points, 0);
  const maxScore =
    badges.reduce((sum, b) => sum + b.points, 0) + COMPLETION_BONUS;

  return {
    badges,
    earnedStageIds: earned,
    earnedCount: earnedBadges.length,
    total,
    complete,
    score: base + (complete ? COMPLETION_BONUS : 0),
    maxScore,
  };
}
