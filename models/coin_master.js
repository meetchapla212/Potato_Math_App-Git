const Sequelize = require('sequelize');
const db = require('../db');


const coinMaster = db.define('coin_package_master', {
    coin_package_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    coin_name: {
        type: Sequelize.STRING(100),
    },
    coin_quantity: {
        type: Sequelize.INTEGER,
    },
    total_amount: {
        type: Sequelize.FLOAT(),
    },
    coin_type: {
        type: Sequelize.STRING(20),
    },
    plan_id: {
        type: Sequelize.STRING,
    },
    is_recurring: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    is_delete: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    status: {
        type: Sequelize.STRING(15),
        defaultValue: 'active'
    },
    ios_package_id:{
        type:Sequelize.STRING(25),
        allowNull: false,
        validate: {
          notNull: { msg: "ios package id is required" },
        },
    },
    android_package_id:{
        type:Sequelize.STRING(25),
        allowNull: false,
        validate: {
          notNull: { msg: "android package id is required" },
        },
    },
});


module.exports = {
    coinMaster
}
