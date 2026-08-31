'use client';

import React, { useState } from 'react';
import { useFaceStore } from '@/lib/useFaceStore';
import { Navbar } from '@/components/Navbar';
import { LandingHero } from '@/components/LandingHero';
import { PairwiseRater } from '@/components/PairwiseRater';
import { PhotoUploadStep } from '@/components/PhotoUploadStep';
import { MatchResultView } from '@/components/MatchResultView';
import { GaleShapleyModal } from '@/components/GaleShapleyModal';
import { LeaderboardModal } from '@/components/LeaderboardModal';
import { Gender } from '@/lib/types';

type ScreenState = 'landing' | 'rate' | 'upload' | 'match';

export default function Home() {
  const {
    targetGender,
    userGender,
    faces,
    currentPair,
    comparisonsCount,
    userRankedIds,
    userProfile,
    matchResult,
    isComputingMatch,
    vote,
    switchTargetGender,
    computeSingleBestMatch,
    resetAll,
  } = useFaceStore();

  const [currentScreen, setCurrentScreen] = useState<ScreenState>('landing');
  const [isGaleShapleyOpen, setIsGaleShapleyOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);

  // If a match already exists on resume, show match screen
  React.useEffect(() => {
    if (matchResult && userProfile && currentScreen === 'landing') {
      setCurrentScreen('match');
    }
  }, [matchResult, userProfile, currentScreen]);

  const handleStartFromLanding = (selectedTarget: Gender) => {
    switchTargetGender(selectedTarget);
    setCurrentScreen('rate');
  };

  const handleGoHome = () => {
    setCurrentScreen('landing');
  };

  const handleResetSession = () => {
    if (window.confirm('Reset all ratings and start a fresh matching session?')) {
      resetAll();
      setCurrentScreen('landing');
    }
  };

  const handleCalculateMatch = async (profile: {
    name: string;
    photoUrl: string;
    age?: number;
    city?: string;
    bio?: string;
  }) => {
    await computeSingleBestMatch(profile);
    setCurrentScreen('match');
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col selection:bg-black selection:text-white font-sans">
      <Navbar
        onOpenGaleShapley={() => setIsGaleShapleyOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onReset={handleResetSession}
        onGoHome={handleGoHome}
        comparisonsCount={comparisonsCount}
      />

      <main className="flex-1 flex flex-col justify-center">
        {currentScreen === 'landing' && (
          <LandingHero
            onStart={handleStartFromLanding}
            onOpenGaleShapley={() => setIsGaleShapleyOpen(true)}
          />
        )}

        {currentScreen === 'rate' && (
          <PairwiseRater
            currentPair={currentPair}
            targetGender={targetGender}
            comparisonsCount={comparisonsCount}
            userRankedIds={userRankedIds}
            faces={faces}
            onVote={vote}
            onSwitchGender={switchTargetGender}
            onProceedToUpload={() => setCurrentScreen('upload')}
          />
        )}

        {currentScreen === 'upload' && (
          <PhotoUploadStep
            userGender={userGender}
            targetGender={targetGender}
            comparisonsCount={comparisonsCount}
            isComputing={isComputingMatch}
            onBack={() => setCurrentScreen('rate')}
            onSubmit={handleCalculateMatch}
          />
        )}

        {currentScreen === 'match' && matchResult && userProfile && (
          <MatchResultView
            result={matchResult}
            userProfile={userProfile}
            onRestart={handleResetSession}
            onOpenGaleShapleyModal={() => setIsGaleShapleyOpen(true)}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          />
        )}
      </main>

      {/* Ultra-clean minimalist footer */}
      <footer className="border-t border-neutral-200 py-8 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-black">BEST FACE</span>
            <span>• Single Mutual Match Engine</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsGaleShapleyOpen(true)}
              className="hover:text-black transition-colors cursor-pointer"
            >
              Gale–Shapley Theory
            </button>
            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="hover:text-black transition-colors cursor-pointer"
            >
              Faces Leaderboard
            </button>
            <span>Deno + InstantDB</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <GaleShapleyModal
        isOpen={isGaleShapleyOpen}
        onClose={() => setIsGaleShapleyOpen(false)}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        faces={faces}
      />
    </div>
  );
}
