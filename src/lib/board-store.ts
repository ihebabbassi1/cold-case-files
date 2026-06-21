// Investigation Board state — persisted per case in localStorage.
//
// This is the single source of truth for board persistence. To move it to the
// database later, only loadBoard/saveBoard need to change (swap localStorage for
// a server action) — the components and the accusation payoff stay untouched.

export type Verdict = "prime" | "cleared" | "unsure";

export interface Placed {
  cardId: string;
  x: number; // 0–100 (% of board width)
  y: number; // 0–100 (% of board height)
}

export interface BoardLink {
  id: string;
  a: string; // cardId
  b: string; // cardId
}

export interface BoardNote {
  id: string;
  x: number;
  y: number;
  text: string;
  color: number; // index into the note palette
}

export interface BoardState {
  placed: Placed[];
  links: BoardLink[];
  notes: BoardNote[];
  verdicts: Record<string, Verdict>; // keyed by cardId (suspect cards)
}

export function emptyBoard(): BoardState {
  return { placed: [], links: [], notes: [], verdicts: {} };
}

export function boardKey(caseId: string) {
  return `ccf:board:${caseId}`;
}

export function loadBoard(caseId: string): BoardState {
  if (typeof window === "undefined") return emptyBoard();
  try {
    const raw = window.localStorage.getItem(boardKey(caseId));
    if (!raw) return emptyBoard();
    const p = JSON.parse(raw) as Partial<BoardState>;
    return {
      placed: p.placed ?? [],
      links: p.links ?? [],
      notes: p.notes ?? [],
      verdicts: p.verdicts ?? {},
    };
  } catch {
    return emptyBoard();
  }
}

export function saveBoard(caseId: string, state: BoardState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(boardKey(caseId), JSON.stringify(state));
  } catch {
    // storage full / unavailable — ignore
  }
}

export const SUSPECT_PREFIX = "suspect:";

export interface BoardTheory {
  /** Raw suspect id (prefix stripped) marked PRIME on the board, if any. */
  primeSuspectId: string | null;
  clearedSuspectIds: string[];
  /** Reasoning assembled from the detective's own sticky notes + connections. */
  reasoning: string;
  hasContent: boolean;
}

/** Read the detective's board into a theory the accusation flow can pre-fill. */
export function readTheory(caseId: string): BoardTheory {
  const b = loadBoard(caseId);

  let prime: string | null = null;
  const cleared: string[] = [];
  for (const [cardId, v] of Object.entries(b.verdicts)) {
    if (!cardId.startsWith(SUSPECT_PREFIX)) continue;
    const id = cardId.slice(SUSPECT_PREFIX.length);
    if (v === "prime" && !prime) prime = id;
    if (v === "cleared") cleared.push(id);
  }

  const notes = b.notes.map((n) => n.text.trim()).filter(Boolean);
  const parts: string[] = [];
  if (notes.length) parts.push(notes.join(" "));
  if (b.links.length)
    parts.push(`I connected ${b.links.length} lead${b.links.length > 1 ? "s" : ""} on my board.`);

  return {
    primeSuspectId: prime,
    clearedSuspectIds: cleared,
    reasoning: parts.join("\n\n"),
    hasContent:
      b.placed.length > 0 ||
      b.notes.length > 0 ||
      b.links.length > 0 ||
      Object.keys(b.verdicts).length > 0,
  };
}
