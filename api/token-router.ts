import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { tokens } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { refreshToken } from "./lib/discord-api";

export const tokenRouter = createRouter({
  // List all tokens
  list: publicQuery.query(async () => {
    const db = getDb();
    const all = await db
      .select()
      .from(tokens)
      .orderBy(desc(tokens.createdAt));
    return all;
  }),

  // Get token by discord ID
  getByDiscordId: publicQuery
    .input(z.object({ discordId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const records = await db
        .select()
        .from(tokens)
        .where(eq(tokens.discordId, input.discordId))
        .orderBy(desc(tokens.createdAt))
        .limit(1);
      return records[0] || null;
    }),

  // Refresh a token
  refresh: publicQuery
    .input(z.object({ discordId: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const records = await db
        .select()
        .from(tokens)
        .where(eq(tokens.discordId, input.discordId))
        .orderBy(desc(tokens.createdAt))
        .limit(1);

      if (records.length === 0) {
        return { success: false, error: "No token found" };
      }

      const record = records[0];
      if (!record.refreshToken) {
        return { success: false, error: "No refresh token available" };
      }

      try {
        const newTokenData = await refreshToken(record.refreshToken);

        await db
          .update(tokens)
          .set({
            token: newTokenData.access_token,
            refreshToken: newTokenData.refresh_token || record.refreshToken,
            scopes: newTokenData.scope,
            expiresAt: new Date(Date.now() + newTokenData.expires_in * 1000),
            lastUsedAt: new Date(),
          })
          .where(eq(tokens.id, record.id));

        return { success: true, token: newTokenData };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }),

  // Revoke a token
  revoke: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(tokens)
        .set({ isRevoked: true })
        .where(eq(tokens.id, input.id));
      return { success: true };
    }),

  // Delete a token
  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(tokens).where(eq(tokens.id, input.id));
      return { success: true };
    }),

  // Get token stats
  stats: publicQuery.query(async () => {
    const db = getDb();
    const all = await db.select().from(tokens);
    const total = all.length;
    const revoked = all.filter((t) => t.isRevoked).length;
    const expired = all.filter(
      (t) => t.expiresAt && new Date(t.expiresAt) < new Date()
    ).length;
    const active = total - revoked - expired;

    return { total, active, revoked, expired };
  }),
});
