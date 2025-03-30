var battleRequest = require('../services/battle_request');
var battle_result = require('../services/battle_result');
const appUserService = require('../services/app_user');
var pushNotification = require('./push_notification');
const courseService = require('../services/course');
const topicService = require('../services/topic');
const streakAppliedService = require('../services/streak_applied');
const streakService = require('../services/streak');
const config = require('../config');
var uuid = require('uuid');

function addBattleRequest(req, res) {
    const battleDetails = req.body;
    battleDetails.sender_user_id = battleDetails.sender_user_id * 1;
    battleDetails.receiver_user_id = battleDetails.receiver_user_id * 1;
    battleDetails._course_id = battleDetails._course_id * 1;
    battleDetails._topic_id = battleDetails._topic_id * 1;
    battleDetails._difficulty_id = battleDetails._difficulty_id * 1;
    battleDetails.challenge_type = battleDetails.challenge_type * 1;
    battleDetails.battle_token = uuid.v1();
    return battleRequest.addBattleRequest(battleDetails).then(data => res.send(data));
};

function getBattleRequestByReceiverId(req, res) {
    var user_id = req.user.id;
    if (user_id) {
        return battleRequest.getBattleRequestByReceiverId(user_id).then(result => {
            if (result) {
                let serverURL = config.getServerUrl(req)

                const battleFunction = async (item) => {
                    return appUserService.getUserDetails(item.sender_user_id)
                        .then(async userRes => {
                            var courseDetails = await courseService.getCourseById(item._course_id);
                            var topicDetails = await topicService.getTopicById(item._topic_id);
                            item.dataValues._course_name = courseDetails['course_name'];
                            item.dataValues._topic_name = topicDetails['topic_name'];
                            item.dataValues.sender_user_name = userRes.name;
                            item.dataValues.sender_user_potato = userRes.potato_earn;
                            item.dataValues.sender_user_image = serverURL + config.avatarImagePath + userRes.user_image;
                            return item
                        })
                }

                return Promise.all(result.map(resData => battleFunction(resData)))
                    .then(data => {
                        var response = { status: true, data: data }
                        res.send(response);
                    })
            } else {
                var response = { status: false, message: config.no_data_message };
                res.send(response);
            }
        })
    } else {
        var response = { status: false, message: config.no_data_message };
        res.send(response);
    }
};

function getPendingBattlesCount(req, res) {
    var user_id = req.user.id;
    if (user_id) {
        return battleRequest.getPendingBattlesCount(user_id).then(result => {
            if (result) {
                var response = { status: true, total: result.length };
                res.send(response);
            }
        });
    }
}

function getBattleRequestBySenderId(req, res) {
    var user_id = req.user.id;
    if (user_id) {
        return battleRequest.getBattleRequestBySenderId(user_id).then(result => {
            if (result) {
                let serverURL = config.getServerUrl(req)
                const battleFunction = async (item) => {
                    return battleRequest.getBattleRequestByToken(item.dataValues.battle_token).then(request => {
                        if (request) {
                            return appUserService.getUserDetails(item.receiver_user_id)
                                .then(userRes => {
                                    item.dataValues.receive_user_name = userRes.name;
                                    item.dataValues.receive_user_potato = userRes.potato_earn;
                                    item.dataValues.receive_user_image = serverURL + config.avatarImagePath + userRes.user_image;
                                    return item
                                })
                        }
                    })
                }

                return Promise.all(result.map(resData => battleFunction(resData)))
                    .then(data => {
                        var response = { status: true, data: data }
                        res.send(response);
                    })
            } else {
                var response = { status: false, message: config.no_data_message };
                res.send(response);
            }
        })
    } else {
        var response = { status: false, message: config.no_data_message };
        res.send(response);
    }
};

function getBattleRequestByToken(req, res) {
    const battleToken = req.body.battle_token;
    let serverURL = config.getServerUrl(req)
    if (battleToken) {
        return battle_result.getBattleByToken(battleToken).then(result => {
            if (result) {
                return appUserService.getUserDetails(result.dataValues._opponent_id)
                    .then(async userRes => {
                        if (userRes) {
                            var senderDetail = await appUserService.getUserDetails(result.dataValues._user_id)
                            if (senderDetail._streak_applied_id) {
                                var streak = await streakAppliedService.getAppliedStreakById(senderDetail._streak_applied_id)
                                var streakDetail = await streakService.getStreakById(streak.dataValues._streak_id)
                                var appServiceDetails = {};
                                appServiceDetails._streak_applied_id = 0;
                                var updateProfile = await appUserService.updateUserProfile(appServiceDetails, result.dataValues._user_id)
                            } else {
                                var streak = await streakAppliedService.getActiveStreakForBattle(result.dataValues._user_id, result.dataValues._course_id)
                                if (streak)
                                    var streakDetail = await streakService.getStreakById(streak.dataValues._streak_id)
                            }
                            result.dataValues.receive_user_name = userRes.name;
                            result.dataValues.receive_user_potato = userRes.potato_earn;
                            result.dataValues.receive_user_image = serverURL + config.avatarImagePath + userRes.user_image;
                            var response = { status: true, data: result };
                            if (streak) {
                                response.streak = streak;
                            }
                            if (streakDetail) {
                                response.streakDetail = streakDetail;
                            }
                            res.send(response);
                        } else {
                            var response = { status: false, message: config.no_data_message };
                            res.send(response);
                        }
                    })
            } else {
                var response = { status: false, message: config.no_data_message };
                res.send(response);
            }

        })
    } else {
        var response = { status: false, message: config.no_data_message };
        res.send(response);
    }
};

function updateBattleRequestByToken(req, res) {
    const battleDetails = req.body;
    return battleRequest.getBattleRequestByToken(battleDetails.battle_token).then(result => {
        if (result) {
            return battleRequest.updateBattleRequestByToken(battleDetails, {
                returning: true, where: { battle_token: battleDetails.battle_token }
            }).then(uppdateResult => {
                if (uppdateResult) {
                    return battle_result.getBattleByToken(battleDetails.battle_token).then(battle => {
                        if (battle) {
                            battleDetails.winner_user_id = battle.dataValues._user_id;
                            return battle_result.updateBattleByToken(battleDetails, {
                                returning: true, where: { battle_hash: battleDetails.battle_token }
                            }).then(update => {
                                if (update) {
                                    return appUserService.getUserDetails(battle.dataValues._user_id)
                                        .then(userRes => {
                                            if (userRes) {
                                                var profileDetails = {};
                                                profileDetails.potato_earn = userRes.dataValues.potato_earn + battle.dataValues.user_potato_earn
                                                return appUserService.updateUserProfile(profileDetails, battle.dataValues._user_id).then(async user => {
                                                    if (user) {
                                                        var friendInfo = await appUserService.getUserDetails(result.dataValues.receiver_user_id)
                                                        var title = config.battle_declined_heading;
                                                        var body = config.battle_declined_message.replace("{friend}", friendInfo.dataValues.name);
                                                        var extraInfo = { type: config.battle_request_type }
                                                        pushNotification.sendNotification(result.dataValues.sender_user_id, title, body, extraInfo)
                                                        var response = { status: true, message: "Battle request rejected succesfully!" }
                                                    } else {
                                                        var response = { status: false, message: "Coin not added in user profile!" }
                                                    }
                                                    res.send(response)
                                                })
                                            } else {
                                                var response = { status: false, message: "User not found!" }
                                                res.send(response);
                                            }
                                        })

                                } else {
                                    var response = { status: false, message: "Battle request not updated!" }
                                }
                                res.send(response)
                            })
                        } else {
                            var response = { status: false, message: "Battle request not updated!" }
                            res.send(response);
                        }
                    })
                } else {
                    var response = { status: false, message: "No Battle request found for update detail!" }
                    res.send(response);
                }
            })
        } else {
            var response = { status: false, message: "No Battle request found for update detail!" }
            res.send(response);
        }
    })
};


module.exports = {
    getPendingBattlesCount,
    addBattleRequest,
    getBattleRequestByToken,
    getBattleRequestByReceiverId,
    updateBattleRequestByToken,
    getBattleRequestBySenderId
}