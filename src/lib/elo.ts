import { Face } from './types';

const K_FACTOR = 32;

/**
 * Calculates the expected score of player A against player B
 */
export function calculateExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculates new Elo ratings after a pairwise match
 */
export function calculateNewRatings(
  winnerRating: number,
  loserRating: number,
  kFactor: number = K_FACTOR
): { newWinnerRating: number; newLoserRating: number; winnerDelta: number; loserDelta: number } {
  const expectedWinner = calculateExpectedScore(winnerRating, loserRating);
  const expectedLoser = calculateExpectedScore(loserRating, winnerRating);

  const winnerDelta = Math.round(kFactor * (1 - expectedWinner));
  const loserDelta = Math.round(kFactor * (0 - expectedLoser));

  return {
    newWinnerRating: winnerRating + winnerDelta,
    newLoserRating: loserRating + loserDelta,
    winnerDelta,
    loserDelta,
  };
}

/**
 * Selects an intelligent next pair to compare:
 * Mixes close ratings (hard choices) with high uncertainty faces (fewer comparisons)
 */
export function getNextPair(faces: Face[], recentPairIds: Set<string>): [Face, Face] | null {
  if (faces.length < 2) return null;

  // Filter out recent pairs if possible
  const validPairs: [Face, Face][] = [];
  for (let i = 0; i < faces.length; i++) {
    for (let j = i + 1; j < faces.length; j++) {
      const pairKey = `${faces[i].id}-${faces[j].id}`;
      const reverseKey = `${faces[j].id}-${faces[i].id}`;
      if (!recentPairIds.has(pairKey) && !recentPairIds.has(reverseKey)) {
        validPairs.push([faces[i], faces[j]]);
      }
    }
  }

  const pool = validPairs.length > 0 ? validPairs : faces.flatMap((f1, i) => faces.slice(i + 1).map(f2 => [f1, f2] as [Face, Face]));
  if (pool.length === 0) return null;

  // Score candidate pairs:
  // We prioritize pairs with closer ratings (more interesting decision)
  // and pairs where one or both have fewer comparisons (information gain)
  const scoredPairs = pool.map(([f1, f2]) => {
    const ratingDiff = Math.abs(f1.rating - f2.rating);
    const avgComparisons = (f1.comparisonsCount + f2.comparisonsCount) / 2;
    // Lower rating diff is better (closer match), lower comparisons count is better
    const score = ratingDiff * 0.7 + avgComparisons * 30;
    return { pair: [f1, f2] as [Face, Face], score };
  });

  scoredPairs.sort((a, b) => a.score - b.score);

  // Pick one from top 3 candidates to avoid deterministic loops
  const topCandidates = scoredPairs.slice(0, Math.min(3, scoredPairs.length));
  const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)].pair;

  // Randomize left/right presentation to eliminate left-side bias
  return Math.random() > 0.5 ? [selected[0], selected[1]] : [selected[1], selected[0]];
}
