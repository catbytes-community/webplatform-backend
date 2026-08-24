const { initDb } = require("./db");
const { initMailer } = require("./services/mailer_service");
const { initDiscordBot } = require("./discordBot.js");
const { initOAuth } = require("./oauth.js");
const utils = require("./utils");
const admin = require("firebase-admin");
const app = require("./app");

(async () => {
  const logger = require("./logger")(__filename);

  try {
    logger.info("Initializing database...");
    await initDb();
    logger.info("Database initialized");

    logger.info("Initializing mailer...");
    await initMailer();
    logger.info("Mailer initialized");

    logger.info("Initializing Discord bot...");
    await initDiscordBot();
    logger.info("Discord bot initialized");

    logger.info("Initializing OAuth...");
    await initOAuth();
    logger.info("OAuth initialized");

    logger.info("Loading roles...");
    await utils.loadRolesIntoMemory();
    logger.info("Roles loaded");

    logger.info("Loading Firebase...");
    const firebaseServiceAccount = await utils.getFirebaseSdkServiceAccount();
    logger.info("Firebase loaded");

    admin.initializeApp({
      credential: admin.credential.cert(firebaseServiceAccount),
    });

    logger.info("Starting HTTP server...");

    // Routes
    const routes = require("./routes/routes");

    app.use(routes);

    app.listen(8080, "0.0.0.0", () => {
      logger.info("Server is running");
    });
  } catch (err) {
    logger.error(err, "Application failed to start");
    process.exit(1);
  }
})();
