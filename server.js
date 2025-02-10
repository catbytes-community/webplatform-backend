require("dotenv").config();
const config = require('config');
const express = require("express");
const cookieParser = require('cookie-parser');
const cors = require("cors");
const { initDb } = require('./db');
const { initMailer } = require('./services/mailer_service');
const utils = require('./utils');
const admin = require("firebase-admin");
const { authenticate } = require("./middleware/authentication");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: (origin, callback) => {
    console.log('origin>> ', origin);
    if (!origin || config.cors.allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'], 
}));
app.options('*', cors()); 
app.use(authenticate());

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
