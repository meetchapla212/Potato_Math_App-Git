const Sequelize = require('sequelize');
const db = require('../db');


const appTextMaster = db.define('app_text_configuration', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    key: {
        type: Sequelize.STRING,
    },
    value: {
        type: Sequelize.TEXT,
    },
    type: {
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
    appTextMaster
}