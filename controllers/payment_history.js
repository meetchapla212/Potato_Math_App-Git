const paymentService = require('../services/payment_history');
const config = require('../config');

function getAllPayments(req, res) {
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;


    return paymentService.getAllPayments(pageNo, dataLimit).then(result => {
        if (result.rows.length > 0) {
            result.rows.forEach((payment) => {
                payment.dataValues['user_name'] = payment['user_detail'].name
                delete payment.dataValues['user_detail']
            })
            var response = { status: true, count: result.count, data: result.rows }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });
}

function getAllPaymentsOfUser(req, res) {
    var user_id = req.user.id;
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;


    return paymentService.getAllPaymentsOfUser(pageNo, dataLimit, user_id).then(result => {
        if (result.length > 0) {
            result.forEach((payment) => {
                payment.dataValues['user_name'] = payment['user_detail'].name
                delete payment.dataValues['user_detail']
            })
            var response = { status: true, data: result }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });
}

module.exports = {
    getAllPayments,
    getAllPaymentsOfUser
}