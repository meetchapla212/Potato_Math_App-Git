const Sequelize = require('sequelize');
const db = require('../db');


const streakAppliedMaster = db.define('streak_applied_master', {
    streak_applied_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    _user_id: {
        type: Sequelize.INTEGER,
    },
    _streak_id: {
        type: Sequelize.INTEGER,
    },
    _course_id: {
        type: Sequelize.INTEGER,
    },
    start_time: {
        type: Sequelize.STRING()
    },
    end_time: {
        type: Sequelize.STRING()
    },
    _streak_type: {
        type: Sequelize.STRING()
    },
    potato_required: {
        type: Sequelize.INTEGER,
    },
    potato_earn: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    streak_status: {
        type: Sequelize.STRING(15),
        defaultValue: 'active'
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
    streakAppliedMaster
}