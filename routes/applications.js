const express = require("express");
const applService = require("../services/applications_service");
const { verifyRole } = require("../middleware/authorization");
const { ROLE_NAMES, APPL_STATUSES } = require("../utils");
const {
  respondWithError,
  isUniqueConstraintViolation,
  isNotNullConstraintViolation,
  parseColumnNameFromConstraint
} = require("./helpers");
const { sendEmailOnApplicationStatusChange } = require("../services/mailer_service");

const router = express.Router();
router.use(express.json());

router.get("/applications", verifyRole(ROLE_NAMES.mentor), async (req, res) => {
  try {
    const result = await applService.getAllApplications();
    res.json({ applications: result });
  } catch (err) {
    console.error(err);
    respondWithError(res);
  }
});

router.post("/applications", async (req, res) => {
  const payload = req.body;
  try {
    const result = await applService.createNewApplication(
      payload.name,
      payload.about,
      payload.email,
      payload.video_link,
      payload.discord_nickname
    );

    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    const violatedValue = parseColumnNameFromConstraint(err.constraint, 'applications');
    if (isUniqueConstraintViolation(err.code)) {
      return respondWithError(
        res,
        409,
        `Application with this ${violatedValue} already exists`
      );
    } else if (isNotNullConstraintViolation(err.code)) {
      return respondWithError(
        res, 400, `Field ${violatedValue} is required`);
    }
    respondWithError(res);
  }
});

router.put("/applications/:id", verifyRole(ROLE_NAMES.mentor), async (req, res) => {
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
      res.status(200).json(application);
    }
    
    // todo add transaction
    application = await applService.updateApplicationStatus(
      id,
      status,
      comment,
      req.userId,
      today
    );

    await sendEmailOnApplicationStatusChange(application.email, application.name, status);
    res.status(200).json(application);
  } catch (err) {
    console.error(err);
    respondWithError(res);
  }
}
);

module.exports = router;
