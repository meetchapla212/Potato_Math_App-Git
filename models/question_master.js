const Sequelize = require('sequelize');
const db = require('../db');
var questionMapMaster = require('./question_map_master').questionMapMaster
var questionTagMaster = require('./question_tag_master').questionTagMaster

const questionMaster = db.define('question_masters', {
    question_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    question_text: {
        type: Sequelize.TEXT,
    },
    options: {
        type: Sequelize.JSONB,
    },
    right_answer: {
        type: Sequelize.STRING(),
    },
    explanation: {
        type: Sequelize.TEXT,
    },
    type: {
        type: Sequelize.STRING(),
        defaultValue: 'normal'
    },
    _admin_id: {
        type: Sequelize.INTEGER,
    },
    _admin_id: {
        type: Sequelize.INTEGER,
    },
    _grade_id: {
        type: Sequelize.INTEGER,
    },
    _qsl_number: {
        type: Sequelize.STRING(15)
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

questionMaster.hasMany(questionMapMaster, { foreignKey: '_question_id' })
questionMapMaster.belongsTo(questionMaster, { as: 'question_masters', foreignKey: '_question_id' })


questionMaster.hasMany(questionMapMaster, { foreignKey: '_question_id' })
questionMapMaster.belongsTo(questionMaster, { as: 'question_map_masters', foreignKey: '_question_id' })

questionMaster.hasMany(questionTagMaster, { foreignKey: '_question_id' })
questionTagMaster.belongsTo(questionMaster, { as: 'question_tag_masters', foreignKey: '_question_id' })

module.exports = {
    questionMaster
}
