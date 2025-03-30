const Sequelize = require('sequelize');
const db = require('../db');
var questionMapMaster = require('./question_map_master').questionMapMaster

const difficultyMaster = db.define('difficulty_masters', {
    difficulty_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    difficulty_name: {
        type: Sequelize.STRING(100),
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

difficultyMaster.hasMany(questionMapMaster, { foreignKey: '_difficulty_id' })
questionMapMaster.belongsTo(difficultyMaster, { as: 'difficulty_masters', foreignKey: '_difficulty_id' })

module.exports = {
    difficultyMaster
}
