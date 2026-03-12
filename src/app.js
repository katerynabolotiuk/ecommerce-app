const express = require('express');
const logger = require('./utils/logger');
const sequelize = require('./config/db');
const routes = require('./routes');
const requestLogger = require('./middleware/requestLogger');

const app = express();

app.use(express.json());
app.use(requestLogger);

app.use('/api', routes);

module.exports = app