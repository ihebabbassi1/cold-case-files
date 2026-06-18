import type { CaseFile, InvestigationStage } from "@/types/case";

/**
 * Maps each gated investigation stage to the case-file content it unlocks.
 *
 * The main case page reveals content chapter by chapter: a detective only sees
 * the victims, evidence, ciphers, timeline entries and photos belonging to the
 * chapters they have reached. Solving a chapter's puzzle reveals the next one.
 *
 * `stageId` must match an `InvestigationStage.id` for the case. Every victim,
 * evidence item, cipher, timeline date and photo in the case data is assigned
 * to exactly one chapter so that nothing is ever permanently hidden.
 */
export interface ChapterContent {
  /** Matches an InvestigationStage id for the case. */
  stageId: string;
  /** Victim names (exact match on Victim.name) this chapter reveals. */
  victimNames: string[];
  /** Evidence ids (EvidenceItem.id) this chapter reveals. */
  evidenceIds: string[];
  /** Cipher ids (Cipher.id) this chapter reveals. */
  cipherIds: string[];
  /** Timeline entry dates (exact match on TimelineEntry.date) this chapter reveals. */
  timelineDates: string[];
  /** Photo ids (CasePhoto.id) this chapter reveals. */
  photoIds: string[];
  /** When true, this chapter unlocks the full suspect roster. */
  revealsSuspects?: boolean;
}

export const CASE_CHAPTERS: Record<string, ChapterContent[]> = {
  zodiac: [
    {
      stageId: "lake-herman",
      victimNames: ["David Faraday & Betty Lou Jensen"],
      evidenceIds: ["ballistics"],
      cipherIds: [],
      timelineDates: ["Oct 30, 1966", "Dec 20, 1968"],
      photoIds: ["lake-herman-road"],
    },
    {
      stageId: "blue-rock-springs",
      victimNames: ["Darlene Ferrin", "Michael Mageau"],
      evidenceIds: [],
      cipherIds: [],
      timelineDates: ["Jul 4, 1969"],
      photoIds: [],
    },
    {
      stageId: "the-408",
      victimNames: [],
      evidenceIds: ["letters"],
      cipherIds: ["z408"],
      timelineDates: ["Aug 1, 1969", "Aug 8, 1969"],
      photoIds: ["z408-cipher", "zodiac-letter-jul1969"],
    },
    {
      stageId: "this-is-the-zodiac",
      victimNames: [],
      evidenceIds: ["symbol"],
      cipherIds: [],
      timelineDates: ["Aug 1969"],
      photoIds: [],
    },
    {
      stageId: "lake-berryessa",
      victimNames: ["Cecelia Shepard", "Bryan Hartnell"],
      evidenceIds: ["costume"],
      cipherIds: [],
      timelineDates: ["Sep 27, 1969"],
      photoIds: ["lake-berryessa", "hartnell-car-door", "berryessa-sketch"],
    },
    {
      stageId: "paul-stine",
      victimNames: ["Paul Lee Stine"],
      evidenceIds: ["shirt", "sketch", "prints"],
      cipherIds: [],
      timelineDates: ["Oct 11, 1969"],
      photoIds: ["stine-crime-scene", "wanted-poster"],
    },
    {
      stageId: "the-340",
      victimNames: [],
      evidenceIds: ["dna"],
      cipherIds: ["z340", "z13", "z32"],
      timelineDates: [
        "Nov 8, 1969",
        "Nov 9, 1969",
        "Oct 27, 1970",
        "Jan 29, 1974",
        "Dec 5, 2020",
      ],
      photoIds: ["z340-cipher", "zodiac-letter-nov1969"],
    },
    {
      stageId: "the-prime-suspect",
      victimNames: [],
      evidenceIds: ["watch"],
      cipherIds: [],
      timelineDates: ["Today"],
      photoIds: [],
      revealsSuspects: true,
    },
  ],
};

/** The sanitized current chapter shipped to the client gate — never carries answers. */
export interface ClientChapter {
  stageId: string;
  /** 1-based chapter number. */
  number: number;
  total: number;
  label: string;
  title: string;
  narrative: string;
  puzzle: {
    type: InvestigationStage["puzzle"]["type"];
    question: string;
    options?: string[];
    hint?: string;
  };
}

export interface RevealState {
  /** True when the case has a chapter map (otherwise everything is shown). */
  hasChapters: boolean;
  /** Number of chapters currently revealed (solved + the active one). */
  revealedCount: number;
  victimNames: Set<string>;
  evidenceIds: Set<string>;
  cipherIds: Set<string>;
  timelineDates: Set<string>;
  photoIds: Set<string>;
  suspectsRevealed: boolean;
  /** The chapter the detective is currently working, or null when complete. */
  currentChapter: ClientChapter | null;
}

/**
 * Resolve which content is visible given the user's solved stages.
 *
 * A chapter is revealed if it is solved or it is the first unsolved chapter
 * (the one the detective is actively working). When the whole track is
 * complete, every chapter is revealed.
 */
export function resolveRevealState(
  file: CaseFile,
  solvedStageIds: string[],
  completed: boolean
): RevealState {
  const chapters = CASE_CHAPTERS[file.id] ?? [];
  const hasChapters = chapters.length > 0;

  if (!hasChapters) {
    return {
      hasChapters: false,
      revealedCount: 0,
      victimNames: new Set(),
      evidenceIds: new Set(),
      cipherIds: new Set(),
      timelineDates: new Set(),
      photoIds: new Set(),
      suspectsRevealed: true,
      currentChapter: null,
    };
  }

  const solved = new Set(solvedStageIds);
  const currentIndex = chapters.findIndex((c) => !solved.has(c.stageId));
  const revealedCount =
    completed || currentIndex === -1 ? chapters.length : currentIndex + 1;
  const revealed = chapters.slice(0, revealedCount);

  const collect = (pick: (c: ChapterContent) => string[]) =>
    new Set(revealed.flatMap(pick));

  let currentChapter: ClientChapter | null = null;
  if (!completed && currentIndex !== -1) {
    const stage = file.investigation?.find(
      (s) => s.id === chapters[currentIndex].stageId
    );
    if (stage) {
      currentChapter = {
        stageId: stage.id,
        number: currentIndex + 1,
        total: chapters.length,
        label: stage.label,
        title: stage.title,
        narrative: stage.narrative,
        puzzle: {
          type: stage.puzzle.type,
          question: stage.puzzle.question,
          options: stage.puzzle.options,
          hint: stage.puzzle.hint,
        },
      };
    }
  }

  return {
    hasChapters: true,
    revealedCount,
    victimNames: collect((c) => c.victimNames),
    evidenceIds: collect((c) => c.evidenceIds),
    cipherIds: collect((c) => c.cipherIds),
    timelineDates: collect((c) => c.timelineDates),
    photoIds: collect((c) => c.photoIds),
    suspectsRevealed: revealed.some((c) => c.revealsSuspects),
    currentChapter,
  };
}
