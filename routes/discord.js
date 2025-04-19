const express = require('express');
const discordService = require('../services/discord_bot_service');
const { respondWithError } = require("./helpers");
const { verifyRole } = require("../middleware/authorization");
const { ROLE_NAMES } = require("../utils");
const logger = require('../logger')(__filename);

const router = express.Router();
router.use(express.json());

router.post('/generate-invite', verifyRole(ROLE_NAMES.member), async (req, res) => {
  try {
    const invite = await discordService.generateInviteLink(req.userId);
    res.json({ invite_link: invite });
  } catch (err) {
    logger.error(err, 'Error generating invite');
    const status = err.status || 500;
    respondWithError(res, status, err.message);
  } 
});

module.exports = router;