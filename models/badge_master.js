const Sequelize = require('sequelize');
const db = require('../db');

const badgeMaster = db.define('badge_masters', {
    badge_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    badge_name: {
        type: Sequelize.STRING(),
    },
    badge_image: {
        type: Sequelize.STRING(100),
    },
    badge_details: {
        type: Sequelize.TEXT,
    },
    _course_id: {
        type: Sequelize.INTEGER,
    },
    _grade_id: {
        type: Sequelize.INTEGER,
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
    badgeMaster
}