const express = require("express");

const router = express.Router();
const mentorService = require("../services/mentor_service");
const { ROLE_NAMES } = require("../utils");
const { verifyRoles } = require("../middleware/authorization");
const { isValidIntegerId, respondWithError } = require("./helpers");
const logger = require('../logger')(__filename);

router.use(express.json());

// Get all mentors
router.get("/mentors", async (req, res) => {
  try {
    const { status } = req.query;
    const userId = req.userId;
    const mentors = await mentorService.getMentors(userId, status, !!userId);
    res.json({ mentors });
  } catch (err) {
    if (err.message.includes('not permitted')) {
      logger.warn(`Unauthorized mentor list request: ${err.message}`);
      return respondWithError(res, 403, err.message);
    }
    logger.error(err);
    respondWithError(res);
  }
});

// Get mentor by ID
router.get("/mentors/:id", verifyRoles([ROLE_NAMES.member]), async (req, res) => {
  const { id } = req.params;
  if (!isValidIntegerId(id)) {
    return respondWithError(res, 400, "Invalid user id supplied");
  }
  try {
    const mentorInfo = await mentorService.getMentorById(req.userRoles, id);
    if (!mentorInfo) {
      return respondWithError(res, 404, "Mentor not found");
    }
    res.json(mentorInfo);
  } catch (err) {
    logger.error(err);
    respondWithError(res);
  }
});

// Create new mentor application
router.post("/mentors", verifyRoles([ROLE_NAMES.member]), async (req, res) => {
  try {
    const mentorData = {
      about: req.body.about,
      contact: req.body.contact || null,
    };
    const newMentor = await mentorService.createMentor(req.userId, mentorData);
    res.status(201).json(newMentor.id);
  } catch(err) {
    return respondWithError(res, err.status, err.message);
  }
});

module.exports = router;