import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { verifications, tokens, orders } from "@db/schema";
import { desc } from "drizzle-orm";
import { discordEnv } from "./lib/discord-env";

export const dashboardRouter = createRouter({
  // Dashboard login
  login: publicQuery
    .input(z.object({ password: z.string(), type: z.enum(["dashboard", "admin"]) }))
    .mutation(async ({ input }) => {
      const validPassword =
        input.type === "admin"
          ? discordEnv.adminPassword
          : discordEnv.dashboardPassword;

      if (input.password === validPassword) {
        return {
          success: true,
          token: `perks_${input.type}_${Date.now()}`,
          type: input.type,
        };
      }
      return { success: false, error: "Invalid password" };
    }),

  // Verify dashboard token
  verifyToken: publicQuery
    .input(z.object({ token: z.string(), type: z.enum(["dashboard", "admin"]) }))
    .query(async ({ input }) => {
      const prefix = `perks_${input.type}_`;
      if (input.token.startsWith(prefix)) {
        const timestamp = parseInt(input.token.replace(prefix, ""));
        // Token valid for 30 days
        if (Date.now() - timestamp < 30 * 24 * 60 * 60 * 1000) {
          return { valid: true, type: input.type };
        }
      }
      return { valid: false };
    }),

  // Get overview stats
  overview: publicQuery.query(async () => {
    const db = getDb();
    const allVerifications = await db
      .select()
      .from(verifications)
      .orderBy(desc(verifications.createdAt));

    const allOrders = await db.select().from(orders);
    const allTokens = await db.select().from(tokens);

    const totalVerifications = allVerifications.length;
    const successfulVerifications = allVerifications.filter(
      (v) => v.status === "success"
    ).length;
    const rolesGiven = allVerifications.filter((v) => v.roleGiven).length;

    const last24h = allVerifications.filter(
      (v) =>
        v.createdAt &&
        new Date(v.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
    );

    const last7d = allVerifications.filter(
      (v) =>
        v.createdAt &&
        new Date(v.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    );

    return {
      verifications: {
        total: totalVerifications,
        successful: successfulVerifications,
        failed: totalVerifications - successfulVerifications,
        rolesGiven,
        last24h: last24h.length,
        last7d: last7d.length,
      },
      orders: {
        total: allOrders.length,
        pending: allOrders.filter((o) => o.orderStatus === "pending").length,
        completed: allOrders.filter((o) => o.orderStatus === "completed").length,
      },
      tokens: {
        total: allTokens.length,
        active: allTokens.filter((t) => !t.isRevoked).length,
        revoked: allTokens.filter((t) => t.isRevoked).length,
      },
      recentVerifications: allVerifications.slice(0, 20),
      recentOrders: allOrders
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        )
        .slice(0, 10),
    };
  }),
});
