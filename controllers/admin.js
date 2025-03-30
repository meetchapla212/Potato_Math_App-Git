const adminService = require('../services/admin');
const config = require('../config');
var crypto = require('crypto');


function addUser(req, res) {
    var adminDetails = {};
    const passwordHmac = crypto.createHmac('sha256', config.jwtSecret).update(req.body.password).digest('hex');
    adminDetails.first_name = (req.body.first_name) ? req.body.first_name : "";
    adminDetails.last_name = (req.body.last_name) ? req.body.last_name : "";
    adminDetails.email_id = (req.body.email_id) ? req.body.email_id : "";
    adminDetails.password = (req.body.password) ? passwordHmac : "";
    adminDetails.role = (req.body.role) ? (req.body.role) * 1 : "";

    return adminService.addUser(adminDetails).then(data => res.send(data));
}


function getUserById(req, res) {
    const { id } = req.params;
    return adminService.getUserById(id).then(result => {
        if (result) {
            var response = { status: true, data: result }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    })
}

function getAllAdminUser(req, res) {
    var userId = req.adminuser.id;
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;
    return adminService.getAllAdminUser(pageNo, dataLimit, userId).then(result => {
        if (result) {
            var response = { status: true, count: result.count, data: result.rows }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });
}

function updateUserById(req, res) {
    const body = req.body;
    var adminId = body.id;
    return adminService.getUserById(body.id).then(result => {
        if (result) {
            var adminDetails = {};
            if (body.is_delete) {
                adminDetails.is_delete = 1;
            }
            else {
                var adminDetails = {};
                const passwordHmac = req.body.password ? crypto.createHmac('sha256', config.jwtSecret).update(req.body.password).digest('hex') : "";
                adminDetails.first_name = (req.body.first_name) ? req.body.first_name : "";
                adminDetails.last_name = (req.body.last_name) ? req.body.last_name : "";
                adminDetails.email_id = (req.body.email_id) ? req.body.email_id : "";
                adminDetails.password = (req.body.password) ? passwordHmac : result.dataValues.password;
                adminDetails.role = (req.body.role) ? (req.body.role) * 1 : "";
            }
            return adminService.updateUserById(adminDetails, {
                returning: true, where: { admin_id: adminId }
            }).then(result => {
                if (result) {
                    var response = { status: true, message: "User updated!" }
                } else {
                    var response = { status: false, message: "User not updated!" }
                }
                res.send(response)
            })
        } else {
            var response = { status: false, message: "No User found for update detail!" }
            res.send(response);
        }
    })
}

module.exports = {
    addUser,
    getUserById,
    updateUserById,
    getAllAdminUser
}