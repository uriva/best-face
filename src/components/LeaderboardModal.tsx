'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Face, Gender } from '@/lib/types';
import { X, Trophy, ArrowUpDown, Sparkles } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  faces: Face[];
}

export function LeaderboardModal({ isOpen, onClose, faces }: LeaderboardModalProps) {
  const [selectedGender, setSelectedGender] = useState<Gender>('women');

  if (!isOpen) return null;

  const filteredFaces = faces
    .filter(f => f.gender === selectedGender && !f.isUser)
    .sort((a, b) => b.rating - a.rating);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-white border border-neutral-200 shadow-2xl p-6 sm:p-8 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-4 pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-black" />
            <h2 className="text-xl sm:text-2xl font-light text-black tracking-tight">
              Community Faces Elo Leaderboard
            </h2>
          </div>
          <p className="text-xs font-mono text-neutral-500">
            Real-time Elo ratings computed from all pairwise face battles in InstantDB.
          </p>

          <div className="flex items-center gap-1 bg-neutral-100 p-1 border border-neutral-200 text-xs font-mono w-fit">
            <button
              onClick={() => setSelectedGender('women')}
              className={`px-4 py-1 transition-all cursor-pointer ${
                selectedGender === 'women'
                  ? 'bg-white text-black font-semibold shadow-2xs'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              Women
            </button>
            <button
              onClick={() => setSelectedGender('men')}
              className={`px-4 py-1 transition-all cursor-pointer ${
                selectedGender === 'men'
                  ? 'bg-white text-black font-semibold shadow-2xs'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              Men
            </button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="flex-1 overflow-y-auto pt-4 space-y-2">
          {filteredFaces.map((face, index) => {
            const winRate =
              face.comparisonsCount > 0
                ? Math.round((face.wins / face.comparisonsCount) * 100)
                : 50;

            return (
              <div
                key={face.id}
                className="flex items-center justify-between p-3 border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="w-6 font-mono text-xs font-bold text-neutral-400">
                    #{index + 1}
                  </span>

                  <div className="relative w-12 h-14 bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0">
                    <Image
                      src={face.imageUrl}
                      alt={face.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <h4 className="text-sm font-normal text-black">{face.name}</h4>
                    <p className="text-xs font-mono text-neutral-400">
                      {face.age} yrs • {face.city}
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono text-xs space-y-0.5">
                  <div className="font-bold text-black text-sm">{face.rating} Elo</div>
                  <div className="text-neutral-500 text-[11px]">
                    {face.wins}W - {face.losses}L ({winRate}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
