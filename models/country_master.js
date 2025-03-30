const Sequelize = require('sequelize');
const db = require('../db');


const countryMaster = db.define('country_master', {
    country_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    country_name: {
        type: Sequelize.STRING,
    },
    country_nicename: {
        type: Sequelize.STRING,
    },
    is_delete: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    status: {
        type: Sequelize.STRING(15),
        defaultValue: 'active'
    },
});


module.exports = {
    countryMaster
}