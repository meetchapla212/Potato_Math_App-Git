const giftService = require('../services/gift');
const appUserService = require('../services/app_user');
const giftRedeemService = require('../services/gift_redeem');
const config = require('../config');
var multer = require('multer');
const mkdirp = require('mkdirp');

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        var path = config.uploadDir + config.giftImagePath;
        mkdirp(path, err => callback(null, path))
    },
    filename: function (req, file, callback) {
        callback(null, 'gift_image_' + Date.now());
    }
});

var upload = multer({ storage: storage }).single('gift_image');

function addGift(req, res) {

    upload(req, res, function (err) {
        var giftDetails = {};
        giftDetails.gift_image = req.file !== undefined ? req.file.filename : 'default';
        giftDetails.gift_name = (req.body.gift_name) ? req.body.gift_name : "";
        giftDetails.gams = (req.body.gams) ? req.body.gams : 0;
        giftDetails.stock = (req.body.stock) ? req.body.stock : 0;
        return giftService.addGift(giftDetails).then(data => res.send(data))
    });
}

function getGifts(req, res) {
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;
    return giftService.getGifts(pageNo, dataLimit).then(result => {
        if (result) {
            let serverURL = config.getServerUrl(req)

            const giftFunction = async (gift) => {
                gift['gift_image'] = serverURL + config.giftImagePath + gift['gift_image'];
                gift.dataValues['totalRedeem'] = await giftRedeemService.totalNumberOfRedeem(gift['gift_id']);
                return gift
            }

            return Promise.all(result.rows.map(resData => giftFunction(resData)))
                .then(data => {
                    var response = { status: true, count: result.count, data: data }
                    res.send(response);
                })
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });
}

function getGiftsForUser(req, res) {
    var user_id = req.user.id;
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;

    return appUserService.getUserDetails(user_id).then(user => {
        if (user) {

            return giftService.getGiftsForUser(pageNo, dataLimit, user.dataValues.gams_earn).then(result => {
                if (result.length > 0) {
                    let serverURL = config.getServerUrl(req)
                    result.forEach((gift) => {
                        gift['gift_image'] = serverURL + config.giftImagePath + gift['gift_image'];
                    })

                    var response = { status: true, data: result }
                } else {
                    var response = { status: false, message: 'You have not enough gams' }
                }
                res.send(response)
            });
        }
    })
}

function getGiftById(req, res) {
    const { giftId } = req.params;
    return giftService.getGiftById(giftId).then(result => {
        if (result) {
            let serverURL = config.getServerUrl(req)
            result['gift_image'] = serverURL + config.giftImagePath + result['gift_image'];
            var response = { status: true, data: result }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    })
}

function updateGiftById(req, res) {
    upload(req, res, function (err) {
        const body = req.body;
        var giftId = body.id;
        return giftService.getGiftById(body.id).then(result => {
            if (result) {
                var giftDetails = {};
                if (body.is_delete) {
                    giftDetails.is_delete = 1;
                }
                else {
                    giftDetails.gift_image = req.file !== undefined ? req.file.filename : result.gift_image;
                    giftDetails.gift_name = (req.body.gift_name) ? req.body.gift_name : "";
                    giftDetails.gams = (req.body.gams) ? req.body.gams : 0;
                    giftDetails.stock = (req.body.stock) ? req.body.stock : 0;

                }
                return giftService.updateGiftById(giftDetails, {
                    returning: true, where: { gift_id: giftId }
                }).then(result => {
                    if (result) {
                        var response = { status: true, data: result }
                    } else {
                        var response = { status: false, message: "Gift not updated!" }
                    }
                    res.send(response)
                })
            } else {
                var response = { status: false, message: "No Gift found for update detail!" }
                res.send(response);
            }
        })
    })
}

module.exports = {
    addGift,
    getGifts,
    getGiftById,
    updateGiftById,
    getGiftsForUser
}