const express = require("express");
const { respondWithError } = require("./helpers");
const rolesService = require("../services/roles_service");

const router = express.Router();
router.use(express.json());

router.get("/roles", async (req, res) => {
  try {
    const result = await rolesService.getAllRoles();
    res.json({roles: result});
  } catch (err) {
    console.error(err);
    respondWithError(res);
  }
});

module.exports = router;