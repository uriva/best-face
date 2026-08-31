import { NextRequest, NextResponse } from 'next/server';
import { runGaleShapley } from '@/lib/galeShapley';
import { INITIAL_CURATED_FACES } from '@/lib/curatedFaces';
import { Face, UserProfile } from '@/lib/types';

export const MIN_USER_RANKINGS = 10;
export const MIN_INCOMING_RANKINGS = 5;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userProfile,
      userFace,
      communityFaces,
      incomingRankingsCount = 0,
      forceSimulation = false,
    } = body as {
      userProfile: UserProfile;
      userFace: Face;
      communityFaces?: Face[];
      incomingRankingsCount?: number;
      forceSimulation?: boolean;
    };

    if (!userProfile || !userFace) {
      return NextResponse.json(
        { error: 'Missing userProfile or userFace' },
        { status: 400 }
      );
    }

    const userRankingsCount = userProfile.preferences ? userProfile.preferences.length : 0;

    // Check condition 1: Has user ranked enough faces?
    if (userRankingsCount < MIN_USER_RANKINGS && !forceSimulation) {
      return NextResponse.json({
        status: 'insufficient_user_rankings',
        userRankingsCount,
        requiredUserRankings: MIN_USER_RANKINGS,
        message: `You have completed ${userRankingsCount}/${MIN_USER_RANKINGS} rankings. Complete ${MIN_USER_RANKINGS - userRankingsCount} more to unlock matching.`,
      });
    }

    // Check condition 2: Has enough of the community ranked the user?
    const currentIncoming = incomingRankingsCount || userFace.comparisonsCount || 0;
    if (currentIncoming < MIN_INCOMING_RANKINGS && !forceSimulation) {
      return NextResponse.json({
        status: 'pending_incoming_rankings',
        incomingRankingsCount: currentIncoming,
        requiredIncomingRankings: MIN_INCOMING_RANKINGS,
        message: `Your face is in the matching pool. ${currentIncoming}/${MIN_INCOMING_RANKINGS} market evaluations completed.`,
      });
    }

    // Pool of faces
    const allFaces = communityFaces && communityFaces.length > 0 ? communityFaces : INITIAL_CURATED_FACES;
    const candidateFaces = allFaces.filter(f => f.gender === userProfile.targetGender && !f.isUser);
    const oppositeFaces = allFaces.filter(f => f.gender === userProfile.gender && !f.isUser);

    // Compute Gale-Shapley Stable Marriage on the server
    const result = runGaleShapley(
      userProfile,
      userFace,
      candidateFaces,
      oppositeFaces
    );

    return NextResponse.json({
      status: 'matched',
      result,
      userProfile,
      matchedAt: Date.now(),
    });
  } catch (error) {
    console.error('Error computing match in backend:', error);
    return NextResponse.json(
      { error: 'Failed to compute Gale-Shapley match', details: (error as Error).message },
      { status: 500 }
    );
  }
}
