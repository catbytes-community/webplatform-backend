const express = require("express");

const router = express.Router();
const rolesRepo = require("../repositories/roles_repository");
const { ROLE_NAMES } = require("../utils");
const { verifyRoles } = require("../middleware/authorization");
const { respondWithError } = require("./helpers");

const logger = require('../logger')(__filename);

router.use(express.json());

router.post('/admin/grant-role', verifyRoles([ROLE_NAMES.admin]), async (req, res) => {
  const { userId, roleId } = req.body;
  try {
    if (!userId || !roleId) {
      return res.status(400).json({ message: 'Missing userId or roleId' });
    }

    await rolesRepo.assignRoleToUser(userId, roleId);

    res.status(200).json({ message: 'Role assigned successfully' });
  } catch (err) {
    logger.error(err, `Error assigning role ${roleId} to user ${userId}`);
    respondWithError(res);
  } 
});

router.post('/admin/revoke-role', verifyRoles([ROLE_NAMES.admin]), async (req, res) => {
  const { userId, roleId } = req.body;
  try {
    if (!userId || !roleId) {
      return res.status(400).json({ message: 'Missing userId or roleId' });
    }

    await rolesRepo.removeRoleFromUser(userId, roleId);

    res.status(200).json({ message: 'Role removed successfully' });
  } catch (err) {
    logger.error(err, `Error removing role ${roleId} from user ${userId}`);
    respondWithError(res);
  } 
});

module.exports = router;