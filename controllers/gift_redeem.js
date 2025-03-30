const giftService = require('../services/gift');
const appUserService = require('../services/app_user');
const giftRedeemService = require('../services/gift_redeem');
const mailjest = require('./mailjest');
const config = require('../config');

function giftRedeem(req, res) {
    let serverURL = config.getServerUrl(req)
    var user_id = req.user.id;
    const redeemDetails = req.body;
    redeemDetails._user_id = user_id
    return appUserService.getUserDetails(user_id).then(user => {
        if (user) {
            return giftService.getGiftById(redeemDetails._gift_id).then(gift => {
                if (gift) {
                    if (user.dataValues.gams_earn >= gift.dataValues.gams) {
                        if (gift.dataValues.stock > 0) {
                            var giftDetails = {};
                            giftDetails.stock = gift.dataValues.stock - 1;
                            return giftService.updateGiftById(giftDetails, {
                                returning: true, where: { gift_id: redeemDetails._gift_id }
                            }).then(updateStock => {
                                if (updateStock) {
                                    return giftRedeemService.addGiftRedeem(redeemDetails).then(data => {
                                        if (data) {
                                            return giftService.getGiftsForMail(data.data._gift_id).then(otherGifts => {
                                                var gifts = []
                                                otherGifts.rows.forEach(gift => {
                                                    var giftdetails = {
                                                        text: gift.gift_name,
                                                        src: serverURL + config.giftImagePath + gift.gift_image
                                                    }
                                                    gifts.push(giftdetails)
                                                })
                                                // })
                                                var appServiceDetails = {};
                                                appServiceDetails.gams_earn = user.dataValues.gams_earn - gift.dataValues.gams;
                                                var userDetails = [{
                                                    "Email": user.dataValues.email_id,
                                                    "Name": user.dataValues.name
                                                }]
                                                var variables = {
                                                    "name": user.dataValues.name,
                                                    "gift_request_number": "" + data.data.gift_redeem_id + "",
                                                    "items": [{
                                                        "name": gift.dataValues.gift_name,
                                                        "src": serverURL + config.giftImagePath + gift.dataValues.gift_image,
                                                        "gems": "" + gift.dataValues.gams + "",
                                                        "extra": "",
                                                        "qty": '1'
                                                    }],
                                                    "shipping_address": "" + redeemDetails.address_one + "," + redeemDetails.address_two + "," + redeemDetails.country + "",
                                                    "billing_address": "" + redeemDetails.address_one + "," + redeemDetails.address_two + "," + redeemDetails.country + "",
                                                    "gifts": gifts
                                                }
                                                var templateId = req.config.setting.gift_redemption_email_template
                                                var subject = 'Gift redeem';
                                                mailjest.sendMail(templateId, subject, userDetails, variables)
                                                return appUserService.updateUserProfile(appServiceDetails, user_id).then(result => {
                                                    if (result) {
                                                        var response = { status: true, message: "Gift redeem successfully!" }
                                                    }
                                                    else {
                                                        var response = { status: false, message: "Request failed!" }
                                                    }
                                                    res.send(response)
                                                })
                                            })
                                        }

                                    });
                                }
                            })
                        } else {
                            var response = { status: false, message: "Item is out of stock!" }
                            res.send(response)
                        }
                    } else {
                        var response = { status: false, message: "You don't have enough gems!" }
                        res.send(response)
                    }
                }
            })
        }
    })
}

module.exports = {
    giftRedeem
}