var generalService = require('../services/general');
var streakAppliedService = require('../services/streak_applied');
var giftRedeemService = require('../services/gift_redeem');
var streakService = require('../services/streak');
var appUserService = require('../services/app_user');
var resultService = require('../services/result');
const appTextService = require('../services/app_text_configuration');
var battleService = require('../services/battle_result');
var rankService = require('../services/rank');
var battleRequest = require('../services/battle_request');
const moment = require('moment');
const mailjest = require('./mailjest');
const pushNotification = require('./push_notification');
const config = require('../config');


function getCount(req, res) {
    var today = moment(new Date()).add(1, 'days').format('YYYY-MM-DD');
    var weekago = moment(new Date()).subtract(7, 'days').format('YYYY-MM-DD');
    return generalService.getCount(weekago, today).then(result => {
        if (result) {
            var response = { status: true, data: result }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });
}

function getGiftRedeem(req, res) {

    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;

    return giftRedeemService.getGiftRedeem(pageNo, dataLimit).then((result) => {
        if (result) {
            var response = { status: true, count: result.count, data: result.rows }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    })
}

function getClosestMaximumValue(standardArray, targetVal) {
    standardArray = standardArray.sort(function (a, b) { return a - b });
    if (!(standardArray) || standardArray.length == 0) {
        return null;
    }
    if (standardArray.length == 1) {
        return standardArray[0];
    }

    for (var i = 0; i < standardArray.length - 1; i++) {
        if (standardArray[i] >= targetVal) {
            var curr = standardArray[i];
            var next = standardArray[i + 1]
            return Math.abs(curr - targetVal) < Math.abs(next - targetVal) ? curr : next;
        }
    }
    return standardArray[standardArray.length - 1];
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

function nextRankOfUser(req, res) {
    var userId = req.user.id;
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;

    return appUserService.getUserDetails(userId).then(async (user) => {
        if (user) {
            var rankPotatoArray = await potatoRankArray(pageNo, dataLimit);
            var tempPotato = getClosestMaximumValue(rankPotatoArray, user['potato_earn'])
            let nextRank = {};
            nextRank.user_potato = user['potato_earn'];
            return rankService.getRankByPotatoQuantity(tempPotato).then(final => {
                if (final) {
                    let serverURL = config.getServerUrl(req)
                    nextRank.rank_name = final.dataValues.rank_name;
                    nextRank.rank_image = serverURL + config.rankImagePath + final.dataValues.rank_image;
                    nextRank.potato_quantity = final.dataValues.potato_quantity;
                    var response = { status: true, data: nextRank }
                }
                else {
                    var response = { status: false, message: config.no_data_message }
                }
                res.send(response);
            })
        } else {
            var response = { status: false, message: config.no_data_message }
            res.send(response)
        }
    })
}

function cronCheckStreak(req, res) {
    return streakAppliedService.getAllActiveStreak().then(active => {
        if (active.length > 0) {
            active.forEach((result) => {

                result.dataValues.streak_status = (result.dataValues.potato_required <= result.dataValues.potato_earn) ? 'success' : 'expired'
                var dataObj = { streak_status: result.dataValues.streak_status }

                return streakAppliedService.updateActiveStreakById(dataObj, {
                    returning: true, where: { streak_applied_id: result.dataValues.streak_applied_id }
                }).then(streak => {
                    if (streak) {
                        if (result.dataValues.streak_status === 'success') {
                            return streakService.getStreakById(result.dataValues._streak_id).then(gamsData => {
                                if (gamsData) {
                                    return appUserService.getUserDetails(result.dataValues._user_id).then(userGams => {
                                        if (userGams) {
                                            var appServiceDetails = {};
                                            appServiceDetails.gams_earn = userGams.gams_earn + gamsData.dataValues.gams;
                                            return appUserService.updateUserProfile(appServiceDetails, result.dataValues._user_id);
                                        }
                                    })
                                }
                            })
                        }
                    }
                })

            })
            var response = { status: true, message: 'streaks are updated successfully!!' }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });
}

function enrtyFee(req, res) {
    var userId = req.user.id
    var entry_fee = req.config.setting.solo_entry_cost
    if (userId) {
        return appUserService.getUserDetails(userId).then(user => {
            if (user) {
                if (user.coins_earn >= entry_fee) {
                    var appServiceDetails = {};
                    appServiceDetails.coins_earn = user.coins_earn - entry_fee;
                    appServiceDetails.coin_spent = user.coin_spent + entry_fee;
                    return appUserService.updateUserProfile(appServiceDetails, userId).then(updateUser => {
                        if (updateUser) {
                            var response = { status: true, message: 'Entry Fee deducted!!' }
                        }
                        else {
                            var response = { status: false, message: config.no_data_message }
                        }
                        res.send(response)
                    })
                }
                else {
                    var response = { status: false, message: 'No enough coins' }
                }
                res.send(response)
            }
        })
    }
}

function msToHMS(ms) {
    var seconds = ms / 1000;
    var hours = parseInt(seconds / 3600);
    seconds = seconds % 3600;
    var minutes = parseInt(seconds / 60);
    seconds = seconds % 60;
    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    return (hours + ":" + minutes + ":" + seconds);
}

async function getCountForApp(req, res) {
    var userId = req.user.id
    const { courseId } = req.params;
    const { uId } = req.params;
    var body = req.body;
    if (uId && uId != null) {
        userId = uId;
    }
    if (userId) {
        var battleUser = await generalService.countInUserColumn(userId, courseId, body);
        var battleOpponent = await generalService.countInOpponentColumn(userId, courseId, body);
        var totalWonBattle = await generalService.totalWonBattle(userId, courseId, body);
        var totalBattle = battleUser + battleOpponent;
        var totalLostBattle = totalBattle - totalWonBattle;
        var potatoSolo = await generalService.getSumFilterData("potato_earn", userId, courseId, body);
        var potatoUserColomn = await generalService.getSumFilterDataInUserBattle("user_potato_earn", userId, courseId, body);
        var potatoOpponentColumn = await generalService.getSumFilterDataInOpponentBattle("opponent_potato_earn", userId, courseId, body);
        var totalQuestion = await generalService.getSumFilterData("total_question", userId, courseId, body);
        var rightQuestion = await generalService.getSumFilterData("right_answer", userId, courseId, body);
        var wrongQuestion = await generalService.getSumFilterData("wrong_answer", userId, courseId, body);
        var time = await generalService.getSumFilterData("quizTime", userId, courseId, body);
        var gems = await generalService.getUserGems(userId, courseId);
        var streak = await generalService.getCountStreakData(userId, courseId);
        var solo = await generalService.getCountFilterData(userId, "challenge_type", "5", courseId, body);
        var onboarding_potato = gems ? (gems.dataValues.onboarding_potato) * 1 : 0;
        var coin_spent = gems ? (gems.dataValues.coin_spent) * 1 : 0;
        var earn_solo = potatoSolo ? (potatoSolo.dataValues.total) * 1 : 0;
        var earn_user_battle = potatoUserColomn ? (potatoUserColomn.dataValues.total) * 1 : 0;
        var earn_opponent_battle = potatoOpponentColumn ? (potatoOpponentColumn.dataValues.total) * 1 : 0;
        var result = [
            {
                arrayname: 'Resources', value: [
                    { name: 'Potatoes', value: earn_solo + onboarding_potato + earn_user_battle + earn_opponent_battle },
                    { name: 'Gems', value: gems ? gems.dataValues.gams_earn : 0 },
                    { name: 'Coin spent', value: coin_spent },
                    { name: 'Time Spent', value: time ? msToHMS(time.dataValues.total) : 0 },
                    { name: 'Badges', value: '' },
                    { name: 'Streaks', value: streak }
                ]
            },
            {
                arrayname: 'Questions', value: [
                    { name: 'Total', value: totalQuestion ? totalQuestion.dataValues.total : 0 },
                    { name: 'Correct', value: rightQuestion ? rightQuestion.dataValues.total : 0 },
                    { name: 'Wrong', value: wrongQuestion ? wrongQuestion.dataValues.total : 0 },

                ]
            },
            {
                arrayname: 'Challenges', value: [
                    { name: 'Battles', value: totalBattle },
                    { name: 'Won Battles', value: totalWonBattle },
                    { name: 'Lost Battles', value: totalLostBattle },
                    { name: 'Solo', value: solo }
                ]
            }
        ]
        var response = { status: true, data: result }
    } else {
        var response = { status: false, message: config.no_data_message }
    }
    res.send(response)
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



function getAdminLeaderBoard(req, res) {
    var { gradeId } = req.params;
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;

    return appUserService.getAdminLeaderBoard(pageNo, dataLimit, gradeId).then(async (result) => {
        if (result) {

            var rankPotatoArray = await potatoRankArray(pageNo, dataLimit);
            const userDataFunction = async (resDataItem) => {
                let serverURL = config.getServerUrl(req)
                resDataItem['user_image'] = serverURL + config.avatarImagePath + resDataItem['user_image'];
                if (resDataItem.dataValues.user_grade) {
                    resDataItem.dataValues.grade_caption = resDataItem.dataValues.user_grade.dataValues.caption;
                    delete resDataItem.dataValues.user_grade;
                }
                var tempPotato = getClosestValue(rankPotatoArray, resDataItem['potato_earn']);
                return rankService.getRankByPotatoQuantity(tempPotato).then(final => {
                    if (final) {
                        resDataItem.dataValues['rank_name'] = final.dataValues.rank_name;
                        return resDataItem
                    }
                    resDataItem.dataValues['rank_name'] = config.Default_Potato_Rank;
                    return resDataItem
                })
            }

            return Promise.all(result.rows.map(resData => userDataFunction(resData)))
                .then(data => {
                    var response = { status: true, count: result.count, data: data }
                    res.send(response);
                })
        } else {
            var response = { status: false, message: config.no_data_message };
        }
        res.send(response);
    });
};

function progressReport(req, res) {
    var body = {};
    body.today = moment(new Date()).add(1, 'days').format('YYYY-MM-DD');
    body.weekago = moment(new Date()).subtract(7, 'days').format('YYYY-MM-DD');
    let serverURL = config.getServerUrl(req)
    return appUserService.getAllUserForCron().then((users) => {
        if (users) {
            const userDataFunction = async (resDataItem) => {
                var total_time = 0;
                var total_quiz = 0;
                var total_potato = 0;

                var solo = await resultService.progessBySolo(resDataItem.dataValues.user_id, body);
                var soloCount = await resultService.progessBySoloCount(resDataItem.dataValues.user_id, body);

                total_quiz = soloCount;
                solo.map(ele => {
                    total_potato = ele.dataValues.total_potato ? (ele.dataValues.total_potato) * 1 : 0
                    total_time = ele.dataValues.total_time ? (ele.dataValues.total_time) * 1 : 0
                })

                var battleUserCount = await battleService.progessBySoloBattleInUserColumnCount(resDataItem.dataValues.user_id, body)
                var battleUser = await battleService.progessBySoloBattleInUserColumn(resDataItem.dataValues.user_id, body)

                total_quiz = battleUserCount ? (total_quiz) * 1 + (battleUserCount) * 1 : total_quiz
                battleUser.map(ele => {
                    total_potato = ele.dataValues.total_potato ? total_potato + (ele.dataValues.total_potato) * 1 : total_potato
                    total_time = ele.dataValues.total_time ? total_time + (ele.dataValues.total_time) * 1 : total_time
                })
                var battleOpponentCount = await battleService.progessBySoloBattleInOpponentColumnCount(resDataItem.dataValues.user_id, body)
                var battleOpponent = await battleService.progessBySoloBattleInOpponentColumn(resDataItem.dataValues.user_id, body);

                total_quiz = battleOpponentCount ? (total_quiz) * 1 + (battleOpponentCount) * 1 : total_quiz

                battleOpponent.map(ele => {
                    total_potato = ele.dataValues.total_potato ? total_potato + (ele.dataValues.total_potato) * 1 : total_potato
                    total_time = ele.dataValues.total_time ? total_time + (ele.dataValues.total_time) * 1 : total_time
                })
                resDataItem.dataValues['total_quiz'] = total_quiz
                resDataItem.dataValues['total_potato'] = total_potato
                resDataItem.dataValues['total_time'] = msToHMS(total_time)
                // if (resDataItem.dataValues.email_id === "reweri6613@toracw.com") {

                var text = await appTextService.getTextByKey('progress_report_email_template');
                var userDetails = [{
                    "Email": resDataItem.dataValues.email_id,
                    "Name": resDataItem.dataValues.name
                }]
                var variables = {
                    "name": resDataItem.dataValues.name,
                    "potatoes_earned": total_potato,
                    "time_spent": msToHMS(total_time),
                    "quizzes": total_quiz,
                    "course_link": "https://potatomath.com/"
                }
                var templateId = (text.dataValues.value) * 1;

                var subject = 'Progress report';
                if (resDataItem.dataValues.email_id) {
                    mailjest.sendMail(templateId, subject, userDetails, variables)
                }
                return resDataItem
            }

            return Promise.all(users.map(resData => userDataFunction(resData)))
                .then(data => {
                    var response = { status: true, message: "Run successfully!" }
                    res.send(response);
                })
        } else {
            var response = { status: false, message: config.no_data_message };
            res.send(response);
        }
    })

};

function markNotificationRead(req, res) {
    var userId = req.user.id
    var battleToken = req.body.battle_token ? req.body.battle_token : null;
    return generalService.markNotificationRead(userId, battleToken).then((users) => {
        var response = { status: true, message: "Notification read successfully!" };
        return res.send(response);
    });
}

function quizReminder(req, res) {
    return appUserService.getAllUserForCron().then((users) => {
        if (users) {

            var title = config.quiz_reminder_heading;
            var body = config.quiz_reminder_message;
            var extraInfo = { type: config.daily_coin }
            pushNotification.sendNotification(null, title, body, extraInfo);


            const userDataFunction = async (resDataItem) => {
                var text = await appTextService.getTextByKey('quiz_reminder_email_template');
                var userDetails = [{
                    "Email": resDataItem.dataValues.email_id,
                    "Name": resDataItem.dataValues.name
                }]
                var variables = {
                    "name": resDataItem.dataValues.name,
                    "course_link": "https://potatomath.com/"
                }
                var templateId = (text.dataValues.value) * 1;
                var subject = 'Quiz reminder';
                if (resDataItem.dataValues.email_id)
                    mailjest.sendMail(templateId, subject, userDetails, variables)
                // }
                return resDataItem
            }

            return Promise.all(users.map(resData => userDataFunction(resData)))
                .then(data => {
                    var response = { status: true, message: "Run successfully!" }
                    res.send(response);
                })
        } else {
            var response = { status: false, message: config.no_data_message };
            res.send(response);
        }
    })

};

function cronCheckPendingBattles(req, res) {
    return battleService.getAllPendingBattles().then(result => {
        if (result) {
            // var response = { status: true, data: result }
            // res.send(response);
            const userDataFunction = async (resDataItem) => {
                var today = new Date();
                const diff = Math.abs((resDataItem.dataValues.createdAt - today) / (1000 * 60 * 60));
                console.log(resDataItem.dataValues.createdAt, today, diff)
                if (diff >= 24) {
                    var battleDetails = {};
                    battleDetails.battle_status = 'expired';
                    return battleRequest.getBattleRequestByToken(resDataItem.dataValues.battle_hash).then(result => {
                        if (result) {
                            return battleRequest.updateBattleRequestByToken(battleDetails, {
                                returning: true, where: { battle_token: resDataItem.dataValues.battle_hash }
                            }).then(result => {
                                if (result) {
                                    return battleService.getBattleByToken(resDataItem.dataValues.battle_hash).then(battle => {
                                        if (battle) {
                                            battleDetails.winner_user_id = battle.dataValues._user_id;
                                            return battleService.updateBattleByToken(battleDetails, {
                                                returning: true, where: { battle_hash: resDataItem.dataValues.battle_hash }
                                            }).then(update => {
                                                if (update) {
                                                    return appUserService.getUserDetails(battle.dataValues._user_id)
                                                        .then(userRes => {
                                                            if (userRes) {
                                                                var profileDetails = {};
                                                                profileDetails.potato_earn = userRes.dataValues.potato_earn + battle.dataValues.user_potato_earn
                                                                return appUserService.updateUserProfile(profileDetails, battle.dataValues._user_id).then(user => {
                                                                    if (user) {
                                                                        return
                                                                    } else {
                                                                        return
                                                                    }
                                                                })
                                                            } else {
                                                                return
                                                            }
                                                        })

                                                } else {
                                                    return
                                                }

                                            })
                                        } else {
                                            return
                                        }
                                    })
                                } else {
                                    return
                                }
                            })
                        } else {
                            return
                        }
                    })
                }
                // const diffDays = Math.ceil(diffTime / (1000 * 60 * 60)); 
            }

            return Promise.all(result.map(resData => userDataFunction(resData)))
                .then(data => {
                    var response = { status: true, message: "Run successfully!" }
                    res.send(response);
                })
        }
        else {

        }
    })
}

function practiceReminder(req, res) {
    return appUserService.getAllUserForPracticeReminderCron().then((users) => {
        if (users) {

            const userDataFunction = async (resDataItem) => {
                var title = config.practice_reminder_heading;
                var body = config.practice_reminder_message;
                var extraInfo = { type: config.daily_coin }
                pushNotification.sendNotification(resDataItem.dataValues.user_id, title, body, extraInfo);
                return resDataItem
            }

            return Promise.all(users.map(resData => userDataFunction(resData)))
                .then(data => {
                    var response = { status: true, message: "Run successfully!" }
                    res.send(response);
                })
        } else {
            var response = { status: false, message: config.no_data_message };
            res.send(response);
        }

    })
}



module.exports = {
    markNotificationRead,
    getCount,
    getCountForApp,
    cronCheckStreak,
    enrtyFee,
    nextRankOfUser,
    getAdminLeaderBoard,
    getGiftRedeem,
    progressReport,
    quizReminder,
    cronCheckPendingBattles,
    practiceReminder
}