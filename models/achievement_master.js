const Sequelize = require('sequelize');
const db = require('../db');


const achievementMaster = db.define('achievement_master', {
    achievement_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    _course_id: {
        type: Sequelize.INTEGER,
    },
    title: {
        type: Sequelize.STRING(30),
    },
    achievement_image: {
        type: Sequelize.STRING(100),
    },
    potato_quantity: {
        type: Sequelize.INTEGER,
    },
    quiz_type: {
        type: Sequelize.STRING(),
    },
    gamification_mechanics: {
        type: Sequelize.STRING(),
    },
    duration: {
        type: Sequelize.INTEGER,
    },
    daily: {
        type: Sequelize.BOOLEAN,
    },
    start_date: {
        type: Sequelize.STRING(),
    },
    end_date: {
        type: Sequelize.STRING(),
    },
    gem_reward: {
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
    achievementMaster
}