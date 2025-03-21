const express = require("express");

const router = express.Router();
const usersRoutes = require("./users");  
const applRoutes = require("./applications");
const rolesRoutes = require("./roles");
const mailerService = require("../services/mailer_service");
const discordRoutes = require("./discord");
const { verifyRole } = require("../middleware/authorization");
const { ROLE_NAMES, APPL_STATUSES } = require("../utils");

router.use(express.json());

// API routes
router.use(usersRoutes); 
router.use(applRoutes);  
router.use(rolesRoutes);  
router.use(discordRoutes); 

router.get("/", (req, res) => {
  res.send("API Specification in Swagger: https://catbytes-community.github.io/webplatform-backend/");
});

// helper route to quickly trigger email sending for testing
router.post("/mail-test", verifyRole(ROLE_NAMES.mentor), async (req, res) => {
  const { name, email} = req.body;
  await mailerService.sendEmailOnApplicationStatusChange(email, name, APPL_STATUSES.approved);
  res.json({"message": "email successfully sent"});
});

module.exports = router;