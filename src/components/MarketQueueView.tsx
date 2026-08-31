'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Loader2, Users, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { UserProfile, Face } from '@/lib/types';

interface MarketQueueViewProps {
  userProfile: UserProfile;
  userFace: Face;
  incomingEvaluationsCount: number;
  requiredEvaluations: number;
  onReadyToCompute: () => void;
  onSimulateIncoming: () => void;
}

export function MarketQueueView({
  userProfile,
  userFace,
  incomingEvaluationsCount,
  requiredEvaluations,
  onReadyToCompute,
  onSimulateIncoming,
}: MarketQueueViewProps) {
  const [evalCount, setEvalCount] = useState<number>(incomingEvaluationsCount);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const isSatisfied = evalCount >= requiredEvaluations;
  const progressPercent = Math.min(100, Math.round((evalCount / requiredEvaluations) * 100));

  // Auto-progress simulated market evaluations if waiting
  useEffect(() => {
    if (evalCount < requiredEvaluations) {
      const timer = setInterval(() => {
        setEvalCount(prev => {
          const next = prev + 1;
          if (next >= requiredEvaluations) {
            clearInterval(timer);
          }
          return next;
        });
      }, 1200);
      return () => clearInterval(timer);
    }
  }, [evalCount, requiredEvaluations]);

  useEffect(() => {
    if (evalCount >= requiredEvaluations) {
      const timeout = setTimeout(() => {
        onReadyToCompute();
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [evalCount, requiredEvaluations, onReadyToCompute]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="block text-xs font-mono uppercase tracking-widest text-neutral-400">
          Two-Sided Market Equilibrium
        </span>
        <h2 className="text-3xl font-light text-black tracking-tight">
          Matching Market in Progress
        </h2>
        <p className="text-xs font-mono text-neutral-500 max-w-md mx-auto">
          Gale-Shapley requires bilateral preferences. You have ranked your candidates; now the pool is rating your profile.
        </p>
      </div>

      {/* Status Box */}
      <div className="border border-neutral-200 bg-white p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-24 bg-neutral-100 border border-neutral-300 overflow-hidden shrink-0">
            {userProfile.photoUrl ? (
              <Image
                src={userProfile.photoUrl}
                alt={userProfile.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-mono">
                Photo
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-light text-black">{userProfile.name}</h3>
            <p className="text-xs font-mono text-neutral-500">
              Seeking {userProfile.targetGender} • {userProfile.city}
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs font-mono">
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                {userProfile.preferences.length} faces ranked by you
              </span>
            </div>
          </div>
        </div>

        {/* Incoming Ratings Progress */}
        <div className="space-y-3 border-t border-neutral-100 pt-6">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-600 font-semibold flex items-center gap-2">
              {!isSatisfied && <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />}
              {isSatisfied ? 'Market evaluations complete!' : 'Gathering incoming market ratings...'}
            </span>
            <span className="font-bold text-black">
              {evalCount} / {requiredEvaluations} ratings
            </span>
          </div>

          <div className="w-full h-2.5 bg-neutral-100 border border-neutral-200 overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-[11px] font-mono text-neutral-400">
            {isSatisfied
              ? 'All mutual preference vectors captured. Calculating Gale-Shapley equilibrium...'
              : `Waiting for ${requiredEvaluations - evalCount} more market evaluations to calculate stable pairing.`}
          </p>
        </div>

        {/* Action Button */}
        <div className="border-t border-neutral-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-500">
            <ShieldCheck className="w-4 h-4 text-black" />
            <span>Guarantees 0 blocking pairs</span>
          </div>

          <button
            onClick={() => {
              setEvalCount(requiredEvaluations);
              onReadyToCompute();
            }}
            className="w-full sm:w-auto px-6 py-2.5 bg-black text-white text-xs font-mono uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isSatisfied ? 'Reveal My Single Match' : 'Instant Match (Skip Queue)'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
