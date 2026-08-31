'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, Camera, ArrowLeft, ArrowRight, Loader2, User, AlertCircle } from 'lucide-react';
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

export function PhotoUploadStep({
  userGender,
  targetGender,
  comparisonsCount,
  isComputing,
  onBack,
  onSubmit,
}: PhotoUploadStepProps) {
  const [photoUrl, setPhotoUrl] = useState<string>('');
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
      setError('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image is too large. Please upload an image under 10MB.');
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
    if (!photoUrl) {
      setError('Please upload your photo to join the matching market.');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your name.');
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
          To enter the matching market and compute your mutual equilibrium match, please upload your real portrait.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="border border-neutral-200 p-6 sm:p-8 bg-white space-y-8">
        {/* Photo Upload Area */}
        <div className="space-y-3">
          <label className="block text-xs font-mono uppercase tracking-wider font-semibold text-black">
            Your Photo *
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleFileUpload}
            className="hidden"
          />

          {photoUrl ? (
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 border border-neutral-200 bg-neutral-50">
              <div className="relative w-32 h-40 bg-neutral-200 border border-neutral-300 overflow-hidden shrink-0">
                <Image
                  src={photoUrl}
                  alt="Your portrait"
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <p className="text-xs font-mono text-emerald-700 font-semibold flex items-center justify-center sm:justify-start gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Photo uploaded successfully
                </p>
                <p className="text-xs text-neutral-500 font-mono">
                  Your photo is ready for mutual evaluation in the matchmaking market.
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 text-xs font-mono text-black hover:bg-white transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Change photo
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-300 hover:border-black p-8 sm:p-12 text-center cursor-pointer transition-colors space-y-3 bg-neutral-50 hover:bg-neutral-100/50"
            >
              <div className="w-12 h-12 mx-auto bg-white border border-neutral-200 flex items-center justify-center text-neutral-600">
                <Upload className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-black">
                  Click to upload your photo or take a picture
                </p>
                <p className="text-xs font-mono text-neutral-400">
                  PNG, JPG, or WebP up to 10MB
                </p>
              </div>
            </div>
          )}
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
              placeholder="e.g. Alex"
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
              placeholder="e.g. New York, Berlin, Tokyo"
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
              placeholder="What are you passionate about?"
              className="w-full px-3 py-2 border border-neutral-300 text-sm focus:outline-none focus:border-black font-light"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-xs font-mono text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
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
                <span>Computing Market Matches...</span>
              </>
            ) : (
              <>
                <span>Enter Matching Market</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
