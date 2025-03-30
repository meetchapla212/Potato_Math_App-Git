var userList = require("./user/users_list");
var friendRequestService = require('../services/friend_request');
var appUserService = require('../services/app_user');
var battleService = require('../services/battle_result');
var rankService = require('../services/rank');
const config = require('../config');
var http = require('http');

// Send index.html to all requests
var app = http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end("Ok");
});


// Socket.io server listens to our app
var io = require('socket.io').listen(app);

async function friendArray(userId) {
    return friendRequestService.getFriendPotatoFromUsers(userId).then(user => {
        var result = [];
        if (user) {
            user.forEach((resData) => {
                result.push(resData.dataValues._friend_id)
            });
            return friendRequestService.getFriendPotatoFromFriends(userId).then(friend => {
                if (friend) {
                    friend.forEach((friendData) => {
                        friendData.dataValues["_friend_id"] = friendData.dataValues._user_id
                        delete friendData.dataValues._user_id
                        result.push(friendData.dataValues._friend_id)
                    });
                    return result
                }
            })
        }
    })
}

async function getFriendPotato(userId) {
    var result = await friendArray(userId);
    return result
};

async function potatoRankArray(pageNo, dataLimit) {
    return rankService.getAllRanksPotato(pageNo, dataLimit).then(result => {
        if (result) {
            var rankPotatoArray = [];
            result.map((item) => {
                rankPotatoArray.push(item.potato_quantity)
            })
            return rankPotatoArray
        }
    })
}

function getClosestValue(standardArray, targetVal) {
    if (!(standardArray) || standardArray.length == 0) {
        return 0;
    }
    if (standardArray.length == 1) {
        return standardArray[0];
    }
    if (targetVal === 0) {
        return 0
    }

    return targetVal - standardArray.reduce(function (closest, v) {
        return targetVal >= v ? Math.min(targetVal - v, closest) : closest;
    }, 1e100);
}

function getUserProfile(user_id) {
    var pageNo = 1;
    var dataLimit = config.dataLimit;
    if (user_id) {
        return appUserService.getUserDetails(user_id)
            .then(async (userRes) => {
                if (userRes) {

                    var rankPotatoArray = await potatoRankArray(pageNo, dataLimit);

                    var tempPotato = getClosestValue(rankPotatoArray, userRes.dataValues.potato_earn)

                    return rankService.getRankByPotatoQuantity(tempPotato).then(final => {
                        if (final) {
                            let serverURL = config.getServerUrl()
                            userRes['user_image'] = serverURL + config.avatarImagePath + userRes['user_image'];
                            userRes.dataValues['rank_name'] = final.dataValues.rank_name;
                            return userRes
                        }
                        return userRes
                    })
                } else {
                    return false
                }
            })
    } else {
        return false
    }
}

function stringGen(len) {
    var text = "";

    var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < len; i++)
        text += charset.charAt(Math.floor(Math.random() * charset.length));

    return text;
}



io.on('connection', function (socket) {
    var onlineFriendArray = [];
    var battleData = [];
    socket.on('login', function (data) {
        console.log('user joined >>', data)
        userList.addUser(data, socket);
    });
    socket.on('get_my_online_friend', function (userId) {
        var pageNo = 1;
        var dataLimit = config.dataLimit;

        getFriendPotato(userId).then((data) => {
            var onlineFriends = []
            data.map((ele) => {
                if (userList.userSoc[ele] != undefined) {
                    onlineFriends.push(ele)
                }
            })

            return appUserService.getMultipleUserDetails(onlineFriends).then(async (result) => {
                if (result) {
                    let serverURL = config.getServerUrl()
                    var rankPotatoArray = await potatoRankArray(pageNo, dataLimit);

                    const userDataFunction = async (user) => {
                        user['user_image'] = serverURL + config.avatarImagePath + user['user_image'];
                        var tempPotato = getClosestValue(rankPotatoArray, user['potato_earn'])
                        return rankService.getRankByPotatoQuantity(tempPotato).then(final => {
                            if (final) {
                                user.dataValues['rank_name'] = final.dataValues.rank_name;
                            } else {
                                user.dataValues['rank_name'] = config.Default_Potato_Rank;
                            }
                            return user.dataValues
                        })
                    }

                    return Promise.all(result.map(async (resData) => {
                        return await userDataFunction(resData)
                    }))
                        .then(response => {
                            var data = { status: true, data: response }
                            socket.emit('send_online_friend', data);
                        })
                }
            })
        })
    });

    socket.on('random_request', function (data) {
        var randomUser = onlineFriendArray[Math.floor(Math.random() * onlineFriendArray.length)]
        if (randomUser.dataValues.user_id !== undefined) {
            var battle_hash = stringGen(10);
            battleData = { battle_hash: battle_hash, _user_id: data._user_id, _opponent_id: randomUser.dataValues.user_id, _course_id: data._course_id, _topic_id: data._topic_id, _difficulty_id: data._difficulty_id, challenge_id: data.challenge_id };
            getUserProfile(data._user_id).then((result) => {
                var dataDetail = { status: true, message: 'user ' + data._user_id + ' send you request to play battle', result: result.dataValues, battleData: battleData }
                socket.to(userList.userSoc[randomUser.dataValues.user_id].socketId).emit('invite_for_battle', dataDetail);
            })
            socket.emit('random_friend', randomUser.dataValues.user_id);
        }
        else {
            socket.emit('no_user_online', 'no user is online');
        }
    });

    socket.on('my_data', function (data) {
        getUserProfile(data._user_id).then((user) => {
            socket.emit('data_update', user.dataValues);
        })
    });


    socket.on('send_battle_request', function (data) {
        var battle_hash = stringGen(10);
        battleData = { battle_hash: battle_hash, _user_id: data._user_id, _opponent_id: data._opponent_id, _course_id: data._course_id, _topic_id: data._topic_id, _difficulty_id: data._difficulty_id, challenge_id: data.challenge_id };
        getUserProfile(data._user_id).then((user) => {
            if (user) {
                getUserProfile(data._opponent_id).then((opponent) => {
                    var dataDetail = { status: true, message: 'user ' + data._user_id + ' send you request to play battle', user: user.dataValues, opponent: opponent.dataValues, battleData: battleData }
                    socket.to(userList.userSoc[data._opponent_id].socketId).emit('invite_for_battle', dataDetail);
                })
            }
        })
    });

    socket.on('accept_message_request', function (data) {
        return battleService.addBattle(data).then((result) => {
            getUserProfile(data._user_id).then((user) => {
                if (user) {
                    getUserProfile(data._opponent_id).then((opponent) => {
                        var dataDetail = { status: true, message: 'user ' + data._opponent_id + ' accept your battle req', battleData: data, user: user.dataValues, opponent: opponent.dataValues }
                        socket.to(userList.userSoc[data._user_id].socketId).emit('complete_request_of_battle', dataDetail);
                    })
                }
            })
        });
    });


    socket.on('decline_message_request', function (data) {
        var dataDetail = { status: false, message: 'user ' + data.friend_id + ' decline your battle req', _user_id: data._user_id, _opponent_id: data._opponent_id }
        socket.to(userList.userSoc[data._user_id].socketId).emit('complete_request_of_battle', dataDetail);
    });

    socket.on('disconnect', function (reason) {
        var offlineId = userList.removeUser(socket)
        if (offlineId !== undefined)
            socket.broadcast.emit('broadcast', 'user ' + offlineId + ' is offline');

    });

});


app.listen(8080);