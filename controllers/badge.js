const badgeService = require('../services/badge');
const resultService = require('../services/result');
const appUserService = require('../services/app_user');
const courseService = require('../services/course');
const battle_result = require('../services/battle_result');
const config = require('../config');
var multer = require('multer');
const mkdirp = require('mkdirp');

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        var path = config.uploadDir + config.badgeImagePath;
        mkdirp(path, err => callback(null, path))
    },
    filename: function (req, file, callback) {
        callback(null, 'badge_image_' + Date.now());
    }
});

var upload = multer({ storage: storage }).single('badge_image');

function addBadge(req, res) {

    upload(req, res, function (err) {
        var badgeDetails = {};
        badgeDetails.badge_image = req.file !== undefined ? req.file.filename : 'default';
        badgeDetails.badge_name = (req.body.badge_name) ? req.body.badge_name : "";
        badgeDetails.badge_details = (req.body.badge_details) ? req.body.badge_details : "";
        badgeDetails.potato_quantity = (req.body.potato_quantity) ? (req.body.potato_quantity) * 1 : 0;
        badgeDetails._course_id = (req.body._course_id) ? req.body._course_id : "";
        badgeDetails._grade_id = (req.body._grade_id) ? req.body._grade_id : "";

        return badgeService.addBadge(badgeDetails).then(data => res.send(data))
    });
}

function getAllBadges(req, res) {
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;
    return badgeService.getAllBadges(pageNo, dataLimit).then(result => {
        if (result) {
            let serverURL = config.getServerUrl(req)
            result.rows.forEach((badge) => {
                badge['badge_image'] = serverURL + config.badgeImagePath + badge['badge_image'];
            })
            var response = { status: true, count: result.count, data: result.rows }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });
}

// function getClosestMaximumValue(standardArray, targetVal) {
//     standardArray = standardArray.sort(function (a, b) { return a - b });
//     if (!(standardArray) || standardArray.length == 0) {
//         return null;
//     }
//     if (standardArray.length == 1) {
//         return standardArray[0];
//     }

//     for (var i = 0; i < standardArray.length - 1; i++) {
//         if (standardArray[i] >= targetVal) {
//             var curr = standardArray[i];
//             var next = standardArray[i + 1]
//             return Math.abs(curr - targetVal) < Math.abs(next - targetVal) ? curr : next;
//         }
//     }
//     return standardArray[standardArray.length - 1];
// }

async function PotatoInUserBattleCourse(userId, courseId) {
    return battle_result.PotatoInUserBattleCourse(userId, courseId).then(userBattlePotato => {
        if (userBattlePotato[0] !== undefined) {
            return (userBattlePotato[0].dataValues.user_total_potato) * 1
        }
        else {
            return 0
        }
    })
}

async function PotatoInOpponentBattleCourse(userId, courseId) {
    return battle_result.PotatoInOpponentBattleCourse(userId, courseId).then(opponentBattlePotato => {
        if (opponentBattlePotato[0] !== undefined) {
            return (opponentBattlePotato[0].dataValues.opponent_total_potato) * 1
        }
        else {
            return 0
        }
    })
}

async function PotatoInCourse(userId, courseId) {
    return resultService.PotatoInCourse(userId, courseId).then(potato => {
        if (potato[0] !== undefined) {
            return (potato[0].dataValues.total_potato) * 1
        } else {
            return 0
        }
    })
}

function getBadgeByUser(req, res) {
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;
    var userId = req.user.id;

    const { uId } = req.params;
    if (uId && uId != null) {
        userId = uId;
    }
    if (userId) {
        return appUserService.getUserDetails(userId).then(result => {
            if (result) {
                var gradeId = result.dataValues._grade_id;
                return courseService.getAllCoursesIdOfGrade(gradeId).then(result => {
                    if (result.length > 0) {

                        const badgeDataFunction = (resDataItem) => {
                            var finalPotato = 0;
                            return badgeService.getBadgeByCourse(resDataItem.course_id)
                                .then(async (userRes) => {
                                    if (userRes) {
                                        var PotatoInUserBattle = await PotatoInUserBattleCourse(userId, resDataItem.course_id);
                                        finalPotato = finalPotato + PotatoInUserBattle;

                                        var PotatoInOpponentBattle = await PotatoInOpponentBattleCourse(userId, resDataItem.course_id);
                                        finalPotato = finalPotato + PotatoInOpponentBattle;

                                        var potatoInSolo = await PotatoInCourse(userId, resDataItem.course_id);
                                        finalPotato = finalPotato + potatoInSolo;

                                        let serverURL = config.getServerUrl(req)
                                        userRes.forEach((badge) => {
                                            badge.dataValues.badge_image = serverURL + config.badgeImagePath + badge.dataValues.badge_image;
                                            badge.dataValues.total_potato = finalPotato;
                                        })
                                        return userRes
                                    }
                                })
                        }

                        return Promise.all(result.slice(0, dataLimit).map(async (resData) => {
                            return await badgeDataFunction(resData)
                        }))
                            .then(data => {
                                let responseData = [];
                                for (let index = 0; index < data.length; index++) {
                                    responseData = responseData.concat(data[index])
                                }
                                var response = { status: true, data: responseData }
                                res.send(response);
                            })
                    } else {
                        var response = { status: false, message: config.no_data_message }
                        res.send(response)
                    }
                });
            }
        })
    }
}

async function BadgePotatoArray(courseId) {
    return badgeService.getBadgeArray(courseId).then(result => {
        if (result) {
            var BadgeArray = [];
            result.map((item) => {
                BadgeArray.push(item.potato_quantity)
            })
            return BadgeArray
        }
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


async function nextBadgeByCourse(req, res) {
    var courseId = req.body._course_id;
    var userId = req.user.id;

    var finalPotato = 0;
    var BadgeArray = await BadgePotatoArray(courseId);

    var PotatoInUserBattle = await PotatoInUserBattleCourse(userId, courseId);
    finalPotato = finalPotato + PotatoInUserBattle;

    var PotatoInOpponentBattle = await PotatoInOpponentBattleCourse(userId, courseId);
    finalPotato = finalPotato + PotatoInOpponentBattle;

    var potatoInSolo = await PotatoInCourse(userId, courseId);
    finalPotato = finalPotato + potatoInSolo;
    var tempPotato = getClosestMaximumValue(BadgeArray, finalPotato);

    return badgeService.getBadgeByPotatoQuantity(courseId, tempPotato).then((result) => {
        if (result) {
            result.dataValues.user_potato = finalPotato;
            var response = { status: true, data: result }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });

}

function getBadgeById(req, res) {
    const { badgeId } = req.params;
    return badgeService.getBadgeById(badgeId).then(result => {
        if (result) {
            let serverURL = config.getServerUrl(req)
            result['badge_image'] = serverURL + config.badgeImagePath + result['badge_image'];
            var response = { status: true, data: result }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    })
}

function updateBadgeById(req, res) {
    upload(req, res, function (err) {
        const body = req.body;
        var badgeId = body.id;
        return badgeService.getBadgeById(body.id).then(result => {
            if (result) {
                var badgeDetails = {};
                if (body.is_delete) {
                    badgeDetails.is_delete = 1;
                }
                else {
                    badgeDetails.badge_image = req.file !== undefined ? req.file.filename : result.badge_image;
                    badgeDetails.badge_name = (req.body.badge_name) ? req.body.badge_name : "";
                    badgeDetails.badge_details = (req.body.badge_details) ? req.body.badge_details : "";
                    badgeDetails.potato_quantity = (req.body.potato_quantity) ? (req.body.potato_quantity) * 1 : 0;
                    badgeDetails._course_id = (req.body._course_id) ? req.body._course_id : "";
                    badgeDetails._grade_id = (req.body._grade_id) ? req.body._grade_id : "";
                }
                return badgeService.updateBadgeById(badgeDetails, {
                    returning: true, where: { badge_id: badgeId }
                }).then(result => {
                    if (result) {
                        var response = { status: true, data: result }
                    } else {
                        var response = { status: false, message: "Badge not updated!" }
                    }
                    res.send(response)
                })
            } else {
                var response = { status: false, message: "No Badge found for update detail!" }
                res.send(response);
            }
        })
    })
}

module.exports = {
    addBadge,
    getAllBadges,
    getBadgeById,
    updateBadgeById,
    getBadgeByUser,
    nextBadgeByCourse
}