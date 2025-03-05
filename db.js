const knex = require('knex');
const { loadSecrets } = require("./aws/ssm-helper");
const config = require('config');

require("dotenv").config();

let databaseUsername, databaseHost, databaseName, databasePassword, databasePort;
let knexInstance = null;

async function getDbSettings() {
  const isLocal = process.env.ENVIRONMENT === "local";
  console.log("isLocal: ", isLocal);
  if (isLocal) {
    databaseUsername = process.env.DB_USER;
    databaseHost = process.env.DB_HOST || "localhost";
    databaseName = process.env.DB_NAME;
    databasePassword = process.env.DB_PASS;
    databasePort = process.env.DB_PORT || 5432;
  }
  else {
    // For remote RSD access, load secrets from AWS SSM
    const awsConfig = config.aws;
    const credentials = await loadSecrets(
      awsConfig.param_store_region, 
      ['/catbytes_webplatform/db_username', '/catbytes_webplatform/db_password'], 
      true);

    databaseUsername = credentials['db_username'];
    databaseHost = awsConfig.db_endpoint;
    databaseName = awsConfig.db_name;
    databasePassword = credentials['db_password'];
    databasePort = awsConfig.databasePort;
  }

  return {
    databaseUsername,
    databaseHost,
    databaseName,
    databasePassword,
    databasePort,
    ssl: isLocal ? false : { rejectUnauthorized: false }
  };
}

async function initDb() {
  const settings = await getDbSettings();
  
  knexInstance = knex({
    client: 'pg',
    connection: {
      host: settings.databaseHost,
      user: settings.databaseUsername,
      password: settings.databasePassword,
      database: settings.databaseName,
      port: settings.databasePort,
      connectionTimeoutMillis: 5000,
      ssl: settings.ssl
    },   
  });
}

module.exports = { getDbSettings, initDb, getKnex: () => knexInstance };