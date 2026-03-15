require("dotenv").config();

const app = require('./app');
const sequelize = require('./config/db');
const logger = require('./utils/logger');
const { Umzug, SequelizeStorage } = require('umzug');

const port = process.env.PORT;

async function runMigrations() {
  const migrator = new Umzug({
    migrations: { glob: 'src/migrations/*.js' }, 
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: {
        info: (msg) => logger.info({ message: msg }),
        warn: (msg) => logger.warn({ message: msg }),
        error: (msg) => logger.error({ message: msg }),
        debug: (msg) => logger.debug({ message: msg }),
    }
  });

  logger.info({ message: 'Checking and applying pending migrations...' });
  await migrator.up(); 
  logger.info({ message: 'All migrations applied' });
}

async function start() {
  try {
    await runMigrations();

    await sequelize.authenticate();
    logger.info({ message: 'DB connected' });

    const server = app.listen(port, () => {
      logger.info({ message: `Server running on port ${port}` })
    });

    process.on('SIGTERM', async () => {
      logger.info({ message: 'SIGTERM received. Starting graceful shutdown...' });

      server.close(async (err) => {
        if (err) {
          logger.error({ message: 'Error during server shutdown', error: err.message });
          process.exit(1);
        }

        try {
          await sequelize.close();
          logger.info({ message: 'Database connection closed' });
          process.exit(0);
        } catch (dbErr) {
          logger.error({ message: 'Error closing DB connection', error: dbErr.message });
          process.exit(1);
        }
      });
    });

  } catch (error) {
    logger.error({ message: 'Server startup failed', error: error.message });
    process.exit(1);
  }
}

start();