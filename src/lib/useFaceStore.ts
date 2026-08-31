'use client';

import { useState, useEffect, useCallback } from 'react';
import { Face, Gender, Comparison, UserProfile, GaleShapleyResult } from './types';
import { INITIAL_CURATED_FACES } from './curatedFaces';
import { calculateNewRatings, getNextPair } from './elo';
import { runGaleShapley } from './galeShapley';
import { db, id } from './instantClient';

const SESSION_KEY = 'best_face_session_id_v2';
const STATE_STORAGE_KEY = 'best_face_local_state_v2';

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'anon-server';
  let sId = localStorage.getItem(SESSION_KEY);
  if (!sId) {
    sId = `usr_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    localStorage.setItem(SESSION_KEY, sId);
  }
  return sId;
}

export function useFaceStore() {
  const [sessionId, setSessionId] = useState<string>('');
  const [targetGender, setTargetGender] = useState<Gender>('women');
  const [userGender, setUserGender] = useState<Gender>('men');
  const [faces, setFaces] = useState<Face[]>(INITIAL_CURATED_FACES);
  const [recentPairKeys, setRecentPairKeys] = useState<Set<string>>(new Set());
  const [currentPair, setCurrentPair] = useState<[Face, Face] | null>(null);
  const [comparisonsCount, setComparisonsCount] = useState<number>(0);
  const [userRankedIds, setUserRankedIds] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [matchResult, setMatchResult] = useState<GaleShapleyResult | null>(null);
  const [isComputingMatch, setIsComputingMatch] = useState<boolean>(false);
  const [history, setHistory] = useState<Comparison[]>([]);

  // 1. Initialize session and restore any local progress
  useEffect(() => {
    const sId = getOrCreateSessionId();
    setSessionId(sId);

    try {
      const saved = localStorage.getItem(STATE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.targetGender) setTargetGender(parsed.targetGender);
        if (parsed.userGender) setUserGender(parsed.userGender);
        if (parsed.faces && Array.isArray(parsed.faces) && parsed.faces.length > 0) {
          setFaces(parsed.faces);
        }
        if (parsed.comparisonsCount) setComparisonsCount(parsed.comparisonsCount);
        if (parsed.userRankedIds) setUserRankedIds(parsed.userRankedIds);
        if (parsed.userProfile) setUserProfile(parsed.userProfile);
        if (parsed.matchResult) setMatchResult(parsed.matchResult);
      }
    } catch {
      // Ignore parse error
    }
  }, []);

  // Save to local storage whenever state changes
  useEffect(() => {
    if (!sessionId) return;
    try {
      localStorage.setItem(
        STATE_STORAGE_KEY,
        JSON.stringify({
          targetGender,
          userGender,
          faces,
          comparisonsCount,
          userRankedIds,
          userProfile,
          matchResult,
        })
      );
    } catch {
      // Storage full or unavailable
    }
  }, [sessionId, targetGender, userGender, faces, comparisonsCount, userRankedIds, userProfile, matchResult]);

  // 2. Query InstantDB to sync real-time community face ratings if available
  const { data: instantData } = db.useQuery({
    faces: {},
    comparisons: {},
  });

  // Merge InstantDB faces if they exist, or seed if empty
  useEffect(() => {
    if (instantData?.faces && instantData.faces.length > 0) {
      // Merge remote ratings with local faces
      setFaces(prevFaces => {
        const remoteMap = new Map((instantData.faces as unknown as Face[]).map(f => [f.id, f]));
        return prevFaces.map(f => {
          const remote = remoteMap.get(f.id);
          if (remote) {
            return {
              ...f,
              rating: remote.rating || f.rating,
              comparisonsCount: remote.comparisonsCount || f.comparisonsCount,
              wins: remote.wins || f.wins,
              losses: remote.losses || f.losses,
            };
          }
          return f;
        });
      });
    }
  }, [instantData]);

  // 3. Update current pair when target gender or faces change
  const pickNextPair = useCallback(
    (currentFaces: Face[], gender: Gender, usedPairs: Set<string>) => {
      const candidates = currentFaces.filter(f => f.gender === gender && !f.isUser);
      const next = getNextPair(candidates, usedPairs);
      setCurrentPair(next);
    },
    []
  );

  useEffect(() => {
    pickNextPair(faces, targetGender, recentPairKeys);
  }, [targetGender, pickNextPair, faces, recentPairKeys]);

  // 4. Record a vote / pairwise comparison
  const vote = useCallback(
    (winnerId: string, loserId: string) => {
      const winner = faces.find(f => f.id === winnerId);
      const loser = faces.find(f => f.id === loserId);
      if (!winner || !loser) return;

      const { newWinnerRating, newLoserRating } = calculateNewRatings(
        winner.rating,
        loser.rating
      );

      const comparisonId = id();
      const newComparison: Comparison = {
        id: comparisonId,
        winnerId,
        loserId,
        genderCategory: targetGender,
        voterSessionId: sessionId || 'anon',
        createdAt: Date.now(),
      };

      // Update local faces state
      setFaces(prev => {
        return prev.map(f => {
          if (f.id === winnerId) {
            return {
              ...f,
              rating: newWinnerRating,
              wins: f.wins + 1,
              comparisonsCount: f.comparisonsCount + 1,
            };
          }
          if (f.id === loserId) {
            return {
              ...f,
              rating: newLoserRating,
              losses: f.losses + 1,
              comparisonsCount: f.comparisonsCount + 1,
            };
          }
          return f;
        });
      });

      // Update user ranked IDs preference order
      setUserRankedIds(prev => {
        const next = [...prev];
        const winIdx = next.indexOf(winnerId);
        const loseIdx = next.indexOf(loserId);

        if (winIdx === -1 && loseIdx === -1) {
          next.push(winnerId, loserId);
        } else if (winIdx === -1) {
          next.splice(loseIdx, 0, winnerId);
        } else if (loseIdx === -1) {
          next.push(loserId);
        } else if (winIdx > loseIdx) {
          // Move winner ahead of loser
          next.splice(winIdx, 1);
          next.splice(loseIdx, 0, winnerId);
        }
        return next;
      });

      setComparisonsCount(prev => prev + 1);
      setHistory(prev => [newComparison, ...prev]);

      const pairKey = `${winnerId}-${loserId}`;
      setRecentPairKeys(prev => {
        const next = new Set(prev);
        next.add(pairKey);
        if (next.size > 20) {
          const firstKey = next.values().next().value;
          if (firstKey) next.delete(firstKey);
        }
        return next;
      });

      // Transact to InstantDB asynchronously (non-blocking)
      try {
        db.transact([
          db.tx.comparisons[comparisonId].create({
            winnerId,
            loserId,
            genderCategory: targetGender,
            voterSessionId: sessionId || 'anon',
            createdAt: Date.now(),
          }),
          db.tx.faces[winnerId].update({
            rating: newWinnerRating,
            wins: winner.wins + 1,
            comparisonsCount: winner.comparisonsCount + 1,
          }),
          db.tx.faces[loserId].update({
            rating: newLoserRating,
            losses: loser.losses + 1,
            comparisonsCount: loser.comparisonsCount + 1,
          }),
        ]).catch(() => {
          // Tolerant to offline/dev
        });
      } catch {
        // Fallback gracefully
      }
    },
    [faces, targetGender, sessionId]
  );

  // 5. Change target gender
  const switchTargetGender = useCallback(
    (newTarget: Gender) => {
      setTargetGender(newTarget);
      setUserGender(newTarget === 'women' ? 'men' : 'women');
      setRecentPairKeys(new Set());
    },
    []
  );

  // 6. Compute Gale-Shapley Match
  const computeSingleBestMatch = useCallback(
    async (profile: {
      name: string;
      photoUrl: string;
      age?: number;
      city?: string;
      bio?: string;
    }) => {
      setIsComputingMatch(true);

      const candidateFaces = faces.filter(f => f.gender === targetGender && !f.isUser);
      const oppositeFaces = faces.filter(f => f.gender === userGender && !f.isUser);

      // Build user face representation
      const userFaceId = `user-${sessionId || id()}`;
      const newUserFace: Face = {
        id: userFaceId,
        name: profile.name,
        gender: userGender,
        imageUrl: profile.photoUrl,
        rating: 1600, // Standard starting rating
        comparisonsCount: comparisonsCount,
        wins: Math.round(comparisonsCount * 0.7),
        losses: Math.round(comparisonsCount * 0.3),
        age: profile.age || 26,
        bio: profile.bio || 'Best Face Explorer',
        city: profile.city || 'Global',
        isUser: true,
        userSessionId: sessionId,
        createdAt: Date.now(),
      };

      const newUserProfile: UserProfile = {
        sessionId: sessionId || 'anon',
        name: profile.name,
        gender: userGender,
        targetGender: targetGender,
        photoUrl: profile.photoUrl,
        age: profile.age,
        bio: profile.bio,
        city: profile.city,
        preferences: userRankedIds,
        createdAt: Date.now(),
      };

      setUserProfile(newUserProfile);

      // Run Gale-Shapley algorithm
      const result = runGaleShapley(
        newUserProfile,
        newUserFace,
        candidateFaces,
        oppositeFaces
      );

      // Simulated computation delay for pleasant visual reveal
      await new Promise(resolve => setTimeout(resolve, 1400));

      setMatchResult(result);
      setIsComputingMatch(false);

      // Store match in InstantDB
      if (result.userMatch) {
        try {
          const matchId = id();
          db.transact([
            db.tx.userProfiles[sessionId || id()].create({
              sessionId: sessionId || 'anon',
              name: profile.name,
              gender: userGender,
              targetGender: targetGender,
              photoUrl: profile.photoUrl,
              preferences: userRankedIds,
              matchedFaceId: result.userMatch.id,
              matchedAt: Date.now(),
              createdAt: Date.now(),
            }),
            db.tx.matches[matchId].create({
              userSessionId: sessionId || 'anon',
              matchedFaceId: result.userMatch.id,
              stabilityScore: result.stabilityScore,
              rankInUserList: result.userRankForPartner,
              rankInPartnerList: result.partnerRankForUser,
              explanation: `Gale-Shapley stable match: You ranked ${result.userMatch.name} #${result.userRankForPartner}, and they ranked you #${result.partnerRankForUser} in their pool.`,
              createdAt: Date.now(),
            }),
          ]).catch(() => {
            // Tolerant to offline/dev
          });
        } catch {
          // Graceful fallback
        }
      }

      return result;
    },
    [faces, targetGender, userGender, sessionId, comparisonsCount, userRankedIds]
  );

  // 7. Reset all progress
  const resetAll = useCallback(() => {
    localStorage.removeItem(STATE_STORAGE_KEY);
    setFaces(INITIAL_CURATED_FACES);
    setComparisonsCount(0);
    setUserRankedIds([]);
    setUserProfile(null);
    setMatchResult(null);
    setRecentPairKeys(new Set());
    setHistory([]);
    const sId = `usr_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    setSessionId(sId);
    localStorage.setItem(SESSION_KEY, sId);
    pickNextPair(INITIAL_CURATED_FACES, targetGender, new Set());
  }, [targetGender, pickNextPair]);

  return {
    sessionId,
    targetGender,
    userGender,
    faces,
    currentPair,
    comparisonsCount,
    userRankedIds,
    userProfile,
    matchResult,
    isComputingMatch,
    history,
    vote,
    switchTargetGender,
    setUserGender,
    computeSingleBestMatch,
    resetAll,
    setTargetGender,
  };
}
