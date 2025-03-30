var battleService = require('../services/battle_result');
var battleRequest = require('../services/battle_request');
var appUserService = require('../services/app_user');
var streakAppliedService = require('../services/streak_applied');
var streakService = require('../services/streak');
var pushNotification = require('./push_notification');
var rankService = require('../services/rank');
const config = require('../config');

function addBattleResult(req, res) {
    const battleDetails = req.body;
    battleDetails.battle_hash = battleDetails.battle_hash;
    battleDetails._user_id = battleDetails._user_id * 1;
    battleDetails._opponent_id = battleDetails._opponent_id * 1;
    battleDetails._course_id = battleDetails._course_id * 1;
    battleDetails._topic_id = battleDetails._topic_id * 1;
    battleDetails._difficulty_id = battleDetails._difficulty_id * 1;
    battleDetails.challenge_type = battleDetails.challenge_type * 1;
    return battleService.addBattle(battleDetails).then(data => res.send(data));
}
async function updateRequestData(token, winnerId) {
    return battleRequest.getBattleRequestByToken(token).then(req => {
        if (req) {
            var requestDetails = {};
            requestDetails.battle_status = "complete";
            if (winnerId === 0) {
                requestDetails.sender_result = "tie"
            } else if (req.dataValues.sender_user_id === winnerId) {
                requestDetails.sender_result = "won"
            } else {
                requestDetails.sender_result = "loss"
            }
            // requestDetails.sender_result = (req.dataValues.sender_user_id === winnerId) ? "won" : "loss";
            return battleRequest.updateBattleRequestByToken(requestDetails, {
                returning: true, where: { battle_token: token }
            }).then(nxt => {
                if (nxt) {
                    return { status: true }
                }
                return { status: true }
            });
        }
        return { status: true }
    })
}

async function updateSenderStatusData(requestDetails, token) {
    return battleRequest.updateBattleRequestByToken(requestDetails, {
        returning: true, where: { battle_token: token }
    }).then(nxt => {
        if (nxt) {
            return { status: true }
        }
        return { status: true }
    });
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


function updateBattleByHash(req, res) {
    const battleDetails = req.body;
    battleDetails.player_id = (battleDetails.player_id) * 1;
    return battleService.getBattleByHash(battleDetails.battle_hash).then(async result => {
        if (result) {
            var isBattleComplte = false;
            if (result.dataValues._user_id === battleDetails.player_id) {
                var user_right_ans = 0;
                var user_totalTime = 0;
                battleDetails.total_question = (battleDetails.answer).length
                battleDetails.answer.forEach(que => {
                    user_totalTime = user_totalTime + que.time
                    if (que.answer_status) {
                        user_right_ans++;
                    }
                });
                // var type = battleDetails.challenge_type === 'solo' ? 5 : 9;
                battleDetails.user_right_answer = user_right_ans
                battleDetails.user_wrong_answer = battleDetails.total_question - battleDetails.user_right_answer;
                battleDetails.user_potato_earn = (battleDetails.user_right_answer) ? battleDetails.user_right_answer * result.dataValues._difficulty_id : 0;
                battleDetails.user_quizTime = user_totalTime;

                if (result.dataValues.opponent_right_answer !== null) {
                    isBattleComplte = true;
                    var userRightAnswer = user_right_ans
                    var opponentRightAnswer = result.dataValues.opponent_right_answer
                    return
                }
                var requestDetails = {};
                requestDetails.sender_battle_status = "complete";
                var updateData = await updateSenderStatusData(requestDetails, battleDetails.battle_hash);
                var userInfo = await appUserService.getUserDetails(result.dataValues._user_id)
                var rankPotatoArray = await potatoRankArray(1, 10);
                var tempPotato = getClosestValue(rankPotatoArray, userInfo.dataValues.potato_earn);
                var final = await rankPotatoQuanntity(tempPotato)
                userInfo.dataValues['rank_name'] = final ? final.dataValues.rank_name : config.Default_Potato_Rank;
                let serverURL = config.getServerUrl()
                userInfo.dataValues.user_image = serverURL + config.avatarImagePath + userInfo.dataValues.user_image;
                var title = config.battle_send_heading;
                var body = config.battle_send.replace("{user}", userInfo.dataValues.name);
                var extraInfo = { type: config.battle_request_type, battle_data: JSON.stringify(result.dataValues), user_data: JSON.stringify(userInfo.dataValues) }
                pushNotification.sendNotification(result.dataValues._opponent_id, title, body, extraInfo)
            }
            if (result.dataValues._opponent_id === battleDetails.player_id) {
                var opponent_right_ans = 0;
                var opponent_totalTime = 0;
                battleDetails.total_question = (battleDetails.answer).length
                battleDetails.answer.forEach(que => {
                    opponent_totalTime = opponent_totalTime + que.time
                    if (que.answer_status) {
                        opponent_right_ans++;
                    }
                });
                battleDetails.opponent_right_answer = opponent_right_ans
                battleDetails.opponent_wrong_answer = battleDetails.total_question - battleDetails.opponent_right_answer;
                battleDetails.opponent_potato_earn = (battleDetails.opponent_right_answer) ? battleDetails.opponent_right_answer * result.dataValues._difficulty_id : 0;
                battleDetails.opponent_quizTime = opponent_totalTime


                if (result.dataValues.user_right_answer !== null) {
                    isBattleComplte = true;
                    var opponentRightAnswer = opponent_right_ans
                    var userRightAnswer = result.dataValues.user_right_answer
                }
            }

            async function handleFinalProceeds(final) {
                if (final) {
                    battleDetails.winner_user_id = final.winner_user_id;
                    battleDetails.battle_status = "complete";
                    battleDetails.user_potato_earn = final.user_potato_earn;
                    battleDetails.opponent_potato_earn = final.opponent_potato_earn;
                    var updateData = await updateRequestData(battleDetails.battle_hash, final.winner_user_id)
                    var opponenntInfo = await appUserService.getUserDetails(result.dataValues._opponent_id)

                    var rankPotatoArray = await potatoRankArray(1, 10);
                    var tempPotato = getClosestValue(rankPotatoArray, opponenntInfo.dataValues.potato_earn);
                    var rankData = await rankPotatoQuanntity(tempPotato)
                    opponenntInfo.dataValues['rank_name'] = rankData ? rankData.dataValues.rank_name : config.Default_Potato_Rank;
                    let serverURL = config.getServerUrl()
                    opponenntInfo.dataValues.user_image = serverURL + config.avatarImagePath + opponenntInfo.dataValues.user_image;

                    if (battleDetails.winner_user_id) {
                        if (result.dataValues._user_id === battleDetails.winner_user_id) {
                            var title = config.battle_result_user_heading_won;
                            var body = config.battle_result_user_message_won.replace("{friend}", opponenntInfo.dataValues.name);
                            var extraInfo = { type: config.battle_result_type, battle_hash: battleDetails.battle_hash, user_data: JSON.stringify(opponenntInfo.dataValues) }
                        } else {
                            var title = config.battle_result_user_heading_lost;
                            var body = config.battle_result_user_message_lost.replace("{friend}", opponenntInfo.dataValues.name);
                            var extraInfo = { type: config.battle_result_type, battle_hash: battleDetails.battle_hash, user_data: JSON.stringify(opponenntInfo.dataValues) }
                        }
                        pushNotification.sendNotification(result.dataValues._user_id, title, body, extraInfo)
                    } else {
                        title = config.battle_result_user_heading_tie;
                        var body = config.battle_result_user_message_tie.replace("{friend}", opponenntInfo.dataValues.name);
                        var extraInfo = { type: config.battle_result_type, battle_hash: battleDetails.battle_hash, user_data: JSON.stringify(opponenntInfo.dataValues) }
                        pushNotification.sendNotification(result.dataValues._user_id, title, body, extraInfo)
                    }
                }
                return battleService.updateBattleById(battleDetails, {
                    returning: true, where: { battle_hash: result.dataValues.battle_hash }
                }).then(data => {
                    if (data) {
                        if (final && final.streak && final.streakDetail) {
                            var response = {
                                status: true, message: "Battle updated!", data: data.data,
                                streak: final.streak, streakDetail: final.streakDetail
                            }
                        } else {
                            var response = { status: true, message: "Battle updated!", data: data.data }
                        }
                    } else {
                        var response = { status: false, message: "Battle not updated!" }
                    }
                    res.send(response)
                })
            }
            if (isBattleComplte) {
                if (opponentRightAnswer === userRightAnswer) {
                    var potatoEarnForBoth = Math.round((userRightAnswer * result.dataValues._difficulty_id) / 2);

                    var userList = [result.dataValues._user_id, result.dataValues._opponent_id]
                    return Promise.all(userList.map((user) => {
                        return appUserService.getUserDetails(user).then(userData => {
                            if (userData) {
                                var appServiceDetails = {};
                                appServiceDetails.potato_earn = userData.dataValues.potato_earn + potatoEarnForBoth;
                                // return appUserService.updateUserProfile(appServiceDetails, user).then(userUpdate => {
                                //     if (userUpdate) {
                                return streakAppliedService.getActiveStreakForBattle(result.dataValues._user_id, result.dataValues._course_id).then(streak => {
                                    let resolve = { potato: potatoEarnForBoth }
                                    if (streak) {
                                        return streakService.getStreakById(streak.dataValues._streak_id).then(gamsData => {
                                            if (gamsData) {

                                                
                                                if (streak) {
                                                    streak.dataValues.potato_earn = streak.dataValues.potato_earn + potatoEarnForBoth;

                                                    var dataObj = {}
                                                    if (streak.dataValues.potato_earn >= streak.dataValues.potato_required) {
                                                        appServiceDetails.gems_earn = userData.dataValues.gems_earn + gamsData.dataValues.gams;
                                                        if (user === result.dataValues._user_id) {
                                                            appServiceDetails._streak_applied_id = streak.dataValues.streak_applied_id;
                                                        }
                                                        dataObj.streak_status = "success";
                                                    }
                                                    return appUserService.updateUserProfile(appServiceDetails, userData.dataValues.user_id).then(user => {
                                                        dataObj.potato_earn = streak.dataValues.potato_earn
                                                        return streakAppliedService.updateActiveStreakById(dataObj, {
                                                            returning: true, where: { streak_applied_id: streak.dataValues.streak_applied_id }
                                                        }).then(streakUpdate => {
                                                            if (streakUpdate) {
                                                                if (user === result.dataValues._opponent_id) {
                                                                    resolve.streak = streakUpdate;
                                                                    resolve.streakDetail = gamsData
                                                                }
                                                                return Promise.resolve(resolve);
                                                            }
                                                        })
                                                    })
                                                } else {
                                                    return Promise.resolve(resolve);
                                                }
                                            } else {
                                                return Promise.resolve(resolve);
                                            }
                                        })
                                    } else {
                                        return Promise.resolve(resolve);
                                    }
                                    //     })
                                    // }
                                    //return
                                })
                            }
                            return;
                        })
                    })).then(allUsers => {
                        allUsers.winner_user_id = 0;
                        allUsers.user_potato_earn = allUsers[0].potato;
                        allUsers.opponent_potato_earn = allUsers[0].potato;
                        handleFinalProceeds(allUsers);
                        return allUsers;
                    })
                }
                else if (userRightAnswer > opponentRightAnswer) {
                    var userEarnPotato = (userRightAnswer + opponentRightAnswer) * result.dataValues._difficulty_id;
                    return appUserService.getUserDetails(result.dataValues._user_id).then(userData => {
                        if (userData) {
                            var appServiceDetails = {};
                            appServiceDetails.potato_earn = userData.dataValues.potato_earn + userEarnPotato;
                            // return appUserService.updateUserProfile(appServiceDetails, userData.dataValues.user_id).then(user => {
                            //     if (user) {
                            return streakAppliedService.getActiveStreakForBattle(result.dataValues._user_id, result.dataValues._course_id).then(streak => {
                                let resolve = { winner_user_id: result.dataValues._user_id, user_potato_earn: userEarnPotato, opponent_potato_earn: 0 }
                                if(streak){
                                    return streakService.getStreakById(streak.dataValues._streak_id).then(gamsData => {
                                        if (gamsData) {
                                            
                                            if (streak) {
                                                streak.dataValues.potato_earn = streak.dataValues.potato_earn + userEarnPotato;


                                                var dataObj = {}
                                                if (streak.dataValues.potato_earn >= streak.dataValues.potato_required) {
                                                    appServiceDetails.gems_earn = userData.dataValues.gems_earn + gamsData.dataValues.gams;
                                                    appServiceDetails._streak_applied_id = streak.dataValues.streak_applied_id;
                                                    dataObj.streak_status = "success";
                                                }

                                                return appUserService.updateUserProfile(appServiceDetails, result.dataValues._user_id).then(user => {
                                                    dataObj.potato_earn = streak.dataValues.potato_earn
                                                    return streakAppliedService.updateActiveStreakById(dataObj, {
                                                        returning: true, where: { streak_applied_id: streak.dataValues.streak_applied_id }
                                                    }).then(streakUpdate => {
                                                        if (streakUpdate) {
                                                            return Promise.resolve(resolve);
                                                        }
                                                    })
                                                })
                                            } else {
                                                return Promise.resolve(resolve);
                                            }
                                        } else {
                                            return Promise.resolve(resolve);
                                        }
                                    })
                                } else {
                                    return Promise.resolve(resolve);
                                }
                            })
                        }
                    }).then(allUsers => {
                        handleFinalProceeds(allUsers);
                        return allUsers;
                    })
                }
                else if (userRightAnswer < opponentRightAnswer) {
                    var opponentEarnPotato = (userRightAnswer + opponentRightAnswer) * result.dataValues._difficulty_id;
                    return appUserService.getUserDetails(result.dataValues._opponent_id).then(userData => {
                        if (userData) {
                            var appServiceDetails = {};
                            appServiceDetails.potato_earn = userData.dataValues.potato_earn + opponentEarnPotato;
                            return streakAppliedService.getActiveStreakForBattle(result.dataValues._opponent_id, result.dataValues._course_id).then(streak => {
                                let resolve = { winner_user_id: result.dataValues._opponent_id, user_potato_earn: 0, opponent_potato_earn: opponentEarnPotato }
                                if(streak) {
                                    return streakService.getStreakById(streak.dataValues._streak_id).then(gamsData => {
                                        if (gamsData) {
                                            
                                            if (streak) {
                                                streak.dataValues.potato_earn = streak.dataValues.potato_earn + opponentEarnPotato;

                                                var dataObj = {}
                                                if (streak.dataValues.potato_earn >= streak.dataValues.potato_required) {
                                                    appServiceDetails.gems_earn = userData.dataValues.gems_earn + gamsData.dataValues.gams;
                                                    dataObj.streak_status = "success";
                                                }

                                                return appUserService.updateUserProfile(appServiceDetails, userData.dataValues.user_id).then(user => {
                                                    dataObj.potato_earn = streak.dataValues.potato_earn
                                                    return streakAppliedService.updateActiveStreakById(dataObj, {
                                                        returning: true, where: { streak_applied_id: streak.dataValues.streak_applied_id }
                                                    }).then(streakUpdate => {
                                                        if (streakUpdate) {
                                                            resolve.streak = streakUpdate;
                                                            resolve.streakDetail = gamsData
                                                            return Promise.resolve(resolve);
                                                        }
                                                    })
                                                })
                                            } else {
                                                return Promise.resolve(resolve);
                                            }
                                        } else {
                                            return Promise.resolve(resolve);
                                        }
                                    })
                                } else {
                                    return Promise.resolve(resolve);
                                }
                            })
                        }
                    }).then(allUsers => {
                        handleFinalProceeds(allUsers)
                        return allUsers;
                    })
                }
            } else {
                handleFinalProceeds()
            }
        } else {
            var response = { status: false, message: "No battle found for update detail!" }
            res.send(response);
        }
    })
};

async function userBattleResult(userId) {
    return battleService.userColumn(userId).then(user => {
        var result = [];
        // result.push(userId)
        if (user) {
            user.forEach((resData) => {
                result.push(resData.dataValues.battle_id)
            });
            return battleService.opponentColumn(userId).then(opponent => {
                if (opponent) {
                    opponent.forEach((resData) => {
                        result.push(resData.dataValues.battle_id)
                    });
                    return result
                }
            })
        }
    })
}


async function getBattleResult(req, res) {
    var user_id = req.user.id;

    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;

    var battleArray = await userBattleResult(user_id);
    return battleService.getMultipleBattleResult(battleArray).then(result => {
        if (result) {
            let serverURL = config.getServerUrl(req)
            result.forEach((resData) => {
                resData.dataValues["topic_name"] = resData.dataValues.topic.dataValues.topic_name;
                resData.dataValues["topic_image"] = resData.dataValues.topic.dataValues.topic_image;
                resData.dataValues["topic_image"] = serverURL + config.topicImagePath + resData.dataValues["topic_image"];
                delete resData.dataValues.topic;
            });
            var response = { status: true, data: result }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    })
}


module.exports = {
    updateBattleByHash,
    getBattleResult,
    addBattleResult
}