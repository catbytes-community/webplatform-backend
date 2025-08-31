const path = require('path');
const pino = require('pino');

require('dotenv').config({ path: '.env.local' });

// If LOGGER_ENV is set to 'local', use pretty print for local development
// Otherwise, use JSON and formatiing for deployed service - e.g. Grafana Loki
const isGrafanaLogging = process.env.LOGGER_ENV !== "local";

// When running tests, NODE_ENV is automatically set to 'test' by Jest.
const isTestEnvironment = process.env.NODE_ENV === 'test';

const defaultLoggingLevel = isGrafanaLogging ? 'info' : 'debug';

const baseLogger = pino({
  level: isTestEnvironment
    ? 'silent' // no logging in tests
    : defaultLoggingLevel,
  transport: !isGrafanaLogging
    ? 
    {
      level: 'debug',
      target: 'pino-pretty', // pretty output for local
      options: {
        colorize: true,
        ignore: 'pid,hostname,module',
        messageFormat: '[{module}] {msg}'
      }
    }
    : undefined, // raw json for prod/Loki
  formatters: {
    level: (label) => {
      return { level: label.toLowerCase() };
    },
  }
});

function getLogger(callerFilename) {
  const childOptions = {
    module: path.basename(callerFilename)
  };

  // add environment information if logging to Grafana
  if (isGrafanaLogging) {
    childOptions.env = process.env.NODE_ENV;
  }

  return baseLogger.child(childOptions);
}

module.exports = getLogger;
module.exports.baseLogger = baseLogger;