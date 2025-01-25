require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { initDb } = require('./db');
const { initMailer } = require('./services/mailer_service');
const utils = require('./utils');
const admin = require("firebase-admin");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

(async () => {   
  await initDb();
  await initMailer();
  await utils.loadRolesIntoMemory();
  const firebaseServiceAccount = await utils.getFirebaseSdkServiceAccount();
  admin.initializeApp({
    credential: admin.credential.cert(firebaseServiceAccount),
  });
  // Routes
  const routes = require("./routes/routes");
  
  app.use(routes);

  app.listen(8080,'0.0.0.0', () => {
    console.log(`Server is running`);
  });
})();
