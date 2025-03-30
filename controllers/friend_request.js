var friendRequestService = require('../services/friend_request');
var appUserService = require('../services/app_user');
var rankService = require('../services/rank');
const config = require('../config');
const pushNotification = require('./push_notification');
const moment = require('moment');


function sendRequest(req, res) {
    const friendRequestDetails = req.body;
    friendRequestDetails._friend_id = (friendRequestDetails._friend_id) * 1;
    friendRequestDetails._user_id = (req.user.id) * 1;
    return friendRequestService.sendRequest(friendRequestDetails).then(async data => {
        if (friendRequestDetails.action === 'add') {
            let serverURL = config.getServerUrl()
            var userInfo = await appUserService.getUserDetails(friendRequestDetails._user_id)
            var rankPotatoArray = await potatoRankArray(1, 10);
            var tempPotato = getClosestValue(rankPotatoArray, userInfo.dataValues.potato_earn);
            var final = await rankPotatoQuanntity(tempPotato)
            userInfo.dataValues['rank_name'] = final ? final.dataValues.rank_name : config.Default_Potato_Rank;
            var title = config.friend_request_heading;
            var body = config.friend_request_message.replace("{user}", userInfo.dataValues.name);
            userInfo.dataValues.user_image = serverURL + config.avatarImagePath + userInfo.dataValues.user_image;
            var extraInfo = { type: config.friend_request_type, user_data: JSON.stringify(userInfo.dataValues), friend_request_id: JSON.stringify(data.data) }
            pushNotification.sendNotification(friendRequestDetails._friend_id, title, body, extraInfo)
        }
        res.send(data)
    });
};

function getPendingRequest(req, res) {
    var friendId = req.user.id
    return friendRequestService.getPendingRequest(friendId).then(result => {
        if (result) {
            let serverURL = config.getServerUrl(req)
            result.forEach((user) => {
                user.dataValues.app_users_master.dataValues.user_image = serverURL + config.avatarImagePath + user.dataValues.app_users_master.dataValues.user_image
            })
            var response = { status: true, data: result };
        } else {
            var response = { status: false, message: config.no_data_message };
        }
        res.send(response);
    });
};

function getClosestValue(standardArray, targetVal) {
    if (!(standardArray) || standardArray.length == 0) {
        return null;
    }
    if (standardArray.length == 1) {
        return standardArray[0];
    }

    return targetVal - standardArray.reduce(function (closest, v) {
        return targetVal >= v ? Math.min(targetVal - v, closest) : closest;
    }, 1e100);
}

async function friendArray(userId) {
    return friendRequestService.getFriendPotatoFromUsers(userId).then(user => {
        var result = [];
        // result.push(userId)
        if (user) {
            user.forEach((resData) => {
                let data = { id: resData.dataValues._friend_id, date: resData.dataValues.updatedAt }
                result.push(data)
            });
            return friendRequestService.getFriendPotatoFromFriends(userId).then(friend => {
                if (friend) {
                    friend.forEach((friendData) => {
                        let item = { id: friendData.dataValues._user_id, date: friendData.dataValues.updatedAt }
                        result.push(item)
                    });
                    return result
                }
            })
        }
    })
}


async function friendArrayForSuggestion(userId) {
    return friendRequestService.getFriendPotatoFromUsers(userId).then(user => {
        var result = [];
        // result.push(userId)
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

async function getRecentFriend(req, res) {
    var userId = req.user.id
    var body = req.body
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;
    const { uId } = req.params;
    if (uId && uId != null) {
        userId = uId;
    }
    var result = await friendArray(userId);
    await result.sort(function (a, b) {
        return b['date'] - a['date'];
    })
    var sortResult = [];
    result.forEach((ele) => {
        sortResult.push(ele.id)
    })

    return rankService.getAllRanksPotato(pageNo, dataLimit).then(rank => {
        if (rank) {
            var rankPotatoArray = [];
            rank.map((item) => {
                rankPotatoArray.push(item.potato_quantity)
            })

            return appUserService.getUserName(body)
                .then(name => {
                    if (name) {
                        var nameLikeArray = [];
                        name.map((user) => {
                            nameLikeArray.push(user.dataValues.user_id)
                        })
                        Array.prototype.diff = function (arr2) {
                            var ret = [];
                            for (var i = 0; i < this.length; i += 1) {
                                if (arr2.indexOf(this[i]) > -1) {
                                    ret.push(this[i]);
                                }
                            }
                            return ret;
                        };
                        var finalFriend = sortResult.diff(nameLikeArray)

                        const potatoFunction = async (resDataItem) => {
                            return appUserService.getUserDetails(resDataItem)
                                .then(userRes => {
                                    if (userRes) {
                                        let serverURL = config.getServerUrl(req)
                                        userRes['user_image'] = serverURL + config.avatarImagePath + userRes['user_image'];
                                        var tempPotato = getClosestValue(rankPotatoArray, userRes['potato_earn'])
                                        return rankService.getRankByPotatoQuantity(tempPotato).then(final => {
                                            if (final) {
                                                userRes.dataValues['rank_name'] = final.dataValues.rank_name;
                                                return userRes
                                            } else {
                                                userRes.dataValues['rank_name'] = config.Default_Potato_Rank;
                                                return userRes
                                            }
                                        })
                                    } else {
                                        var response = { status: false, message: config.no_data_message };
                                        res.send(response);
                                    }
                                })
                        }

                        return Promise.all(finalFriend.slice(0, dataLimit).map(resData => potatoFunction(resData)))
                            .then(data => {
                                var response = { status: true, data: data }
                                res.send(response);
                            })
                    } else {
                        var response = { status: false, message: config.no_data_message };
                        res.send(response);
                    }
                })
        }
    })
};
async function checkStatus(_user_id, _friend_id) {
    return friendRequestService.isYourFriendUserColumn(_user_id, _friend_id).then(item => {
        if (item) {
            if (item.dataValues.is_pending === 0) {
                return true
            }
        } else {
            return friendRequestService.isYourFriendUserColumn(_friend_id, _user_id).then(data => {
                if (data) {
                    if (data.dataValues.is_pending === 0) {
                        return true
                    }
                } else {
                    return false
                }
            })
        }
    })
}

async function getSuggestionFriend(req, res) {
    var userId = req.user.id
    var body = req.body
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;

    var result = await friendArrayForSuggestion(userId);
    result.push(userId)
    return appUserService.getSuggestionFriend(pageNo, dataLimit, body, result).then(friendData => {
        if (friendData) {

            let serverURL = config.getServerUrl(req)
            const friendFunction = async (resDataItem) => {
                resDataItem['user_image'] = serverURL + config.avatarImagePath + resDataItem['user_image'];
                resDataItem.dataValues['is_requested'] = await checkStatus(userId, resDataItem['user_id'])

                return resDataItem;
            }

            return Promise.all(friendData.map(resData => friendFunction(resData)))
                .then(data => {
                    var response = { status: true, data: data }
                    res.send(response);
                })
        }
    })
}

function isYourFriend(req, res) {
    var _user_id = req.user.id
    var _friend_id = (req.body._friend_id) * 1;
    return friendRequestService.isYourFriendUserColumn(_user_id, _friend_id).then(item => {
        if (item) {
            if (item.dataValues.is_pending === 1) {
                var response = { status: true, data: 1 }
            } else {
                var response = { status: true, data: 0 }
            }
            res.send(response)
        } else {
            return friendRequestService.isYourFriendUserColumn(_friend_id, _user_id).then(data => {
                if (data) {

                    if (data.dataValues.is_pending === 1) {
                        var response = { status: true, data: 1 }
                    } else {
                        var response = { status: true, data: 0 }
                    }
                } else {
                    var response = { status: true, data: -1 }
                }
                res.send(response)
            })
        }
    })
}

function acceptRequest(req, res) {
    var friendId = req.user.id
    const friendRequestDetails = req.body;
    friendRequestDetails.friend_request_id = (friendRequestDetails.friend_request_id) * 1;
    friendRequestDetails._friend_id = (friendId) * 1;
    friendRequestDetails.is_pending = 1;
    return friendRequestService.getPendingRequest(friendId).then(async result => {
        if (result) {
            var details = await friendRequestService.checkRequest(friendRequestDetails.friend_request_id);
            return friendRequestService.acceptRequest(friendRequestDetails, {
                returning: true, where: { friend_request_id: friendRequestDetails.friend_request_id }
            }).then(async data => {
                if (data) {
                    var userInfo = await appUserService.getUserDetails(details.dataValues._friend_id)
                    if (data === 1) {
                        var body = config.friend_declined_message.replace("{friend}", userInfo.dataValues.name);
                        var response = { status: true, message: "Request Declined!" }
                        var status = 'Decline';
                    } else {
                        var body = config.friend_accepted_message.replace("{friend}", userInfo.dataValues.name);
                        var response = { status: true, message: "You both are friends now!" }
                        var status = 'Accepted';
                    }
                    var rankPotatoArray = await potatoRankArray(1, 10);
                    var tempPotato = getClosestValue(rankPotatoArray, userInfo.dataValues.potato_earn);
                    var final = await rankPotatoQuanntity(tempPotato)
                    userInfo.dataValues['rank_name'] = final ? final.dataValues.rank_name : config.Default_Potato_Rank;
                    var title = config.friend_request_heading;
                    let serverURL = config.getServerUrl()
                    userInfo.dataValues.user_image = serverURL + config.avatarImagePath + userInfo.dataValues.user_image;
                    var extraInfo = { status: status, type: config.friend_request_type, user_data: JSON.stringify(userInfo.dataValues), friend_request_id: JSON.stringify(friendRequestDetails.friend_request_id) }
                    pushNotification.sendNotification(details.dataValues._user_id, title, body, extraInfo)
                } else {
                    var response = { status: false, message: "Unable!" }
                }
                res.send(response)
            })
        } else {
            var response = { status: false, message: config.no_data_message }
            res.send(response);
        }
    })
};

async function userColumnArray(userId, loginDate, today) {
    return friendRequestService.getFriendPotatoFromUsersWithDate(userId, loginDate, today).then(user => {
        var result = [];
        if (user) {
            user.forEach((resData) => {
                result.push(resData.dataValues.friend_request_id)
            });
            return result
        }
    })
}

function notifyFriend(req, res) {
    var userId = req.user.id;
    return appUserService.getUserDetails(userId).then(async (user) => {
        if (user) {
            var today = moment(new Date()).add(1, 'days').format('YYYY-MM-DD hh:mm');
            var lastNotificationDate = user.dataValues.last_notification_date;
            var userArray = await userColumnArray(userId, lastNotificationDate, today);

            const checkFunction = async (resDataItem) => {
                return friendRequestService.checkRequest(resDataItem).then((result) => {
                    if (result) {
                        let serverURL = config.getServerUrl(req)
                        result.app_users_masters.dataValues.user_image = serverURL + config.avatarImagePath + result.app_users_masters.dataValues.user_image
                        return result
                    }
                    else {
                        return
                    }
                })

            }

            return Promise.all(userArray.map(resData => checkFunction(resData)))
                .then(data => {
                    var response = { status: true, data: data }
                    res.send(response);
                })
        }
        else {
            var response = { status: false, message: config.no_data_message };
            res.send(response);
        }
    })
}

function randomOpponent(req, res) {
    var userId = req.user.id;
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;
    return appUserService.getUserDetails(userId).then((user) => {
        if (user) {
            var gradeId = user.dataValues._grade_id
            return appUserService.getUsersForOpponent(gradeId, userId).then(async (result) => {
                if (result && result.length > 0) {
                    var userArray = [];
                    result.forEach(item => {
                        userArray.push(item.dataValues.user_id);
                    })
                    var randomUser = userArray[Math.floor(Math.random() * userArray.length)]
                    let serverURL = config.getServerUrl(req);
                    return appUserService.getUserDetails(randomUser)
                        .then(async userRes => {
                            if (userRes) {
                                userRes.dataValues.user_image = serverURL + config.avatarImagePath + userRes.dataValues.user_image;
                                var rankPotatoArray = await potatoRankArray(pageNo, dataLimit);
                                var tempPotato = getClosestValue(rankPotatoArray, userRes.dataValues.potato_earn);
                                var final = await rankPotatoQuanntity(tempPotato)
                                userRes.dataValues['rank_name'] = final ? final.dataValues.rank_name : config.Default_Potato_Rank;

                                var response = { status: true, data: userRes }
                            } else {
                                var response = { status: true, message: config.no_data_message }
                            }
                            res.send(response)
                        })
                } else {
                    var response = { status: false, message: "No random user found!!" }
                    res.send(response)
                }
            })
        } else {
            var response = { status: false, message: config.no_data_message }
            res.send(response)
        }
    })
}
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

async function rankPotatoQuanntity(tempPotato) {
    return rankService.getRankByPotatoQuantity(tempPotato).then(final => {
        return final
    })
}

module.exports = {
    sendRequest,
    getPendingRequest,
    acceptRequest,
    getRecentFriend,
    getSuggestionFriend,
    isYourFriend,
    notifyFriend,
    randomOpponent
}