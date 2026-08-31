'use client';

import React from 'react';
import { X, Sparkles, Award, ShieldCheck, ArrowRight } from 'lucide-react';

interface GaleShapleyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GaleShapleyModal({ isOpen, onClose }: GaleShapleyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white border border-neutral-200 rounded-none shadow-2xl p-6 sm:p-10 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono tracking-wider uppercase border border-neutral-200 bg-neutral-50 text-neutral-800">
              <Award className="w-3.5 h-3.5" />
              Nobel Prize 2012
            </div>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-black">
              The Gale–Shapley Algorithm
            </h2>
            <p className="text-sm font-mono text-neutral-500">
              Stable Marriage Problem • Deferred Acceptance Algorithm
            </p>
          </div>

          <div className="border-t border-neutral-100 pt-4 space-y-4 text-sm leading-relaxed text-neutral-700 font-normal">
            <p>
              In 1962, mathematicians <strong>David Gale</strong> and <strong>Lloyd Shapley</strong> proved 
              a mathematical breakthrough: in any matching market with two equal sets of participants 
              who each have ranked preferences, there <em>always exists</em> at least one <strong>Stable Matching</strong>.
            </p>

            <div className="p-4 bg-neutral-50 border border-neutral-200 space-y-2">
              <span className="font-mono text-xs font-semibold uppercase text-black flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-neutral-900" />
                Definition of Stability
              </span>
              <p className="text-xs text-neutral-600">
                A matching is considered <strong>strictly stable</strong> if there are no two individuals 
                who would both prefer each other over their assigned partners. No &quot;blocking pairs&quot; exist. 
                Nobody has an incentive to stray.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-black">
                Why swipe apps fail vs. Best Face
              </h3>
              <ul className="space-y-2 text-xs text-neutral-600">
                <li className="flex items-start gap-2">
                  <span className="text-black font-mono font-bold">•</span>
                  <span><strong>Tinder/Bumble Model:</strong> Everyone swipes right on the top 5% of profiles. 99% of conversations lead nowhere because human attention is diluted across dozens of matches simultaneously.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black font-mono font-bold">•</span>
                  <span><strong>Best Face Model:</strong> Through pairwise comparisons, your actual preferences are mathematically ordered into a true ranked list. Gale-Shapley allocates <strong>exactly one optimal mutual match</strong>.</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-black">
                How the rounds work
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-3 border border-neutral-200 bg-white">
                  <span className="block font-bold text-black mb-1">1. Propose</span>
                  Each free participant proposes to their highest-ranked preference.
                </div>
                <div className="p-3 border border-neutral-200 bg-white">
                  <span className="block font-bold text-black mb-1">2. Defer</span>
                  Receivers hold their favorite proposal and reject worse candidates.
                </div>
                <div className="p-3 border border-neutral-200 bg-white">
                  <span className="block font-bold text-black mb-1">3. Converge</span>
                  Rejected candidates propose down their list until a stable equilibrium is reached.
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-6 flex justify-end">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white text-xs font-mono tracking-widest uppercase hover:bg-neutral-800 transition-colors"
            >
              Got it
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
