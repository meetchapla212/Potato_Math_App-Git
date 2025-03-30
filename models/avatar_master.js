const Sequelize = require('sequelize');
const db = require('../db');


const avatarMaster = db.define('avatar_master', {
    avatar_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    avatar_image: {
        type: Sequelize.STRING(100),
    },
    is_paid: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    potato_quantity: {
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
    avatarMaster
}