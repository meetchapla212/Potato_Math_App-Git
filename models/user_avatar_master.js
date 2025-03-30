const Sequelize = require('sequelize');
const db = require('../db');


const userAvatarMaster = db.define('user_avatar_master', {
    user_avatar_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    _user_id: {
        type: Sequelize.INTEGER,
    },
    _avatar_id: {
        type: Sequelize.INTEGER,
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
    userAvatarMaster
}