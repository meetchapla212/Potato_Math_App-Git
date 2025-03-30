const Sequelize = require('sequelize');
const db = require('../db');

const battleRequestMaster = db.define('battle_request_master', {
    request_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    battle_token: {
        type: Sequelize.STRING(),
    },
    sender_user_id: {
        type: Sequelize.INTEGER,
    },
    receiver_user_id: {
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
    sender_result: {
        type: Sequelize.STRING(),
    },
    sender_battle_status: {
        type: Sequelize.STRING(),
        defaultValue: 'pending'
    },
    battle_status: {
        type: Sequelize.STRING(),
        defaultValue: 'pending'
    },
    is_read: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
    battleRequestMaster
}