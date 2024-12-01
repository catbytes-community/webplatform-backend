const express = require("express");
const { getPool } = require("../db");
const pool = getPool();
const { verifyRole } = require("../middleware/authorization");
const { ROLE_NAMES } = require("../utils");
const {
  respondWithError,
  isUniqueConstraintViolation,
  isNotNullConstraintViolation,
} = require("./helpers");
const router = express.Router();
router.use(express.json());

router.get("/applications", verifyRole(ROLE_NAMES.mentor), async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM applications");
    res.json({ applications: result.rows });
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

router.put(
  "/applications/:id",
  verifyRole(ROLE_NAMES.mentor), // to do: change verifyRole to provide user_id as well? TBD
  async (req, res) => {
    const { id } = req.params;
    const { status, comment, user_id } = req.body; // user_id = who approved/denied
    if (!["approved", "rejected"].includes(status)) {
      return respondWithError(res, 400, "Invalid status provided");
    }
    if (status === "rejected" && !comment) {
      return respondWithError(
        res,
        400,
        "Comment is required for rejected applications"
      );
    }
    try {
      let query =
        "UPDATE applications SET status = $1, comment = $2, modified_by = $3 WHERE id = $4 RETURNING *";
      let values = [status, comment, user_id, id];
      const result = await pool.query(query, values);
      if (result.rowCount === 0) {
        return respondWithError(res, 404, "Application not found");
      }
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      respondWithError(res);
    }
  }
);

module.exports = router;
