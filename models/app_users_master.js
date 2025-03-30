const Sequelize = require('sequelize');
const db = require('../db');
var friendRequestMaster = require('./friend_request_master').friendRequestMaster
var contactMaster = require('./contact_us_request').contactMaster
var resultMaster = require('./result_master').resultMaster
var battleMaster = require('./battle_result_master').battleMaster
var paymentMaster = require('./payment_history').paymentMaster
var giftRedeemMaster = require('./gift_redeem_master').giftRedeemMaster
var referralMaster = require('./referral_master').referralMaster


const userMaster = db.define('app_users_master', {
    user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    account_id: {
        type: Sequelize.STRING(100),
    },
    name: {
        type: Sequelize.STRING(30),
    },
    username: {
        type: Sequelize.STRING(30),
    },
    email_id: {
        type: Sequelize.STRING(),
    },
    user_image: {
        type: Sequelize.STRING(100),
    },
    login_type: {
        type: Sequelize.STRING(),
    },
    password: {
        type: Sequelize.STRING(),
    },
    potato_earn: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    gams_earn: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    coins_earn: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    _grade_id: {
        type: Sequelize.INTEGER,
    },
    stripe_customer_id: {
        type: Sequelize.STRING,
    },
    last_4digit: {
        type: Sequelize.INTEGER,
    },
    _coin_id: {
        type: Sequelize.INTEGER,
    },
    plan_start_date: {
        type: Sequelize.STRING,
    },
    plan_end_date: {
        type: Sequelize.STRING,
    },
    last_played_date: {
        type: Sequelize.STRING,
    },
    last_login_date: {
        type: Sequelize.STRING,
    },
    last_notification_date: {
        type: Sequelize.STRING,
    },
    email_token: {
        type: Sequelize.STRING,
    },
    is_verified: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    onboarding_potato: {
        type: Sequelize.INTEGER
    },
    coin_spent: {
        type: Sequelize.INTEGER
    },
    otp_number: {
        type: Sequelize.INTEGER
    },
    _streak_applied_id: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    is_friend_request_allow: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
    },
    is_challenge_request_allow: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
    },
    is_leaderboards_allow: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
    },
    is_practice_reminder: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
    },
    is_delete: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    status: {
        type: Sequelize.STRING(15),
        defaultValue: 'active'
    },
    iap_subscription: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    device_type: {
        type: Sequelize.STRING
    }
});
userMaster.hasMany(friendRequestMaster, { foreignKey: '_user_id' })
friendRequestMaster.belongsTo(userMaster, { as: 'app_users_master', foreignKey: '_user_id' })

userMaster.hasMany(friendRequestMaster, { foreignKey: '_friend_id' })
friendRequestMaster.belongsTo(userMaster, { as: 'app_users_masters', foreignKey: '_friend_id' })

userMaster.hasMany(resultMaster, { foreignKey: '_user_id' })
resultMaster.belongsTo(userMaster, { as: 'app_users', foreignKey: '_user_id' })

userMaster.hasMany(battleMaster, { foreignKey: '_opponent_id' })
battleMaster.belongsTo(userMaster, { as: 'opponent_users', foreignKey: '_opponent_id' })

userMaster.hasMany(battleMaster, { foreignKey: '_user_id' })
battleMaster.belongsTo(userMaster, { as: 'main_users', foreignKey: '_user_id' })

userMaster.hasMany(contactMaster, { foreignKey: '_user_id' })
contactMaster.belongsTo(userMaster, { as: 'user', foreignKey: '_user_id' })

userMaster.hasMany(paymentMaster, { foreignKey: '_user_id' })
paymentMaster.belongsTo(userMaster, { as: 'user_detail', foreignKey: '_user_id' })

userMaster.hasMany(giftRedeemMaster, { foreignKey: '_user_id' })
giftRedeemMaster.belongsTo(userMaster, { as: 'user_gift_detail', foreignKey: '_user_id' })

userMaster.hasMany(referralMaster, { foreignKey: '_user_id' })
referralMaster.belongsTo(userMaster, { as: 'linked_user', foreignKey: '_user_id' })

module.exports = {
    userMaster
}