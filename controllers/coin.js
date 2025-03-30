var coinService = require('../services/coin');
var paymentService = require('../services/payment_history');
const config = require('../config');
const coin = require('../services/coin');
const { func } = require('joi');
const stripe = require('stripe')(config.stripe_secret_key);


function addCoin(req, res) {
    const coinDetails = req.body;
    coinDetails.is_recurring = (coinDetails.is_recurring) * 1;
    coinDetails.coin_quantity = (coinDetails.coin_quantity) * 1;
    coinDetails.coin_name = (coinDetails.coin_name)? (coinDetails.coin_name):"";
     if (coinDetails.is_recurring === 1) {
        stripe.plans.create(
            {
                amount: (coinDetails.total_amount * 100),
                currency: 'usd',
                interval: 'month',
                product: { name: coinDetails.coin_name },
            }).then((response) => {
                coinDetails.plan_id = response.id
                return coinService.addCoin(coinDetails).then(data => res.send(data));
            })
    } else {
        return coinService.addCoin(coinDetails).then(data => res.send(data));
    }
};

function getAllCoins(req, res) {
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;

    return coinService.getAllCoins(pageNo, dataLimit).then(result => {
        if (result) {
            const coinFunction = async (coin) => {
                coin.dataValues['totalPurchase'] = await paymentService.totalNumberOfPurchase(coin['coin_package_id']);
                coin.dataValues['uniquePurchase'] = await paymentService.totalUniqueNumberOfPurchase(coin['coin_package_id']);
                return coin
            }
            return Promise.all(result.rows.map(resData => coinFunction(resData)))
                .then(data => {
                    var response = { status: true, count: result.count, data: data }
                    res.send(response);
                })
        } else {
            var response = { status: false, message: config.no_data_message };
        }
        res.send(response);
    });
};

function getCoinById(req, res) {
    const { coinId } = req.params;
    if (coinId) {
        return coinService.getCoinById(coinId).then(result => {
            var response = { status: true, data: result };
            res.send(response);
        })
    } else {
        var response = { status: false, message: config.no_data_message };
        res.send(response);
    }
};

function updateCoinById(req, res) {
    const coinDetails = req.body;
    if(req.params.coinId){
        coinDetails.id = req.params.coinId
    }
    return coinService.getCoinById(coinDetails.id).then(result => {
        if (result) {
            if (coinDetails.is_recurring == 1) {
                    stripe.plans.create(
                    {
                        amount: (coinDetails.total_amount * 100),
                        currency: 'usd',
                        interval: 'month',
                        product: { name: coinDetails.coin_name },
                    }).then((response) => {
                    
                        coinDetails.plan_id = response.id
                        return coinService.updateCoinById(coinDetails, {
                            returning: true, where: { coin_package_id: coinDetails.id }
                        }).then(result => {
                            if (result) {
                                var response = { status: true, data: result }
                            } else {
                                var response = { status: false, message: "Coin not updated!" }
                            }
                            res.send(response)
                        })
                    })
            }else{
                   
                    coinDetails.plan_id = null
                    return coinService.updateCoinById(coinDetails, {
                        returning: true, where: { coin_package_id: coinDetails.id }
                    }).then(result => {
                        if (result) {
                            var response = { status: true, data: result }
                        } else {
                            var response = { status: false, message: "Coin not updated!" }
                        }
                        res.send(response)  
                    })
            }
        } else {
            var response = { status: false, message: "No coin found for update detail!" }
            res.send(response);
        }
    })
};

function DeleteCoinById(req,res){
    const coinDetails = {};
    if(req.params.coinId){
        coinDetails.id = req.params.coinId
    }
    return coinService.getCoinById(coinDetails.id).then(result => {
        if (result) {
            coinDetails.is_delete = 1
            return coinService.updateCoinById(coinDetails, {
                returning: true, where: { coin_package_id: coinDetails.id }
            }).then(result => {
                if (result) {
                    var response = { status: true, message: "Coin package delete successfully."}
                } else {
                    var response = { status: false, message: "Coin not updated!" }
                }
               res.send(response)
            })
        }else{
             var response = { status: false, message: config.no_data_message } 
             res.send(response)  
        }

    })

}
module.exports = {
    addCoin,
    getAllCoins,
    getCoinById,
    updateCoinById,
    DeleteCoinById
}