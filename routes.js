const express = require("express");
const pool = require("./db");

const router = express.Router();

// API routes
router.get("/", (req, res) => {
    res.send("Hello World");
});

// GET Endpoints
router.get("/users", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM users");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.get("/applications", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM applications");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// POST Endpoints
router.post("/users", async (req, res) => {
    const { username } = req.body;

    try {
        const result = await pool.query(
            "INSERT INTO users (username) VALUES ($1) RETURNING *",
            [username]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.post("/applications", async (req, res) => {
    const { userId, text } = req.body;
    const date = new Date();

    try {
          await pool.query(
            "INSERT INTO applications (user_id, sumbission_date, text) VALUES ($1, $2, $3)",
            [userId, date, text]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;