const appSettingMaster = require('../models/app_setting').appSettingMaster;
const sequelize = require('../db');
var Sequelize = require('sequelize');

// const addGift = data => appSettingMaster.create({
//     ...data
// }).then((result) => {
//     var response = { status: true, message: "Success! Gift added successfully!" }
//     return response;
// }).catch((error) => {
//     var response = { status: false, message: "Error! Invalid data found", error }
//     return response;
// });


const getSettings = (pageNo, dataLimit) => {
    var offset = (pageNo - 1) * dataLimit;

    var query = {
        where: {
            is_delete: 0
        },
        attributes: ['id', 'key', 'value',],
        offset: offset,
        limit: dataLimit,
        order: [['id', 'DESC']]
    };

    return appSettingMaster.findAll(query).then(sequelize.getValues)
}

// const getGiftsForUser = (pageNo, dataLimit, userPotato) => {
//     var offset = (pageNo - 1) * dataLimit;

//     var query = {
//         where: {
//             is_delete: 0,
//             gams: { [Sequelize.Op.lte]: userPotato },
//         },
//         attributes: ['gift_id', 'gift_name', 'gift_image', 'gams', 'stock'],
//         offset: offset,
//         limit: dataLimit,
//         order: [['gift_id', 'DESC']]
//     };

//     return appSettingMaster.findAll(query).then(sequelize.getValues)
// }


// const getGiftById = (id) => {
//     var query = {
//         where: {
//             gift_id: id
//         },
//         attributes: ['gift_id', 'gift_name', 'gift_image', 'gams', 'stock'],
//     };
//     return appSettingMaster.findOne(query).then(sequelize.getValues)
// }


// const updateGiftById = (data, query) => {
//     return appSettingMaster.update(data, query).then(function ([rowsUpdate, [updatedGift]]) {
//         return updatedGift;
//     })
// }


module.exports = {
    // addGift,
    getSettings,
    // getGiftById,
    // updateGiftById,
    // getGiftsForUser
}