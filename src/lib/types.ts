export type Gender = 'men' | 'women';

export interface Face {
  id: string;
  name: string;
  gender: Gender;
  imageUrl: string;
  rating: number; // Elo score (starts at 1500)
  comparisonsCount: number;
  wins: number;
  losses: number;
  age?: number;
  bio?: string;
  city?: string;
  occupation?: string;
  isUser?: boolean;
  userSessionId?: string;
  createdAt: number;
}

export interface Comparison {
  id: string;
  winnerId: string;
  loserId: string;
  genderCategory: Gender;
  voterSessionId: string;
  createdAt: number;
}

export interface UserProfile {
  sessionId: string;
  name: string;
  gender: Gender;
  targetGender: Gender;
  photoUrl: string;
  age?: number;
  bio?: string;
  city?: string;
  preferences: string[]; // Ordered list of face IDs from most preferred to least preferred
  matchedFaceId?: string;
  matchedAt?: number;
  createdAt: number;
}

export interface GaleShapleyStep {
  round: number;
  proposerId: string;
  proposerName: string;
  receiverId: string;
  receiverName: string;
  action: 'propose' | 'accept' | 'reject' | 'tentatively_accept';
  reason: string;
}

export interface GaleShapleyResult {
  matches: Record<string, string>; // Proposer ID -> Receiver ID
  userMatch: Face | null;
  userRankForPartner: number;
  partnerRankForUser: number;
  stabilityScore: number;
  steps: GaleShapleyStep[];
  totalRounds: number;
}
