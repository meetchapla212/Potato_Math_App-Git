const Sequelize = require('sequelize');
const db = require('../db');


const questionTagMaster = db.define('question_tag_masters', {
    _question_id: {
        type: Sequelize.INTEGER,
    },
    tag: {
        type: Sequelize.STRING,
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
    questionTagMaster
}