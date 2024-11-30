// import npm packages and env config
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const { initDb } = require('./db');
const rolesService = require('./services/roles_service');
// Middleware
app.use(express.json()); // read documentation on what this does
app.use(cors());

(async () => { 
    await initDb();
    console.log("1");
  await rolesService.loadRolesIntoMemory();

  // Routes
  const routes = require("./routes/routes");
  app.use(routes);

  app.listen(8080,'0.0.0.0', () => {
    console.log(`Server is running`);
  });
})();
