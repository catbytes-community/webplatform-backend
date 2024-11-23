const express = require("express");
const pool = require("../db");
const { respondWithError } = require("./helpers")
const router = express.Router();
router.use(express.json());

router.get("/roles", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM roles");
        res.json({roles: result.rows});
    } catch (err) {
        console.error(err);
        respondWithError(res)
    }
});

module.exports = router;