import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getCase } from "@/data/cases";
import { AccusationFlow } from "@/components/accusation-flow";

export const dynamic = "force-dynamic";
export const metadata = { title: "Name the Suspect — Cold Case Files" };

export default async function AccusePage({
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
  if (!file || file.locked) notFound();

  return (
    <div className="vignette">
      <div className="container py-12">
        <AccusationFlow
          caseId={file.id}
          codename={file.codename}
          suspects={file.suspects}
          verdict={file.verdict}
          detective={session.user.name}
        />
      </div>
    </div>
  );
}
