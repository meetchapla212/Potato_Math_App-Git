const adminMaster = require('../models/admin').adminMaster;
const sequelize = require('../db');
var Sequelize = require('sequelize');

const addUser = data => adminMaster.create({
    ...data
}).then((result) => {
    var response = { status: true, message: "Success! User added successfully!" }
    return response;
}).catch((error) => {
    var response = { status: false, message: "Error! Invalid data found", error }
    return response;
});

const getUserById = (id) => {
    var query = {
        where: {
            admin_id: id
        }
    };
    return adminMaster.findOne(query).then(sequelize.getValues)
}

const getAllAdminUser = (pageNo, dataLimit, id) => {
    var offset = (pageNo - 1) * dataLimit;
    var query = {
        where: {
            admin_id: { [Sequelize.Op.ne]: id },
            is_delete: 0
        },
        attributes: ['admin_id', 'first_name', 'last_name', 'email_id', 'role'],
        offset: offset,
        limit: dataLimit,
        order: [['admin_id', 'DESC']]
    };
    return adminMaster.findAndCountAll(query).then(sequelize.getValues)
}


const updateUserById = (data, query) => {
    return adminMaster.update(data, query).then(function ([rowsUpdate, [updatedBadge]]) {
        return updatedBadge;
    })
}

module.exports = {
    addUser,
    getUserById,
    updateUserById,
    getAllAdminUser
}