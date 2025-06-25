const admin = require('firebase-admin');
const axios = require('axios');
const querystring = require('querystring');
const userService = require('../services/user_service');
const applService = require("../services/applications_service");

const {discordAuth} = require ("../oauth.js"); 

const logger = require('../logger')(__filename);

async function handleFirebaseAuth(firebaseToken) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    const email = decodedToken.email;
    const firebaseId = decodedToken.uid;

    if (!decodedToken.email_verified) {
      throw { status: 403, message: 'Email not verified' };
    }

    const application = await applService.getApplicationByEmail(email);
    if (!application || application.status !== 'approved') {
      throw { status: 403, message: 'Application is not approved or does not exist' };
    }

    let user = await userService.getUserByEmail(email);
    if (!user) {
      user = await userService.createNewMemberUser(
        application.name,
        email,
        application.about,
        application.languages,
        application.discord_nickname
      );
    }

    await userService.updateUserById(user.id, { firebase_id: firebaseId });

    return user;
  } catch (error) {
    logger.error({ error: error.message }, "Firebase Token Verification Failed");
    throw { status: 401, message: 'Unauthorized' };
  }
}

;

async function handleDiscordAuth(code){
  try {
    // exchange code for access token
    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token',
      querystring.stringify({
        client_id: discordAuth.discordClientId,
        client_secret: discordAuth.discordClientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: discordAuth.discordRedirectUrl,
        scope: 'identify email'
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    // get user data from discord
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenResponse.data.access_token}`
      }
    });

    const discordUser = userResponse.data;
    const user = await userService.getUserByEmail(discordUser.email);

    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    return { user };
  } catch (error) {
    logger.error({ error: error.message }, "Discord Authentication Failed", );
    throw { status: 401, message: 'Unauthorized' };
  }
}

;
module.exports = { handleFirebaseAuth, handleDiscordAuth};