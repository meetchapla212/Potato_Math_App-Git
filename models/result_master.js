const Sequelize = require('sequelize');
const db = require('../db');


const resultMaster = db.define('result_master', {
    result_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    _user_id: {
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
    right_answer: {
        type: Sequelize.INTEGER,
    },
    wrong_answer: {
        type: Sequelize.INTEGER,
    },
    potato_earn: {
        type: Sequelize.INTEGER,
    },
    quizTime: {
        type: Sequelize.INTEGER,
    },
    _joined_id: {
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
    resultMaster
}