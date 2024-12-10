const express = require("express");
const applService = require("../services/applications_service")
const { verifyRole } = require("../middleware/authorization");
const { ROLE_NAMES } = require("../utils")
const { respondWithError, isUniqueConstraintViolation, isNotNullConstraintViolation } = require("./helpers")
const router = express.Router();
router.use(express.json());

router.get("/applications", verifyRole(ROLE_NAMES.mentor), async (req, res) => {
    try {
        const result = await applService.getAllApplications();
        res.json({ applications: result});
    } catch (err) {
        console.error(err);
        respondWithError(res);
    }
});

router.post("/applications", async (req, res) => {
    const { name, about, email, video_link, discord_nickname } = req.body;
    try {
        const result = await applService.createNewApplication(name, about, email, video_link, discord_nickname);

        res.status(201).json(result);
    } catch (err) {
        console.error(err);
        if (isUniqueConstraintViolation(err.code)) {
            return respondWithError(res, 409, "Application with this email already exists")
        } else if (isNotNullConstraintViolation(err.code)) {
            return respondWithError(res, 400, err.message)
        }
        respondWithError(res);
    }
});

module.exports = router;