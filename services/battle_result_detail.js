const battleResultDetailMaster = require('../models/battle_result_detail_master').battleResultDetailMaster;
const sequelize = require('../db');
var Sequelize = require('sequelize');

const totalNumberOfView = async (questionId) => {
    var query = {
        where: {
            _question_id: questionId,
            is_delete: 0
        },
    };
    return battleResultDetailMaster.count(query).then(sequelize.getValues)
}

const totalNumberOfTrue = async (questionId) => {
    var query = {
        where: {
            _question_id: questionId,
            answer_status: true,
            is_delete: 0
        },
    };
    return battleResultDetailMaster.count(query).then(sequelize.getValues)
}

const totalNumberOfFalse = async (questionId) => {
    var query = {
        where: {
            _question_id: questionId,
            answer_status: false,
            is_delete: 0
        },
    };
    return battleResultDetailMaster.count(query).then(sequelize.getValues)
}

const getSumOfTime = async (questionId) => {
    var query = {
        where: {
            _question_id: questionId,
            is_delete: 0
        },
        attributes: [[Sequelize.fn('sum', Sequelize.col('time')), 'total']]
    };
    return battleResultDetailMaster.findOne(query).then(sequelize.getValues)
}

module.exports = {
    totalNumberOfView,
    totalNumberOfTrue,
    totalNumberOfFalse,
    getSumOfTime
};
