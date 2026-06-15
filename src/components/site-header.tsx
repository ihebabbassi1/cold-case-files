import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Crosshair } from "@/components/crosshair";
import { HeaderNav } from "@/components/header-nav";

export async function SiteHeader() {
  const session = await auth.api.getSession({
    headers: (await headers()) as unknown as Headers,
  });

  return (
    <header className="sticky top-0 z-40 border-b border-ink/30 bg-paper/85 backdrop-blur supports-[backdrop-filter]:bg-paper/70">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-ink">
          <Crosshair className="h-5 w-5 text-primary" />
          <span className="font-type text-sm uppercase tracking-[0.2em]">
            Cold Case Files
          </span>
        </Link>

        <HeaderNav user={session?.user ?? null} />
      </div>
    </header>
  );
}
