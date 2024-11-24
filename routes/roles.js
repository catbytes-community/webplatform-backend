const express = require("express");
const { getPool } = require('../db');
const pool = getPool();
const router = express.Router();
router.use(express.json());

router.get("/roles", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM roles");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;