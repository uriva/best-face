'use client';

import React from 'react';
import { ArrowRight, Sparkles, Upload, Shuffle, Heart, Award } from 'lucide-react';
import { Gender } from '@/lib/types';

interface LandingHeroProps {
  onStart: (targetGender: Gender) => void;
  onOpenGaleShapley: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onStart, onOpenGaleShapley }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-16 sm:space-y-24">
      {/* Hero Header */}
      <div className="space-y-8 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-mono tracking-widest uppercase border border-neutral-200 bg-neutral-50 text-neutral-800">
          <Sparkles className="w-3.5 h-3.5" />
          The Anti-Dating App
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-black leading-[1.1]">
            Find your best match.
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm sm:text-base font-mono text-neutral-600">
            <span className="text-black font-medium">Single match.</span>
            <span className="text-neutral-300">•</span>
            <span>Rate all faces.</span>
            <span className="text-neutral-300">•</span>
            <span className="text-black font-medium">Get your best mutual match.</span>
            <span className="text-neutral-300">•</span>
            <span className="underline decoration-neutral-300 underline-offset-4">Just one match.</span>
          </div>
        </div>

        <p className="text-sm sm:text-base text-neutral-500 font-normal leading-relaxed max-w-xl mx-auto">
          No infinite swiping. No ghosting paralysis. Best Face uses pairwise Elo comparisons 
          and the Nobel Prize–winning Gale-Shapley algorithm to compute the single optimal mutual match.
        </p>

        {/* Start CTAs - Choose gender to rate right away */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onStart('women')}
            className="w-full sm:w-auto px-8 py-3.5 bg-black text-white text-xs font-mono tracking-widest uppercase hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <span>Rate Women</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onStart('men')}
            className="w-full sm:w-auto px-8 py-3.5 bg-white text-black border border-neutral-300 text-xs font-mono tracking-widest uppercase hover:bg-neutral-50 hover:border-black transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Rate Men</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="border-t border-neutral-200 pt-12 sm:pt-16 space-y-10">
        <div className="text-center space-y-2">
          <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">
            The Process
          </p>
          <h2 className="text-2xl sm:text-3xl font-light text-black tracking-tight">
            How it works
          </h2>
          <p className="text-xs font-mono text-neutral-500">
            Three simple steps to mathematically guaranteed mutual compatibility
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="border border-neutral-200 p-6 sm:p-8 space-y-4 bg-white hover:border-neutral-400 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-neutral-400">01</span>
              <Shuffle className="w-4 h-4 text-neutral-700" />
            </div>
            <h3 className="text-lg font-normal text-black">
              Rate faces
            </h3>
            <p className="text-xs leading-relaxed text-neutral-500">
              Start choosing between pairs of faces. Binary pairwise choices reveal your true subconscious preference hierarchy without rating scale fatigue.
            </p>
          </div>

          {/* Step 2 */}
          <div className="border border-neutral-200 p-6 sm:p-8 space-y-4 bg-white hover:border-neutral-400 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-neutral-400">02</span>
              <Upload className="w-4 h-4 text-neutral-700" />
            </div>
            <h3 className="text-lg font-normal text-black">
              Upload your photo
            </h3>
            <p className="text-xs leading-relaxed text-neutral-500">
              Add your portrait and quick profile so the matching market can evaluate mutual preference compatibility between you and candidate faces.
            </p>
          </div>

          {/* Step 3 */}
          <div className="border border-neutral-200 p-6 sm:p-8 space-y-4 bg-white hover:border-neutral-400 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-neutral-400">03</span>
              <Heart className="w-4 h-4 text-neutral-700" />
            </div>
            <h3 className="text-lg font-normal text-black">
              See single best match
            </h3>
            <p className="text-xs leading-relaxed text-neutral-500">
              Gale-Shapley runs in real time to calculate your single stable match where no two people prefer each other over their partners.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenGaleShapley}
                className="text-xs font-mono underline decoration-neutral-300 underline-offset-4 text-black hover:text-neutral-600 inline-flex items-center gap-1 cursor-pointer"
              >
                Learn more: what is Gale–Shapley? →
              </button>
            </div>
          </div>
        </div>

        {/* Footnote statement */}
        <div className="p-4 bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-600">
          <span>
            ⚡ Powered by InstantDB real-time data sync & Deno Next.js
          </span>
          <button
            onClick={() => onStart('women')}
            className="text-black font-semibold uppercase tracking-wider hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            Start now →
          </button>
        </div>
      </div>
    </div>
  );
};
