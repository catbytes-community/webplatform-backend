const express = require("express");
const applService = require("../services/applications_service");
const discordService = require("../services/discord_bot_service");
const { verifyRoles } = require("../middleware/authorization");
const { ROLE_NAMES, APPL_STATUSES } = require("../utils");
const {
  respondWithError,
  checkConstraintViolationOrRespondWith500
} = require("./helpers");
const { sendEmailOnApplicationStatusChange } = require("../services/mailer_service");
const logger = require('../logger')(__filename);

const router = express.Router();
router.use(express.json());

router.get("/applications", verifyRoles([ROLE_NAMES.mentor, ROLE_NAMES.admin]), async (req, res) => {
  try {
    const result = await applService.getAllApplications();
    res.json({ applications: result });
  } catch (err) {
    logger.error(err);
    respondWithError(res);
  }
});

router.get("/applications/:id", verifyRoles([ROLE_NAMES.mentor, ROLE_NAMES.admin]), async (req, res) => {
  const { id } = req.params;
  try {
    const application = await applService.getApplicationById(id);
    if (!application) {
      return respondWithError(res, 404, "Application not found");
    }
    res.json(application);
  } catch (err) {
    logger.error(err);
    respondWithError(res);
  }
});

router.post("/applications", async (req, res) => {
  const payload = req.body;
  if (!payload.video_link && !payload.video_filename) {
    return respondWithError(res, 400, "Video link or filename is required");
  }

  try {
    const result = await applService.createNewApplication(payload);

    res.status(201).json(result);
  } catch (err) {
    logger.error(err);
    checkConstraintViolationOrRespondWith500(err, res, 'applications');
  }
});

router.put("/applications/:id", verifyRoles([ROLE_NAMES.mentor, ROLE_NAMES.admin]), async (req, res) => {
  const { id } = req.params;
  const { status, comment } = req.body;
  const today = new Date();

  if (!Object.values(APPL_STATUSES).includes(status)) {
    return respondWithError(res, 400, "Invalid status provided");
  }

  if (status === APPL_STATUSES.rejected && !comment) {
    return respondWithError(
      res,
      400,
      "Comment is required for rejected applications"
    );
  }
  try {
    let application = await applService.getApplicationById(id);

    if (!application) {
      return respondWithError(res, 404, "Application not found");
    }

    if (application.status === APPL_STATUSES.rejected) {
      return respondWithError(res, 400, "Application is already in rejected status.");
    }

    if (application.status === APPL_STATUSES.approved) {
      return res.status(200).json(application);
    }
    
    // todo add transaction
    application = await applService.updateApplicationStatus(
      id,
      status,
      comment,
      req.userId,
      today
    );
    //no need to put restrictions on appl approved email
    const inviteLink = await discordService.generateInviteLink(null);
    await sendEmailOnApplicationStatusChange(application.email, application.name, status, inviteLink);
    res.status(200).json(application);
  } catch (err) {
    logger.error(err);
    respondWithError(res);
  }
}
);

module.exports = router;
