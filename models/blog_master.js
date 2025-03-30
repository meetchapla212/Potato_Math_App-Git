const Sequelize = require('sequelize');
const db = require('../db');


const blogMaster = db.define('blog_master', {
    blog_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    blog_title: {
        type: Sequelize.STRING,
    },
    blog_type: {
        type: Sequelize.INTEGER,
    },
    blog_image: {
        type: Sequelize.STRING,
    },
    blog_video_url: {
        type: Sequelize.STRING,
    },
    blog_description: {
        type: Sequelize.TEXT,
    },
    total_views: {
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


module.exports = {
    blogMaster
}
