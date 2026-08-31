'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { GaleShapleyResult, UserProfile } from '@/lib/types';
import {
  Sparkles,
  ShieldCheck,
  Award,
  ChevronDown,
  ChevronUp,
  Share2,
  RotateCcw,
  CheckCircle2,
  Heart,
  ArrowRight,
} from 'lucide-react';

interface MatchResultViewProps {
  result: GaleShapleyResult;
  userProfile: UserProfile;
  onRestart: () => void;
  onOpenGaleShapleyModal: () => void;
  onOpenLeaderboard: () => void;
}

export function MatchResultView({
  result,
  userProfile,
  onRestart,
  onOpenGaleShapleyModal,
  onOpenLeaderboard,
}: MatchResultViewProps) {
  const [showTrace, setShowTrace] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const match = result.userMatch;

  useEffect(() => {
    // Fire celebratory confetti on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#000000', '#555555', '#aaaaaa', '#ffffff'],
      });
    } catch {
      // Confetti fallback
    }
  }, []);

  const handleShare = () => {
    if (!match) return;
    const text = `I found my single best mutual match with ${match.name} on Best Face using the Gale-Shapley Stable Marriage algorithm!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!match) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <p className="text-sm font-mono text-neutral-500">No match found.</p>
        <button
          onClick={onRestart}
          className="px-6 py-2 bg-black text-white text-xs font-mono uppercase"
        >
          Restart
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono tracking-widest uppercase border border-neutral-200 bg-neutral-50 text-neutral-800">
          <Heart className="w-3.5 h-3.5 fill-black text-black" />
          Single Optimal Mutual Match Found
        </div>

        <h1 className="text-3xl sm:text-5xl font-light text-black tracking-tight">
          Your Gale–Shapley Match
        </h1>

        <p className="text-xs sm:text-sm font-mono text-neutral-500 max-w-md mx-auto">
          Through your pairwise choices and market equilibrium, this is your single mathematically optimal match.
        </p>
      </div>

      {/* Match Showcase Card */}
      <div className="border border-neutral-300 bg-white overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Large Portrait */}
          <div className="relative aspect-[4/5] md:aspect-auto min-h-[360px] bg-neutral-100">
            <Image
              src={match.imageUrl}
              alt={match.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs px-2.5 py-1 text-xs font-mono font-semibold border border-neutral-200">
              100% Stability Guarantee
            </div>
          </div>

          {/* Details & Mutual Stats */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                  Best Face Match
                </span>
                <h2 className="text-3xl font-light text-black tracking-tight">
                  {match.name}
                </h2>
                <p className="text-xs font-mono text-neutral-500 mt-1">
                  {match.age} years old • {match.city}
                </p>
                <p className="text-xs font-mono text-neutral-600 mt-0.5">
                  {match.occupation}
                </p>
              </div>

              {match.bio && (
                <div className="p-3 bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 leading-relaxed italic">
                  &ldquo;{match.bio}&rdquo;
                </div>
              )}

              {/* Preference Alignment Breakdown */}
              <div className="space-y-2 border-t border-neutral-100 pt-4 text-xs font-mono">
                <div className="flex items-center justify-between py-1 border-b border-neutral-50">
                  <span className="text-neutral-500">Your Preference Rank:</span>
                  <span className="font-semibold text-black">#{result.userRankForPartner} in your list</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-neutral-50">
                  <span className="text-neutral-500">Their Preference Rank:</span>
                  <span className="font-semibold text-black">#{result.partnerRankForUser} in their list</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-neutral-500">Market Stability:</span>
                  <span className="font-semibold text-emerald-700">Equilibrium (0 blocking pairs)</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-neutral-200 space-y-3">
              <button
                onClick={handleShare}
                className="w-full py-3 bg-black text-white text-xs font-mono tracking-widest uppercase hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Share Match Card</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gale-Shapley Algorithm Explainer Box */}
      <div className="border border-neutral-200 p-6 bg-neutral-50 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-black" />
              <h3 className="text-sm font-semibold text-black uppercase font-mono tracking-wider">
                Why is this your single best match?
              </h3>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Unlike arbitrary swipe algorithms that trap you in an endless loop of low-commitment chats, 
              the Gale–Shapley deferred acceptance theorem guarantees a Pareto-optimal matching with zero blocking pairs.
            </p>
          </div>

          <button
            onClick={onOpenGaleShapleyModal}
            className="shrink-0 px-3 py-1.5 border border-neutral-300 bg-white hover:bg-neutral-100 text-xs font-mono uppercase text-black transition-colors cursor-pointer"
          >
            Learn More
          </button>
        </div>

        {/* Accordion to inspect step by step trace */}
        <div className="border-t border-neutral-200 pt-3">
          <button
            onClick={() => setShowTrace(!showTrace)}
            className="flex items-center justify-between w-full text-xs font-mono text-neutral-600 hover:text-black py-1 cursor-pointer"
          >
            <span>Inspect Mathematical Rounds & Proposals ({result.steps.length} steps)</span>
            {showTrace ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showTrace && (
            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto border border-neutral-200 bg-white p-3 text-xs font-mono text-neutral-700">
              {result.steps.map((step, idx) => (
                <div key={idx} className="border-b border-neutral-100 pb-2 last:border-0">
                  <span className="text-neutral-400 font-bold mr-2">Round {step.round}:</span>
                  <span className="font-semibold text-black">{step.proposerName}</span> →{' '}
                  <span className="font-semibold text-black">{step.receiverName}</span>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{step.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-200 text-xs font-mono">
        <button
          onClick={onOpenLeaderboard}
          className="text-neutral-600 hover:text-black underline cursor-pointer"
        >
          View Community Elo Leaderboard →
        </button>

        <button
          onClick={onRestart}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-neutral-300 hover:border-black text-black bg-white hover:bg-neutral-50 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Start a New Match Session</span>
        </button>
      </div>
    </div>
  );
}
