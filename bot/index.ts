import { Client, GatewayIntentBits, REST, Routes, GuildMember, Role } from "discord.js";
import express from "express";
import cors from "cors";
import "dotenv/config";

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || "";
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || "";
const GUILD_ID = process.env.DISCORD_GUILD_ID || "";
const VERIFIED_ROLE_ID = process.env.DISCORD_VERIFIED_ROLE_ID || "";

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Express API for the bot
const app = express();
app.use(cors());
app.use(express.json());

let botReady = false;

client.once("ready", async () => {
  console.log(`[BOT] Logged in as ${client.user?.tag}`);
  botReady = true;

  // Register slash commands
  const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);
  const commands = [
    {
      name: "verify",
      description: "Get your verification link",
    },
    {
      name: "ping",
      description: "Check bot status",
    },
  ];

  try {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log("[BOT] Slash commands registered");
  } catch (err) {
    console.error("[BOT] Failed to register commands:", err);
  }
});

// Handle slash commands
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply({
      content: "Bot is online! All systems operational.",
      ephemeral: true,
    });
  }

  if (interaction.commandName === "verify") {
    const verifyUrl = `${process.env.WEB_URL || "https://get-perks.vercel.app"}/verify`;
    await interaction.reply({
      content: `Click here to verify: ${verifyUrl}`,
      ephemeral: true,
    });
  }
});

// API endpoint to assign role
app.post("/bot/assign-role", async (req, res) => {
  const { userId, guildId = GUILD_ID, roleId = VERIFIED_ROLE_ID } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, error: "userId is required" });
  }

  if (!botReady) {
    return res.status(503).json({ success: false, error: "Bot is not ready yet" });
  }

  try {
    const guild = await client.guilds.fetch(guildId);
    if (!guild) {
      return res.status(404).json({ success: false, error: "Guild not found" });
    }

    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) {
      return res.status(404).json({
        success: false,
        error: "User is not in the server. Please join first!",
      });
    }

    const role = await guild.roles.fetch(roleId);
    if (!role) {
      return res.status(404).json({ success: false, error: "Role not found" });
    }

    // Check if member already has the role
    if (member.roles.cache.has(roleId)) {
      return res.json({
        success: true,
        message: "User already has the verified role",
        alreadyHadRole: true,
      });
    }

    await member.roles.add(roleId);
    console.log(`[BOT] Assigned role ${role.name} to ${member.user.tag}`);

    return res.json({
      success: true,
      message: `Role assigned successfully`,
      roleName: role.name,
      alreadyHadRole: false,
    });
  } catch (error: any) {
    console.error("[BOT] Error assigning role:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to assign role",
    });
  }
});

// API endpoint to remove role
app.post("/bot/remove-role", async (req, res) => {
  const { userId, guildId = GUILD_ID, roleId = VERIFIED_ROLE_ID } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, error: "userId is required" });
  }

  try {
    const guild = await client.guilds.fetch(guildId);
    const member = await guild.members.fetch(userId);
    await member.roles.remove(roleId);
    return res.json({ success: true, message: "Role removed" });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to check if user has role
app.get("/bot/check-role", async (req, res) => {
  const { userId, guildId = GUILD_ID, roleId = VERIFIED_ROLE_ID } = req.query as any;

  if (!userId) {
    return res.status(400).json({ success: false, error: "userId is required" });
  }

  try {
    const guild = await client.guilds.fetch(guildId);
    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) {
      return res.json({ inGuild: false, hasRole: false });
    }
    const hasRole = member.roles.cache.has(roleId);
    return res.json({ inGuild: true, hasRole, username: member.user.tag });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to get guild info
app.get("/bot/guild-info", async (req, res) => {
  if (!botReady) {
    return res.status(503).json({ error: "Bot not ready" });
  }

  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    const roles = await guild.roles.fetch();
    const members = await guild.members.fetch();

    return res.json({
      success: true,
      guild: {
        id: guild.id,
        name: guild.name,
        icon: guild.iconURL(),
        memberCount: guild.memberCount,
        ownerId: guild.ownerId,
      },
      roles: roles.map((r) => ({
        id: r.id,
        name: r.name,
        color: r.color,
        position: r.position,
      })),
      members: members.map((m) => ({
        id: m.id,
        username: m.user.tag,
        avatar: m.user.displayAvatarURL(),
        roles: Array.from(m.roles.cache.keys()),
        joinedAt: m.joinedAt,
      })),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Bot status endpoint
app.get("/bot/status", (req, res) => {
  res.json({
    ready: botReady,
    user: client.user
      ? { tag: client.user.tag, id: client.user.id }
      : null,
    guilds: client.guilds.cache.size,
    uptime: client.uptime,
  });
});

// Keep-alive endpoint for uptime services
app.get("/keep-alive", (req, res) => {
  res.json({ status: "alive", timestamp: Date.now() });
});

// Error handling
client.on("error", (err) => {
  console.error("[BOT] Discord client error:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("[BOT] Unhandled rejection:", err);
});

// Start
const PORT = process.env.BOT_PORT || 3001;
app.listen(PORT, () => {
  console.log(`[BOT] API server running on port ${PORT}`);
});

client.login(BOT_TOKEN);
