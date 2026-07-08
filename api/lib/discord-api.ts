import axios from "axios";
import { discordEnv } from "./discord-env";

const DISCORD_API = "https://discord.com/api/v10";

export async function exchangeCode(code: string, redirectUri: string) {
  const params = new URLSearchParams();
  params.append("client_id", discordEnv.clientId);
  params.append("client_secret", discordEnv.clientSecret);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", redirectUri);

  const response = await axios.post(`${DISCORD_API}/oauth2/token`, params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return response.data;
}

export async function refreshToken(refreshToken: string) {
  const params = new URLSearchParams();
  params.append("client_id", discordEnv.clientId);
  params.append("client_secret", discordEnv.clientSecret);
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);

  const response = await axios.post(`${DISCORD_API}/oauth2/token`, params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return response.data;
}

export async function getUser(accessToken: string) {
  const response = await axios.get(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
}

export async function getUserGuilds(accessToken: string) {
  const response = await axios.get(`${DISCORD_API}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
}

export async function addGuildMember(
  guildId: string,
  userId: string,
  accessToken: string,
  roles?: string[]
) {
  const response = await axios.put(
    `${DISCORD_API}/guilds/${guildId}/members/${userId}`,
    { access_token: accessToken, roles },
    {
      headers: {
        Authorization: `Bot ${discordEnv.botToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}

export async function addGuildMemberRole(
  guildId: string,
  userId: string,
  roleId: string
) {
  const response = await axios.put(
    `${DISCORD_API}/guilds/${guildId}/members/${userId}/roles/${roleId}`,
    {},
    {
      headers: { Authorization: `Bot ${discordEnv.botToken}` },
    }
  );
  return response.data;
}

export async function removeGuildMemberRole(
  guildId: string,
  userId: string,
  roleId: string
) {
  const response = await axios.delete(
    `${DISCORD_API}/guilds/${guildId}/members/${userId}/roles/${roleId}`,
    {
      headers: { Authorization: `Bot ${discordEnv.botToken}` },
    }
  );
  return response.data;
}

export async function getGuildInfo(guildId: string) {
  const response = await axios.get(`${DISCORD_API}/guilds/${guildId}`, {
    headers: { Authorization: `Bot ${discordEnv.botToken}` },
    params: { with_counts: true },
  });
  return response.data;
}

export async function getGuildRoles(guildId: string) {
  const response = await axios.get(
    `${DISCORD_API}/guilds/${guildId}/roles`,
    {
      headers: { Authorization: `Bot ${discordEnv.botToken}` },
    }
  );
  return response.data;
}

export async function getGuildMembers(guildId: string, limit = 1000) {
  const response = await axios.get(
    `${DISCORD_API}/guilds/${guildId}/members`,
    {
      headers: { Authorization: `Bot ${discordEnv.botToken}` },
      params: { limit },
    }
  );
  return response.data;
}
