const Sequelize = require('sequelize');
const db = require('../db');

const galleryMaster = db.define('gallery_master', {
    image_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    image: {
        type: Sequelize.STRING(100),
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
    galleryMaster
}