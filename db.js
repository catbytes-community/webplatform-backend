const knex = require('knex');
const { loadSecrets } = require("./aws/ssm-helper")
const config = require("./config.json");
require("dotenv").config();

let db_username, db_host, db_name, db_password, db_port;
let knexInstance = null;


async function initDb() {
  const isLocal = process.env.ENVIRONMENT === "local";
    if (isLocal) {

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

    knexInstance = knex({
        client: 'pg',
        connection: {
            host: db_host,
            user: db_username,
            password: db_password,
            database: db_name,
            port: db_port
        },
    });
}
module.exports = { initDb, getKnex: () => knexInstance };