import Link from "next/link";
import { Crosshair } from "@/components/crosshair";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center text-center">
      <Crosshair className="h-12 w-12 text-primary" />
      <h1 className="mt-4 font-headline text-5xl font-black text-ink">
        File Not Found
      </h1>
      <p className="mt-2 font-type text-sm uppercase tracking-widest text-muted-foreground">
        This record is sealed, missing, or never existed.
      </p>
      <Button asChild className="mt-6 font-type uppercase tracking-widest">
        <Link href="/cases">Return to the archive</Link>
      </Button>
    </div>
  );
}
