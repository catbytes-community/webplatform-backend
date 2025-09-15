const express = require("express");

const router = express.Router();
const mentorService = require("../services/mentor_service");
const { ROLE_NAMES } = require("../utils");
const { verifyRoles } = require("../middleware/authorization");
const { respondWithError } = require("./helpers");
const { MentorAlreadyExistsError, DataRequiresElevatedRoleError } = require("../errors");
const logger = require('../logger')(__filename);

router.use(express.json());

// Create new mentor application
router.post("/mentors", verifyRoles([ROLE_NAMES.member]), async (req, res) => {
  try {
    const mentorData = {
      about: req.body.about,
      contact: req.body.contact,
    };

    const mentorId = await mentorService.createMentor(req.userId, mentorData);
    res.status(201).json({ id: mentorId});
  } catch(err) {
    logger.error(`Error while creating mentor application for user ${req.userId}: ${err.message}`);
    if (err instanceof MentorAlreadyExistsError) {
      return respondWithError(res, 409, err.message);
    }
    return respondWithError(res);
  }
});

// Get all mentors
router.get("/mentors", async (req, res) => {
  const { status } = req.query;
  try {
    const userId = req.userId;
    const mentors = await mentorService.getMentors(userId, status, !!userId);
    res.json({ mentors });
  } catch (err) {
    logger.error(`Error when trying to get all mentors, status=${status}: ${err.message}`);
    if (err instanceof DataRequiresElevatedRoleError) {
      return respondWithError(res, 403, err.message);
    }
    respondWithError(res);
  }
});

module.exports = router;