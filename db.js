const config = require('./config');
const Sequelize = require('sequelize');
var sequelize = new Sequelize(config.dbName, config.dbUserName, config.dbPassword, {
    host: config.dbHost,
    port: config.dbPort,
    dialect: 'postgres',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    logging: false
});

module.exports = sequelize;
