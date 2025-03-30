const battleRequestMaster = require('../models/battle_request_master').battleRequestMaster;
const sequelize = require('../db');
var Sequelize = require('sequelize');

const addBattleRequest = data => battleRequestMaster.create({
    ...data
}).then((result) => {
    var response = { status: true, message: "Success! Battle request added successfully!", data: result }
    return response;
}).catch((error) => {
    var response = { status: false, message: "Error! Invalid data found", error }
    return response;
});

const getBattleRequestByToken = (id) => {
    var query = {
        where: {
            battle_token: id
        },
    };
    return battleRequestMaster.findOne(query).then(sequelize.getValues)
}

const getBattleRequestByReceiverId = (id) => {
    var query = {
        where: {
            receiver_user_id: id,
            battle_status: "pending",
            sender_battle_status: "complete",
            is_delete: 0
        },
    };
    return battleRequestMaster.findAll(query).then(sequelize.getValues)
}

const getPendingBattlesCount = (id) => {
    var query = {
        where: {
            sender_user_id: id,
            battle_status: "pending",
            sender_battle_status: "complete",
            is_delete: 0
        },
    };
    return battleRequestMaster.findAll(query).then(sequelize.getValues)
}

const getSenderBattleRequest = (token, id) => {
    var query = {
        where: {
            sender_user_id: id,
            battle_token: token,
            sender_battle_status: "pending",
            is_delete: 0
        },
    };
    return battleRequestMaster.findOne(query).then(sequelize.getValues)
}

const getBattleRequestBySenderId = (id) => {
    var query = {
        where: {
            sender_user_id: id,
            battle_status: { [Sequelize.Op.ne]: 'pending' },
            is_read: 0,
            is_delete: 0
        },
    };
    return battleRequestMaster.findAll(query).then(sequelize.getValues)
}


const updateBattleRequestByToken = (data, query) => {
    return battleRequestMaster.update(data, query).then(function ([rowsUpdate, [updatedBadge]]) {
        return updatedBadge;
    })
}



module.exports = {
    getPendingBattlesCount,
    addBattleRequest,
    getBattleRequestByToken,
    getBattleRequestByReceiverId,
    updateBattleRequestByToken,
    getBattleRequestBySenderId,
    getSenderBattleRequest
}