const streakService = require('../services/streak');
const streakAppliedService = require('../services/streak_applied');
const config = require('../config');
var multer = require('multer');
const mkdirp = require('mkdirp');

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        var path = config.uploadDir + config.streakImagePath;
        mkdirp(path, err => callback(null, path))
    },
    filename: function (req, file, callback) {
        callback(null, 'streak_image_' + Date.now());
    }
});

var upload = multer({ storage: storage }).single('streak_image');

function addStreak(req, res) {

    upload(req, res, function (err) {
        var streakDetails = {};
        streakDetails.streak_image = req.file !== undefined ? req.file.filename : 'default';
        streakDetails.streak_name = (req.body.streak_name) ? req.body.streak_name : "";
        streakDetails.streak_details = (req.body.streak_details) ? req.body.streak_details : "";
        streakDetails.streak_time = (req.body.streak_time) ?
            (Number(req.body.streak_time.split(':')[0]) * 3600 + Number(req.body.streak_time.split(':')[1]) * 60) * 1000
            : "";
        streakDetails.potato_quantity = (req.body.potato_quantity) ? (req.body.potato_quantity) * 1 : 0;
        streakDetails.gams = (req.body.gams) ? (req.body.gams) * 1 : 0;
        streakDetails._course_id = (req.body._course_id) ? req.body._course_id : "";
        streakDetails._grade_id = (req.body._grade_id) ? req.body._grade_id : "";
        streakDetails.streak_type = (req.body.streak_type) ? req.body.streak_type : "";

        return streakService.addStreak(streakDetails).then(data => res.send(data))
    });
}

function getAllStreaks(req, res) {
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;
    return streakService.getAllStreaks(pageNo, dataLimit).then(result => {
        if (result) {
            let serverURL = config.getServerUrl(req)

            const streakFunction = async (streak) => {
                streak['streak_image'] = serverURL + config.streakImagePath + streak['streak_image'];
                streak.dataValues['totalUser'] = await streakAppliedService.totalNumberOfUser(streak['streak_id']);
                streak.dataValues['totalMiss'] = await streakAppliedService.totalNumberOfMiss(streak['streak_id']);
                streak.dataValues['totalComplete'] = await streakAppliedService.totalNumberOfComplete(streak['streak_id']);
                return streak

            }

            return Promise.all(result.rows.map(resData => streakFunction(resData)))
                .then(data => {
                    var response = { status: true, count: result.count, data: data }
                    res.send(response);
                })
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });
}

function getStreakById(req, res) {
    const { streakId } = req.params;
    return streakService.getStreakById(streakId).then(result => {
        if (result) {
            let serverURL = config.getServerUrl(req)
            result['streak_image'] = serverURL + config.streakImagePath + result['streak_image'];
            var response = { status: true, data: result }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    })
}

function updateStreakById(req, res) {
    upload(req, res, function (err) {
        const body = req.body;
        var streakId = body.id;
        return streakService.getStreakById(body.id).then(result => {
            if (result) {
                var streakDetails = {};
                if (body.is_delete) {
                    streakDetails.is_delete = 1;
                    streakAppliedService.getAllAppliedStreakById(body.id).then(streaks => {
                        if (streaks) {
                            streaks.forEach(streak => {
                                streakAppliedService.updateActiveStreakById(streakDetails, {
                                    returning: true, where: { streak_applied_id: streak.dataValues.streak_applied_id }
                                })
                            });
                        }
                    })
                }
                else {
                    streakDetails.streak_image = req.file !== undefined ? req.file.filename : result.streak_image;
                    streakDetails.streak_name = (req.body.streak_name) ? req.body.streak_name : "";
                    streakDetails.streak_details = (req.body.streak_details) ? req.body.streak_details : "";
                    streakDetails.streak_time = (req.body.streak_time) ? (Number(req.body.streak_time.split(':')[0]) * 3600 + Number(req.body.streak_time.split(':')[1]) * 60) * 1000 : "";
                    streakDetails.potato_quantity = (req.body.potato_quantity) ? (req.body.potato_quantity) * 1 : 0;
                    streakDetails.gams = (req.body.gams) ? (req.body.gams) * 1 : 0;
                    streakDetails._course_id = (req.body._course_id) ? req.body._course_id : "";
                    streakDetails._grade_id = (req.body._grade_id) ? req.body._grade_id : "";
                    streakDetails.streak_type = (req.body.streak_type) ? req.body.streak_type : "";
                }
                return streakService.updateStreakById(streakDetails, {
                    returning: true, where: { streak_id: streakId }
                }).then(result => {
                    if (result) {
                        var response = { status: true, data: result }
                    } else {
                        var response = { status: false, message: "Streak not updated!" }
                    }
                    res.send(response)
                })
            } else {
                var response = { status: false, message: "No Streak found for update detail!" }
                res.send(response);
            }
        })
    })
}

module.exports = {
    addStreak,
    getAllStreaks,
    getStreakById,
    updateStreakById,
}