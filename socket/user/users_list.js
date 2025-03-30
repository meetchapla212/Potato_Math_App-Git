/**
* Created by Iraasta on 22.12.13.
*/
;
var userList = {};
module.exports = userList;

var userData = [];
var userSocData = {};

userList.user = userData;
userList.userSoc = userSocData;

userList.getUserList = function () {
    return userSocData;
};

userList.addUser = function (user, client) {
    userSocData[user] = {
        socketId: client.id
    }
};

userList.setReceiverId = function (user, client) {
    var index = userData.findIndex(x => x.user_id == user['user_id']);
    if (index !== -1) {
        userData[index]['receiver_id'] = user['receiver_id'];
    }
    userSocData[user['user_id']] = {
        socket: client.id
    };
};


userList.removeUser = function (client) {
    for (const property in userSocData) {
        if (client.id === userSocData[property].socketId) {
            var userID = property;
            delete userSocData[property]
        }
    }
    return userID;
};
