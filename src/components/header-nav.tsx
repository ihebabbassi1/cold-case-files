"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

type User = { id: string; name: string; email: string } | null;

export function HeaderNav({ user }: { user: User }) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="flex items-center gap-2">
      <Button asChild variant="ghost" size="sm" className="font-type text-xs uppercase tracking-wider">
        <Link href="/cases">Case Files</Link>
      </Button>

      {user ? (
        <>
          <span className="hidden font-type text-xs uppercase tracking-wider text-muted-foreground sm:inline">
            Det. {user.name}
          </span>
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="font-type text-xs uppercase tracking-wider"
          >
            Sign out
          </Button>
        </>
      ) : (
        <Button asChild size="sm" className="font-type text-xs uppercase tracking-wider">
          <Link href="/login">Sign in</Link>
        </Button>
      )}
    </nav>
  );
}
