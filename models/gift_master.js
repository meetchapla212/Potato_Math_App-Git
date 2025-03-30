const Sequelize = require('sequelize');
const giftRedeemMaster = require('../models/gift_redeem_master').giftRedeemMaster;
const db = require('../db');

const giftMaster = db.define('gift_masters', {
    gift_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    gift_name: {
        type: Sequelize.STRING(),
    },
    gift_image: {
        type: Sequelize.STRING(100),
    },
    gams: {
        type: Sequelize.INTEGER,
    },
    stock: {
        type: Sequelize.INTEGER,
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

giftMaster.hasMany(giftRedeemMaster, { foreignKey: '_gift_id' })
giftRedeemMaster.belongsTo(giftMaster, { as: 'gift_detail', foreignKey: '_gift_id' })

module.exports = {
    giftMaster
}
