# Cold Case Files — The Zodiac

A scary, immersive **true-crime investigation experience**. The player is handed a
real cold case as a vintage 1960s newspaper / police dossier, reads the actual
evidence, studies the documented suspects, and then does what no detective in 1969
could: **names the Zodiac**. The moment they file a verdict, the real outcome of
every suspect is unsealed — ending with the truth that the case remains officially
**UNSOLVED**.

Built to be **published** and to grow: more cases can be added by dropping new data
objects into one file.

---

## Tech stack

| Layer | Choice |
|------|--------|
| Framework | **Next.js 14 (App Router)** + TypeScript |
| UI | **React 18**, **Tailwind CSS**, **shadcn/ui** components |
| Auth | **Better Auth** (email + password, self-hosted) |
| ORM | **Prisma** |
| Database | **PostgreSQL** (Neon or Supabase) |

> Auth & case progress are stored in your own Postgres database — no third-party
> auth service required. Each detective's accusation is saved to their account.

---

## What's inside

- **Vintage newspaper landing page** — masthead, columns, drop caps, the killer's
  own decrypted words, a sealed "Cold Case Archive".
- **Sign-in / badge registration** (Better Auth).
- **The case file** with tabbed sections: Briefing, Victims, Timeline, Evidence,
  Ciphers, and Suspects — all based on documented history.
- **The accusation flow** — pick a suspect, add detective's notes, file your
  verdict (saved to the DB), then a dramatic reveal of what really happened to
  each suspect and the final "CASE STATUS: UNSOLVED."
- **Atmosphere**: aged-paper texture, ink/blood palette, rubber stamps, vignette,
  the Zodiac crosshair, handwriting and typewriter fonts.

---

## Run it locally

### 1. Prerequisites
- Node.js 18.18+ (Node 20 recommended)
- A PostgreSQL database. The fastest free option is **[Neon](https://neon.tech)**
  (or **[Supabase](https://supabase.com)**). Create a project and copy the
  connection string.

### 2. Install
```bash
npm install
```

### 3. Configure environment
Copy the example file and fill it in:
```bash
cp .env.example .env
```
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require"
BETTER_AUTH_SECRET="<run: openssl rand -base64 32>"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Create the database tables
```bash
npx prisma db push
```

### 5. Start
```bash
npm run dev
```
Open <http://localhost:3000>, register a badge, and open the Zodiac file.

---

## Deploy (publish it)

**Recommended: Vercel + Neon**

1. Push this folder to a GitHub repo.
2. Create a Neon Postgres database; copy the pooled connection string.
3. Import the repo into **Vercel**.
4. In Vercel → Project → Settings → **Environment Variables**, add:
   - `DATABASE_URL` — your Neon string
   - `BETTER_AUTH_SECRET` — a long random value
   - `BETTER_AUTH_URL` — your production URL, e.g. `https://yourapp.vercel.app`
   - `NEXT_PUBLIC_APP_URL` — same production URL
5. Deploy. After the first deploy, run `npx prisma db push` against the production
   `DATABASE_URL` once (locally with the prod env, or via a Vercel build step) to
   create the tables.

`prisma generate` runs automatically on install (postinstall) and build.

---

## Add another case (it's designed for this)

All content lives in **`src/data/cases.ts`** as typed objects (`CaseFile`). To add
a case, append a new object to the `cases` array following the `CaseFile` shape in
`src/types/case.ts`:

```ts
const blackDahlia: CaseFile = {
  id: "black-dahlia",
  codename: "THE BLACK DAHLIA",
  status: "OPEN — UNSOLVED",
  // victims, timeline, evidence, ciphers, suspects, verdict...
};
```

Then replace the matching `lockedCase(...)` placeholder with your real object. The
landing page, the archive, the case file UI, and the accusation flow all read from
this data automatically — no other code changes needed.

---

## Project structure

```
src/
  app/
    page.tsx                      # newspaper landing page
    login/ register/              # Better Auth screens
    cases/                        # case picker (auth-gated)
    cases/[caseId]/               # the case file (tabs)
    cases/[caseId]/accuse/        # accusation + reveal
    api/auth/[...all]/route.ts    # Better Auth handler
  components/
    accusation-flow.tsx           # the interactive verdict + reveal
    site-header.tsx, auth-form.tsx, crosshair.tsx, stamp.tsx
    ui/                           # shadcn primitives
  data/cases.ts                   # ALL case content (the Zodiac)
  lib/                            # auth, auth-client, prisma, actions, utils
  types/case.ts                   # the CaseFile data model
prisma/schema.prisma              # auth tables + Accusation
```

---

## A note on the content & responsibility

This experience is based on **publicly documented history**. The Zodiac case is
real and **officially unsolved**. Every suspect named here was publicly
investigated or theorized in books, news reporting, or documentaries; several were
formally cleared, and **no one was ever charged**. Naming a suspect inside the app
is a deduction game — it is **not** a claim that any real person was guilty. This is
stated in the app footer and in the final reveal.

---

## Verification status

The source has been syntax-checked and bundle-verified (all internal imports and
exports resolve). A full `next build` was not run in the authoring environment, so
run `npm run build` once locally after adding your `.env` to confirm before
deploying.
