import { test, describe } from 'node:test';
import assert from 'node:assert';
import { calculateNewRatings, calculateExpectedScore, getNextPair } from '../src/lib/elo';
import { runGaleShapley } from '../src/lib/galeShapley';
import { INITIAL_CURATED_FACES } from '../src/lib/curatedFaces';
import { Face, UserProfile } from '../src/lib/types';

describe('Elo Rating Engine', () => {
  test('calculates expected scores correctly', () => {
    const scoreEqual = calculateExpectedScore(1500, 1500);
    assert.strictEqual(scoreEqual, 0.5);

    const scoreHigher = calculateExpectedScore(1700, 1500);
    assert.ok(scoreHigher > 0.5);
  });

  test('updates ratings on win/loss correctly', () => {
    const { newWinnerRating, newLoserRating, winnerDelta, loserDelta } = calculateNewRatings(1500, 1500);
    assert.ok(winnerDelta > 0);
    assert.ok(loserDelta < 0);
    assert.strictEqual(newWinnerRating, 1500 + winnerDelta);
    assert.strictEqual(newLoserRating, 1500 + loserDelta);
  });

  test('picks valid next pairs', () => {
    const women = INITIAL_CURATED_FACES.filter(f => f.gender === 'women');
    const pair = getNextPair(women, new Set());
    assert.ok(pair);
    assert.strictEqual(pair.length, 2);
    assert.notStrictEqual(pair[0].id, pair[1].id);
  });
});

describe('Gale-Shapley Matching Algorithm', () => {
  test('computes a stable mutual match for user', () => {
    const women = INITIAL_CURATED_FACES.filter(f => f.gender === 'women');
    const men = INITIAL_CURATED_FACES.filter(f => f.gender === 'men');

    const userProfile: UserProfile = {
      sessionId: 'test-session',
      name: 'Test Proposer',
      gender: 'men',
      targetGender: 'women',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      preferences: [women[0].id, women[1].id, women[2].id],
      createdAt: Date.now(),
    };

    const userFace: Face = {
      id: 'user-test',
      name: 'Test Proposer',
      gender: 'men',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      rating: 1600,
      comparisonsCount: 10,
      wins: 7,
      losses: 3,
      isUser: true,
      createdAt: Date.now(),
    };

    const result = runGaleShapley(userProfile, userFace, women, men);

    assert.ok(result.userMatch, 'Gale-Shapley should find a match');
    assert.strictEqual(result.stabilityScore, 100);
    assert.ok(result.steps.length > 0, 'Should have matching trace steps');
    console.log(`Matched with ${result.userMatch.name} in ${result.steps.length} steps`);
  });
});
