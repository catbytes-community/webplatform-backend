const express = require("express");
const { getPool } = require("../db");
const pool = getPool();
const { verifyRole } = require("../middleware/authorization");
const { ROLE_NAMES, STATUS_NAMES } = require("../utils");
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
  verifyRole(ROLE_NAMES.mentor),
  async (req, res) => {
    const { id } = req.params;
    const { status, comment, user_id } = req.body; // user_id = who approved/denied
    const today = new Date();
    if (!Object.values(STATUS_NAMES).includes(status)) {
      return respondWithError(res, 400, "Invalid status provided");
    }
    if (status === STATUS_NAMES.rejected && !comment) {
      return respondWithError(
        res,
        400,
        "Comment is required for rejected applications"
      );
    }
    try {
      let query =
        "UPDATE applications SET status = $1, comment = $2, modified_by = $3, modified_at = $4 WHERE id = $5 RETURNING *";
      let values = [status, comment, user_id, today, id];
      const result = await pool.query(query, values);
      if (result.rowCount === 0) {
        return respondWithError(res, 404, "Application not found");
      }
      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      respondWithError(res);
    }
  }
);

module.exports = router;
