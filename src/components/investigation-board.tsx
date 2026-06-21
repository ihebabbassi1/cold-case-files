"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  Plus,
  Spline,
  RotateCcw,
  StickyNote,
  Network,
  Trash2,
  Scissors,
} from "lucide-react";
import {
  loadBoard,
  saveBoard,
  emptyBoard,
  type BoardState,
  type Verdict,
} from "@/lib/board-store";
import { Button } from "@/components/ui/button";

export interface BoardCard {
  id: string; // "suspect:allen" | "photo:z408-cipher" | "evidence:..." | "victim:..." | "cipher:..."
  kind: "photo" | "suspect" | "evidence" | "victim" | "cipher";
  title: string;
  subtitle?: string;
  image?: string;
}

const NOTE_COLORS = ["#f4d96b", "#a5d6a7", "#ef9a9a", "#90caf9"];

const KIND_LABEL: Record<BoardCard["kind"], string> = {
  photo: "Photo",
  suspect: "Suspect",
  evidence: "Exhibit",
  victim: "Victim",
  cipher: "Cipher",
};

let idCounter = 0;
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${idCounter++}`;

export function InvestigationBoard({
  caseId,
  cards,
}: {
  caseId: string;
  cards: BoardCard[];
}) {
  const cardMap = new Map(cards.map((c) => [c.id, c]));

  const [open, setOpen] = useState(false);
  const [board, setBoardState] = useState<BoardState>(emptyBoard);
  const boardRef = useRef<BoardState>(board);
  const planeRef = useRef<HTMLDivElement>(null);

  const [linkMode, setLinkMode] = useState(false);
  const [linkFrom, setLinkFrom] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  // Load saved board once on mount.
  useEffect(() => {
    const loaded = loadBoard(caseId);
    boardRef.current = loaded;
    setBoardState(loaded);
  }, [caseId]);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  // Lock body scroll while the board is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Esc cancels the in-progress thread, then connect mode, then closes.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (linkFrom) {
        setLinkFrom(null);
        setCursor(null);
      } else if (linkMode) {
        setLinkMode(false);
      } else {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, linkMode, linkFrom]);

  /** Commit + persist immediately (discrete actions). */
  function commit(next: BoardState) {
    boardRef.current = next;
    setBoardState(next);
    saveBoard(caseId, next);
  }
  /** Update without saving (used during a drag; saved on pointer-up). */
  function update(fn: (b: BoardState) => BoardState) {
    const next = fn(boardRef.current);
    boardRef.current = next;
    setBoardState(next);
  }

  const placedIds = new Set(board.placed.map((p) => p.cardId));
  const trayCards = cards.filter((c) => !placedIds.has(c.id));

  /** Position of any linkable node — a pinned card OR a sticky note. */
  function nodePos(id: string): { x: number; y: number } | null {
    const p = board.placed.find((p) => p.cardId === id);
    if (p) return { x: p.x, y: p.y };
    const n = board.notes.find((n) => n.id === id);
    if (n) return { x: n.x, y: n.y };
    return null;
  }

  function pinCard(cardId: string) {
    const n = board.placed.length;
    const x = clamp(50 + ((n % 5) - 2) * 9 + rand(3), 6, 94);
    const y = clamp(34 + Math.floor(n / 5) * 15 + rand(3), 12, 88);
    commit({ ...board, placed: [...board.placed, { cardId, x, y }] });
  }

  function unpinCard(cardId: string) {
    commit({
      ...board,
      placed: board.placed.filter((p) => p.cardId !== cardId),
      links: board.links.filter((l) => l.a !== cardId && l.b !== cardId),
    });
    if (linkFrom === cardId) setLinkFrom(null);
  }

  function handleCardPointerDown(
    e: React.PointerEvent,
    cardId: string
  ) {
    // In connect mode the overlay handles linking; never start a drag.
    if (linkMode) return;
    startDrag(e, (b, x, y) => ({
      ...b,
      placed: b.placed.map((p) => (p.cardId === cardId ? { ...p, x, y } : p)),
    }));
  }

  /** Link any two nodes (cards or notes). */
  function handleLink(nodeId: string) {
    if (linkFrom === null) {
      setLinkFrom(nodeId);
      return;
    }
    if (linkFrom === nodeId) {
      setLinkFrom(null);
      setCursor(null);
      return;
    }
    const exists = board.links.some(
      (l) =>
        (l.a === linkFrom && l.b === nodeId) ||
        (l.a === nodeId && l.b === linkFrom)
    );
    if (!exists) {
      commit({
        ...board,
        links: [...board.links, { id: uid("link"), a: linkFrom, b: nodeId }],
      });
    }
    setLinkFrom(null);
    setCursor(null);
  }

  function removeLink(id: string) {
    commit({ ...board, links: board.links.filter((l) => l.id !== id) });
  }

  function setVerdict(cardId: string, v: Verdict) {
    const current = board.verdicts[cardId];
    const verdicts = { ...board.verdicts };
    if (current === v) delete verdicts[cardId];
    else verdicts[cardId] = v;
    commit({ ...board, verdicts });
  }

  function addNote() {
    commit({
      ...board,
      notes: [
        ...board.notes,
        {
          id: uid("note"),
          x: clamp(50 + rand(8), 10, 90),
          y: clamp(45 + rand(8), 15, 85),
          text: "",
          color: board.notes.length % NOTE_COLORS.length,
        },
      ],
    });
  }

  function editNote(id: string, text: string) {
    commit({
      ...board,
      notes: board.notes.map((n) => (n.id === id ? { ...n, text } : n)),
    });
  }

  function deleteNote(id: string) {
    commit({ ...board, notes: board.notes.filter((n) => n.id !== id) });
  }

  function resetBoard() {
    if (!confirm("Clear the whole board? This can't be undone.")) return;
    commit(emptyBoard());
    setLinkFrom(null);
    setLinkMode(false);
  }

  /** Generic pointer drag → writes board coords (%) via the given updater. */
  function startDrag(
    e: React.PointerEvent,
    apply: (b: BoardState, x: number, y: number) => BoardState
  ) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    const move = (ev: PointerEvent) => {
      const plane = planeRef.current;
      if (!plane) return;
      const rect = plane.getBoundingClientRect();
      const x = clamp(((ev.clientX - rect.left) / rect.width) * 100, 2, 98);
      const y = clamp(((ev.clientY - rect.top) / rect.height) * 100, 2, 98);
      update((b) => apply(b, x, y));
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      saveBoard(caseId, boardRef.current);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  function onStageMove(e: React.MouseEvent) {
    if (dragging || linkMode) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: -py * 5, ry: px * 6 });
  }

  /** Track the cursor in board coords so the thread rubber-bands to it. */
  function onPlaneMove(e: React.MouseEvent) {
    if (!linkMode || linkFrom === null) return;
    const plane = planeRef.current;
    if (!plane) return;
    const r = plane.getBoundingClientRect();
    setCursor({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  }

  const count =
    board.placed.length + board.notes.length + board.links.length;

  return (
    <>
      {/* Floating launcher (bottom-left, opposite the chapter gate) */}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col items-start gap-2">
        {count > 0 && (
          <span className="rounded-full border border-primary/40 bg-background/90 px-3 py-1 font-type text-[0.6rem] uppercase tracking-widest text-primary shadow-sm backdrop-blur">
            {board.placed.length} leads · {board.links.length} threads
          </span>
        )}
        <Button
          onClick={() => setOpen(true)}
          size="lg"
          variant="outline"
          className="border-primary/50 bg-background/90 font-type uppercase tracking-widest shadow-lg shadow-black/40 backdrop-blur"
        >
          <Network className="mr-2 h-4 w-4" />
          Investigation Board
        </Button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[80] flex flex-col bg-[#0c0a08]">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 border-b border-black/50 bg-[#1c150f] px-4 py-3">
            <div className="flex items-center gap-2 font-type text-xs uppercase tracking-[0.3em] text-[hsl(40,33%,80%)]">
              <Network className="h-4 w-4 text-primary" />
              Investigation Board
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={linkMode ? "default" : "outline"}
                onClick={() => {
                  setLinkMode((m) => !m);
                  setLinkFrom(null);
                }}
                className="font-type text-[0.65rem] uppercase tracking-widest"
                title="Connect any two leads or notes with red string"
              >
                <Spline className="mr-1.5 h-3.5 w-3.5" />
                {linkMode ? "Connecting…" : "Connect"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={addNote}
                className="font-type text-[0.65rem] uppercase tracking-widest"
              >
                <StickyNote className="mr-1.5 h-3.5 w-3.5" />
                Note
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={resetBoard}
                className="font-type text-[0.65rem] uppercase tracking-widest"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={() => setOpen(false)}
                className="font-type text-[0.65rem] uppercase tracking-widest"
              >
                <X className="mr-1.5 h-3.5 w-3.5" />
                Done
              </Button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1">
            {/* The board */}
            <div
              className={`relative flex-1 overflow-hidden ${linkMode ? "cursor-crosshair" : ""}`}
              style={{ perspective: "1600px" }}
              onMouseMove={onStageMove}
              onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
              onClick={() => {
                if (linkFrom) {
                  setLinkFrom(null);
                  setCursor(null);
                }
              }}
            >
              <div
                ref={planeRef}
                className="board-cork absolute inset-4 rounded-md border-[10px] border-[#5b3a1e] shadow-[inset_0_0_120px_rgba(0,0,0,0.55)]"
                onMouseMove={onPlaneMove}
                style={{
                  transform:
                    dragging || linkMode
                      ? "none"
                      : `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                  transformStyle: "preserve-3d",
                  transition: dragging ? "none" : "transform 0.2s ease-out",
                }}
              >
                {/* red string */}
                <svg
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  style={{ overflow: "visible" }}
                >
                  {/* rubber-band thread following the cursor while connecting */}
                  {linkMode && linkFrom && cursor && (() => {
                    const from = nodePos(linkFrom);
                    if (!from) return null;
                    return (
                      <line
                        x1={`${from.x}%`}
                        y1={`${from.y}%`}
                        x2={`${cursor.x}%`}
                        y2={`${cursor.y}%`}
                        stroke="hsl(0 70% 50% / 0.7)"
                        strokeWidth={2}
                        strokeDasharray="6 6"
                        strokeLinecap="round"
                      />
                    );
                  })()}
                  {board.links.map((l) => {
                    const a = nodePos(l.a);
                    const b = nodePos(l.b);
                    if (!a || !b) return null;
                    return (
                      <g key={l.id} className="pointer-events-auto">
                        <line
                          x1={`${a.x}%`}
                          y1={`${a.y}%`}
                          x2={`${b.x}%`}
                          y2={`${b.y}%`}
                          stroke="transparent"
                          strokeWidth={14}
                          className="cursor-pointer"
                          onClick={() => removeLink(l.id)}
                        />
                        <line
                          x1={`${a.x}%`}
                          y1={`${a.y}%`}
                          x2={`${b.x}%`}
                          y2={`${b.y}%`}
                          stroke="hsl(0 70% 42%)"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          style={{
                            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.7))",
                          }}
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* placed cards */}
                {board.placed.map((p) => {
                  const card = cardMap.get(p.cardId);
                  if (!card) return null;
                  const isLinkSource = linkFrom === p.cardId;
                  const verdict = board.verdicts[p.cardId];
                  return (
                    <div
                      key={p.cardId}
                      onPointerDown={(e) => handleCardPointerDown(e, p.cardId)}
                      className={`group absolute w-[150px] -translate-x-1/2 -translate-y-1/2 select-none rounded-sm bg-[#f3ead6] p-2 pb-3 shadow-[0_14px_28px_-10px_rgba(0,0,0,0.85)] ${
                        linkMode ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"
                      } ${isLinkSource ? "ring-2 ring-primary" : ""}`}
                      style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        transform: `translate(-50%,-50%) rotate(${rotFor(p.cardId)}deg)`,
                      }}
                    >
                      {/* pin */}
                      <span className="absolute -top-2 left-1/2 z-10 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ff6b6b,#9b1c1c)] shadow" />

                      {/* connect-mode click target — whole card is one easy target */}
                      {linkMode && (
                        <button
                          type="button"
                          aria-label="Connect this lead"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLink(p.cardId);
                          }}
                          className="absolute inset-0 z-30 cursor-crosshair rounded-sm ring-inset transition-shadow hover:ring-2 hover:ring-primary/70"
                        />
                      )}

                      {/* remove */}
                      <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => unpinCard(p.cardId)}
                        className="absolute -right-2 -top-2 z-10 hidden h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white group-hover:flex"
                        title="Remove from board"
                      >
                        <X className="h-3 w-3" />
                      </button>

                      <CardThumb card={card} className="h-24 w-full" />

                      <p className="mt-1.5 truncate font-type text-[0.55rem] uppercase tracking-wider text-[#6b5836]">
                        {KIND_LABEL[card.kind]}
                      </p>
                      <p className="font-headline text-xs font-bold leading-tight text-[#2e2718] [overflow-wrap:anywhere]">
                        {card.title}
                      </p>
                      {card.subtitle && (
                        <p className="mt-0.5 font-serif text-[0.65rem] italic leading-tight text-[#6b5836]">
                          {card.subtitle}
                        </p>
                      )}

                      {/* suspect verdict stamp + controls */}
                      {card.kind === "suspect" && (
                        <>
                          {verdict && <VerdictStamp verdict={verdict} />}
                          <div
                            className="mt-2 flex justify-center gap-1"
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <VerdictBtn
                              active={verdict === "prime"}
                              onClick={() => setVerdict(p.cardId, "prime")}
                              label="Prime"
                              tone="prime"
                            />
                            <VerdictBtn
                              active={verdict === "cleared"}
                              onClick={() => setVerdict(p.cardId, "cleared")}
                              label="Clear"
                              tone="cleared"
                            />
                            <VerdictBtn
                              active={verdict === "unsure"}
                              onClick={() => setVerdict(p.cardId, "unsure")}
                              label="?"
                              tone="unsure"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}

                {/* sticky notes */}
                {board.notes.map((n) => {
                  const isLinkSource = linkFrom === n.id;
                  return (
                  <div
                    key={n.id}
                    className={`group absolute w-[140px] -translate-x-1/2 -translate-y-1/2 rounded-sm p-0 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.8)] ${
                      isLinkSource ? "ring-2 ring-primary" : ""
                    }`}
                    style={{
                      left: `${n.x}%`,
                      top: `${n.y}%`,
                      background: NOTE_COLORS[n.color] ?? NOTE_COLORS[0],
                      transform: `translate(-50%,-50%) rotate(${rotFor(n.id)}deg)`,
                    }}
                  >
                    <div
                      onPointerDown={(e) => {
                        if (linkMode) return;
                        startDrag(e, (b, x, y) => ({
                          ...b,
                          notes: b.notes.map((m) =>
                            m.id === n.id ? { ...m, x, y } : m
                          ),
                        }));
                      }}
                      className="flex h-5 cursor-grab items-center justify-between px-1.5 active:cursor-grabbing"
                    >
                      <span className="text-[0.5rem] font-bold uppercase tracking-widest text-black/40">
                        Note
                      </span>
                      <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => deleteNote(n.id)}
                        className="text-black/40 hover:text-black"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <textarea
                      value={n.text}
                      onChange={(e) => editNote(n.id, e.target.value)}
                      placeholder="Your hunch…"
                      className="h-20 w-full resize-none border-0 bg-transparent px-2 pb-2 font-serif text-[0.78rem] leading-snug text-black/80 placeholder:text-black/30 focus:outline-none"
                    />

                    {/* connect-mode click target for notes */}
                    {linkMode && (
                      <button
                        type="button"
                        aria-label="Connect this note"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLink(n.id);
                        }}
                        className="absolute inset-0 z-30 cursor-crosshair rounded-sm ring-inset transition-shadow hover:ring-2 hover:ring-primary/70"
                      />
                    )}
                  </div>
                  );
                })}

                {/* thread cut buttons (unconnect) — hidden during connect mode */}
                {!linkMode &&
                  board.links.map((l) => {
                    const a = nodePos(l.a);
                    const b = nodePos(l.b);
                    if (!a || !b) return null;
                    const mx = (a.x + b.x) / 2;
                    const my = (a.y + b.y) / 2;
                    return (
                      <button
                        key={`cut-${l.id}`}
                        onClick={() => removeLink(l.id)}
                        title="Cut this thread"
                        aria-label="Cut this thread"
                        className="absolute z-20 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-red-700/70 bg-[#1c150f] text-red-500 opacity-45 shadow transition hover:scale-110 hover:opacity-100"
                        style={{ left: `${mx}%`, top: `${my}%` }}
                      >
                        <Scissors className="h-3 w-3" />
                      </button>
                    );
                  })}

                {/* empty state */}
                {board.placed.length === 0 && board.notes.length === 0 && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <p className="max-w-xs text-center font-type text-xs uppercase tracking-[0.3em] text-[#3a2c1a]">
                      Pin leads from the evidence tray → then connect them with string
                    </p>
                  </div>
                )}
              </div>

              {linkMode && (
                <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
                  <span className="rounded-full bg-primary/90 px-4 py-1.5 font-type text-[0.65rem] uppercase tracking-widest text-primary-foreground shadow-lg">
                    {linkFrom
                      ? "Now click any other lead or note to tie the thread"
                      : "Click any lead or note to start a thread · Esc to cancel"}
                  </span>
                </div>
              )}
            </div>

            {/* Evidence tray */}
            <aside className="flex w-56 shrink-0 flex-col border-l border-black/50 bg-[#15100b]">
              <p className="border-b border-black/40 px-4 py-3 font-type text-[0.65rem] uppercase tracking-[0.3em] text-[hsl(40,28%,70%)]">
                Evidence tray
              </p>
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
                {trayCards.length === 0 ? (
                  <p className="px-1 py-6 text-center font-serif text-xs italic text-[hsl(40,20%,50%)]">
                    Everything you&apos;ve uncovered is on the board.
                  </p>
                ) : (
                  trayCards.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => pinCard(c.id)}
                      className="flex w-full items-center gap-2 rounded border border-white/10 bg-black/30 p-2 text-left transition-colors hover:border-primary/60 hover:bg-black/50"
                    >
                      <CardThumb card={c} className="h-10 w-10 shrink-0 rounded" />
                      <span className="min-w-0">
                        <span className="block truncate font-type text-[0.6rem] uppercase tracking-wider text-primary/80">
                          {KIND_LABEL[c.kind]}
                        </span>
                        <span className="block truncate font-serif text-xs text-[hsl(40,30%,82%)]">
                          {c.title}
                        </span>
                      </span>
                      <Plus className="ml-auto h-3.5 w-3.5 shrink-0 text-white/40" />
                    </button>
                  ))
                )}
              </div>
              <p className="border-t border-black/40 px-4 py-2 font-serif text-[0.6rem] italic leading-snug text-[hsl(40,20%,50%)]">
                Saved automatically. Your board is waiting at the accusation.
              </p>
            </aside>
          </div>
        </div>
      )}
    </>
  );
}

/** A card's image, or a themed evidence placeholder when there's no photo. */
function CardThumb({
  card,
  className = "",
}: {
  card: BoardCard;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (card.image && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={card.image}
        alt={card.title}
        draggable={false}
        onError={() => setFailed(true)}
        className={`${className} object-cover grayscale-[0.25] sepia-[0.1]`}
      />
    );
  }

  if (card.kind === "suspect" || card.kind === "victim") {
    const tint = card.kind === "suspect" ? "#c9b48f" : "#aeb9c1";
    return (
      <div
        className={`${className} flex items-center justify-center overflow-hidden`}
        style={{ background: tint }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-[62%] w-[62%] text-black/35">
          <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-9 2.6-9 6v2h18v-2c0-3.4-4-6-9-6Z" />
        </svg>
      </div>
    );
  }

  if (card.kind === "cipher") {
    return (
      <div className={`${className} flex items-center justify-center overflow-hidden bg-[#15130f] p-1.5`}>
        <span className="font-cipher text-center text-[0.6rem] leading-tight text-[hsl(40,40%,68%)]">
          ⊕ ✦ ◣ ☋ ⊿ ✚ ⌑ ✦ ⊕ ◣ ☌ ⊿ ✦ ⊕
        </span>
      </div>
    );
  }

  // evidence — a document / clipping look
  return (
    <div className={`${className} flex flex-col justify-center gap-[3px] overflow-hidden bg-[#ece3cd] px-2`}>
      <span className="h-[3px] w-3/4 rounded-full bg-black/25" />
      <span className="h-[3px] w-full rounded-full bg-black/15" />
      <span className="h-[3px] w-full rounded-full bg-black/15" />
      <span className="h-[3px] w-2/3 rounded-full bg-black/15" />
    </div>
  );
}

function VerdictStamp({ verdict }: { verdict: Verdict }) {
  const map = {
    prime: { text: "PRIME", cls: "border-pink-500 text-pink-500" },
    cleared: { text: "CLEARED", cls: "border-red-600 text-red-600" },
    unsure: { text: "?", cls: "border-amber-500 text-amber-500" },
  } as const;
  const m = map[verdict];
  return (
    <span
      className={`pointer-events-none absolute right-1 top-8 -rotate-12 rounded border-2 px-1.5 py-0.5 font-type text-[0.6rem] font-black uppercase tracking-widest ${m.cls}`}
    >
      {m.text}
    </span>
  );
}

function VerdictBtn({
  active,
  onClick,
  label,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  tone: "prime" | "cleared" | "unsure";
}) {
  const tones = {
    prime: "border-pink-500/60 text-pink-700 data-[on=true]:bg-pink-500 data-[on=true]:text-white",
    cleared: "border-red-600/60 text-red-700 data-[on=true]:bg-red-600 data-[on=true]:text-white",
    unsure: "border-amber-500/60 text-amber-700 data-[on=true]:bg-amber-500 data-[on=true]:text-white",
  } as const;
  return (
    <button
      data-on={active}
      onClick={onClick}
      className={`rounded border px-1.5 py-0.5 font-type text-[0.5rem] font-bold uppercase tracking-wider transition-colors ${tones[tone]}`}
    >
      {label}
    </button>
  );
}

// Helpers
function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
function rand(m: number) {
  return (Math.random() - 0.5) * 2 * m;
}
// Stable pseudo-random tilt per id so cards don't re-rotate on every render.
function rotFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return ((h % 9) - 4) * 0.8;
}
