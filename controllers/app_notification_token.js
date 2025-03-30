var appNotificationService = require('../services/app_notification_token');
const config = require('../config');
var pushNotification = require('./push_notification');

function getAll(req, res) {
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;

    return appNotificationService.getAll(pageNo, dataLimit).then(result => {

        if (result) {
            var response = {
                status: true,
                data: result
            }
        } else {
            var response = {
                status: false,
                message: config.no_data_message
            }
        }
        res.send(response)
    });
};

function logout(req, res) {
    var user_id = req.user.id;
    var body = req.body;
    body.user_id = user_id;
    return appNotificationService.destroyNotificationToken({
        returning: true, where: { user_id: body.user_id, device_id: body.device_id, device_type: body.device_type }
    }).then(async data => {
        if (data) {
            var response = { status: true }
        } else {
            var response = { status: false }
        }
        res.send(response)
    })
}


function setNotificationToken(req, res) {
    var user_id = req.user.id;
    var body = req.body;
    body.user_id = user_id;
    console.log(req.body)
    if (body.token && body.device_id && body.device_type) {
        return appNotificationService.isExistDevice(body)
            .then(async exists => {
                if (exists.length === 1) {
                    return appNotificationService.updateDeviceToken(body, exists[0].id)
                        .then(async updateValue => {
                            res.send(updateValue);
                        })
                } else {
                    return appNotificationService.addDevice(body)
                        .then(async addValue => {
                            res.send(addValue)
                        })
                }
            })
    } else {
        var response = {
            status: false,
            message: "Some informations are missing!"
        }
        res.send(response)
    }


}



module.exports = {
    getAll,
    setNotificationToken,
    logout
    // test
}