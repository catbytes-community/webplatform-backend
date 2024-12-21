// import npm packages and env config
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const { initDb } = require('./db');
const { initMailer } = require('./services/mailer_service')
const utils = require('./utils');
const admin = require("firebase-admin");
//const serviceAccount = require('./serviceAccountKey.json');

// Middleware
app.use(express.json()); // read documentation on what this does
app.use(cors());

(async () => {   
  await initDb();
  await initMailer();
  await utils.loadRolesIntoMemory();
  serviceAccount = await utils.getServiceAccount();
  admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
  });
  // Routes
  const routes = require("./routes/routes");
  app.use(routes);

  app.listen(8080,'0.0.0.0', () => {
    console.log(`Server is running`);
  });
})();
