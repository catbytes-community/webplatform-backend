const { Client, GatewayIntentBits } = require('discord.js');
const { loadSecrets } = require("./aws/ssm-helper");
const config = require('config');

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
    const params = await loadSecrets(config.aws.param_store_region, ['/catbytes_webplatform/discord_bot_params'], true);
    botToken = params['bot_token'];
    channelId = params['channel_id'];
    serverId = params['server_id'];
  }

  await discordClient.login(botToken);
  discordClient.once('ready', async () => {
    try {
      discordBot.discordClient = discordClient;
      discordBot.guildId = serverId;
      discordBot.channelId = channelId;
    } catch (error) {
      console.error("Error initializing Discord bot:", error);
    }
  });
}

module.exports = { discordBot, initDiscordBot };