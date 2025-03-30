const paymentMaster = require('../models/payment_history').paymentMaster;
const userMaster = require('../models/app_users_master').userMaster;
const sequelize = require('../db');

const addPaymentRecord = data => paymentMaster.create({
    ...data
}).then((result) => {
    var response = { status: true, message: "Success! Record added successfully!" }
    return response;
}).catch((error) => {
    var response = { status: false, message: "Error! Invalid data found", error }
    return response;
});

const getAllPayments = (pageNo, dataLimit) => {
    var offset = (pageNo - 1) * dataLimit;

    var query = {
        where: {
            is_delete: 0
        },
        attributes: ['payment_id', '_user_id', '_coin_package_id', 'coin_name', 'transaction_id', 'total_amount', 'coin_quantity'],
        include: [
            {
                model: userMaster,
                as: 'user_detail',
                attributes: [
                    'name',
                ],
            }
        ],
        offset: offset,
        limit: dataLimit,
        order: [['payment_id', 'DESC']]
    };
    return paymentMaster.findAndCountAll(query).then(sequelize.getValues)
};

const getAllPaymentsOfUser = (pageNo, dataLimit, userId) => {
    var offset = (pageNo - 1) * dataLimit;

    var query = {
        where: {
            is_delete: 0,
            _user_id: userId
        },
        attributes: ['payment_id', '_user_id', '_coin_package_id', 'coin_name', 'transaction_id', 'total_amount', 'coin_quantity'],
        include: [
            {
                model: userMaster,
                as: 'user_detail',
                attributes: [
                    'name',
                ],
            }
        ],
        offset: offset,
        limit: dataLimit,
        order: [['payment_id', 'DESC']]
    };
    return paymentMaster.findAll(query).then(sequelize.getValues)
};

const totalNumberOfPurchase = async (coinId) => {
    var query = {
        where: {
            _coin_package_id: coinId,
            is_delete: 0
        },
    };
    return paymentMaster.count(query).then(sequelize.getValues)
}

const findBySubscriptionId = async (subscriptionId) => {
    var query = {
        where: {
            transaction_id: subscriptionId,
            is_delete: 0
        },
    };
    return paymentMaster.findOne(query).then(sequelize.getValues)
}

const totalUniqueNumberOfPurchase = async (coinId) => {
    var query = {
        where: {
            _coin_package_id: coinId,
            is_delete: 0
        },
        group: ['_user_id'],
        // distinct: true,
    };
    return paymentMaster.count(query).then(sequelize.getValues)
}

module.exports = {
    addPaymentRecord,
    getAllPayments,
    getAllPaymentsOfUser,
    totalNumberOfPurchase,
    totalUniqueNumberOfPurchase,
    findBySubscriptionId
};
