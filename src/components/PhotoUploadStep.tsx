'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, Sparkles, User, Camera, ArrowLeft, ArrowRight, Loader2, Check } from 'lucide-react';
import { Gender } from '@/lib/types';

interface PhotoUploadStepProps {
  userGender: Gender;
  targetGender: Gender;
  comparisonsCount: number;
  isComputing: boolean;
  onBack: () => void;
  onSubmit: (profile: {
    name: string;
    photoUrl: string;
    age?: number;
    city?: string;
    bio?: string;
  }) => Promise<unknown>;
}

const SAMPLE_AVATARS: Record<Gender, string[]> = {
  men: [
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  ],
  women: [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
  ],
};

export function PhotoUploadStep({
  userGender,
  targetGender,
  comparisonsCount,
  isComputing,
  onBack,
  onSubmit,
}: PhotoUploadStepProps) {
  const [photoUrl, setPhotoUrl] = useState<string>(SAMPLE_AVATARS[userGender][0]);
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<string>('26');
  const [city, setCity] = useState<string>('New York');
  const [bio, setBio] = useState<string>('Looking for my single optimal mutual match.');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
        setError('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!photoUrl) {
      setError('Please upload or select a photo.');
      return;
    }

    setError('');
    await onSubmit({
      name: name.trim(),
      photoUrl,
      age: parseInt(age) || 26,
      city: city.trim() || 'Global',
      bio: bio.trim(),
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">
      {/* Step Header */}
      <div className="space-y-2 text-center">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-500 hover:text-black mb-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to rating
        </button>

        <span className="block text-xs font-mono uppercase tracking-widest text-neutral-400">
          Step 2 of 3 • Profile Setup
        </span>
        <h2 className="text-3xl font-light text-black tracking-tight">
          Upload your photo
        </h2>
        <p className="text-xs font-mono text-neutral-500 max-w-md mx-auto">
          The Gale-Shapley matching market requires your photo and profile to compute your mutual equilibrium match.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="border border-neutral-200 p-6 sm:p-8 bg-white space-y-8">
        {/* Photo Upload Area */}
        <div className="space-y-4">
          <label className="block text-xs font-mono uppercase tracking-wider font-semibold text-black">
            Your Portrait
          </label>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-32 h-40 bg-neutral-100 border border-neutral-300 overflow-hidden shrink-0 group">
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt="Your portrait"
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                  <User className="w-8 h-8" />
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-[10px] font-mono cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                Change
              </button>
            </div>

            <div className="space-y-3 flex-1 text-center sm:text-left">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 hover:border-black text-xs font-mono uppercase tracking-wider text-black bg-white hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Photo from Device
              </button>

              <div className="space-y-1">
                <span className="text-[11px] font-mono text-neutral-400 block">
                  Or pick a sample avatar:
                </span>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  {SAMPLE_AVATARS[userGender].map((avatar, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoUrl(avatar)}
                      className={`relative w-9 h-9 border overflow-hidden cursor-pointer ${
                        photoUrl === avatar
                          ? 'border-black ring-1 ring-black'
                          : 'border-neutral-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={avatar}
                        alt={`Sample ${idx + 1}`}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-neutral-100 pt-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-neutral-600">
              Your Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full px-3 py-2 border border-neutral-300 text-sm focus:outline-none focus:border-black font-light"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-neutral-600">
              Age
            </label>
            <input
              type="number"
              value={age}
              onChange={e => setAge(e.target.value)}
              min={18}
              max={99}
              className="w-full px-3 py-2 border border-neutral-300 text-sm focus:outline-none focus:border-black font-light"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-neutral-600">
              City / Location
            </label>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="e.g. San Francisco / Remote"
              className="w-full px-3 py-2 border border-neutral-300 text-sm focus:outline-none focus:border-black font-light"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-neutral-600">
              Target Match Gender
            </label>
            <div className="w-full px-3 py-2 border border-neutral-200 bg-neutral-50 text-xs font-mono text-neutral-600 uppercase">
              {targetGender}
            </div>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-xs font-mono uppercase text-neutral-600">
              Short Bio / Vibe
            </label>
            <input
              type="text"
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="What are you about?"
              className="w-full px-3 py-2 border border-neutral-300 text-sm focus:outline-none focus:border-black font-light"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-xs font-mono text-red-600">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="border-t border-neutral-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-mono text-neutral-500">
            Based on <span className="text-black font-bold">{comparisonsCount} pairwise ratings</span>
          </div>

          <button
            type="submit"
            disabled={isComputing}
            className="w-full sm:w-auto px-8 py-3.5 bg-black text-white text-xs font-mono tracking-widest uppercase hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isComputing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Gale–Shapley...</span>
              </>
            ) : (
              <>
                <span>Calculate Single Best Match</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
