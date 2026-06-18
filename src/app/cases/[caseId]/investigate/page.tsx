import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getCase } from "@/data/cases";
import { getInvestigationState } from "@/lib/actions";
import {
  InvestigationFlow,
  type ClientStage,
} from "@/components/investigation-flow";

export const dynamic = "force-dynamic";
export const metadata = { title: "Investigation — Cold Case Files" };

export default async function InvestigatePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const session = await auth.api.getSession({
    headers: (await headers()) as unknown as Headers,
  });
  if (!session?.user) redirect("/login");

  const file = getCase(caseId);
  if (!file || file.locked || !file.investigation?.length) notFound();

  const { solvedStageIds, completed } = await getInvestigationState(file.id);
  const solved = new Set(solvedStageIds);

  // The index of the first unsolved stage — the one the detective is working on now.
  const currentIndex = file.investigation.findIndex((s) => !solved.has(s.id));

  // Build a SANITIZED payload. Never ship answers, acceptable lists, or the
  // content of stages the detective hasn't reached yet.
  const stages: ClientStage[] = file.investigation.map((s, i) => {
    const isSolved = solved.has(s.id);
    const isCurrent = i === currentIndex;

    if (!isSolved && !isCurrent) {
      // Locked: reveal nothing but its existence.
      return { id: s.id, label: s.label, locked: true };
    }

    return {
      id: s.id,
      label: s.label,
      title: s.title,
      narrative: s.narrative,
      locked: false,
      solved: isSolved,
      puzzle: {
        type: s.puzzle.type,
        question: s.puzzle.question,
        options: s.puzzle.options,
        hint: s.puzzle.hint,
      },
      // Solved stages may re-show their explanation; current stage must not.
      explanation: isSolved ? s.puzzle.explanation : undefined,
    };
  });

  return (
    <div className="vignette">
      <div className="container py-12">
        <InvestigationFlow
          caseId={file.id}
          codename={file.codename}
          stages={stages}
          completed={completed}
          detective={session.user.name}
        />
      </div>
    </div>
  );
}
