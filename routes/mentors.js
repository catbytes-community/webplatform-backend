const express = require("express");

const router = express.Router();
const mentorService = require("../services/mentor_service");
const { ROLE_NAMES } = require("../utils");
const {verifyRole} = require("../middleware/authorization");
const { isValidIntegerId, respondWithError } = require("./helpers");
const logger = require('../logger')(__filename);

router.use(express.json());
 
// Get all mentors
router.get("/mentors", async (req, res) => {
  try {
    const {status} = req.query;
    const mentors = await mentorService.getMentors(req.userId, status);
    res.json({ mentors });
  } catch (err) {
    logger.error(err);
    respondWithError(res);
  }
});


// Get mentor by ID
router.get("/mentors/:id", verifyRole(ROLE_NAMES.member), async (req, res) => {
  const { id } = req.params;
  if (!isValidIntegerId(id)) {
    return respondWithError(res, 400, "Invalid user id supplied");
  }
  try {
    const mentorInfo = await mentorService.getMentorById(req.userId, id);
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
router.post("/mentors", verifyRole(ROLE_NAMES.member), async (req, res) => {
  try {
    const userId = req.userId;

    const mentorData = {
      about: req.body.about,
      contact: req.body.contact || null,
    };
    const newMentor = await mentorService.createMentor(userId, mentorData);
    res.status(201).json(newMentor);
  } catch (err) {
    logger.error(err);
    if (err.message === 'User already has a mentor profile') {
      return respondWithError(res, 409, err.message);
    }
    respondWithError(res);
  }
});

module.exports = router;