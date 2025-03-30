const difficultyMaster = require('../models/difficulty_master').difficultyMaster;
const sequelize = require('../db');

const getAllDifficulties = (pageNo, dataLimit) => {
    var offset = (pageNo - 1) * dataLimit;
    var query = {
        where: {
            is_delete: 0
        },
        attributes: ['difficulty_id', 'difficulty_name'],
        offset: offset,
        limit: dataLimit,
        order: [['difficulty_id']]
    };

    return difficultyMaster.findAll(query).then(sequelize.getValues)
};

module.exports = {
    getAllDifficulties
};