const pino = require('pino');

const logger = pino({
  level: process.env.NODE_ENV === 'test' ? 'silent' : (process.env.LOG_LEVEL || 'info'),
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
});

module.exports = logger;