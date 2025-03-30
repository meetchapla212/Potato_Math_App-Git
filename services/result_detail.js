const resultDetailMaster = require('../models/result_detail_master').resultDetailMaster;
const sequelize = require('../db');
var Sequelize = require('sequelize');

const addResultDeatil = data => resultDetailMaster.create({
    ...data
}).then((result) => {
    var response = { status: true, message: "Success! Result Detail added successfully!" }
    return response;
}).catch((error) => {
    var response = { status: false, message: "Error! Invalid data found", error }
    return response;
});

const totalNumberOfView = async (questionId) => {
    var query = {
        where: {
            _question_id: questionId,
            is_delete: 0
        },
    };
    return resultDetailMaster.count(query).then(sequelize.getValues)
}

const totalNumberOfTrue = async (questionId) => {
    var query = {
        where: {
            _question_id: questionId,
            answer_status: true,
            is_delete: 0
        },
    };
    return resultDetailMaster.count(query).then(sequelize.getValues)
}
const totalNumberOfFalse = async (questionId) => {
    var query = {
        where: {
            _question_id: questionId,
            answer_status: false,
            is_delete: 0
        },
    };
    return resultDetailMaster.count(query).then(sequelize.getValues)
}

const getSumOfTime = async (questionId) => {
    var query = {
        where: {
            _question_id: questionId,
            is_delete: 0
        },
        attributes: [[Sequelize.fn('sum', Sequelize.col('time')), 'total']]
    };
    return resultDetailMaster.findOne(query).then(sequelize.getValues)
}

module.exports = {
    addResultDeatil,
    totalNumberOfView,
    totalNumberOfTrue,
    totalNumberOfFalse,
    getSumOfTime
};
