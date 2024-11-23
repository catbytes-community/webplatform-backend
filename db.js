const { Pool } = require("pg");
const { loadSecrets } = require("./aws/ssm-helper")
const config = require("./config.json");
require("dotenv").config();

let db_username, db_host, db_name, db_password, db_port;
let pool = null;

async function initDb() {
  if (process.env.ENVIRONMENT === "local") {
    db_username = process.env.DB_USER;
    db_host = process.env.DB_HOST || "localhost";
    db_name = process.env.DB_NAME;
    db_password = process.env.DB_PASS;
    db_port = process.env.DB_PORT || 5432;
  } else {
    // For remote RSD access, load secrets from AWS SSM
    const awsConfig = config.aws;
    const credentials = await loadSecrets(awsConfig.region, ['/catbytes_webplatform/db_username', '/catbytes_webplatform/db_password'], true);
    
    db_username = credentials['db_username']; 
    db_host = awsConfig.db_endpoint;
    db_name = awsConfig.db_name;
    db_password = credentials['db_password'];
    db_port = awsConfig.db_port;
  }

  pool = new Pool({
    user: db_username,
    host: db_host,
    database: db_name,
    password: db_password,
    port: db_port,
    connectionTimeoutMillis : 5000,
    ssl: { rejectUnauthorized: false }
  });
}

module.exports = { initDb, getPool: () => pool };
