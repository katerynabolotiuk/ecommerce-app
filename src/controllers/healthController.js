const sequelize = require('../config/db');
const logger = require('../utils/logger');

exports.healthCheck = async (req, res) => {
  try {
    await sequelize.authenticate();

    logger.info({ message: 'Health check OK' });

    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });

  } catch (err) {
    logger.error({ message: 'Health check failed', error: err.message });

    res.status(503).json({
      status: 'error',
      error: 'Database unavailable',
      timestamp: new Date().toISOString(),
    });
  }
};