// Tiers data-driven : à partir du "Codex Score" (0-100) de spire-codex + sample size.
import { ratings, type Score } from '@/lib/data';

export type Tier = 'S' | 'A' | 'B' | 'C' | 'D';
export const TIERS: Tier[] = ['S', 'A', 'B', 'C', 'D'];

const LOW_SAMPLE = 300; // sous ce nombre de picks, on grise (bruit statistique)

export function scoreTier(score: number): Tier {
  if (score >= 80) return 'S';
  if (score >= 64) return 'A';
  if (score >= 44) return 'B';
  if (score >= 24) return 'C';
  return 'D';
}

export const tierColor = (t: Tier) => `var(--tier-${t.toLowerCase()})`;

/** Score d'une carte dans le contexte d'un perso (sinon overall). */
export function cardScore(cardId: string, char?: string): Score | null {
  const bucket = (char && ratings.cards[char]) || ratings.cards.overall;
  return bucket?.[cardId] ?? ratings.cards.overall?.[cardId] ?? null;
}
export function relicScore(relicId: string): Score | null {
  return ratings.relics.overall?.[relicId] ?? null;
}

export const isLowSample = (s: Score | null) => !s || s.picks < LOW_SAMPLE;

/** Tiers par RANG dans un pool (le Codex Score sature à 100 ; un seuil absolu
 *  collerait tout en S). Pyramide : S top 7%, A 20%, B 50%, C 82%, D le reste.
 *  Départage les ex-aequo par nombre de runs (plus joué = plus prouvé). */
export function rankTiers(scored: { id: string; s: Score | null }[]): Map<string, Tier> {
  const valid = scored
    .filter((x) => x.s && !isLowSample(x.s))
    .sort((a, b) => b.s!.score - a.s!.score || b.s!.picks - a.s!.picks);
  const n = valid.length || 1;
  const m = new Map<string, Tier>();
  valid.forEach((x, i) => {
    const p = (i + 0.5) / n;
    m.set(x.id, p < 0.07 ? 'S' : p < 0.2 ? 'A' : p < 0.5 ? 'B' : p < 0.82 ? 'C' : 'D');
  });
  return m;
}

/** Étiquette de confiance basée sur le nombre de runs. */
export function confidence(s: Score | null): 'high' | 'medium' | 'low' {
  if (!s || s.picks < LOW_SAMPLE) return 'low';
  if (s.picks < 2000) return 'medium';
  return 'high';
}
