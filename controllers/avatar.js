const avatarService = require('../services/avatar');
const userAvatarService = require('../services/user_avatar');
const config = require('../config');
var multer = require('multer');
const mkdirp = require('mkdirp');

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        var path = config.uploadDir + config.avatarImagePath;
        mkdirp(path, err => callback(null, path))
    },
    filename: function (req, file, callback) {
        callback(null, 'avatar_image_' + Date.now());
    }
});

var upload = multer({ storage: storage }).single('avatar_image');


function getAvatars(req, res) {

    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;

    return avatarService.getAllAvatars(pageNo, dataLimit).then(result => {
        if (result.length > 0) {
            let serverURL = config.getServerUrl(req)
            result.forEach((avatar) => {
                avatar['avatar_image'] = serverURL + config.avatarImagePath + avatar['avatar_image'];
            })
            var response = { status: true, data: result }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });
}

function getAllAvatars(req, res) {
    var userId = req.user.id
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;
    return userAvatarService.getUserAvatar(userId).then(userAvatar => {
        if (userAvatar) {

            return avatarService.getAllAvatars(pageNo, dataLimit).then(result => {
                if (result.length > 0) {
                    let serverURL = config.getServerUrl(req)
                    result.forEach((avatar) => {
                        userAvatar.forEach(user => {
                            if ((user.dataValues._avatar_id) * 1 === avatar['avatar_id']) {
                                avatar['is_paid'] = 0;
                            }
                        })
                        avatar['avatar_image'] = serverURL + config.avatarImagePath + avatar['avatar_image'];
                    })
                    var response = { status: true, data: result }
                } else {
                    var response = { status: false, message: config.no_data_message }
                }
                res.send(response)
            });
        }
    })
}

function getAvatarById(req, res) {
    const { avatarId } = req.params;
    if (avatarId) {

        return avatarService.getAvatarById(avatarId).then(result => {
            if (result.length > 0) {
                // let serverURL = config.getServerUrl(req)
                // result.forEach((avatar) => {
                // avatar['avatar_image'] = serverURL + config.avatarImagePath + 
                // avatar['avatar_image'];
                // })
                var response = { status: true, data: result }
            } else {
                var response = { status: false, message: config.no_data_message }
            }
            res.send(response)
        });
    } else {
        var response = { status: false, message: config.no_data_message };
        res.send(response);
    }


}

module.exports = {
    getAllAvatars,
    getAvatarById,
    getAvatars
}