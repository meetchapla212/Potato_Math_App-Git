const Sequelize = require('sequelize');
const db = require('../db');

const streakMaster = db.define('streak_masters', {
    streak_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    streak_name: {
        type: Sequelize.STRING(),
    },
    streak_image: {
        type: Sequelize.STRING(100),
    },
    streak_details: {
        type: Sequelize.TEXT,
    },
    streak_time: {
        type: Sequelize.STRING(),
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
    streak_type: {
        type: Sequelize.STRING(),
    },
    gams: {
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
    streakMaster
}