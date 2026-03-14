const { Umzug, SequelizeStorage } = require('umzug');
const path = require('path');
const { Sequelize } = require('sequelize');
const sequelize = require('../../src/config/db');
const db = require('../../src/models');

const migrator = new Umzug({
  migrations: {
    glob: path.join(__dirname, '../../src/migrations/*.js'),
    resolve: ({ name, path: migPath, context }) => {
      const migration = require(migPath);
      return {
        name,
        up: async () => migration.up(context, Sequelize), 
        down: async () => migration.down(context, Sequelize),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: undefined,
});

beforeAll(async () => {
  await sequelize.authenticate();
  await migrator.down({ to: 0 }); 
  await migrator.up();           
});

beforeEach(async () => {
  await sequelize.query(`
    TRUNCATE TABLE 
      "OrderItems", "Orders", "CartItems", "Carts", "Products", "Users"
    RESTART IDENTITY CASCADE
  `);
});

afterAll(async () => {
  await db.sequelize.close();
  await sequelize.close();
});