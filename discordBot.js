const { Client, GatewayIntentBits } = require('discord.js');
const { loadSecrets } = require("./aws/ssm-helper");
const config = require('config');
const logger = require('./logger')(__filename);

const discordBot = {
  discordClient: null,
  guildId: null,
  channelId: null,
};

async function initDiscordBot() {
  const discordClient = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
    ],
  });

  let botToken, channelId, serverId = null;

  if (process.env.ENVIRONMENT === "local") {
    botToken = process.env.BOT_TOKEN;
    channelId = process.env.CHANNEL_ID;
    serverId = process.env.SERVER_ID;
  } else {
    const params = await loadSecrets(config.aws.param_store_region, ['/catbytes_webplatform/discord_bot_params'], true, true);
    botToken = params['discord_bot_params']['bot_token'];
    channelId = params['discord_bot_params']['channel_id'];
    serverId = params['discord_bot_params']['server_id'];
  }

  await discordClient.login(botToken);
  
  discordClient.once('ready', async () => {
    try {
      discordBot.discordClient = discordClient;
      discordBot.guildId = serverId;
      discordBot.channelId = channelId;
    } catch (err) {
      logger.error(err, 'Error initializing Discord bot');
    }
  });
}

module.exports = { discordBot, initDiscordBot };