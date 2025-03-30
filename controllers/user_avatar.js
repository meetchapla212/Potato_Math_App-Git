var userAvatarService = require('../services/user_avatar');
var appUserService = require('../services/app_user');
const config = require('../config');
var multer = require('multer');
const mkdirp = require('mkdirp');

function avatarPurchase(req, res) {
    var userId = req.user.id;
    var details = {};
    details._user_id = userId ? userId : 0;
    details._avatar_id = (req.body._avatar_id) ? (req.body._avatar_id) * 1 : 0;

    return appUserService.getUserDetails(userId).then(result => {
        if (result) {
            if (result.potato_earn > req.body.potato_quantity) {
                var appServiceDetails = {};
                appServiceDetails.potato_earn = result.potato_earn - req.body.potato_quantity;
                return appUserService.updateUserProfile(appServiceDetails, userId).then(userUpdate => {
                    if (userUpdate) {
                        return userAvatarService.avatarPurchase(details).then(data => {
                            if (data) {
                                res.send(data)
                            }
                        })
                    }
                })
            } else {
                response = { status: false, message: "You don't have much potato" }
                res.send(response)
            }
        }
    })
};

function getUserAvatar(req, res) {

    return userAvatarService.getUserAvatar().then(result => {
        if (result) {
            var response = { status: true, data: result };
        } else {
            var response = { status: false, message: config.no_data_message };
        }
        res.send(response);
    });
};

module.exports = {
    avatarPurchase,
    getUserAvatar,
}