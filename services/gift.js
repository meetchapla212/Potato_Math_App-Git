const giftMaster = require('../models/gift_master').giftMaster;
const sequelize = require('../db');
var Sequelize = require('sequelize');

const addGift = data => giftMaster.create({
    ...data
}).then((result) => {
    var response = { status: true, message: "Success! Gift added successfully!" }
    return response;
}).catch((error) => {
    var response = { status: false, message: "Error! Invalid data found", error }
    return response;
});


const getGifts = (pageNo, dataLimit) => {
    var offset = (pageNo - 1) * dataLimit;

    var query = {
        where: {
            is_delete: 0
        },
        attributes: ['gift_id', 'gift_name', 'gift_image', 'gams', 'stock'],
        offset: offset,
        limit: dataLimit,
        order: [['gift_id', 'DESC']]
    };

    return giftMaster.findAndCountAll(query).then(sequelize.getValues)
}


const getGiftsForMail = (giftId) => {
    var dataLimit = 3;
    var query = {
        where: {
            gift_id: { [Sequelize.Op.ne]: giftId },
            is_delete: 0
        },
        attributes: ['gift_name', 'gift_image'],
        limit: dataLimit,
        // order: [['gift_id', 'DESC']]
    };

    return giftMaster.findAndCountAll(query).then(sequelize.getValues)
}

const getGiftsForUser = (pageNo, dataLimit, userPotato) => {
    var offset = (pageNo - 1) * dataLimit;

    var query = {
        where: {
            is_delete: 0,
            gams: { [Sequelize.Op.lte]: userPotato },
        },
        attributes: ['gift_id', 'gift_name', 'gift_image', 'gams', 'stock'],
        offset: offset,
        limit: dataLimit,
        order: [['gift_id', 'DESC']]
    };

    return giftMaster.findAll(query).then(sequelize.getValues)
}


const getGiftById = (id) => {
    var query = {
        where: {
            gift_id: id
        },
        attributes: ['gift_id', 'gift_name', 'gift_image', 'gams', 'stock'],
    };
    return giftMaster.findOne(query).then(sequelize.getValues)
}


const updateGiftById = (data, query) => {
    return giftMaster.update(data, query).then(function ([rowsUpdate, [updatedGift]]) {
        return updatedGift;
    })
}


module.exports = {
    addGift,
    getGifts,
    getGiftById,
    updateGiftById,
    getGiftsForUser,
    getGiftsForMail
}