import { init, id } from "@instantdb/react";
import schema, { AppSchema } from "@/instant.schema";

const APP_ID =
  process.env.NEXT_PUBLIC_INSTANT_APP_ID ||
  "9c207467-cf34-4ed9-a1a5-077ec58ba276";

export const db = init({
  appId: APP_ID,
  schema,
});

export { id };
export type { AppSchema };
