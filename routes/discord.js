const express = require('express');
const discordService = require('../services/discord_bot_service');
const { respondWithError } = require("./helpers");
const { verifyRole } = require("../middleware/authorization");
const { ROLE_NAMES } = require("../utils");

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

module.exports = router;