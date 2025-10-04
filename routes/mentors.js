const express = require("express");

const router = express.Router();
const mentorService = require("../services/mentor_service");
const { ROLE_NAMES, MENTOR_STATUSES } = require("../utils");
const { verifyRoles, verifyMentorOwnership } = require("../middleware/authorization");
const { isValidIntegerId, respondWithError } = require("./helpers");
const { MentorAlreadyExistsError, DataRequiresElevatedRoleError } = require("../errors");
const { sendEmailOnMentorApplicationStatusChange } = require("../services/mailer_service");
const { getUserById } = require("../services/user_service");
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

// Get mentor by ID
router.get("/mentors/:id", verifyRoles([ROLE_NAMES.member]),  async (req, res) => {
  const { id } = req.params;
  if (!isValidIntegerId(id)) {
    return respondWithError(res, 400, "Invalid user id supplied");
  }
  try {
    const isOwner = await verifyMentorOwnership(id, req.userId);
    const mentorInfo = await mentorService.getMentorById(req.userRoles, id, isOwner);
    if (!mentorInfo) {
      return respondWithError(res, 404, "Mentor not found");
    }
    res.json(mentorInfo);
  } catch (err) {
    logger.error(err);
    respondWithError(res);
  }
});

// Update mentor status
router.patch("/mentors/:id", verifyRoles([ROLE_NAMES.member]), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if(!isValidIntegerId(id)) {
    return respondWithError(res, 400, "Invalid user id supplied");
  }
  try {
    const isOwner = await verifyMentorOwnership(id, req.userId);
    const mentorInfo = await mentorService.getMentorById(req.userRoles, id, isOwner);
    if (!mentorInfo) {
      return respondWithError(res, 404, "Mentor not found");
    }
    const mentorId = await mentorService.updateMentorStatus(req.userRoles, id, status, isOwner);
    
    if (status === MENTOR_STATUSES.active || status === MENTOR_STATUSES.rejected) {
      const userInfo = await getUserById(mentorInfo.user_id);
      if (!userInfo) {
        return respondWithError(res, 404, "User not found");
      }
      await sendEmailOnMentorApplicationStatusChange(userInfo.email, mentorInfo.name, status);
    };

    res.json({ id: mentorId });
  } catch (err) {
    logger.error(err);
    if (err instanceof DataRequiresElevatedRoleError) {
      return respondWithError(res, 403, err.message);
    }
    respondWithError(res);
  }
});

module.exports = router;