const { SSMClient, GetParametersCommand } = require('@aws-sdk/client-ssm');

async function loadSecrets(region, names, withDecryption = false, parseJson = false) {
  const ssmClient = new SSMClient({
    region: region,
  });      

  try {
    console.log('Fetching secrets from region:', region);
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

    console.log('Fetched secrets:', Object.keys(secrets));
    return secrets;
  } catch (error) {
    console.error('Error fetching parameters:', error);
    throw error;
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
