const express = require("express");
const pool = require("../db");
const { verifyRole } = require("../middleware/authorization");
const { getRole } = require("../utils");
const router = express.Router();
router.use(express.json());

router.get("/applications", verifyRole('mentor'), async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM applications");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.post("/applications", async (req, res) => {
    const { name, text } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO applications (name, about) VALUES ($1, $2) RETURNING *",
            [name, text]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;