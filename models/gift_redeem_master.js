const Sequelize = require('sequelize');
const db = require('../db');

const giftRedeemMaster = db.define('gift_redeem_masters', {
    gift_redeem_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    _user_id: {
        type: Sequelize.INTEGER,
    },
    email_id: {
        type: Sequelize.STRING(),
    },
    _gift_id: {
        type: Sequelize.INTEGER,
    },
    country: {
        type: Sequelize.STRING(100),
    },
    address_one: {
        type: Sequelize.STRING,
    },
    address_two: {
        type: Sequelize.STRING,
    },
    postcode: {
        type: Sequelize.INTEGER,
    },
    phone_number: {
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
});

module.exports = {
    giftRedeemMaster
}
