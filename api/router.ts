import { authRouter } from "./auth-router";
import { verificationRouter } from "./verification-router";
import { guildRouter } from "./guild-router";
import { tokenRouter } from "./token-router";
import { dashboardRouter } from "./dashboard-router";
import { orderRouter } from "./order-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  verification: verificationRouter,
  guild: guildRouter,
  token: tokenRouter,
  dashboard: dashboardRouter,
  order: orderRouter,
});

export type AppRouter = typeof appRouter;
