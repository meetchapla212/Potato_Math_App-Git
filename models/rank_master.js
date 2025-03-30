const Sequelize = require('sequelize');
const db = require('../db');

const rankMaster = db.define('rank_masters', {
    rank_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    rank_name: {
        type: Sequelize.STRING(),
    },
    rank_image: {
        type: Sequelize.STRING(100),
    },
    potato_quantity: {
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
    rankMaster
}