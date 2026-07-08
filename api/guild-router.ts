import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { discordEnv } from "./lib/discord-env";
import {
  getGuildInfo,
  getGuildRoles,
  getGuildMembers,
  addGuildMemberRole,
  removeGuildMemberRole,
} from "./lib/discord-api";
import { getDb } from "./queries/connection";
import { guilds, verifications } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const guildRouter = createRouter({
  // Get guild info from Discord API
  info: publicQuery.query(async () => {
    try {
      const guildInfo = await getGuildInfo(discordEnv.guildId);
      const guildRoles = await getGuildRoles(discordEnv.guildId);
      const guildMembers = await getGuildMembers(discordEnv.guildId, 100);

      // Sync to DB
      const db = getDb();
      const existing = await db
        .select()
        .from(guilds)
        .where(eq(guilds.guildId, discordEnv.guildId))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(guilds).values({
          guildId: discordEnv.guildId,
          guildName: guildInfo.name,
          guildIcon: guildInfo.icon
            ? `https://cdn.discordapp.com/icons/${guildInfo.id}/${guildInfo.icon}.png`
            : null,
          ownerId: guildInfo.owner_id,
          memberCount: guildInfo.approximate_member_count || guildMembers.length,
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
            memberCount:
              guildInfo.approximate_member_count || guildMembers.length,
          })
          .where(eq(guilds.guildId, discordEnv.guildId));
      }

      return {
        success: true,
        guild: {
          id: guildInfo.id,
          name: guildInfo.name,
          icon: guildInfo.icon
            ? `https://cdn.discordapp.com/icons/${guildInfo.id}/${guildInfo.icon}.png`
            : null,
          memberCount: guildInfo.approximate_member_count,
          ownerId: guildInfo.owner_id,
          region: guildInfo.region,
          verificationLevel: guildInfo.verification_level,
        },
        roles: guildRoles.map((r: any) => ({
          id: r.id,
          name: r.name,
          color: r.color,
          position: r.position,
          managed: r.managed,
        })),
        members: guildMembers.map((m: any) => ({
          id: m.user?.id,
          username: m.user?.username,
          avatar: m.user?.avatar
            ? `https://cdn.discordapp.com/avatars/${m.user.id}/${m.user.avatar}.png`
            : null,
          roles: m.roles,
          joinedAt: m.joined_at,
        })),
        verifiedRole: guildRoles.find(
          (r: any) => r.id === discordEnv.verifiedRoleId
        ),
      };
    } catch (error: any) {
      console.error("[Guild] Error fetching guild info:", error.message);
      // Return cached data from DB
      const db = getDb();
      const cached = await db
        .select()
        .from(guilds)
        .where(eq(guilds.guildId, discordEnv.guildId))
        .limit(1);

      if (cached.length > 0) {
        return {
          success: true,
          guild: cached[0],
          roles: [],
          members: [],
          fromCache: true,
        };
      }

      throw new Error(error.message || "Failed to fetch guild info");
    }
  }),

  // Assign role to a member
  assignRole: publicQuery
    .input(z.object({ userId: z.string(), roleId: z.string().optional() }))
    .mutation(async ({ input }) => {
      try {
        const roleId = input.roleId || discordEnv.verifiedRoleId;
        await addGuildMemberRole(discordEnv.guildId, input.userId, roleId);
        return { success: true, message: "Role assigned" };
      } catch (error: any) {
        throw new Error(error.message || "Failed to assign role");
      }
    }),

  // Remove role from a member
  removeRole: publicQuery
    .input(z.object({ userId: z.string(), roleId: z.string().optional() }))
    .mutation(async ({ input }) => {
      try {
        const roleId = input.roleId || discordEnv.verifiedRoleId;
        await removeGuildMemberRole(discordEnv.guildId, input.userId, roleId);
        return { success: true, message: "Role removed" };
      } catch (error: any) {
        throw new Error(error.message || "Failed to remove role");
      }
    }),

  // Get guild stats
  stats: publicQuery.query(async () => {
    const db = getDb();
    const allVerifications = await db
      .select()
      .from(verifications)
      .orderBy(desc(verifications.createdAt));

    const totalVerifications = allVerifications.length;
    const successfulVerifications = allVerifications.filter(
      (v) => v.status === "success"
    ).length;
    const rolesGiven = allVerifications.filter((v) => v.roleGiven).length;

    // Last 24 hours
    const last24h = allVerifications.filter(
      (v) =>
        v.createdAt &&
        new Date(v.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
    );

    // Last 7 days
    const last7d = allVerifications.filter(
      (v) =>
        v.createdAt &&
        new Date(v.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    );

    return {
      totalVerifications,
      successfulVerifications,
      failedVerifications: totalVerifications - successfulVerifications,
      rolesGiven,
      last24h: last24h.length,
      last7d: last7d.length,
      recent: allVerifications.slice(0, 10),
    };
  }),

  // Update guild settings
  updateSettings: publicQuery
    .input(z.object({ settings: z.record(z.string(), z.any()) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(guilds)
        .set({ settings: input.settings })
        .where(eq(guilds.guildId, discordEnv.guildId));
      return { success: true };
    }),
});
