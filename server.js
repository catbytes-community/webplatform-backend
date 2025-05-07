const config = require('config');
const express = require("express");
const cookieParser = require('cookie-parser');
const cors = require("cors");
const { initDb } = require('./db');
const { initMailer } = require('./services/mailer_service');
const { initDiscordBot } = require('./discordBot.js');
const { initOAuth } = require('./oauth.js');
const utils = require('./utils');
const admin = require("firebase-admin");
const { authenticate } = require("./middleware/authentication");
const pinoHttp = require('pino-http');
const { baseLogger } = require('./logger');

require('dotenv').config({ path: '.env.local' });

const app = express();

// Middleware
if (process.env.LOGGING_HTTP_REQUESTS === 'true') {
  app.use(pinoHttp({ logger: baseLogger }));
}

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || config.cors.allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token'], 
}));
app.options('*', cors()); 
app.use(authenticate());

(async () => {   
  const logger = require('./logger')(__filename);
  
  await initDb();
  await initMailer();
  await initDiscordBot();
  await initOAuth();
  await utils.loadRolesIntoMemory();
  const firebaseServiceAccount = await utils.getFirebaseSdkServiceAccount();
  admin.initializeApp({
    credential: admin.credential.cert(firebaseServiceAccount),
  });

  // Routes
  const routes = require("./routes/routes");
  
  app.use(routes);

  app.listen(8080,'0.0.0.0', () => {
    logger.info('Server is running');
  });
})();
