'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Face, Gender } from '@/lib/types';
import { ArrowRight, Check, Sparkles, SlidersHorizontal, ListOrdered } from 'lucide-react';

interface PairwiseRaterProps {
  currentPair: [Face, Face] | null;
  targetGender: Gender;
  comparisonsCount: number;
  userRankedIds: string[];
  faces: Face[];
  onVote: (winnerId: string, loserId: string) => void;
  onSwitchGender: (gender: Gender) => void;
  onProceedToUpload: () => void;
}

export function PairwiseRater({
  currentPair,
  targetGender,
  comparisonsCount,
  userRankedIds,
  faces,
  onVote,
  onSwitchGender,
  onProceedToUpload,
}: PairwiseRaterProps) {
  const [selectedSide, setSelectedSide] = useState<'left' | 'right' | null>(null);
  const [showPreferences, setShowPreferences] = useState<boolean>(false);

  const handleSelect = useCallback(
    (winnerIndex: 0 | 1) => {
      if (!currentPair || selectedSide !== null) return;

      const winner = currentPair[winnerIndex];
      const loser = currentPair[winnerIndex === 0 ? 1 : 0];

      setSelectedSide(winnerIndex === 0 ? 'left' : 'right');

      setTimeout(() => {
        onVote(winner.id, loser.id);
        setSelectedSide(null);
      }, 250);
    },
    [currentPair, onVote, selectedSide]
  );

  // Keyboard navigation support: Left Arrow / '1' for Left, Right Arrow / '2' for Right
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === '1') {
        handleSelect(0);
      } else if (e.key === 'ArrowRight' || e.key === '2') {
        handleSelect(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelect]);

  if (!currentPair) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <p className="text-xs font-mono text-neutral-500">Loading faces...</p>
      </div>
    );
  }

  const [leftFace, rightFace] = currentPair;
  const minRequiredForMatch = 5;
  const isReadyForMatch = comparisonsCount >= minRequiredForMatch;

  // Compute user's ranked faces list
  const rankedFacesList = userRankedIds
    .map(id => faces.find(f => f.id === id))
    .filter((f): f is Face => f !== undefined && f.gender === targetGender);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Top Controls & Category Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div className="flex items-center gap-1 bg-neutral-100 p-1 border border-neutral-200 text-xs font-mono">
          <button
            onClick={() => onSwitchGender('women')}
            className={`px-4 py-1.5 transition-all cursor-pointer ${
              targetGender === 'women'
                ? 'bg-white text-black font-semibold shadow-2xs'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            Rating Women
          </button>
          <button
            onClick={() => onSwitchGender('men')}
            className={`px-4 py-1.5 transition-all cursor-pointer ${
              targetGender === 'men'
                ? 'bg-white text-black font-semibold shadow-2xs'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            Rating Men
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 transition-colors cursor-pointer"
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>My Rankings ({userRankedIds.length})</span>
          </button>

          {isReadyForMatch && (
            <button
              onClick={onProceedToUpload}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-black text-white hover:bg-neutral-800 transition-all font-mono text-xs uppercase tracking-wider cursor-pointer shadow-2xs animate-pulse"
            >
              <span>Get Best Match</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Rater Prompt */}
      <div className="text-center space-y-2">
        <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
          Pairwise Comparison
        </span>
        <h2 className="text-2xl sm:text-3xl font-light text-black tracking-tight">
          Which face do you prefer?
        </h2>
        <p className="text-xs font-mono text-neutral-500">
          Click a face, or use keyboard keys <kbd className="px-1.5 py-0.5 bg-neutral-100 border border-neutral-200">←</kbd> and <kbd className="px-1.5 py-0.5 bg-neutral-100 border border-neutral-200">→</kbd>
        </p>
      </div>

      {/* Pairwise Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
        {/* Left Face */}
        <div
          onClick={() => handleSelect(0)}
          className={`group relative flex flex-col bg-white border cursor-pointer transition-all duration-200 select-none ${
            selectedSide === 'left'
              ? 'border-black ring-2 ring-black scale-[1.01]'
              : 'border-neutral-200 hover:border-black hover:shadow-md'
          }`}
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
            <Image
              src={leftFace.imageUrl}
              alt={leftFace.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-103"
              priority
            />
            {selectedSide === 'left' && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center animate-in fade-in">
                <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-lg">
                  <Check className="w-6 h-6 stroke-[2.5]" />
                </div>
              </div>
            )}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2 py-0.5 text-xs font-mono font-medium border border-neutral-200">
              Option 1 (Key 1 / ←)
            </div>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
            <div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-light text-black">{leftFace.name}</h3>
                {leftFace.age && (
                  <span className="text-xs font-mono text-neutral-400">{leftFace.age} yrs</span>
                )}
              </div>
              <p className="text-xs font-mono text-neutral-500 mt-0.5">
                {leftFace.occupation} • {leftFace.city}
              </p>
            </div>

            {leftFace.bio && (
              <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                &ldquo;{leftFace.bio}&rdquo;
              </p>
            )}

            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>Elo: {leftFace.rating}</span>
              <span className="text-black group-hover:underline">Choose this face →</span>
            </div>
          </div>
        </div>

        {/* Right Face */}
        <div
          onClick={() => handleSelect(1)}
          className={`group relative flex flex-col bg-white border cursor-pointer transition-all duration-200 select-none ${
            selectedSide === 'right'
              ? 'border-black ring-2 ring-black scale-[1.01]'
              : 'border-neutral-200 hover:border-black hover:shadow-md'
          }`}
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
            <Image
              src={rightFace.imageUrl}
              alt={rightFace.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-103"
              priority
            />
            {selectedSide === 'right' && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center animate-in fade-in">
                <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-lg">
                  <Check className="w-6 h-6 stroke-[2.5]" />
                </div>
              </div>
            )}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2 py-0.5 text-xs font-mono font-medium border border-neutral-200">
              Option 2 (Key 2 / →)
            </div>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
            <div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-light text-black">{rightFace.name}</h3>
                {rightFace.age && (
                  <span className="text-xs font-mono text-neutral-400">{rightFace.age} yrs</span>
                )}
              </div>
              <p className="text-xs font-mono text-neutral-500 mt-0.5">
                {rightFace.occupation} • {rightFace.city}
              </p>
            </div>

            {rightFace.bio && (
              <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                &ldquo;{rightFace.bio}&rdquo;
              </p>
            )}

            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>Elo: {rightFace.rating}</span>
              <span className="text-black group-hover:underline">Choose this face →</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress & Call-to-action Footer */}
      <div className="border border-neutral-200 p-4 sm:p-6 bg-neutral-50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-black uppercase">
              Comparisons: {comparisonsCount}
            </span>
            {comparisonsCount >= minRequiredForMatch ? (
              <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-300">
                Ready for Gale–Shapley
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-mono bg-neutral-200 text-neutral-700">
                {minRequiredForMatch - comparisonsCount} more recommended
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 font-mono">
            Each pairwise choice tunes your mathematical preference order.
          </p>
        </div>

        <button
          onClick={onProceedToUpload}
          className={`w-full sm:w-auto px-6 py-3 text-xs font-mono tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
            isReadyForMatch
              ? 'bg-black text-white hover:bg-neutral-800 shadow-xs'
              : 'bg-white text-neutral-600 border border-neutral-300 hover:border-black hover:text-black'
          }`}
        >
          <span>{isReadyForMatch ? 'Proceed to Photo Step' : 'Skip to Match (Unlock)'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Live Rankings Drawer */}
      {showPreferences && (
        <div className="border border-neutral-200 p-6 bg-white space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h4 className="text-xs font-mono uppercase tracking-wider font-semibold text-black">
              Your Subconscious Ranked Preferences
            </h4>
            <span className="text-xs font-mono text-neutral-400">
              Ranked #{rankedFacesList.length} Faces
            </span>
          </div>

          {rankedFacesList.length === 0 ? (
            <p className="text-xs text-neutral-500 font-mono py-4 text-center">
              Make a few pairwise comparisons above to see your live preference list.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {rankedFacesList.map((face, index) => (
                <div
                  key={face.id}
                  className="border border-neutral-200 p-2 text-center space-y-1.5 bg-neutral-50"
                >
                  <div className="relative aspect-square w-full bg-neutral-200 overflow-hidden">
                    <Image
                      src={face.imageUrl}
                      alt={face.name}
                      fill
                      sizes="100px"
                      className="object-cover"
                    />
                    <div className="absolute top-1 left-1 bg-black text-white text-[10px] font-mono px-1 font-bold">
                      #{index + 1}
                    </div>
                  </div>
                  <p className="text-xs font-light text-black truncate">{face.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
