const express = require("express");

const router = express.Router();
const usersRoutes = require("./users");  
const applRoutes = require("./applications");
const rolesRoutes = require("./roles");
const mailerService = require("../services/mailer_service");
const { verifyRole } = require("../middleware/authorization");
const { ROLE_NAMES } = require("../utils");

router.use(express.json());

// API routes
router.use(usersRoutes); 
router.use(applRoutes);  
router.use(rolesRoutes);  

router.get("/", (req, res) => {
  res.send("API Specification in Swagger: https://catbytes-community.github.io/webplatform-backend/");
});

// helper route to quickly trigger email sending for testing
router.post("/mail-test", verifyRole(ROLE_NAMES.mentor), async (req, res) => {
  const { name, email} = req.body;
  await mailerService.sendEmailOnApplicationStatusChange(email, name, "rejected");
  res.json({"message": "email successfully sent"});
});

module.exports = router;