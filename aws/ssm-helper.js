const { SSMClient, GetParametersCommand } = require('@aws-sdk/client-ssm');
const logger = require('../logger')(__filename);

async function loadSecrets(region, names, withDecryption = false, parseJson = false) {
  const ssmClient = new SSMClient({
    region: region,
  });      

  try {
    logger.debug(`Fetching secrets from region: ${region}`);
    const command = new GetParametersCommand({
      Names: names,
      WithDecryption: withDecryption,
    });

    const result = await ssmClient.send(command);

    const secrets = result.Parameters.reduce((acc, { Name, Value }) => {
      const key = Name.split('/').pop();
      acc[key] = parseJson ? parseJsonValue(Value) : Value;
      return acc;
    }, {});

    logger.debug(Object.keys(secrets), 'Fetched secrets');
    return secrets;
  } catch (err) {
    logger.error(err, 'Error fetching parameters');
    throw err;
  }
}

function parseJsonValue(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

module.exports = { loadSecrets }; 
