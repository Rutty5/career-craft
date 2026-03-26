import type { Scores } from "./types";

export function parseScores(text: string): Scores | null {
  try {
    const match = text.match(
      /<!--\s*SCORES_JSON:\s*(\{[^}]+\})\s*-->/
    );
    if (!match) return null;

    const parsed = JSON.parse(match[1]);

    if (
      typeof parsed.impact !== "number" ||
      typeof parsed.specificity !== "number" ||
      typeof parsed.targetFit !== "number" ||
      typeof parsed.readability !== "number" ||
      typeof parsed.emotion !== "number" ||
      typeof parsed.total !== "number"
    ) {
      return null;
    }

    return {
      impact: parsed.impact,
      specificity: parsed.specificity,
      targetFit: parsed.targetFit,
      readability: parsed.readability,
      emotion: parsed.emotion,
      total: parsed.total,
    };
  } catch {
    return null;
  }
}

export function removeScoresComment(text: string): string {
  return text.replace(/<!--\s*SCORES_JSON:\s*\{[^}]+\}\s*-->/g, "").trim();
}
