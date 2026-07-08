import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { discordEnv } from "./lib/discord-env";
import {
  exchangeCode,
  getUser,
  addGuildMemberRole,
  getGuildInfo,
} from "./lib/discord-api";
import { getDb } from "./queries/connection";
import { verifications, guilds, tokens } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const verificationRouter = createRouter({
  // Exchange OAuth code and assign role
  exchange: publicQuery
    .input(
      z.object({
        code: z.string(),
        redirectUri: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Exchange code for tokens
        const tokenData = await exchangeCode(input.code, input.redirectUri);
        const { access_token, refresh_token, expires_in, scope } = tokenData;

        // Get user info
        const user = await getUser(access_token);
        const { id, username, avatar, email } = user;

        // Get IP and location info
        let country = "Unknown";
        let isVpn = false;

        // Assign verified role
        let roleGiven = false;
        let roleError = null;

        try {
          await addGuildMemberRole(
            discordEnv.guildId,
            id,
            discordEnv.verifiedRoleId
          );
          roleGiven = true;
        } catch (err: any) {
          roleError = err.message;
          // User might not be in guild yet
        }

        // Store in database
        const db = getDb();

        // Upsert guild info
        try {
          const guildInfo = await getGuildInfo(discordEnv.guildId);
          const existingGuild = await db
            .select()
            .from(guilds)
            .where(eq(guilds.guildId, discordEnv.guildId))
            .limit(1);

          if (existingGuild.length === 0) {
            await db.insert(guilds).values({
              guildId: discordEnv.guildId,
              guildName: guildInfo.name,
              guildIcon: guildInfo.icon
                ? `https://cdn.discordapp.com/icons/${guildInfo.id}/${guildInfo.icon}.png`
                : null,
              ownerId: guildInfo.owner_id,
              memberCount: guildInfo.approximate_member_count || 0,
              verifiedRoleId: discordEnv.verifiedRoleId,
            });
          } else {
            await db
              .update(guilds)
              .set({
                guildName: guildInfo.name,
                guildIcon: guildInfo.icon
                  ? `https://cdn.discordapp.com/icons/${guildInfo.id}/${guildInfo.icon}.png`
                  : null,
                memberCount: guildInfo.approximate_member_count || 0,
              })
              .where(eq(guilds.guildId, discordEnv.guildId));
          }
        } catch (e) {
          // Guild fetch failed, continue
        }

        // Store verification record
        await db.insert(verifications).values({
          discordId: id,
          discordUsername: username,
          discordAvatar: avatar
            ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`
            : null,
          guildId: discordEnv.guildId,
          status: roleGiven ? "success" : "failed",
          country,
          isVpn,
          authCode: input.code,
          accessToken: access_token,
          refreshToken: refresh_token,
          tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
          roleGiven,
          roleGivenAt: roleGiven ? new Date() : undefined,
          verifiedAt: roleGiven ? new Date() : undefined,
        });

        // Store token
        await db.insert(tokens).values({
          token: access_token,
          refreshToken: refresh_token,
          discordId: id,
          discordUsername: username,
          guildId: discordEnv.guildId,
          scopes: scope,
          expiresAt: new Date(Date.now() + expires_in * 1000),
        });

        return {
          success: roleGiven,
          user: {
            id,
            username,
            avatar: avatar
              ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`
              : null,
            email,
          },
          roleGiven,
          roleError,
          redirectChannelId: discordEnv.redirectChannelId,
          guildId: discordEnv.guildId,
        };
      } catch (error: any) {
        console.error("[Verification] Exchange error:", error.response?.data || error.message);
        throw new Error(
          error.response?.data?.error_description || "Verification failed"
        );
      }
    }),

  // Get verification status for a user
  status: publicQuery
    .input(z.object({ discordId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const records = await db
        .select()
        .from(verifications)
        .where(eq(verifications.discordId, input.discordId))
        .orderBy(desc(verifications.createdAt))
        .limit(1);

      if (records.length === 0) {
        return { verified: false };
      }

      const record = records[0];
      return {
        verified: record.status === "success" && record.roleGiven,
        status: record.status,
        roleGiven: record.roleGiven,
        verifiedAt: record.verifiedAt,
        username: record.discordUsername,
      };
    }),

  // Get recent verifications (for dashboard)
  list: publicQuery.query(async () => {
    const db = getDb();
    const records = await db
      .select()
      .from(verifications)
      .orderBy(desc(verifications.createdAt))
      .limit(100);
    return records;
  }),

  // Get verification stats
  stats: publicQuery.query(async () => {
    const db = getDb();
    const all = await db.select().from(verifications);
    const total = all.length;
    const successful = all.filter((v) => v.status === "success").length;
    const failed = all.filter((v) => v.status === "failed").length;
    const rolesGiven = all.filter((v) => v.roleGiven).length;

    return { total, successful, failed, rolesGiven };
  }),

  // Retry role assignment
  retryRole: publicQuery
    .input(z.object({ discordId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const db = getDb();
        const records = await db
          .select()
          .from(verifications)
          .where(eq(verifications.discordId, input.discordId))
          .orderBy(desc(verifications.createdAt))
          .limit(1);

        if (records.length === 0) {
          return { success: false, error: "No verification record found" };
        }

        const record = records[0];

        await addGuildMemberRole(
          discordEnv.guildId,
          input.discordId,
          discordEnv.verifiedRoleId
        );

        await db
          .update(verifications)
          .set({
            roleGiven: true,
            roleGivenAt: new Date(),
            status: "success",
          })
          .where(eq(verifications.id, record.id));

        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }),
});
