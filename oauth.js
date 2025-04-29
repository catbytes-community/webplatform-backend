const { loadSecrets } = require("./aws/ssm-helper");
const config = require('config');

const discordAuth = {
  discordClientId: null,
  discordClientSecret: null,
  discordRedirectUrl: null,
};

async function initOAuth() {
  let discordClientId, discordClientSecret, discordRedirectUrl = null;

  if (process.env.ENVIRONMENT === "local") {
    discordClientId = process.env.DISCORD_CLIENT_ID;
    discordClientSecret = process.env.DISCORD_CLIENT_SECRET;
    discordRedirectUrl = process.env.DISCORD_REDIRECT_URI;
  } else {
    const params = await loadSecrets(config.aws.param_store_region, ['/catbytes_webplatform/oauth_creds'], true, true);
    discordClientId = params['oauth_creds']['discord']['clientID'];
    discordClientSecret = params['oauth_creds']['discord']['clientSecret'];
    discordRedirectUrl = config.discord_redirect_url;
  }

  discordAuth.discordClientId = discordClientId;
  discordAuth.discordClientSecret = discordClientSecret;
  discordAuth.discordRedirectUrl = discordRedirectUrl;
}

module.exports = { discordAuth, initOAuth };
  