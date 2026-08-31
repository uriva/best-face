'use client';

import React from 'react';
import { Sparkles, RotateCcw, BarChart3, HelpCircle } from 'lucide-react';

interface NavbarProps {
  onOpenGaleShapley: () => void;
  onOpenLeaderboard: () => void;
  onReset: () => void;
  onGoHome: () => void;
  comparisonsCount: number;
}

export function Navbar({
  onOpenGaleShapley,
  onOpenLeaderboard,
  onReset,
  onGoHome,
  comparisonsCount,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
        >
          <div className="w-6 h-6 border border-black flex items-center justify-center font-mono font-bold text-xs bg-black text-white group-hover:bg-neutral-800 transition-colors">
            BF
          </div>
          <span className="font-mono text-sm tracking-widest uppercase font-semibold text-black">
            Best Face
          </span>
        </button>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-4">
          {comparisonsCount > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono border border-neutral-200 text-neutral-600 bg-neutral-50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{comparisonsCount} Rated</span>
            </div>
          )}

          <button
            onClick={onOpenLeaderboard}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-neutral-700 hover:text-black hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Faces Elo
          </button>

          <button
            onClick={onOpenGaleShapley}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-neutral-700 hover:text-black hover:bg-neutral-50 border border-neutral-200 transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Gale–Shapley
          </button>

          {comparisonsCount > 0 && (
            <button
              onClick={onReset}
              title="Reset session"
              className="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-100 border border-neutral-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
