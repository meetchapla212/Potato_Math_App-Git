const Sequelize = require('sequelize');
const db = require('../db');
var topicMaster = require('./topic_master').topicMaster
var questionMapMaster = require('./question_map_master').questionMapMaster
var resultMaster = require('./result_master').resultMaster
var streakAppliedMaster = require('./streak_applied_master').streakAppliedMaster
var streakMaster = require('./streak_master').streakMaster

const courseMaster = db.define('course_masters', {
    course_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    _grade_id: {
        type: Sequelize.INTEGER,
    },
    course_name: {
        type: Sequelize.STRING(100),
    },
    course_image: {
        type: Sequelize.STRING,
    },
    course_details: {
        type: Sequelize.TEXT,
    },
    _admin_id: {
        type: Sequelize.INTEGER,
    },
    sortIndex: {
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

courseMaster.hasMany(topicMaster, { foreignKey: '_course_id' })
topicMaster.belongsTo(courseMaster, { as: 'topic_master', foreignKey: '_course_id' })

courseMaster.hasMany(questionMapMaster, { foreignKey: '_course_id' })
questionMapMaster.belongsTo(courseMaster, { as: 'course_masters', foreignKey: '_course_id' })

courseMaster.hasMany(resultMaster, { foreignKey: '_course_id' })
resultMaster.belongsTo(courseMaster, { as: 'course', foreignKey: '_course_id' })

courseMaster.hasMany(streakAppliedMaster, { foreignKey: '_course_id' })
streakAppliedMaster.belongsTo(courseMaster, { as: 'applied_streak_course', foreignKey: '_course_id' })

courseMaster.hasMany(streakMaster, { foreignKey: '_course_id' })
streakMaster.belongsTo(courseMaster, { as: 'streak_course', foreignKey: '_course_id' })

module.exports = {
    courseMaster
}