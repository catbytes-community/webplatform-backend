// import npm packages and env config
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const utils = require('./utils');
const app = express();

// Middleware
app.use(express.json()); // read documentation on what this does
app.use(cors());

(async () => { 
  await utils.loadRolesIntoMemory();

  // Routes
  const routes = require("./routes/routes");
  app.use(routes);

  app.listen(8080, () => {
    console.log(`Server is running`);
  });

})();