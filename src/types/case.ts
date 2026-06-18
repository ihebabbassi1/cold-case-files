export type CaseStatus = "OPEN — UNSOLVED" | "CLOSED" | "SEALED";

export interface Victim {
  name: string;
  age: string;
  date: string;
  location: string;
  status: "MURDERED" | "SURVIVED";
  details: string;
  sourceUrl?: string;
}

export interface TimelineEntry {
  date: string;
  event: string;
  sourceUrl?: string;
}

export interface EvidenceItem {
  id: string;
  title: string;
  tag: string;
  date?: string;
  description: string;
  quote?: string;
  sourceUrl?: string;
  sourceLabel?: string;
}

export interface Cipher {
  id: string;
  name: string;
  date: string;
  status: "SOLVED" | "UNSOLVED";
  solvedBy?: string;
  description: string;
  solution?: string;
  sourceUrl?: string;
}

export interface Suspect {
  id: string;
  name: string;
  alias: string;
  lived: string;
  fate: string;
  summary: string;
  pointsFor: string[];
  pointsAgainst: string[];
  /** The real, documented outcome — revealed after the user accuses. */
  whatHappened: string;
  sourceUrl?: string;
}

export type PuzzleType = "multiple-choice" | "cipher" | "text";

export interface Puzzle {
  type: PuzzleType;
  /** The prompt shown to the detective. */
  question: string;
  /** Multiple-choice only. */
  options?: string[];
  /** The correct answer — SERVER-ONLY. Never sent to the client. */
  answer: string;
  /** Extra accepted strings (cipher/text), matched after normalization. SERVER-ONLY. */
  acceptable?: string[];
  /** Optional nudge, revealed on request or after a wrong attempt. */
  hint?: string;
  /** The real history of this event, shown once the stage is solved. */
  explanation: string;
}

export interface InvestigationStage {
  /** Stable slug, e.g. "lake-herman". */
  id: string;
  /** e.g. "December 20, 1968". */
  label: string;
  /** e.g. "The first blood on Lake Herman Road". */
  title: string;
  /** Immersive scene-setting text (1–3 short paragraphs). */
  narrative: string;
  puzzle: Puzzle;
}

export interface CasePhoto {
  id: string;
  url: string;
  caption: string;
  credit: string;
  year: string;
}

export interface CaseSource {
  label: string;
  url: string;
  description: string;
}

export interface CaseFile {
  id: string;
  codename: string;
  title: string;
  status: CaseStatus;
  locked?: boolean;
  years: string;
  jurisdiction: string;
  tagline: string;
  bodyCount: string;
  briefing: string[];
  mission: string;
  victims: Victim[];
  timeline: TimelineEntry[];
  evidence: EvidenceItem[];
  ciphers: Cipher[];
  suspects: Suspect[];
  /** Shown at the very end of the accusation flow. The truth of the case. */
  verdict: string[];
  /** Optional gated, sequential investigation track. The accusation unlocks only once it's complete. */
  investigation?: InvestigationStage[];
  photos?: CasePhoto[];
  sources?: CaseSource[];
}
