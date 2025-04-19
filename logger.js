const path = require('path');
const pino = require('pino');

require("dotenv").config();

const baseLogger = pino({
  level: process.env.DEFAULT_LOG_LEVEL || process.env.NODE_ENV !== 'production' 
    ? 'debug' 
    : 'info',
  transport: process.env.NODE_ENV !== 'production'
    ? 
    {
      level: 'debug',
      target: 'pino-pretty', // pretty output for local/dev
      options: {
        colorize: true,
        ignore: 'pid,hostname,module',
        messageFormat: '[{module}] {msg}'
      }
    }
    : undefined // raw json for prod/Loki
});

module.exports = function getLogger(callerFilename) {
  return baseLogger.child({ module: path.basename(callerFilename) });
};