const Sequelize = require('sequelize');
const db = require('../db');


const questionMapMaster = db.define('question_map_masters', {
    map_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    _question_id: {
        type: Sequelize.INTEGER,
    },
    _grade_id: {
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
    eta: {
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
    questionMapMaster
}