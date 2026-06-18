import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getCases } from "@/data/cases";
import { Crosshair } from "@/components/crosshair";
import { Stamp } from "@/components/stamp";
import { CaseOpenerButton } from "@/components/case-opener-button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Case Files — Cold Case Files" };

export default async function CasesPage() {
  const session = await auth.api.getSession({
    headers: (await headers()) as unknown as Headers,
  });
  if (!session?.user) redirect("/login");

  const cases = getCases();

  return (
    <div className="container py-12">
      <div className="mb-8 text-center">
        <Crosshair className="mx-auto h-10 w-10 text-primary" />
        <p className="mt-3 font-type text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Welcome to the archive, Detective {session.user.name}
        </p>
        <h1 className="mt-1 font-headline text-4xl font-black text-ink sm:text-5xl">
          Open a Cold Case
        </h1>
        <p className="mx-auto mt-3 max-w-xl font-serif text-ink/80">
          Every file below is a real, documented investigation. Pick one. Read
          everything. Then commit to a verdict.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {cases.map((c) => (
          <div
            key={c.id}
            className={
              "sheet relative flex flex-col rounded-md border border-ink/40 p-6 " +
              (c.locked ? "opacity-70" : "")
            }
          >
            <div className="mb-3 flex items-center justify-between">
              <Crosshair className="h-6 w-6 text-primary" />
              <Stamp straight className="text-[0.6rem]">
                {c.locked ? "Sealed" : "Open"}
              </Stamp>
            </div>
            <h2 className="font-headline text-2xl font-bold text-ink">
              {c.codename}
            </h2>
            <p className="font-type text-xs uppercase tracking-widest text-muted-foreground">
              {c.years}
            </p>
            <p className="mt-3 flex-1 font-serif text-sm text-ink/80">
              {c.tagline}
            </p>
            <div className="mt-5">
              {c.locked ? (
                <span className="font-type text-xs uppercase tracking-widest text-muted-foreground">
                  Awaiting declassification
                </span>
              ) : (
                <CaseOpenerButton
                  caseId={c.id}
                  href={`/cases/${c.id}`}
                  codename={c.codename}
                  tagline={c.tagline}
                  years={c.years}
                  chapterName={c.investigation?.[0]?.title}
                  chapterLabel={c.investigation?.[0]?.label}
                  detectiveName={session.user.name}
                  className="w-full font-type uppercase tracking-widest"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
