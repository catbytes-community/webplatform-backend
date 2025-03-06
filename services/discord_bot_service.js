const { discordBot } = require('../discordBot.js');
const userService = require('../services/user_service');
const repo = require('../repositories/discord_bot_repository');

async function generateInviteLink(userId) {
  try {
    const guild = await getGuild(discordBot.discordClient, discordBot.guildId);
    const channel = await getChannel(guild, discordBot.channelId);
    const invite = await createInvite(channel); 
    if (userId !== null) {
      const user = await getUser(userId);
      await checkRestrictionsOnGenerateLink(user, guild);
      await repo.saveInviteInDB(userId, invite.url); 
    }
    return invite.url;
  }
  catch (error) {
    console.error('Failed to generate invite:', error.message);
    throw error; 
  }
}

async function checkRestrictionsOnGenerateLink(user, guild) {
  try {
    await validateUserNotOnServer(guild, user.discord_nickname) && await checkCooldown(user.id);
  }
  catch (error) {
    console.error('Failed to generate invite:', error.message);
    throw error;
  }
 
}

async function getGuild(discordClient, guildId) {
  const guild = discordClient.guilds.cache.get(guildId);
  if (!guild) {
    throw new Error(`Guild with ID ${guildId} not found.`);
  }
  return guild;
}

async function getChannel(guild, channelId) {
  const channel = guild.channels.cache.get(channelId);
  if (!channel) {
    throw new Error(`Channel with ID ${channelId} not found in guild ${guild.name}.`);
  }
  return channel;
}

async function checkCooldown(userId) {
  const lastInviteTime = await repo.getLastInviteTime(userId);

  if (lastInviteTime) {
    const cooldownDate = new Date(lastInviteTime);
    cooldownDate.setDate(cooldownDate.getDate() + 7); // Add 7 days to the last invite time

    const currentDate = new Date();
    if (currentDate < cooldownDate) {
      const error = new Error('Invite generation is on cooldown for this user');
      error.status = 403;
      throw error;
    }
  }

  return true; // no cooldown or cooldown has expired
}

async function getUser(userId) {
  const user = userService.getUserById(userId);
  if (!user) throw new Error('User not found');
  return user;
}

async function validateUserNotOnServer(guild, username) {
  await guild.members.fetch(); 
  const member = guild.members.cache.find(member => member.user.username === username);
  if (member) {
    const error = new Error('This user already exists on the server');
    error.status = 400;
    throw error;
  }
  return true;  //no user with this username on the server
}

async function createInvite(channel) {
  return await channel.createInvite({
    maxAge: 7 * 24 * 3600,
    maxUses: 1,
    unique: true,
  });
}

module.exports = { generateInviteLink };