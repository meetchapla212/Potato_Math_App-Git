const appNotificationTokenMaster = require('../models/app_notification_token').appNotificationTokenMaster;
const sequelize = require('../db');
var Sequelize = require('sequelize');


const getAll = (pageNo, dataLimit) => {
    var offset = (pageNo - 1) * dataLimit;

    var query = {
        where: {
            is_delete: 0
        },
        attributes: ['id', 'key', 'value'],
        offset: offset,
        limit: dataLimit,
        order: [
            ['id', 'DESC']
        ]
    };

    return appNotificationTokenMaster.findAll(query).then(sequelize.getValues)
}

const isExistDevice = (req) => {
    var query = {
        where: {
            user_id: req.user_id,
            device_id: req.device_id,
            device_type: req.device_type,
            is_delete: 0
        },
    };
    return appNotificationTokenMaster.findAll(query).then(sequelize.getValues)
}

const addDevice = (req) => {
    return appNotificationTokenMaster.create(req).then((result) => {
        var response = {
            status: true,
            message: "Success! New device added successfully!"
        }
        return response;
    }).catch((error) => {
        var response = {
            status: false,
            message: "Error! Invalid data found",
            error
        }
        return response;
    });
}

const updateDeviceToken = (req, id) => {
    var query = {
        where: {
            id: id
        },
    };
    return appNotificationTokenMaster.update(req, query).then((result) => {
        var response = {
            status: true,
            message: "Success! Device token updated successfully!"
        }
        return response;
    }).catch((error) => {
        var response = {
            status: false,
            message: "Error! Invalid data found",
            error
        }
        return response;
    })
}

const getTokens = (user_id) => {
    var query = {
        where: {
            user_id: user_id,
            is_delete: 0,
        }
    };
    return appNotificationTokenMaster.findAll(query).then(sequelize.getValues)
}
const getAllTokens = () => {
    var query = {
        where: {
            is_delete: 0,
        },
    };
    return appNotificationTokenMaster.findAll(query).then(sequelize.getValues)
}

const destroyNotificationToken = (query) => {
    return appNotificationTokenMaster.destroy(query).then(function (instance) {
        return instance;
    })
}


module.exports = {
    getAll,
    isExistDevice,
    addDevice,
    updateDeviceToken,
    getTokens,
    getAllTokens,
    destroyNotificationToken
}