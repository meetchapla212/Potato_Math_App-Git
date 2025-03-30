const Sequelize = require('sequelize');
const db = require('../db');


const battleResultDetailMaster = db.define('battle_result_detail_master', {
    result_detail_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    _battle_id: {
        type: Sequelize.INTEGER,
    },
    _question_id: {
        type: Sequelize.INTEGER,
    },
    _map_id: {
        type: Sequelize.INTEGER,
    },
    time: {
        type: Sequelize.INTEGER,
    },
    potato: {
        type: Sequelize.INTEGER,
    },
    user_answer: {
        type: Sequelize.STRING(),
    },
    answer_status: {
        type: Sequelize.BOOLEAN,
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
    battleResultDetailMaster
}