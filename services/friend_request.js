const friendRequestMaster = require('../models/friend_request_master').friendRequestMaster;
const userMaster = require('../models/app_users_master').userMaster;
const sequelize = require('../db');
var Sequelize = require('sequelize');

const sendRequest = (data) => friendRequestMaster.findOne({
    where: {
        _user_id: data._friend_id,
        _friend_id: data._user_id
    }
}).then(function (device) {
    if (!device) {
        if (data.action === 'add') {
            return friendRequestMaster.findOrCreate({
                where: {
                    _user_id: data._user_id,
                    _friend_id: data._friend_id
                },
            }).spread(function (userResult, created) {
                if (created) {
                    var response = { status: true, message: "Success! Request send successfully!", data: userResult.friend_request_id }
                    return response;
                }
                else {
                    var response = { status: false, message: "Already sent" }
                    return response;
                }
            });
        }
        else if (data.action === 'undo') {
            return friendRequestMaster.findOne({
                where: {
                    _user_id: data._user_id,
                    _friend_id: data._friend_id
                }
            }).then(function (exist) {
                if (exist) {
                    var deleteQuery = { where: { _user_id: data._user_id, _friend_id: data._friend_id }, returning: true, checkExistance: true };
                    return friendRequestMaster.destroy(deleteQuery).then(function (instance) {
                        if (instance) {
                            var response = { status: true, message: "request undo successfully!" }
                            return response;
                        }
                    })
                } else {
                    var response = { status: false, message: "No Data Found!" }
                    return response;
                }
            })

        }
    } else {
        if (data.action === 'add') {
            var response = { status: false, message: "Already Frined!" }
            return response;
        } else if (data.action === 'undo') {
            var deleteQuery = { where: { _user_id: data._friend_id, _friend_id: data._user_id }, returning: true, checkExistance: true };
            return friendRequestMaster.destroy(deleteQuery).then(function (instance) {
                if (instance) {
                    var response = { status: true, message: "request undo successfully!" }
                    return response;
                }
            })
        }
    }

}).catch(function (exist) {
    console.log(exist)
})

const getPendingRequest = (friendId) => {
    var query = {
        where: {
            _friend_id: friendId,
            is_pending: 0,
            is_delete: 0
        },
        attributes: ['friend_request_id', '_user_id', 'is_pending', 'createdAt'],
        include: [
            {
                model: userMaster,
                as: 'app_users_master',
                attributes: [
                    'name',
                    'user_image'
                ],
            }
        ],
        order: [['friend_request_id', 'DESC']]
    };

    return friendRequestMaster.findAll(query).then(sequelize.getValues)
};

const getFriendPotatoFromUsers = (userId) => {
    var query = {
        where: {
            _user_id: userId,
            is_pending: 1,
            is_delete: 0
        },
        attributes: ['friend_request_id', '_friend_id', 'updatedAt'],
        order: [['friend_request_id', 'DESC']]
    };

    return friendRequestMaster.findAll(query).then(sequelize.getValues)
};

const getFriendPotatoFromFriends = (userId) => {
    var query = {
        where: {
            _friend_id: userId,
            is_pending: 1,
            is_delete: 0
        },
        attributes: ['friend_request_id', '_user_id', 'updatedAt'],
        order: [['friend_request_id', 'DESC']]
    };

    return friendRequestMaster.findAll(query).then(sequelize.getValues)
};

const getFriendPotatoFromUsersWithDate = (userId, loginDate, today) => {
    var query = {
        where: {
            _user_id: userId,
            is_pending: 1,
            // updatedAt: {
            //     [Sequelize.Op.between]: [loginDate, today]
            // },
            is_read: 0,
            is_delete: 0
        },
        attributes: ['friend_request_id', '_friend_id', 'updatedAt'],
        order: [['friend_request_id', 'DESC']]
    };

    return friendRequestMaster.findAll(query).then(sequelize.getValues)
};

// const getFriendPotatoFromFriendsWithDate = (userId, loginDate, today) => {
//     var query = {
//         where: {
//             _friend_id: userId,
//             is_pending: 1,
//             updatedAt: {
//                 [Sequelize.Op.between]: [loginDate, today]
//             },
//             is_delete: 0
//         },
//         attributes: ['friend_request_id', '_user_id', 'updatedAt'],
//         order: [['friend_request_id', 'DESC']]
//     };

//     return friendRequestMaster.findAll(query).then(sequelize.getValues)
// };

const acceptRequest = (data, query) => {

    if (data.action === 'accept') {
        return friendRequestMaster.update(data, query).then(function ([rowsUpdate, [updateFriendStatus]]) {
            return updateFriendStatus;
        })
    } else if (data.action === 'decline') {
        return friendRequestMaster.destroy(query).then(function (instance) {
            return instance;
        })
    }
};

const isYourFriendUserColumn = (userId, friendId) => {
    var query = {
        where: {
            _user_id: userId,
            _friend_id: friendId,
            is_delete: 0
        },
        attributes: ['friend_request_id', '_user_id', 'is_pending']
    };

    return friendRequestMaster.findOne(query).then(sequelize.getValues)
}

const checkRequest = (id) => {

    var query = {
        where: {
            friend_request_id: id,
            is_delete: 0
        },
        attributes: ['friend_request_id', '_user_id', '_friend_id'],
        include: [
            {
                model: userMaster,
                as: 'app_users_masters',
                attributes: [
                    'name',
                    'user_image'
                ],
            }
        ],
    };

    return friendRequestMaster.findOne(query).then(sequelize.getValues)
}



module.exports = {
    sendRequest,
    getPendingRequest,
    acceptRequest,
    getFriendPotatoFromFriends,
    getFriendPotatoFromUsers,
    isYourFriendUserColumn,
    checkRequest,
    // getFriendPotatoFromFriendsWithDate,
    getFriendPotatoFromUsersWithDate,
    // getPendingRequestUpdate
    // updateCoinById,
};