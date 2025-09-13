const { initDb } = require('./db');
const { initMailer } = require('./services/mailer_service');
const { initDiscordBot } = require('./discordBot.js');
const { initOAuth } = require('./oauth.js');
const utils = require('./utils');
const admin = require("firebase-admin");
const app = require('./app');

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
