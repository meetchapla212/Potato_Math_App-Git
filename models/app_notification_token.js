const Sequelize = require('sequelize');
const db = require('../db');


const appNotificationTokenMaster = db.define('app_notification_token', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: Sequelize.INTEGER,
    },
    token: {
        type: Sequelize.STRING(500),
    },
    device_id: {
        type: Sequelize.STRING(25),
    },
    device_type: {
        type: Sequelize.STRING(15),
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
    appNotificationTokenMaster
}