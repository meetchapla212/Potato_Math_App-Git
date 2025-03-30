const Sequelize = require('sequelize');
const db = require('../db');

const receiptsMaster = db.define('iap_receipts', {
    receipt_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    _user_id: {
        type: Sequelize.INTEGER,
    },
    receipt: {
        type: Sequelize.TEXT,
    },
   
});
module.exports = {
    receiptsMaster
}