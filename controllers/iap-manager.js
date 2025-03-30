// import dependencies
const moment = require('moment');
const appleReceiptVerify = require('node-apple-receipt-verify')
const config = require('../config');
var appUserService = require('../services/app_user');
var receiptService = require('../services/iap-receipts')
var coinService = require('../services/coin');
var paymentService = require('../services/payment_history');
var Verifier = require('google-play-billing-validator');
// initialise receipt-verify instance
appleReceiptVerify.config({
  secret: config.applepassword,
  environment: ['sandbox'],
  excludeOldTransactions: true,
  ignoreExpired: true,
});
var options = {
  "email": config.clientEmail,
  "key": config.googleprivateKey,
};
module.exports = {
  renewOrCancelSubscriptions: async function () {
    var currentDate = moment().format('x');;
    const today = currentDate;
    console.log("cron job call subscription renewal and cancel", today)
    return appUserService.getallUserforplan_end_date(today).then(result => {
      if (result) {
        for (let data of result) {
          receiptService.getReceiptDetails(data.user_id).then(async recResult => {
            if (recResult) {
              const record = recResult.dataValues.receipt;
              // re-verify receipt to get the latest subscription status
              if (data.device_type === 'Android') {
                const receipt = JSON.parse(record)
                var verifier = new Verifier(options);
                let promiseData = verifier.verifySub(receipt)
                promiseData.then(function (purchases) {
                  const DataPurchases = purchases
                  console.log("DataPurchases ----", DataPurchases)
                  if (DataPurchases.payload.autoRenewing === true) {
                    console.log('--RENEW UPDATE SUBCRIPTION ANDROID--')
                    return coinService.getCoinByios_package_id(receipt.productId).then(async resresult => {
                      if (resresult) {
                        var arrdata = {}
                        var currentDate = moment(new Date());
                        const today = currentDate.format('YYYY-MM-DD');
                        arrdata._user_id = data.user_id
                        arrdata._coin_package_id = resresult.coin_package_id
                        arrdata.coin_name = resresult.coin_name
                        arrdata.transaction_id = DataPurchases.payload.orderId
                        arrdata.total_amount = resresult.total_amount
                        arrdata.coin_quantity = resresult.coin_quantity
                        arrdata.date = today
                        return paymentService.addPaymentRecord(arrdata).then(res => {
                          if (res) {
                            var appServiceDetails = {};
                            appServiceDetails.plan_start_date = DataPurchases.payload.startTimeMillis
                            appServiceDetails.plan_end_date = DataPurchases.payload.expiryTimeMillis
                            appServiceDetails.iap_subscription = true
                            appServiceDetails.coins_earn = data.coins_earn + resresult.coin_quantity;
                            console.log("appserviceDetails:", appServiceDetails)
                            return appUserService.updateUserProfile(appServiceDetails, data.user_id).then(userdata => {
                              if (userdata) {
                                console.log('Subscription renewal done successfully')
                                // var response = { status: true, message: "Subscription renewal done successfully" }
                                // res.send(response)
                              }
                            })
                          }
                        })
                      }
                    })
                  } else {
                    console.log('--CANCLE SUBCRIPTION ANDROID--')
                    let palyload = {}
                    palyload.plan_end_date = null
                    palyload.plan_start_date = null
                    palyload.iap_subscription = false
                    palyload._coin_id = null
                    return appUserService.updateUserProfile(palyload, data.user_id).then(updateUser => {
                      if (updateUser) {
                        console.log("Subscription cancel done successfully")
                        // var response = { status: true, message: "Subscription cancel done successfully" }
                        // res.send(response)
                      }
                    })
                  }
                })

              } else {
                let purchases = await appleReceiptVerify.validate({
                  receipt: record
                });
                console.log('appleReceiptVerify_purchases:', purchases)
                if (purchases.length === 0) {
                  console.log('--CANCLE SUBCRIPTION APPLE--')
                  let palyload = {}
                  palyload.plan_end_date = null
                  palyload.plan_start_date = null
                  palyload.iap_subscription = false
                  palyload._coin_id = null
                  return appUserService.updateUserProfile(palyload, data.user_id).then(updateUser => {
                    if (updateUser) {
                      console.log("Subscription cancel done successfully")
                      // var response = { status: true, message: "Subscription cancel done successfully" }
                      // res.send(response)
                    }
                  })
                }
                if (purchases.length !== 0) {
                  console.log('--RENEW UPDATE SUBCRIPTION APPLE--')
                  return coinService.getCoinByios_package_id(purchases[0].productId).then(async resresult => {
                    if (resresult) {
                      var arrdata = {}
                      var currentDate = moment(new Date());
                      const today = currentDate.format('YYYY-MM-DD');
                      arrdata._user_id = data.user_id
                      arrdata._coin_package_id = resresult.coin_package_id
                      arrdata.coin_name = resresult.coin_name
                      arrdata.transaction_id = purchases[0].transactionId
                      arrdata.total_amount = resresult.total_amount
                      arrdata.coin_quantity = resresult.coin_quantity
                      arrdata.date = today
                      return paymentService.addPaymentRecord(arrdata).then(res => {
                        if (res) {
                          var appServiceDetails = {};
                          appServiceDetails.plan_start_date = purchases[0].purchaseDate
                          appServiceDetails.plan_end_date = purchases[0].expirationDate
                          appServiceDetails.iap_subscription = true
                          appServiceDetails.coins_earn = data.coins_earn + resresult.coin_quantity;
                          console.log("appserviceDetails:", appServiceDetails)
                          return appUserService.updateUserProfile(appServiceDetails, data.user_id).then(userdata => {
                            if (userdata) {
                              console.log('Subscription renewal done successfully')
                              // var response = { status: true, message: "Subscription renewal done successfully" }
                              // res.send(response)
                            }
                          })
                        }
                      })
                    }
                  })
                }
              }
            }
          })
        }
      }
    })
  }
};