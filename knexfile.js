// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */

const { getDbSettings } = require('./db');
const readline = require('readline');

async function verifyAcknowledgement() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const userInput = await new Promise((resolve) => {
    rl.question('> ', (answer) => {
      rl.close();
      resolve(answer);
    });
  });

  if (userInput.trim() !== 'ack') {
    throw new Error('❌ Acknowledgment not received. Aborting connection to the database and not applying migrations.');
  }
}

module.exports = {
  client: 'pg',
  connection: async () => {
    const dbSettings = await getDbSettings();
    console.log(`\n⚠️  !!!! IMPORTANT !!!! ⚠️
      Before proceeding with migrations, verify your changes in migration files
      and apply them on the local database first.
      Check if the output above says "Environment: local".
      If you are sure, you can proceed with migrations on remote database. 
      Please acknowledge this message by typing "ack" and pressing Enter. `);

    await verifyAcknowledgement();

    return {
      host: dbSettings.databaseHost,
      database: dbSettings.databaseName,
      port: dbSettings.databasePort,      
      user: dbSettings.databaseUsername,
      password: dbSettings.databasePassword,
      ssl: dbSettings.ssl,
    };
  },
  migrations: {
    directory: __dirname + '/knex/migrations',
  },
  seeds: {
    directory: __dirname + '/knex/seeds'
  }
};
