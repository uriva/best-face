import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    faces: i.entity({
      name: i.string(),
      gender: i.string().indexed(), // 'men' | 'women'
      imageUrl: i.string(),
      rating: i.number().indexed(), // Elo rating score
      comparisonsCount: i.number(),
      wins: i.number(),
      losses: i.number(),
      age: i.number().optional(),
      bio: i.string().optional(),
      city: i.string().optional(),
      occupation: i.string().optional(),
      isUser: i.boolean().indexed().optional(),
      userSessionId: i.string().indexed().optional(),
      createdAt: i.number().indexed(),
    }),
    comparisons: i.entity({
      winnerId: i.string().indexed(),
      loserId: i.string().indexed(),
      genderCategory: i.string().indexed(),
      voterSessionId: i.string().indexed(),
      createdAt: i.number().indexed(),
    }),
    userProfiles: i.entity({
      sessionId: i.string().unique().indexed(),
      name: i.string().optional(),
      gender: i.string().indexed(),
      targetGender: i.string().indexed(),
      photoUrl: i.string().optional(),
      preferences: i.any().optional(),
      matchedFaceId: i.string().optional(),
      matchedAt: i.number().optional(),
      createdAt: i.number().indexed(),
    }),
    matches: i.entity({
      userSessionId: i.string().indexed(),
      matchedFaceId: i.string().indexed(),
      stabilityScore: i.number().indexed().optional(),
      rankInUserList: i.number().optional(),
      rankInPartnerList: i.number().optional(),
      explanation: i.string().optional(),
      createdAt: i.number().indexed(),
    }),
  },
  links: {},
  rooms: {},
});

type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
