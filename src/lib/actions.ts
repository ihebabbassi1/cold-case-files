"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCase } from "@/data/cases";

export interface AccusationInput {
  caseId: string;
  suspectId: string;
  suspectName: string;
  reasoning?: string;
}

export async function submitAccusation(
  input: AccusationInput
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth.api.getSession({
    headers: (await headers()) as unknown as Headers,
  });
  if (!session?.user) {
    return { ok: false, error: "You must be signed in to file a verdict." };
  }

  try {
    await prisma.accusation.create({
      data: {
        userId: session.user.id,
        caseId: input.caseId,
        suspectId: input.suspectId,
        suspectName: input.suspectName,
        reasoning: input.reasoning?.trim() ? input.reasoning.trim() : null,
      },
    });
    revalidatePath(`/cases/${input.caseId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "The record could not be saved. Try again." };
  }
}

export interface AccusationVerdict {
  /** "strong" = picked the prime/most-supported suspect, "weak" = a fringe pick. */
  rating: "strong" | "plausible" | "weak" | null;
  analysis: string | null;
}

export async function analyzeAccusation(input: {
  caseId: string;
  suspectId: string;
  reasoning?: string;
}): Promise<AccusationVerdict> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { rating: null, analysis: null };

  const file = getCase(input.caseId);
  if (!file) return { rating: null, analysis: null };

  const suspect = file.suspects.find((s) => s.id === input.suspectId);
  if (!suspect) return { rating: null, analysis: null };

  const reasoningText = input.reasoning?.trim()
    ? `The detective's written reasoning: "${input.reasoning.trim()}"`
    : "The detective gave no written reasoning.";

  // Give the model the full roster so it can judge this pick RELATIVE to the others.
  const roster = file.suspects
    .map(
      (s) =>
        `- ${s.name} (${s.alias}). For: ${s.pointsFor.join("; ")}. Against: ${s.pointsAgainst.join("; ")}.`
    )
    .join("\n");

  const prompt = `You are the senior detective on the Zodiac Killer cold case, reviewing a junior detective's accusation. The case is officially UNSOLVED — no one was ever charged, so no pick can be "confirmed correct." But the suspects are NOT equal: some had far stronger circumstantial cases than others.

GROUND TRUTH for grading:
- Arthur Leigh Allen is the PRIME SUSPECT — the only man ever served a search warrant, the strongest (though still circumstantial and never proven) case. Picking him = the strongest, most defensible call.
- Gary Francis Poste and the others are fringe or fully discredited picks with little or no hard support.

The full roster the detective could choose from:
${roster}

THE DETECTIVE ACCUSED: ${suspect.name} (${suspect.alias})
${reasoningText}
What investigators actually found about this suspect: ${suspect.whatHappened}

Respond with a JSON object ONLY (no markdown fences), with exactly these keys:
{
  "rating": one of "strong" | "plausible" | "weak",
  "analysis": "a 2-3 paragraph hardboiled-detective assessment, under 170 words"
}

Rules for "rating":
- "strong" ONLY if they picked Arthur Leigh Allen.
- "plausible" if the pick has some documented support but is weaker than Allen.
- "weak" if the pick is fringe/discredited with little evidence.

Rules for "analysis":
- First tell them plainly whether their call was the strongest available one or not, and why.
- Then weigh their stated reasoning against the actual evidence.
- End on the hard truth: the case is unsolved, so even the best pick was never proven.
- Noir tone, past tense, direct, no bullet points.`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) return { rating: null, analysis: null };

    const data = await res.json();
    const raw: string | undefined = data?.choices?.[0]?.message?.content;
    if (!raw) return { rating: null, analysis: null };

    try {
      const parsed = JSON.parse(raw) as { rating?: string; analysis?: string };
      const rating =
        parsed.rating === "strong" ||
        parsed.rating === "plausible" ||
        parsed.rating === "weak"
          ? parsed.rating
          : null;
      return { rating, analysis: parsed.analysis ?? null };
    } catch {
      // Model didn't return clean JSON — still show the text.
      return { rating: null, analysis: raw };
    }
  } catch {
    return { rating: null, analysis: null };
  }
}
