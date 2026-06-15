import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

/**
 * The canonical site URL — used for auth cookies, redirects, and email links.
 * Works in local dev, Vercel production, and Vercel preview deployments without
 * any manual configuration:
 *   1. BETTER_AUTH_URL              — explicit override if you set it
 *   2. VERCEL_PROJECT_PRODUCTION_URL — your stable *.vercel.app production alias
 *   3. VERCEL_URL                   — the per-deployment URL (preview builds)
 *   4. localhost                    — local development
 */
const baseURL =
  process.env.BETTER_AUTH_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

export const auth = betterAuth({
  baseURL,
  /**
   * Which origins are allowed to make auth requests. We trust:
   *   - local development
   *   - the explicitly configured site URL (if any)
   *   - ANY *.vercel.app origin — covers the production alias, the git-branch
   *     URL, and every preview deployment, now and in the future.
   * This is what prevents the "INVALID ORIGIN" error on deployed builds.
   */
  trustedOrigins: async (request) => {
    const origins = new Set<string>(["http://localhost:3000"]);

    if (process.env.BETTER_AUTH_URL) origins.add(process.env.BETTER_AUTH_URL);
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      origins.add(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
    }

    const header =
      request?.headers.get("origin") || request?.headers.get("referer") || "";
    try {
      const incoming = new URL(header).origin;
      if (/^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.vercel\.app$/i.test(incoming)) {
        origins.add(incoming);
      }
    } catch {
      // header missing or not a valid URL — ignore
    }

    return Array.from(origins);
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    // No email server wired up in this starter — accounts are usable immediately.
    requireEmailVerification: false,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh daily
  },
});

export type Session = typeof auth.$Infer.Session;
