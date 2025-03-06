const express = require('express');

const router = express.Router();
router.use(express.json());
const discordService = require('../services/discord_bot_service');
const { authenticate } = require('../middleware/authentication');
const { respondWithError } = require("./helpers");

router.post('/generate-invite', authenticate(), async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'User with provided UID not found' });
    }
    const invite = await discordService.generateInviteLink(req.userId);
    res.json({ invite_link: invite });
  } catch (error) {
    console.error('Error generating invite:', error);
    const status = error.status || 500;
    respondWithError(res, status, error.message);
  } 
});

module.exports = router;