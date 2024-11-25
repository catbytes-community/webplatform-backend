const express = require("express");
const { getPool } = require('../db');
const pool = getPool();
const { verifyRole } = require("../middleware/authorization");
const { ROLE_NAMES } = require("../utils")
const { respondWithError, isUniqueConstraintViolation, isNotNullConstraintViolation } = require("./helpers")
const router = express.Router();
router.use(express.json());

router.get("/applications", verifyRole(ROLE_NAMES.mentor), async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM applications");
        res.json({ applications: result.rows});
    } catch (err) {
        console.error(err);
        respondWithError(res);
    }
});

router.post("/applications", async (req, res) => {
    const { name, about, email, video_link, discord_nickname } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO applications (name, about, email, video_link, discord_nickname) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [name, about, email, video_link, discord_nickname]
        );
        res.status(201).json(result.rows[0]);
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