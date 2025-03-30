const sequelize = require('../db');
const config = require('../config');
const CustomError = require('../customError');
var Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
var crypto = require('crypto');
var receiptsMaster = require('../models/iap-receipts').receiptsMaster

const getReceiptDetails = (id) => {
    const query = {
        where: {
            _user_id: id
           
        },
        attributes: [
            'receipt_id', '_user_id', 'receipt'
        ]
    };
    return receiptsMaster.findOne(query).then(sequelize.getValues)
};
const addReceipt = data => receiptsMaster.create({
    ...data
}).then((result) => {
    var response = { status: true, message: "Success! receipt added successfully!", data: result }
    return response;
}).catch((error) => {
    var response = { status: false, message: "Error! Invalid data found", error }
    return response;
});

const updateReceiptProfile = (data, userId) => {
    const query = {
        returning: true,
        where: {
            _user_id: userId
        }
    };
    return receiptsMaster.update(data, query)
        .then(
            ([affectedCount, [updatedUser]]) => {
                if (affectedCount > 0) {
                    return { status: true, message: "Profile update successfully!", data: updatedUser }
                }
                return { status: false, message: "Something went wrong! Please try again!" }
            }
        ).catch(err => {
            console.log('====', err)
        })
}
module.exports={
    getReceiptDetails,
    addReceipt,
    updateReceiptProfile
}