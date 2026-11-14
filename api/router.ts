import { authRouter } from "./auth-router";
import { reportRouter } from "./report-router";
import { accountRouter } from "./account-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  report: reportRouter,
  account: accountRouter,
});

export type AppRouter = typeof appRouter;
