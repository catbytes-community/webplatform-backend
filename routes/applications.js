const express = require("express");
const applService = require("../services/applications_service");
const { verifyRole } = require("../middleware/authorization");
const { ROLE_NAMES, APPL_STATUSES } = require("../utils");
const {
  respondWithError,
  isUniqueConstraintViolation,
  isNotNullConstraintViolation,
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
  const { name, about, email, videoLink, discordNickname } = req.body;
  try {
    const result = await applService.createNewApplication(
      name,
      about,
      email,
      videoLink,
      discordNickname
    );

    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    if (isUniqueConstraintViolation(err.code)) {
      return respondWithError(
        res,
        409,
        "Application with this email already exists"
      );
    } else if (isNotNullConstraintViolation(err.code)) {
      return respondWithError(res, 400, err.message);
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
    // todo add transaction
    // todo add check if status already set up to `status` value
    const [application] = await applService.updateApplicationStatus(
      id,
      status,
      comment,
      req.userId,
      today
    );

    await sendEmailOnApplicationStatusChange(application.email, application.name, status, comment);
    res.status(200).json(application);
  } catch (err) {
    console.error(err);
    respondWithError(res);
  }
}
);

module.exports = router;
