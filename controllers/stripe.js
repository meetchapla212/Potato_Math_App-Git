var coinService = require('../services/coin');
var appUserService = require('../services/app_user');
var coinService = require('../services/coin');
var paymentService = require('../services/payment_history');
const config = require('../config');
const stripe = require('stripe')(config.stripe_secret_key);
const moment = require('moment');
const mailjest = require('./mailjest');

const createCustomer = async function (apiData) {
    /******************  Create Customer ******************/
    return stripe.customers.create({
        name: apiData.name,
        email: apiData.email,
        source: apiData.stripeToken
    });
}

const createSubscription = async function (apiData, customerId) {
    let subscription = {
        customer: customerId,
        items: [{
            plan: apiData.plan_id,
        },]
    };
    return stripe.subscriptions.create(subscription)
        .then((response) => {
            console.log('create=====')
            apiData.transaction_id = response.id;
            return paymentService.addPaymentRecord(apiData).then(record => {
                if (record) {
                    var appServiceDetails = {};
                    // appServiceDetails.coins_earn = apiData.user_coin_quantity + apiData.coin_quantity;
                    appServiceDetails.stripe_customer_id = customerId;
                    appServiceDetails.last_4digit = (response.payment_method_details) ? response.payment_method_details.card.last4 : 0;
                    appServiceDetails._coin_id = apiData._coin_package_id;
                    var currentDate = moment(new Date());
                    var futureMonth = moment(currentDate).add(1, 'M');
                    var futureMonthEnd = moment(futureMonth).endOf('month');

                    if (currentDate.date() != futureMonth.date() && futureMonth.isSame(futureMonthEnd.format('YYYY-MM-DD'))) {
                        futureMonth = futureMonth.add(1, 'd');
                    }

                    appServiceDetails.plan_start_date = currentDate.format('YYYY-MM-DD');
                    appServiceDetails.plan_end_date = futureMonth.format('YYYY-MM-DD');

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
                        "label_info": "Visa Card",
                        "card_info": "XXXXXXXXXXXX" + appServiceDetails.last_4digit,
                        "shipping_address": ""
                    }

                    // var templateId = req.config.setting.purchase_confirmation_email_template
                    var subject = 'Coin Purchase Receipt';

                    mailjest.sendMail(apiData.templateId, subject, userDetails, variables)

                    return appUserService.updateUserProfile(appServiceDetails, apiData._user_id).then(userUpdate => {
                        if (userUpdate) {
                            var response = { status: true, message: "Subscription done successfully!!" }
                        } else {
                            var response = { status: false, message: "Subscription failed!!" }
                        }
                        return response;
                    })
                }
            })
        })
};

const updateSubscription = async function (apiData, customerId, subscriptions) {
    let sub_id = subscriptions.data[0].id;
    let item_id = subscriptions.data[0]["items"]["data"][0].id;

    return stripe.subscriptions.update(sub_id, {
        items: [{
            id: item_id,
            plan: apiData.plan_id
        }],
        prorate: true,
        billing_cycle_anchor: 'now'
    }).then((response) => {
        console.log('update=====')
        apiData.transaction_id = response.id;
        return paymentService.addPaymentRecord(apiData).then(record => {
            if (record) {
                var appServiceDetails = {};
                // appServiceDetails.coins_earn = apiData.user_coin_quantity + apiData.coin_quantity;
                appServiceDetails.stripe_customer_id = customerId;
                appServiceDetails.last_4digit = (response.payment_method_details) ? response.payment_method_details.card.last4 : 0;
                appServiceDetails._coin_id = apiData._coin_package_id;
                var currentDate = moment(new Date());
                var futureMonth = moment(currentDate).add(1, 'M');
                var futureMonthEnd = moment(futureMonth).endOf('month');

                if (currentDate.date() != futureMonth.date() && futureMonth.isSame(futureMonthEnd.format('YYYY-MM-DD'))) {
                    futureMonth = futureMonth.add(1, 'd');
                }

                appServiceDetails.plan_start_date = currentDate.format('DD/MM/YYYY');
                appServiceDetails.plan_end_date = futureMonth.format('DD/MM/YYYY');

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
                    "label_info": "Visa Card",
                    "card_info": "XXXXXXXXXXXX" + appServiceDetails.last_4digit,
                    "shipping_address": ""
                }
                // var templateId = req.config.setting.purchase_confirmation_email_template
                var subject = 'Coin Purchase Receipt';
                mailjest.sendMail(apiData.templateId, subject, userDetails, variables)


                return appUserService.updateUserProfile(appServiceDetails, apiData._user_id).then(userUpdate => {
                    if (userUpdate) {
                        var response = { status: true, message: "Subscription updated done successfully!!" }
                    } else {
                        var response = { status: false, message: "Subscription failed!!" }
                    }
                    return response;
                })
            }
        })
    }).catch(err => {
        console.log('>>>>>', err)
    })
}

const subscriptionCall = async function (appData, customerID) {
    let subscriptions = await stripe.subscriptions.list({
        customer: customerID
    });
    if (subscriptions && subscriptions.data.length > 0) {
        /******************  Update Subscription ******************/

        var updateSubscriptionResponse = await updateSubscription(appData, customerID, subscriptions)
        return updateSubscriptionResponse


    } else {
        /******************  Create Subscription ******************/
        var createSubscriptionResponse = await createSubscription(appData, customerID)
        return createSubscriptionResponse
    }
}

const createCharge = async function (appData, customerId) {
    /******************  Create Charge ******************/
    var amount = (appData.total_amount) * 100
    let data = {
        amount: parseInt(amount),
        currency: "usd",
        customer: customerId
    };

    return stripe.charges.create(data)
        .then((response) => {
            // console.log(response)
            appData.transaction_id = response.id;
            return paymentService.addPaymentRecord(appData).then(record => {
                if (record) {
                    var appServiceDetails = {};
                    appServiceDetails.coins_earn = appData.user_coin_quantity + appData.coin_quantity;
                    appServiceDetails.last_4digit = (response.payment_method_details) ? response.payment_method_details.card.last4 : 0;
                    appServiceDetails.stripe_customer_id = customerId;

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
                        "label_info": "Visa Card",
                        "card_info": "XXXXXXXXXXXX" + appServiceDetails.last_4digit,
                        "shipping_address": ""
                    }
                    // var templateId = req.config.setting.purchase_confirmation_email_template
                    var subject = 'Coin Purchase Receipt';
                    mailjest.sendMail(appData.templateId, subject, userDetails, variables)

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
        })
};



function charges(req, res) {

    var user_id = req.user.id;
    var templateId = req.config.setting.purchase_confirmation_email_template;
    console.log('###############################')
    // return true
    var customerID = null;
    return appUserService.getUserDetails(user_id).then(async (userRes) => {
        if (userRes.dataValues.stripe_customer_id === null) {
            let customerIdResponse = await createCustomer(req.body);
            if (customerIdResponse) {
                // var appServiceDetails = {};
                // appServiceDetails.stripe_customer_id = customerIdResponse.id;
                // return appUserService.updateUserProfile(appServiceDetails, user_id).then(userUpdate => {
                //     if (userUpdate) {
                customerID = customerIdResponse.id;
                console.log('new', customerID)
                //     }
                // })

            }
        } else {
            customerID = userRes.dataValues.stripe_customer_id
            console.log('old', customerID)
        }
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
            if (result.dataValues.is_recurring === 0) {
                // charge call
                console.log('---------charge call')
                var chargeResponse = await createCharge(appData, customerID)
                res.send(chargeResponse)
            } else {
                // subscription call
                console.log('---------subscription call')

                var subscriptionResponse = await subscriptionCall(appData, customerID)
                res.send(subscriptionResponse)
            }
        })
    })
}

function webHooks(req, res) {
    // console.log('*********************************')
    var customerID = req.body.data.object.customer;
    if (req.body.type === 'invoice.finalized') {
        var subscriptionID = req.body.data.object.subscription
    }

    if (req.body.type === 'invoice.finalized') {
        return paymentService.findBySubscriptionId(subscriptionID).then(detail => {
            if (detail) {
                return appUserService.getUserDetails(detail.dataValues._user_id).then(user => {
                    if (user) {
                        return coinService.getCoinById(user.dataValues._coin_id).then((coinDetails) => {
                            if (coinDetails) {
                                var appServiceDetails = {};
                                appServiceDetails.coins_earn = user.dataValues.coins_earn + coinDetails.dataValues.coin_quantity;


                                return appUserService.updateUserProfile(appServiceDetails, user.dataValues.user_id).then(userUpdate => {
                                    if (userUpdate) {
                                        var response = { status: true, message: "Coin added successfully!!" }
                                    } else {
                                        var response = { status: false, message: "failed!!" }
                                    }
                                    res.send(response)
                                })
                            }
                        })
                    } else {
                        var response = { status: false, message: "No user found!!" }
                        res.send(response)
                    }
                })
            } else {
                var response = { status: false, message: "No user found!!" }
                res.send(response)
            }
        })
    }
}
module.exports = {
    charges,
    webHooks
}