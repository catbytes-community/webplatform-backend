const { SSMClient, GetParametersCommand } = require('@aws-sdk/client-ssm');

async function loadSecrets(region, names, withDecryption = false) {
    const ssmClient = new SSMClient({
        region: region,
      });      

    try {
        const command = new GetParametersCommand({
            Names: names,
            WithDecryption: withDecryption,
          });

        const result = await ssmClient.send(command);

        const secrets = result.Parameters.reduce((acc, param) => {
            acc[param.Name.split('/').pop()] = param.Value;
            return acc;
        }, {});

        console.log('Fetched secrets:', Object.keys(secrets));
        return secrets;
    } catch (error) {
        console.error('Error fetching parameters:', error);
        throw error;
    }
}

module.exports = { loadSecrets }; 