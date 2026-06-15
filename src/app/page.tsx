import Link from "next/link";
import { Crosshair } from "@/components/crosshair";
import { Stamp } from "@/components/stamp";
import { Button } from "@/components/ui/button";
import { getCases } from "@/data/cases";

export default function HomePage() {
  const cases = getCases();

  return (
    <div className="vignette">
      {/* ---------- Masthead ---------- */}
      <section className="container pt-10">
        <div className="border-y-4 border-double border-ink py-4 text-center">
          <p className="font-type text-[0.65rem] uppercase tracking-[0.4em] text-muted-foreground">
            Special Investigations Edition · Reopened Cold Cases
          </p>
          <h1 className="my-1 font-masthead text-5xl leading-none text-ink sm:text-7xl">
            The Golden State Ledger
          </h1>
          <div className="flex items-center justify-center gap-3 font-type text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">
            <span>Est. 1869</span>
            <span>·</span>
            <span>Vol. CI — No. 13</span>
            <span>·</span>
            <span>Price 10¢</span>
          </div>
        </div>
      </section>

      {/* ---------- Lead story ---------- */}
      <section className="container py-10">
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <article className="sheet relative overflow-hidden rounded-md border border-ink/40 p-7 sm:p-10">
            <Crosshair className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 text-ink/5" />
            <div className="mb-3 flex items-center gap-3">
              <Stamp>Unsolved</Stamp>
              <span className="font-type text-xs uppercase tracking-widest text-muted-foreground">
                Northern California · 1968–1969
              </span>
            </div>

            <h2 className="font-headline text-4xl font-black leading-[1.05] text-ink sm:text-6xl">
              The Zodiac: the killer who signed his crimes
            </h2>
            <p className="mt-4 font-headline text-xl italic text-ink/80">
              He shot couples in the dark, mailed his ciphers to the front page,
              and dared a generation of detectives to catch him. They never did.
            </p>

            <div className="mt-6 columns-1 gap-8 font-serif text-[1.05rem] leading-relaxed text-ink/90 sm:columns-2">
              <p className="mb-4">
                <span className="float-left mr-2 font-headline text-6xl font-black leading-[0.8] text-primary">
                  F
                </span>
                ive people are confirmed dead. Two more survived to describe a
                man with no face — a black hood, a gunsight stitched to his
                chest. He called the newspapers. He called the police. And then
                he reached for a pen.
              </p>
              <p className="mb-4">
                In letter after letter he taunted the city, demanding his words
                be printed or more would die. He enclosed codes he swore would
                spell his name. One of them went unbroken for fifty-one years.
              </p>
              <p className="mb-0">
                Decades later the file is still open. The evidence still sits in
                the locker. The suspects still have names. Everything you need to
                solve it is here — if you are detective enough to read it.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="font-type uppercase tracking-widest">
                <Link href="/cases">Enter the case file</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-type uppercase tracking-widest">
                <Link href="/register">Get your badge</Link>
              </Button>
            </div>
          </article>

          {/* Sidebar: the killer's own words */}
          <aside className="noir relative flex flex-col justify-between rounded-md border border-ink/60 p-7">
            <div>
              <p className="font-type text-xs uppercase tracking-[0.3em] text-primary/80">
                From the letters
              </p>
              <p className="mt-4 scrawl text-2xl text-[hsl(0,55%,55%)]">
                &ldquo;This is the Zodiac speaking.&rdquo;
              </p>
              <p className="mt-6 typed text-sm text-[hsl(40,30%,72%)]">
                I like killing people because it is so much fun. It is more fun
                than killing wild game in the forrest because man is the most
                dangeroue anamal of all…
              </p>
              <p className="mt-3 font-type text-[0.7rem] uppercase tracking-widest text-[hsl(40,20%,50%)]">
                — decrypted 408 cipher, August 1969
              </p>
            </div>
            <div className="mt-8 flex items-center gap-3 border-t border-[hsl(40,20%,25%)] pt-4">
              <Crosshair className="h-7 w-7 text-primary" />
              <span className="font-type text-xs uppercase tracking-widest text-[hsl(40,25%,60%)]">
                Evidence is unredacted inside
              </span>
            </div>
          </aside>
        </div>
      </section>

      {/* ---------- Cold case archive ---------- */}
      <section className="container pb-16">
        <div className="mb-5 flex items-center gap-4">
          <h3 className="font-type text-sm uppercase tracking-[0.3em] text-ink">
            The Cold Case Archive
          </h3>
          <hr className="rule-double flex-1" />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {cases.map((c) => (
            <div
              key={c.id}
              className={
                "sheet relative rounded-md border border-ink/40 p-6 " +
                (c.locked ? "opacity-70" : "")
              }
            >
              <div className="mb-3 flex items-center justify-between">
                <Crosshair className="h-6 w-6 text-primary" />
                {c.locked ? (
                  <Stamp straight className="text-[0.6rem]">
                    Sealed
                  </Stamp>
                ) : (
                  <Stamp straight className="text-[0.6rem]">
                    Open
                  </Stamp>
                )}
              </div>
              <h4 className="font-headline text-2xl font-bold text-ink">
                {c.codename}
              </h4>
              <p className="font-type text-xs uppercase tracking-widest text-muted-foreground">
                {c.years}
              </p>
              <p className="mt-3 font-serif text-sm text-ink/80">{c.tagline}</p>

              <div className="mt-5">
                {c.locked ? (
                  <span className="font-type text-xs uppercase tracking-widest text-muted-foreground">
                    Awaiting declassification
                  </span>
                ) : (
                  <Button asChild variant="link" className="px-0 font-type text-xs uppercase tracking-widest">
                    <Link href={`/cases/${c.id}`}>Open the file →</Link>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
