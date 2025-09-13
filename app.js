const config = require('config');
const express = require("express");
const cookieParser = require('cookie-parser');
const cors = require("cors");
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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Firebase-Token', 'X-Discord-Code'], 
}));
app.options('*', cors()); 
app.use(authenticate());

module.exports = app;