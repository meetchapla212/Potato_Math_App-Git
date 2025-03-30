const Sequelize = require('sequelize');
const db = require('../db');

const adminMaster = db.define('admin_account_master', {
    admin_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    first_name: {
        type: Sequelize.STRING(65),
    },
    last_name: {
        type: Sequelize.STRING(65),
    },
    email_id: {
        type: Sequelize.STRING(65),
        allowNull: false,
        validate: {
            isEmail: {
                msg: 'Insert valid email.'
            },
            notEmpty: {
                msg: 'Can\'t be empty'
            }
        },
        unique: {
            args: true,
            msg: 'User already regitered.'
        }
    },
    password: {
        type: Sequelize.STRING(),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Can\'t be empty'
            }
        }
    },
    role: {
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
    adminMaster
}
