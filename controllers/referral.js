var referralService = require('../services/referral');
const appUserService = require('../services/app_user');
const config = require('../config');
const moment = require('moment');

function addRecord(req, res) {
    const recordDetails = req.body;
    recordDetails._user_id = req.user.id;
    recordDetails._invite_id = (recordDetails._invite_id) * 1;

    if (recordDetails._user_id !== recordDetails._invite_id) {
        return referralService.addRecord(recordDetails).then(data => {
            let serverURL = config.getServerUrl(req)
            return appUserService.getUserDetails(data.data._invite_id).then(result => {
                if (result) {
                    result.dataValues.user_image = serverURL + config.messageavatarImagePath + result.dataValues.user_image
                    var response = { status: true, message: data.message, data: result }
                }
                else {
                    var response = { status: false, message: config.no_data_message }
                }
                res.send(response)
            })
        });
    } else {
        var response = { status: false, message: config.no_data_message }
        res.send(response)
    }
};


function getInvitedFriends(req, res) {
    var userId = req.user.id;

    return referralService.getInvitedFriends(userId).then(result => {
        if (result.length > 0) {
            let serverURL = config.getServerUrl(req)
            result.forEach((user) => {
                user.linked_user['user_image'] = serverURL + config.avatarImagePath + user.linked_user['user_image'];
            })
            var response = { status: true, data: result }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });
}

function userNotification(req, res) {
    var userId = req.user.id;
    var isBattle = true;
    return referralService.getInvitedFriends(userId, isBattle).then(result => {
        if (result) {
            let serverURL = config.getServerUrl(req)
            result.forEach((user) => {
                user.linked_user['user_image'] = serverURL + config.avatarImagePath + user.linked_user['user_image'];
            })
            var response = { status: true, data: result }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });
}



module.exports = {
    addRecord,
    getInvitedFriends,
    userNotification
}