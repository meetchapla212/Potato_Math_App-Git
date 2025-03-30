var coinService = require('../services/coin');
var appUserService = require('../services/app_user');
var coinService = require('../services/coin');
var paymentService = require('../services/payment_history');
const { google } = require('googleapis');
var androidPublisher = google.androidpublisher('v3');
const config = require('../config');
const mailjest = require('./mailjest');
var iap = require('in-app-purchase');
var receiptService = require('../services/iap-receipts');
const { conforms, flatMap, findKey } = require('lodash');
const createCharge = async function (appData) {
    /******************  Create Charge ******************/
    return paymentService.addPaymentRecord(appData).then(record => {
        if (record) {
            var userDetails = [{
                "Email": appData.email_id,
                "Name": appData.name
            }]
            var variables = {
                "name": appData.name,
                "items": [{
                    "price": appData.total_amount,
                    "src": "https://i.imgur.com/uLcIAwT.png",
                    "name": appData.coin_name,
                    "extra": ""
                }],
                "sub_total": appData.total_amount,
                "total": appData.total_amount,
                "shipping_address": "",
                "label_info": "Transaction Id",
                "card_info": appData.transaction_id,
                "device": appData.device_type
            }
            var subject = 'Coin Purchase Receipt';
            mailjest.sendMail(appData.templateId, subject, userDetails, variables)
            var appServiceDetails = {};
            appServiceDetails.coins_earn = appData.user_coin_quantity + appData.coin_quantity;
            appServiceDetails.device_type = appData.device_type
            return appUserService.updateUserProfile(appServiceDetails, appData._user_id).then(userUpdate => {
                if (userUpdate) {
                    var response = { status: true, message: "Payment done successfully!!" }
                } else {
                    var response = { status: false, message: "Payment failed!!" }
                }
                return response;
            })
        }
    })

};
const createSubscription = async function (appData, receipt) {
    console.log('create Subscription=====')
    return paymentService.addPaymentRecord(appData).then(async record => {
        if (record) {
            var receiptData = {}
            receiptData._user_id = appData._user_id
            receiptData.receipt = receipt
            await receiptService.getReceiptDetails(appData._user_id).then(async (data) => {
                if (data) {
                    await receiptService.updateReceiptProfile(receiptData, appData._user_id)
                } else {
                    await receiptService.addReceipt(receiptData)
                }
            })
            var appServiceDetails = {};
            appServiceDetails.coins_earn = appData.user_coin_quantity + appData.coin_quantity;
            appServiceDetails._coin_id = appData._coin_package_id;
            appServiceDetails.device_type = appData.device_type;
            appServiceDetails.plan_start_date = appData.plan_start_date
            appServiceDetails.plan_end_date = appData.plan_end_date
            appServiceDetails.iap_subscription = true
            var userDetails = [{
                "Email": appData.email_id,
                "Name": appData.name
            }]
            var variables = {
                "name": appData.name,
                "items": [{
                    "price": appData.total_amount,
                    "src": "https://i.imgur.com/uLcIAwT.png",
                    "name": appData.coin_name,
                    "extra": ""
                }],
                "sub_total": appData.total_amount,
                "total": appData.total_amount,
                "shipping_address": "",
                "label_info": "Transaction Id",
                "card_info": appData.transaction_id,
                "device": appData.device
            }
            var subject = 'Coin Purchase Receipt';
            mailjest.sendMail(appData.templateId, subject, userDetails, variables)
            console.log('appServiceDetails ', appServiceDetails)
            return appUserService.updateUserProfile(appServiceDetails, appData._user_id).then(userUpdate => {
                if (userUpdate) {
                    var response = { status: true, message: "Subscription done successfully!!" }
                } else {
                    var response = { status: false, message: "Subscription failed!!" }
                }
                return response;
            })
        }
    })

};

const updateSubscription = async function (apiData, receipt) {
    console.log('update subcription calll=>>>')
    return paymentService.addPaymentRecord(apiData).then(async record => {
        if (record) {

            await receiptService.getReceiptDetails(apiData._user_id).then(async (data) => {
                if (data) {
                    let oldReceipt = JSON.parse(data.dataValues.receipt)
                    if (apiData.device_type === 'Android') {
                        var authClient = new google.auth.JWT(
                            config.clientEmail,
                            '',
                            config.googleprivateKey,
                            [
                                'https://www.googleapis.com/auth/androidpublisher'
                            ],
                            ''
                        );

                        authClient.authorize((err, token) => {
                            if (err) {
                                console.log("Authorization error!");
                            }
                            androidPublisher.purchases.subscriptions.cancel({
                                auth: authClient,
                                packageName: oldReceipt.packageName,
                                subscriptionId: oldReceipt.productId,
                                token: oldReceipt.purchaseToken
                            }, (err, resp) => {
                                if (err) {
                                    console.log("Error on cancel subscription " + err);
                                } else {
                                    console.log("Cancel Subscription Response ----------------" + resp);
                                }
                            })
                        });
                    }
                }
            })

            var appServiceDetails = {};
            appServiceDetails.coins_earn = apiData.user_coin_quantity + apiData.coin_quantity;
            var receiptData = {}
            receiptData.receipt = receipt
            await receiptService.updateReceiptProfile(receiptData, apiData._user_id)
            appServiceDetails._coin_id = apiData._coin_package_id;
            appServiceDetails.device_type = apiData.device_type;
            appServiceDetails.plan_start_date = apiData.plan_start_date
            appServiceDetails.plan_end_date = apiData.plan_end_date
            appServiceDetails.iap_subscription = true
            var userDetails = [{
                "Email": apiData.email_id,
                "Name": apiData.name
            }]
            var variables = {
                "name": apiData.name,
                "items": [{
                    "price": apiData.total_amount,
                    "src": "https://i.imgur.com/uLcIAwT.png",
                    "name": apiData.coin_name,
                    "extra": ""
                }],
                "sub_total": apiData.total_amount,
                "total": apiData.total_amount,
                "label_info": "Transaction Id",
                "card_info": appData.transaction_id,
                "shipping_address": "",
                "device": apiData.device_type
            }
            var subject = 'Coin Purchase Receipt';
            mailjest.sendMail(apiData.templateId, subject, userDetails, variables)

            return appUserService.updateUserProfile(appServiceDetails, apiData._user_id).then(userUpdate => {
                if (userUpdate) {
                    var response = { status: true, message: "Subscription updated done successfully!!" }
                } else {
                    var response = { status: false, message: "Subscription updated failed!!" }
                }
                return response;
            })
        }
    })

}

const subscriptionCall = async function (appData, receipt) {

    if (appData.iap_subscription == true) {
        //     /******************  Update Subscription ******************/
        var updateSubscriptionResponse = await updateSubscription(appData, receipt)
        return updateSubscriptionResponse


    } else {
        /******************  Create Subscription ******************/
        var createSubscriptionResponse = await createSubscription(appData, receipt)
        return createSubscriptionResponse
    }
}
function onSuccess(validatedData) {
    var options = {
        ignoreCanceled: true, // Apple ONLY (for now...): purchaseData will NOT contain cancceled items
        ignoreExpired: false // purchaseData will NOT contain exipired subscription items
    };
    // validatedData contains sandbox: true/false for Apple and Amazon
    var purchaseData = iap.getPurchaseData(validatedData, options);
    console.log('purchaseData', purchaseData)
    return purchaseData

}

function onError(error) {
    console.log("error==>", error)
    return false
}
iap.config({
    appleExcludeOldTransactions: false,
    applePassword: config.applepassword,
    /* Configurations for Google Service Account validation: You can validate with just packageName, productId, and purchaseToken */
    googleServiceAccount: {
        clientEmail: config.clientEmail,
        privateKey: config.googleprivateKey
    },

    /* Configurations for Google Play */
    googlePublicKeyStrSandBox: config.googlePublicKeyStrSandBox, // this is the google iap-sandbox public key string
    googlePublicKeyStrLive: config.googlePublicKeyStrLive, // this is the google iap-live public key string
    googleAccToken: config.googleAccToken, // optional, for Google Play subscriptions
    googleRefToken: config.googleRefToken, // optional, for Google Play subscritions
    googleClientID: config.googleClientID, // optional, for Google Play subscriptions
    googleClientSecret: config.googleClientSecret, // optional, for Google Play subscriptions

    /* Configurations all platforms */
    test: true, // For Apple and Googl Play to force Sandbox validation only
    verbose: true // Output debug logs to stdout stream
})

function charges(req, res) {
    console.log("req.body:", req.body)
    try {
        if (req.body.transaction_id == undefined || req.body.transaction_id == null || req.body.transaction_id == '') {
            var response = { status: true, message: "Transaction id not found" }
            res.send(response)
        }
        if (req.body.receipt == null || req.body.receipt == undefined || req.body.receipt == '') {
            var response = { status: false, message: "receipt not found." }
            res.send(response)
        }
        if (req.body.device_type == null || req.body.device_type == undefined || req.body.device_type == '') {
            var response = { status: false, message: "Device type not found." }
            res.send(response)
        }
        var user_id = req.user.id;
        var transaction_id = req.body.transaction_id
        var device_type = req.body.device_type
        var templateId = req.config.setting.purchase_confirmation_email_template;
        return appUserService.getUserDetails(user_id).then(async (userRes) => {
            return coinService.getCoinById(req.body.coinId).then(async (result) => {
                var appData = {};
                appData._user_id = user_id;
                appData._coin_package_id = result.dataValues.coin_package_id;
                appData.coin_name = result.dataValues.coin_name;
                appData.total_amount = result.dataValues.total_amount;
                appData.coin_quantity = result.dataValues.coin_quantity;
                appData.user_coin_quantity = userRes.dataValues.coins_earn;
                appData.email_id = userRes.dataValues.email_id;
                appData.name = userRes.dataValues.name;
                appData.templateId = templateId;
                appData.plan_id = result.dataValues.plan_id;
                appData.transaction_id = transaction_id
                appData.ios_package_id = result.dataValues.ios_package_id
                appData.android_package_id = result.dataValues.android_package_id
                appData.iap_subscription = userRes.iap_subscription
                appData.device_type = device_type
                console.log("is_recurring===", result.dataValues.is_recurring)
                console.log(appData)
                iap.setup()
                    .then(() => {
                        let response = [];
                        if (device_type === "Android") {
                            var receipt = {}
                            receipt.packageName = req.body.packageName
                            receipt.purchaseToken = req.body.purchaseToken
                            receipt.productId = req.body.device_type == "Android" ? appData.android_package_id : appData.ios_package_id
                            receipt.subscription = result.dataValues.is_recurring == 0 ? false : true
                            receipt.signature = req.body.signature
                            response = iap.validate(receipt).then(onSuccess).catch(onError)
                            var receiptstring = JSON.stringify(receipt)
                            req.body.receipt = receiptstring
                            console.log("req.boby.receipt------", req.body.receipt)
                        } else {
                            console.log("IOS call")
                            response = iap.validate(req.body.receipt).then(onSuccess).catch(onError);
                        }
                        response.then(async data => {
                            if (data.length != 0) {
                                if (device_type === "Android") {
                                    appData.plan_start_date = data[0] && data[0].startTimeMillis ? data[0].startTimeMillis : null
                                    appData.plan_end_date = data[0] && data[0].expiryTimeMillis ? data[0].expiryTimeMillis : null
                                } else {
                                    appData.plan_start_date = data[0] && data[0].originalPurchaseDateMs ? data[0].originalPurchaseDateMs : null
                                    appData.plan_end_date = data[0] && data[0].expiresDateMs ? data[0].expiresDateMs : null
                                }

                                if (result.dataValues.is_recurring === 0) {
                                    // charge call
                                    console.log('---------charge call')
                                    var chargeResponse = await createCharge(appData)
                                    res.send(chargeResponse)
                                } else {
                                    // subscription call
                                    console.log('---------subscription call')

                                    var subscriptionResponse = await subscriptionCall(appData, req.body.receipt)
                                    res.send(subscriptionResponse)
                                }
                            } else {
                                var response = { status: false, message: 'invalid receipts data!' }
                                res.send(response)
                            }
                        })
                    })
                    .catch((error) => {
                        console.log("error=>", error)
                        var response = { status: false, message: error }
                        res.send(response)
                    });
            })
        })
    } catch (error) {
        var response = { status: false, message: error }
        res.send(response)
    };
}

module.exports = {
    charges
}