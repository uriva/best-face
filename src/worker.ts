import { POST as handleMatch } from "./app/api/match/route.ts";
import { NextRequest } from "./worker/nextServerShim.ts";

type AssetFetcher = {
  fetch: (req: Request) => Promise<Response>;
};

type WorkerEnv = {
  ASSETS?: AssetFetcher;
};

export const worker = {
  fetch: async (req: Request, env: WorkerEnv) => {
    const url = new URL(req.url);
    if (url.pathname === "/api/match" && req.method === "POST") {
      return await handleMatch(
        Object.assign(req, { nextUrl: url }) as unknown as NextRequest,
      );
    }
    if (env.ASSETS) {
      return await env.ASSETS.fetch(req);
    }
    return new Response("Not Found", { status: 404 });
  },
};

export default worker;
