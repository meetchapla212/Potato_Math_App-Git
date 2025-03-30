const rankMaster = require('../models/rank_master').rankMaster;
const sequelize = require('../db');

const addRank = data => rankMaster.create({
    ...data
}).then((result) => {
    var response = { status: true, message: "Success! Rank added successfully!" }
    return response;
}).catch((error) => {
    var response = { status: false, message: "Error! Invalid data found", error }
    return response;
});


const getAllRanks = (pageNo, dataLimit) => {
    var offset = (pageNo - 1) * dataLimit;
    var query = {
        where: {
            is_delete: 0
        },
        attributes: ['rank_id', 'rank_name', 'rank_image', 'potato_quantity'],
        offset: offset,
        limit: dataLimit,
        order: [['rank_id', 'ASC']]
    };
    return rankMaster.findAndCountAll(query).then(sequelize.getValues)
}

const getAllRanksPotato = (pageNo, dataLimit) => {
    // var offset = (pageNo - 1) * dataLimit;
    var query = {
        where: {
            is_delete: 0
        },
        attributes: ['potato_quantity'],
        // offset: offset,
        // limit: dataLimit,
        // order: [['rank_id', 'DESC']]
    };
    return rankMaster.findAll(query).then(sequelize.getValues)
}

const getRankByPotatoQuantity = (quantity) => {
    var query = {
        where: {
            potato_quantity: quantity
        },
        attributes: ['rank_id', 'rank_name', 'rank_image', 'potato_quantity'],
    };
    return rankMaster.findOne(query).then(sequelize.getValues)
}


const getRankById = (id) => {
    var query = {
        where: {
            rank_id: id
        },
        attributes: ['rank_id', 'rank_name', 'rank_image', 'potato_quantity'],
    };
    return rankMaster.findOne(query).then(sequelize.getValues)
}


const updateRankById = (data, query) => {
    return rankMaster.update(data, query).then(function ([rowsUpdate, [updatedRank]]) {
        return updatedRank;
    })
}



module.exports = {
    addRank,
    getAllRanks,
    getRankById,
    updateRankById,
    getAllRanksPotato,
    getRankByPotatoQuantity
}