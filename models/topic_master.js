const Sequelize = require('sequelize');
const db = require('../db');
var questionMaster = require('./question_master').questionMaster
var questionMapMaster = require('./question_map_master').questionMapMaster
var resultMaster = require('./result_master').resultMaster
var battleMaster = require('./battle_result_master').battleMaster

const topicMaster = db.define('topic_masters', {
    topic_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    topic_name: {
        type: Sequelize.STRING(),
    },
    topic_image: {
        type: Sequelize.STRING(100),
    },
    topic_details: {
        type: Sequelize.TEXT,
    },
    _admin_id: {
        type: Sequelize.INTEGER,
    },
    sortIndex: {
        type: Sequelize.INTEGER,
    },
    _course_id: {
        type: Sequelize.INTEGER,
    },
    _grade_id: {
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

topicMaster.hasMany(questionMaster, { foreignKey: '_topic_id' })
questionMaster.belongsTo(topicMaster, { as: 'question_master', foreignKey: '_topic_id' })

topicMaster.hasMany(questionMapMaster, { foreignKey: '_topic_id' })
questionMapMaster.belongsTo(topicMaster, { as: 'topic_masters', foreignKey: '_topic_id' })

topicMaster.hasMany(resultMaster, { foreignKey: '_topic_id' })
resultMaster.belongsTo(topicMaster, { as: 'topic_master', foreignKey: '_topic_id' })

topicMaster.hasMany(battleMaster, { foreignKey: '_topic_id' })
battleMaster.belongsTo(topicMaster, { as: 'topic', foreignKey: '_topic_id' })

module.exports = {
    topicMaster
}
