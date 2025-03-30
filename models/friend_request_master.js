const Sequelize = require('sequelize');
const db = require('../db');


const friendRequestMaster = db.define('friend_request_master', {
    friend_request_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    _user_id: {
        type: Sequelize.INTEGER,
    },
    _friend_id: {
        type: Sequelize.INTEGER,
    },
    is_pending: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    is_read: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
    friendRequestMaster
}