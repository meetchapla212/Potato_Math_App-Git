var streakAppliedService = require('../services/streak_applied');
var streakService = require('../services/streak');
const appUserService = require('../services/app_user');
const config = require('../config');

var moment = require('moment');

function msToTime(duration) {
    var seconds = parseInt((duration / 1000) % 60)
        , minutes = parseInt((duration / (1000 * 60)) % 60)
        , hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds;
}

function addActiveStreak(req, res) {
    var userId = req.user.id

    const activeDetails = req.body;
    return streakService.getStreakById(activeDetails._streak_id).then(result => {
        if (result) {
            var streakTime = result['streak_time'];
            var startTime = moment();
            var endTime = moment().add((streakTime / 1000), "seconds");
            activeDetails.start_time = startTime.toISOString();
            activeDetails.end_time = endTime.toISOString();
            activeDetails._user_id = userId;
            activeDetails.potato_required = result['potato_quantity'];
            activeDetails._streak_type = result['streak_type'];
            return streakAppliedService.addActiveStreak(activeDetails).then(data => res.send(data));
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    })
};

function checkActiveStreakForUser(req, res) {
    var userId = req.user.id

    return streakAppliedService.checkActiveStreakForUser(userId).then(result => {
        if (result) {
            return streakService.getStreakById(result['_streak_id']).then(streak => {
                if (streak) {
                    //let currentDateTime = new Date();
                    //let formattedTime = currentDateTime.getHours() + ":" + currentDateTime.getMinutes() + ":" + currentDateTime.getSeconds();
                    var formattedTime = moment().toISOString();
                    result.dataValues['current_time'] = formattedTime;
                    result.dataValues['gams'] = streak['gams'];
                    result.dataValues['streak_details'] = streak['streak_details'];
                    result.dataValues['streak_name'] = streak['streak_name'];
                    var response = { status: true, data: result }
                } else {
                    var response = { status: fasle, data: config.no_data_message }
                }
                res.send(response)
            })
        } else {
            var response = { status: false, message: 'No active streak is there!' }
            res.send(response)
        }
    }).catch(err => {
        var response = { status: false, message: 'No active streak is there!' }
        res.send(response)
    });;
};

function showOtherStreak(req, res) {

    var userId = req.user.id
    return appUserService.getUserDetails(userId)
        .then(userRes => {
            if (userRes) {
                console.log(userRes.dataValues._grade_id)
                return streakAppliedService.checkActiveStreakForUser(userId).then(result => {
                    if (result !== null) {
                        var response = { status: false, message: "Streak is still going on,Finish that first!!" }
                    } else {
                        return streakAppliedService.getAplliedStreakID(userId).then(result => {
                            if (result) {
                                var appliedID = []
                                result.forEach((streak) => {
                                    appliedID.push(streak.dataValues._streak_id)
                                })
                                return streakService.getUnplayedStreak(appliedID, userRes.dataValues._grade_id).then(data => {
                                    if (data.length > 0) {
                                        var response = { status: true, data: data }
                                    } else {
                                        var response = { status: false, message: 'No streak available!' }
                                    }
                                    res.send(response)
                                })
                            } else {
                                var response = { status: false, message: config.no_data_message }
                            }
                            res.send(response)
                        });
                    }
                    res.send(response)
                });
            } else {
                var response = { status: false, message: "user not found!" }
                res.send(response)
            }
        })
};

function getAplliedStreakID(req, res) {
    var user_id = req.user.id;
    return streakAppliedService.getAplliedStreakID(user_id).then(result => {
        if (result.length > 0) {
            var response = { status: true, data: result }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });
}

function getUserPlayedStreak(req, res) {
    var user_id = req.user.id;
    const { uId } = req.params;
    if (uId && uId != null) {
        user_id = uId;
    }
    return streakAppliedService.getUserPlayedStreak(user_id).then(result => {
        if (result) {

            const streakFunction = async (streakData) => {
                return streakService.getStreakById(streakData._streak_id).then(streak => {
                    if (streak) {
                        let serverURL = config.getServerUrl(req)
                        streakData.dataValues['gams'] = streak.dataValues.gams;
                        streakData.dataValues['streak_time'] = streak.dataValues.streak_time;
                        streakData.dataValues['streak_image'] = serverURL + config.streakImagePath + streak.dataValues.streak_image;
                        return streakData
                    }
                })
            }

            Promise.all(result.map(resData => streakFunction(resData)))
                .then(data => {
                    var response = { status: true, data: data }
                    res.send(response);
                })
        } else {
            var response = { status: false, message: config.no_data_message }
            res.send(response)
        }
    })
}

module.exports = {
    addActiveStreak,
    checkActiveStreakForUser,
    showOtherStreak,
    getAplliedStreakID,
    getUserPlayedStreak
}