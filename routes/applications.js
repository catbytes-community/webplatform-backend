const express = require("express");
const pool = require("../db");
const { verifyRole } = require("../middleware/authorization");
const { ROLE_NAMES } = require("../utils")
const { respondWithError, isUniqueConstraintViolation } = require("./helpers")
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
    const { name, about, email } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO applications (name, about, email) VALUES ($1, $2, $3) RETURNING *",
            [name, about, email]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        if (isUniqueConstraintViolation(err.code)) {
            respondWithError(res, 409, "Application with this email already exists")
        } else {
            respondWithError(res);
        }
    }
});

module.exports = router;