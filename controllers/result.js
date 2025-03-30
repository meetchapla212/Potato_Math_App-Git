var resultService = require('../services/result');
var appUserService = require('../services/app_user');
var streakService = require('../services/streak');
var streakAppliedService = require('../services/streak_applied');
var battleService = require('../services/battle_result');
var referralService = require('../services/referral');
const rankService = require('../services/rank');
const config = require('../config');
const moment = require('moment');

function isJoinedId(userId, joinedId) {
    return referralService.getReferralRecord(userId, joinedId).then(referralData => {
        if (referralData) {
            var profileDetails = {};
            profileDetails.is_battle = 1;
            return referralService.updateReferralRecord(profileDetails, referralData.dataValues.id);
        }
    })
}

function addResult(req, res) {
    const resultDetails = req.body;
    var right = 0;
    var totalTime = 0;
    resultDetails._user_id = req.user.id;
    resultDetails._course_id = (resultDetails._course_id) ? (resultDetails._course_id) * 1 : 0;
    resultDetails._topic_id = (resultDetails._topic_id) ? (resultDetails._topic_id) * 1 : 0;
    resultDetails._difficulty_id = (resultDetails._difficulty_id) ? (resultDetails._difficulty_id) * 1 : 0;
    resultDetails.challenge_type = (resultDetails.challenge_type) ? (resultDetails.challenge_type) * 1 : 0;
    resultDetails.total_question = (resultDetails.answer) ? (resultDetails.answer).length : 0;
    resultDetails.answer.forEach(que => {
        totalTime = totalTime + que.time
        if (que.answer_status) {
            right++;
        }
    });

    resultDetails.right_answer = right
    resultDetails.wrong_answer = resultDetails.total_question - resultDetails.right_answer;
    resultDetails.potato_earn = (resultDetails.right_answer) ? resultDetails.right_answer * resultDetails._difficulty_id : 0;
    resultDetails.quizTime = totalTime
    if (resultDetails._joined_id) {
        isJoinedId(resultDetails._user_id, resultDetails._joined_id)
    }
    return resultService.addResult(resultDetails).then(data => {
        if (data) {
            return appUserService.getUserDetails(resultDetails._user_id).then(result => {
                if (result) {
                    var appServiceDetails = {};
                    appServiceDetails.potato_earn = result.potato_earn + resultDetails.potato_earn;
                    appServiceDetails.last_played_date = moment(new Date()).format('YYYY-MM-DD');
                    return appUserService.updateUserProfile(appServiceDetails, resultDetails._user_id).then(userUpdate => {
                        if (userUpdate) {
                            return streakAppliedService.getActiveStreak(resultDetails._user_id, resultDetails._course_id).then(streak => {
                                if (streak) {
                                    return streakService.getStreakById(streak.dataValues._streak_id).then(gamsData => {
                                        if (gamsData) {
                                            var dataObj = {}

                                            var potatoEarn = streak.dataValues.potato_earn + resultDetails.potato_earn;
                                            var potatoRequire = streak.dataValues.potato_required;

                                            dataObj.potato_earn = potatoEarn;

                                            if (potatoEarn >= potatoRequire) {
                                                data.data.dataValues.streak_status = "success";
                                                data.data.dataValues.gems_earn = gamsData.dataValues.gams;

                                                dataObj.streak_status = "success";

                                                appUserService.getUserDetails(resultDetails._user_id).then(userGams => {
                                                    if (userGams) {
                                                        var appServiceDetails = {};
                                                        appServiceDetails.gams_earn = userGams.gams_earn + gamsData.dataValues.gams;
                                                        appUserService.updateUserProfile(appServiceDetails, resultDetails._user_id);
                                                    }
                                                })
                                            }

                                            return streakAppliedService.updateActiveStreakById(dataObj, {
                                                returning: true, where: { streak_applied_id: streak.dataValues.streak_applied_id }
                                            }).then(result => {
                                                var response = { status: true, message: "Result save successfully!", data: data.data, streak: result, streakDetail: gamsData }
                                                res.send(response)
                                            })
                                        }
                                    })
                                }
                                else {
                                    var response = { status: true, message: "Result save successfully!", data: data.data }
                                    res.send(response)
                                }
                            })
                        }
                    })
                }
            })
        }
    });
};

async function userBattleResult(userId) {
    return battleService.userColumn(userId).then(user => {
        var result = [];
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

function getFilterData(req, res) {
    var user_id = req.user.id;
    var body = req.body;
    const { uId } = req.params;
    if (uId && uId != null) {
        user_id = uId;
    }
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;
    var result = [];

    let serverURL = config.getServerUrl(req)
    return resultService.getFilterSolo(user_id, body).then(async (solo) => {
        if (solo.length > 0) {
            solo.forEach((resData) => {
                resData.dataValues["topic_name"] = resData.dataValues.topic_master.dataValues.topic_name;
                resData.dataValues["user_name"] = resData.dataValues.app_users.dataValues.name;
                resData.dataValues["user_image"] = serverURL + config.avatarImagePath + resData.dataValues.app_users.dataValues.user_image;
                delete resData.dataValues.app_users;
                delete resData.dataValues.topic_master;
            });
        }

        var battleArray = await userBattleResult(user_id);

        return battleService.getFilterBattle(battleArray, body).then(battle => {
            if (battle) {
                battle.forEach((resData) => {
                    resData.dataValues["user_name"] = resData.dataValues.main_users.dataValues.name;
                    resData.dataValues["user_image"] = serverURL + config.avatarImagePath + resData.dataValues.main_users.dataValues.user_image;
                    resData.dataValues["opponent_image"] = serverURL + config.avatarImagePath + resData.dataValues.opponent_users.dataValues.user_image;
                    resData.dataValues["opponent_name"] = resData.dataValues.opponent_users.dataValues.name;
                    resData.dataValues["topic_name"] = resData.dataValues.topic.dataValues.topic_name;
                    delete resData.dataValues.topic;
                    delete resData.dataValues.main_users;
                    delete resData.dataValues.opponent_users;
                });
            }

            if (solo.length >= 0 && battle.length >= 0) {
                result = [...solo, ...battle];
            }
            else if (solo.length >= 0 && battle.length <= 0) {
                result = [...solo];
            }
            else if (solo.length <= 0 && battle.length >= 0) {
                result = [...battle];
            }
            else {
                result = []
            }
            result.sort(function (a, b) {
                return b['createdAt'] - a['createdAt'];
            })
            var response = { status: true, data: result.slice(0, dataLimit) }
            res.send(response)
        })
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

async function getRankByPotato(tempPotato) {
    return await rankService.getRankByPotatoQuantity(tempPotato).then(final => {
        if (final) {
            return final.dataValues.rank_name;
        }
        return config.Default_Potato_Rank;
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


function leaderboard(req, res) {
    const { courseId } = req.params;
    var body = req.body;
    var userId = req.user.id;
    userId = userId * 1;
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;
    return appUserService.getUserDetails(userId).then((user) => {
        if (user) {
            var gradeId = user.dataValues._grade_id
            return appUserService.getMainLeaderBoard(pageNo, dataLimit, body, gradeId).then(async (result) => {
                if (result) {
                    var rankPotatoArray = await potatoRankArray(pageNo, dataLimit);
                    let serverURL = config.getServerUrl(req)
                    const userDataFunction = async (resDataItem) => {
                        let count = 0;
                        resDataItem['user_image'] = serverURL + config.avatarImagePath + resDataItem['user_image'];
                        if (resDataItem.dataValues.user_grade) {
                            resDataItem.dataValues.grade_caption = resDataItem.dataValues.user_grade.dataValues.caption;
                            delete resDataItem.dataValues.user_grade;
                        }

                        let userSoloResult = await resultService.leaderboardByCourseInSolo(pageNo, dataLimit, courseId, body, resDataItem['user_id'])
                        count += userSoloResult ? (userSoloResult.dataValues.total_potato * 1) : 0

                        let userBattleResult = await battleService.leaderboardByCourseInBattleInOpponentColumn(pageNo, dataLimit, courseId, body, resDataItem['user_id'])

                        count += userBattleResult ? (userBattleResult.dataValues.total_potato * 1) : 0

                        let userBattleOpponentResult = await battleService.leaderboardByCourseInBattleInOpponentColumn(pageNo, dataLimit, courseId, body, resDataItem['user_id'])

                        count += userBattleOpponentResult ? (userBattleOpponentResult.dataValues.total_potato * 1) : 0

                        var tempPotato = getClosestValue(rankPotatoArray, resDataItem['potato_earn']);
                        resDataItem['potato_earn'] = count;

                        return rankService.getRankByPotatoQuantity(tempPotato).then(final => {
                            if (final) {
                                resDataItem.dataValues['rank_name'] = final.dataValues.rank_name;
                                return resDataItem
                            }
                            resDataItem.dataValues['rank_name'] = config.Default_Potato_Rank;
                            return resDataItem
                        })
                    }

                    return Promise.all(result.map(async (resData) => {
                        return await userDataFunction(resData)
                    }))
                        .then(data => {
                            data.sort(function (a, b) {
                                return b['potato_earn'] - a['potato_earn'];
                            })
                            var counter = 0;
                            var userData = null
                            data.map(ele => {
                                ele.dataValues['index'] = ++counter
                                if (ele.dataValues.user_id === userId) {
                                    userData = ele
                                }
                            })
                            data = data.slice(0, 10);
                            if (!data.includes(userData)) {
                                data.push(userData)
                            }
                            var response = { status: true, data: data }
                            res.send(response);
                        })
                } else {
                    var response = { status: false, message: config.no_data_message }
                    res.send(response)
                }
            })
        } else {
            var response = { status: false, message: config.no_data_message }
            res.send(response)
        }
    })
};

module.exports = {
    addResult,
    getFilterData,
    leaderboard
}