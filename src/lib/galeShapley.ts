import { Face, GaleShapleyResult, GaleShapleyStep, UserProfile } from './types';

/**
 * Generates synthetic preference lists for the pool faces if they don't have explicit ones.
 * The user's preferences are strictly derived from their pairwise comparison ratings / choices.
 */
export function generateSyntheticPreferences(
  candidateFaces: Face[],
  oppositeFaces: Face[],
  userFace: Face,
  userPreferences: string[]
): {
  proposerPreferences: Record<string, string[]>;
  receiverPreferences: Record<string, string[]>;
  allProposers: Face[];
  allReceivers: Face[];
} {
  // Proposers: user + opposite faces of user's gender
  // Receivers: target faces that user rated
  const allProposers: Face[] = [userFace, ...oppositeFaces.filter(f => f.id !== userFace.id)];
  const allReceivers: Face[] = [...candidateFaces];

  const proposerPreferences: Record<string, string[]> = {};
  const receiverPreferences: Record<string, string[]> = {};

  // User's preferences are strictly the rated order, followed by any remaining candidates by rating
  const userFullList: string[] = [
    ...userPreferences.filter(id => allReceivers.some(r => r.id === id)),
    ...allReceivers
      .filter(r => !userPreferences.includes(r.id))
      .sort((a, b) => b.rating - a.rating)
      .map(r => r.id),
  ];
  proposerPreferences[userFace.id] = userFullList;

  // For other proposers, generate preferences based on receiver ratings with some individual noise/personality
  for (const proposer of allProposers) {
    if (proposer.id === userFace.id) continue;
    // Deterministic pseudo-random seed based on proposer ID
    const seed = proposer.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const sorted = [...allReceivers].sort((a, b) => {
      const scoreA = a.rating + ((seed * 17 + a.rating) % 150) - 75;
      const scoreB = b.rating + ((seed * 31 + b.rating) % 150) - 75;
      return scoreB - scoreA;
    });
    proposerPreferences[proposer.id] = sorted.map(r => r.id);
  }

  // For receivers, generate preferences over proposers
  for (const receiver of allReceivers) {
    const seed = receiver.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const sorted = [...allProposers].sort((a, b) => {
      // If comparing user with others, user gets evaluated with competitive score based on their profile
      const ratingA = a.id === userFace.id ? userFace.rating : a.rating;
      const ratingB = b.id === userFace.id ? userFace.rating : b.rating;
      const scoreA = ratingA + ((seed * 13 + ratingA) % 120) - 60;
      const scoreB = ratingB + ((seed * 23 + ratingB) % 120) - 60;
      return scoreB - scoreA;
    });
    receiverPreferences[receiver.id] = sorted.map(p => p.id);
  }

  return { proposerPreferences, receiverPreferences, allProposers, allReceivers };
}

/**
 * Runs the Gale-Shapley (Deferred Acceptance) algorithm and returns the full audit trace.
 */
export function runGaleShapley(
  userProfile: UserProfile,
  userFace: Face,
  candidateFaces: Face[],
  oppositeFaces: Face[]
): GaleShapleyResult {
  const { proposerPreferences, receiverPreferences, allProposers, allReceivers } =
    generateSyntheticPreferences(candidateFaces, oppositeFaces, userFace, userProfile.preferences);

  const proposerMap = new Map(allProposers.map(p => [p.id, p]));
  const receiverMap = new Map(allReceivers.map(r => [r.id, r]));

  // Index of next proposal for each proposer
  const nextProposalIndex: Record<string, number> = {};
  for (const p of allProposers) {
    nextProposalIndex[p.id] = 0;
  }

  // Current tentative matches: receiverId -> proposerId
  const receiverMatches: Record<string, string> = {};
  // Current matches: proposerId -> receiverId
  const proposerMatches: Record<string, string> = {};

  // Unmatched proposers queue
  const freeProposers: string[] = allProposers.map(p => p.id);

  const steps: GaleShapleyStep[] = [];
  let round = 1;
  const maxRounds = allProposers.length * allReceivers.length * 2;

  while (freeProposers.length > 0 && round < maxRounds) {
    const proposerId = freeProposers.shift()!;
    const prefs = proposerPreferences[proposerId] || [];
    const propIndex = nextProposalIndex[proposerId];

    if (propIndex >= prefs.length) {
      // Proposer has proposed to everyone
      continue;
    }

    const receiverId = prefs[propIndex];
    nextProposalIndex[proposerId] = propIndex + 1;

    const proposerObj = proposerMap.get(proposerId);
    const receiverObj = receiverMap.get(receiverId);
    const proposerName = proposerObj ? proposerObj.name : proposerId;
    const receiverName = receiverObj ? receiverObj.name : receiverId;

    const currentPartnerId = receiverMatches[receiverId];

    if (!currentPartnerId) {
      // Receiver is free, accepts tentatively
      receiverMatches[receiverId] = proposerId;
      proposerMatches[proposerId] = receiverId;

      steps.push({
        round,
        proposerId,
        proposerName,
        receiverId,
        receiverName,
        action: 'tentatively_accept',
        reason: `${receiverName} was free and accepted proposal from ${proposerName}.`,
      });
    } else {
      // Receiver compares current partner with new proposer
      const receiverPrefs = receiverPreferences[receiverId] || [];
      const currentRank = receiverPrefs.indexOf(currentPartnerId);
      const newRank = receiverPrefs.indexOf(proposerId);

      const currentPartnerObj = proposerMap.get(currentPartnerId);
      const currentPartnerName = currentPartnerObj ? currentPartnerObj.name : currentPartnerId;

      if (newRank !== -1 && (currentRank === -1 || newRank < currentRank)) {
        // Receiver prefers the new proposer!
        receiverMatches[receiverId] = proposerId;
        proposerMatches[proposerId] = receiverId;
        delete proposerMatches[currentPartnerId];

        // Previous partner is now free
        freeProposers.push(currentPartnerId);

        steps.push({
          round,
          proposerId,
          proposerName,
          receiverId,
          receiverName,
          action: 'accept',
          reason: `${receiverName} ranked ${proposerName} higher than current match ${currentPartnerName}, switching match.`,
        });
      } else {
        // Receiver rejects new proposer
        freeProposers.push(proposerId);

        steps.push({
          round,
          proposerId,
          proposerName,
          receiverId,
          receiverName,
          action: 'reject',
          reason: `${receiverName} prefers current match ${currentPartnerName} and politely rejected ${proposerName}.`,
        });
      }
    }

    round++;
  }

  // Find user's match
  const userMatchedId = proposerMatches[userFace.id];
  const userMatch = userMatchedId ? receiverMap.get(userMatchedId) || null : null;

  // Calculate mutual ranks
  let userRankForPartner = 1;
  let partnerRankForUser = 1;

  if (userMatchedId) {
    const uPrefs = proposerPreferences[userFace.id] || [];
    const rPrefs = receiverPreferences[userMatchedId] || [];
    userRankForPartner = uPrefs.indexOf(userMatchedId) + 1;
    partnerRankForUser = rPrefs.indexOf(userFace.id) + 1;
    if (userRankForPartner === 0) userRankForPartner = 1;
    if (partnerRankForUser === 0) partnerRankForUser = 1;
  }

  // Stability score (100% because Gale-Shapley is guaranteed to find a stable matching)
  const stabilityScore = 100;

  return {
    matches: proposerMatches,
    userMatch,
    userRankForPartner,
    partnerRankForUser,
    stabilityScore,
    steps,
    totalRounds: round,
  };
}
