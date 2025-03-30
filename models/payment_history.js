const Sequelize = require('sequelize');
const db = require('../db');

const paymentMaster = db.define('payment_history', {
    payment_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    _user_id: {
        type: Sequelize.INTEGER,
    },
    _coin_package_id: {
        type: Sequelize.INTEGER,
    },
    coin_name: {
        type: Sequelize.STRING,
    },
    transaction_id: {
        type: Sequelize.STRING,
    },
    total_amount: {
        type: Sequelize.STRING,
    },
    coin_quantity: {
        type: Sequelize.STRING,
    },
    is_delete: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    status: {
        type: Sequelize.STRING(15),
        defaultValue: 'active'
    },
    date:{
        type:Sequelize.STRING(12)
    }
});

module.exports = {
    paymentMaster
}