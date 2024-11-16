const express = require("express");
const router = express.Router();
const usersRoutes = require("./users");  
const applRoutes = require("./applications");
router.use(express.json());

// API routes
router.use(usersRoutes); 
router.use(applRoutes);  

router.get("/", (req, res) => {
    res.send("Hello World");
});

module.exports = router;