const express = require('express');
const discordService = require('../services/discord_bot_service');
const userService = require("../services/user_service");
const { respondWithError } = require("./helpers");
const { verifyRole } = require("../middleware/authorization");
const { ROLE_NAMES } = require("../utils");

const {discordAuth} = require ("../oauth.js");
const axios = require('axios');
const querystring = require('querystring');

const router = express.Router();
router.use(express.json());

router.post('/generate-invite', verifyRole(ROLE_NAMES.member), async (req, res) => {
  try {
    const invite = await discordService.generateInviteLink(req.userId);
    res.json({ invite_link: invite });
  } catch (error) {
    console.error('Error generating invite:', error);
    const status = error.status || 500;
    respondWithError(res, status, error.message);
  } 
});

router.get('/auth/discord', (req, res) => {
  res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${discordAuth.discordClientId}
    &redirect_uri=${encodeURIComponent(discordAuth.discordRedirectUrl)}&response_type=code&scope=identify%20email`);
});

router.get('/auth/discord/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) return  respondWithError(res, 400, 'no code provided');
  
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
        Authorization: `Bearer ${ tokenResponse.data.access_token}`
      }
    });
      
    const discordUser = userResponse.data;   
    
    const user = await userService.getUserByEmail(discordUser.email);
    if (!user) {
      return respondWithError(res, 404, 'User not found');
    }

    res.cookie('userUID', user.firebaseId, { httpOnly: true, secure: true, sameSite: 'none' });
    res.status(200).json({ user: user });
      
  } catch (error) {
    console.error('Error:', error);
    respondWithError(res, 500, 'Authentication failed');
  }
});

module.exports = router;