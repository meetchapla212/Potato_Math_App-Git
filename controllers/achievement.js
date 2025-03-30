const achievementService = require('../services/achievement');
const config = require('../config');
var multer = require('multer');
const mkdirp = require('mkdirp');

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        var path = config.uploadDir + config.achievementImagePath;
        mkdirp(path, err => callback(null, path))
    },
    filename: function (req, file, callback) {
        callback(null, 'achievement_image_' + Date.now());
    }
});

var upload = multer({ storage: storage }).single('achievement_image');

function addAchievement(req, res) {
    upload(req, res, function (err) {
        var achievementDetails = {};
        achievementDetails.achievement_image = req.file !== undefined ? req.file.filename : 'default';
        achievementDetails.title = (req.body.title) ? req.body.title : "";
        achievementDetails.quiz_type = (req.body.quiz_type) ? req.body.quiz_type : "";
        achievementDetails.gamification_mechanics = (req.body.gamification_mechanics) ? req.body.gamification_mechanics : "";
        achievementDetails.daily = (req.body.daily) ? req.body.daily : "";
        achievementDetails.start_date = (req.body.start_date) ? req.body.start_date : "";
        achievementDetails.end_date = (req.body.end_date) ? req.body.end_date : "";
        achievementDetails.duration = (req.body.duration) ? (req.body.duration) * 1 : 0;
        achievementDetails._course_id = (req.body._course_id) ? (req.body._course_id) * 1 : 0;
        achievementDetails.gem_reward = (req.body.gem_reward) ? (req.body.gem_reward) * 1 : 0;
        achievementDetails.potato_quantity = (req.body.potato_quantity) ? (req.body.potato_quantity) * 1 : 0;
        return achievementService.addAchievement(achievementDetails)
            .then(data => res.send(data));
    });
}

function getAllAchievements(req, res) {
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;

    return achievementService.getAllAchievements(pageNo, dataLimit).then(result => {
        if (result.length > 0) {
            let serverURL = config.getServerUrl(req)
            result.forEach((achievement) => {
                achievement['achievement_image'] = serverURL + config.achievementImagePath + achievement['achievement_image'];
            })
            var response = { status: true, data: result }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });
}

function getAchievementById(req, res) {
    const { achievementId } = req.params;
    return achievementService.getAchievementById(achievementId).then(result => {
        if (result) {
            let serverURL = config.getServerUrl(req)
            result['achievement_image'] = serverURL + config.achievementImagePath + result['achievement_image'];
            var response = { status: true, data: result };
        } else {
            var response = { status: false, message: config.no_data_message };
        }
        res.send(response)
    })
}

function updateAchievementById(req, res) {
    upload(req, res, function (err) {
        const body = req.body;
        var achievementId = body.id;
        return achievementService.getAchievementById(body.id).then(result => {
            if (result) {
                var achievementDetails = {};
                if (body.is_delete) {
                    achievementDetails.is_delete = 1;
                }
                else {
                    achievementDetails.achievement_image = req.file !== undefined ? req.file.filename : 'default';
                    achievementDetails.title = (req.body.title) ? req.body.title : "";
                    achievementDetails.quiz_type = (req.body.quiz_type) ? req.body.quiz_type : "";
                    achievementDetails.gamification_mechanics = (req.body.gamification_mechanics) ? req.body.gamification_mechanics : "";
                    achievementDetails.daily = (req.body.daily) ? req.body.daily : "";
                    achievementDetails.start_date = (req.body.start_date) ? req.body.start_date : "";
                    achievementDetails.end_date = (req.body.end_date) ? req.body.end_date : "";
                    achievementDetails.duration = (req.body.duration) ? (req.body.duration) * 1 : 0;
                    achievementDetails._course_id = (req.body._course_id) ? (req.body._course_id) * 1 : 0;
                    achievementDetails.gem_reward = (req.body.gem_reward) ? (req.body.gem_reward) * 1 : 0;
                    achievementDetails.potato_quantity = (req.body.potato_quantity) ? (req.body.potato_quantity) * 1 : 0;
                }
                return achievementService.updateAchievementById(achievementDetails, {
                    returning: true, where: { achievement_id: achievementId }
                }).then(result => {
                    if (result) {
                        var response = { status: true, data: result }
                    } else {
                        var response = { status: false, message: "achievement not updated!" }
                    }
                    res.send(response)
                })
            } else {
                var response = { status: false, message: "No achievement found for update detail!" }
                res.send(response);
            }
        })
    })
}


module.exports = {
    addAchievement,
    getAllAchievements,
    getAchievementById,
    updateAchievementById,
}