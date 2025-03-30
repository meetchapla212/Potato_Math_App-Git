const giftRedeemMaster = require('../models/gift_redeem_master').giftRedeemMaster;
const userMaster = require('../models/app_users_master').userMaster;
const giftMaster = require('../models/gift_master').giftMaster;
const sequelize = require('../db');
var Sequelize = require('sequelize');

const addGiftRedeem = data => giftRedeemMaster.create({
    ...data
}).then((result) => {
    var response = { status: true, message: "Success! Gift redeem successfully!", data: result }
    return response;
}).catch((error) => {
    var response = { status: false, message: "Error! Invalid data found", error }
    return response;
});

const totalNumberOfRedeem = async (giftId) => {
    var query = {
        where: {
            _gift_id: giftId,
            is_delete: 0
        },
    };
    return giftRedeemMaster.count(query).then(sequelize.getValues)
}

const getGiftRedeem = (pageNo, dataLimit) => {
    var offset = (pageNo - 1) * dataLimit;

    var query = {
        where: {
            is_delete: 0
        },
        // attributes: ['gift_redeem_id', '_gift_id', '_user_id'],
        include: [
            {
                model: giftMaster,
                as: 'gift_detail',
                attributes: [
                    'gift_name', 'gift_image', 'gams'
                ],
            },
            {
                model: userMaster,
                as: 'user_gift_detail',
                attributes: [
                    'name'
                ],
            }
        ],
        offset: offset,
        limit: dataLimit,
        order: [['gift_redeem_id', 'DESC']]
    };

    return giftRedeemMaster.findAndCountAll(query).then(sequelize.getValues)
}

module.exports = {
    addGiftRedeem,
    totalNumberOfRedeem,
    getGiftRedeem
}