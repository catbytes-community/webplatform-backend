const express = require("express");
const { respondWithError } = require("./helpers");
const logger = require('../logger')(__filename);
const { verifyRoles } = require("../middleware/authorization");
const { ROLE_NAMES } = require("../utils");
const tagsService = require("../services/tags_service");

const router = express.Router();
router.use(express.json());

router.get("/tags", verifyRoles([ROLE_NAMES.member]), async (req, res) => {
  try {
    const tags = await tagsService.getAllTags();
    res.json({ tags });
  } catch (err) {
    logger.error(err);
    respondWithError(res);
  }
});

module.exports = router;