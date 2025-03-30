const Sequelize = require('sequelize');
const db = require('../db');


const battleMaster = db.define('battle_master', {
    battle_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    battle_hash: {
        type: Sequelize.STRING,
    },
    _user_id: {
        type: Sequelize.INTEGER,
    },
    _opponent_id: {
        type: Sequelize.INTEGER,
    },
    _course_id: {
        type: Sequelize.INTEGER,
    },
    _topic_id: {
        type: Sequelize.INTEGER,
    },
    _difficulty_id: {
        type: Sequelize.INTEGER,
    },
    challenge_type: {
        type: Sequelize.INTEGER,
    },
    total_question: {
        type: Sequelize.INTEGER,
    },
    user_right_answer: {
        type: Sequelize.INTEGER,
    },
    user_wrong_answer: {
        type: Sequelize.INTEGER,
    },
    user_potato_earn: {
        type: Sequelize.INTEGER,
    },
    user_quizTime: {
        type: Sequelize.INTEGER,
    },
    opponent_right_answer: {
        type: Sequelize.INTEGER,
    },
    opponent_wrong_answer: {
        type: Sequelize.INTEGER,
    },
    opponent_potato_earn: {
        type: Sequelize.INTEGER,
    },
    opponent_quizTime: {
        type: Sequelize.INTEGER,
    },
    winner_user_id: {
        type: Sequelize.INTEGER,
    },
    battle_status: {
        type: Sequelize.STRING,
        defaultValue: "pending"
    },
    winner_potato: {
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
    battleMaster
}