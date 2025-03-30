const Sequelize = require('sequelize');
const db = require('../db');
var userMaster = require('./app_users_master').userMaster

const contactMaster = db.define('contact_us_request', {
    contact_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    _user_id: {
        type: Sequelize.INTEGER,
    },
    title: {
        type: Sequelize.STRING(100),
    },
    type: {
        type: Sequelize.STRING(100),
    },
    attachment: {
        type: Sequelize.STRING,
    },
    description: {
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
    contactMaster
}