const topicService = require('../services/topic');
const question_map = require('../services/question_map');
const resultService = require('../services/result');
const battleService = require('../services/battle_result');
const questionMapService = require('../services/question_map');
const config = require('../config');
var multer = require('multer');
const mkdirp = require('mkdirp');

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        var path = config.uploadDir + config.topicImagePath;
        mkdirp(path, err => callback(null, path))
    },
    filename: function (req, file, callback) {
        callback(null, 'topic_image_' + Date.now());
    }
});

var upload = multer({ storage: storage }).single('topic_image');

function addTopic(req, res) {

    upload(req, res, function (err) {
        var _admin_id = req.adminuser.id;
        var topicDetails = {};
        topicDetails.topic_image = req.file !== undefined ? req.file.filename : 'default';
        topicDetails.topic_name = (req.body.topic_name) ? req.body.topic_name : "";
        topicDetails.topic_details = (req.body.topic_details) ? req.body.topic_details : "";
        topicDetails._course_id = (req.body._course_id) ? req.body._course_id : "";
        topicDetails._grade_id = (req.body._grade_id) ? req.body._grade_id : "";
        topicDetails._admin_id = (_admin_id) * 1;
        topicDetails.sortIndex = (req.body.sortIndex) ? (req.body.sortIndex) * 1 : 0;

        return topicService.addTopic(topicDetails).then(data => res.send(data))
    });
}

async function topicPotatoInSolo(topicId, userId) {
    return resultService.topicPotatoInSolo(topicId, userId).then(async (result) => {
        if (result[0] !== undefined) {
            return (result[0].dataValues.total_potato) * 1
        } else {
            return 0
        }
    })
}

async function topicPotatoInBattleInUserColumn(topicId, userId) {
    return battleService.topicPotatoInBattleInUserColumn(topicId, userId).then(async (result) => {
        if (result[0] !== undefined) {
            return (result[0].dataValues.total_potato) * 1
        } else {
            return 0
        }
    })
}

async function topicPotatoInBattleInOpponentColumn(topicId, userId) {
    return battleService.topicPotatoInBattleInOpponentColumn(topicId, userId).then(async (result) => {
        if (result[0] !== undefined) {
            return (result[0].dataValues.total_potato) * 1
        } else {
            return 0
        }
    })
}

function getAllTopics(req, res) {
    const { courseId } = req.params;
    var isAuth = false;

    if (req.user && req.user.id) {
        var userId = req.user.id;
        isAuth = true;
    }

    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;
    if (courseId) {
        return topicService.getAllTopics(pageNo, dataLimit, courseId).then(result => {
            if (result) {
                let serverURL = config.getServerUrl(req)
                const topicFunction = async (topic) => {
                    var finalPotato = 0;
                    var total_accurence = 0;
                    topic['topic_image'] = serverURL + config.topicImagePath + topic['topic_image'];
                    var difficultyOne, difficultyTwo, difficultyThree;
                    for (let index = 1; index < 4; index++) {
                        if (index === 1) {
                            difficultyOne = await questionMapService.getQuestions(pageNo, dataLimit, topic['topic_id'], index)
                        } else if (index === 2) {
                            difficultyTwo = await questionMapService.getQuestions(pageNo, dataLimit, topic['topic_id'], index)
                        } else {
                            difficultyThree = await questionMapService.getQuestions(pageNo, dataLimit, topic['topic_id'], index)
                        }
                    }
                    topic.dataValues.difficultyOne = difficultyOne.length
                    topic.dataValues.difficultyTwo = difficultyTwo.length
                    topic.dataValues.difficultyThree = difficultyThree.length;
                    if (isAuth) {
                        var potatoCountInSolo = await topicPotatoInSolo(topic['topic_id'], userId)
                        var potatoCountInUserBattle = await topicPotatoInBattleInUserColumn(topic['topic_id'], userId)
                        var potatoCountInOpponentBattle = await topicPotatoInBattleInOpponentColumn(topic['topic_id'], userId)

                        finalPotato = potatoCountInSolo + potatoCountInUserBattle + potatoCountInOpponentBattle;

                        total_accurence = await resultService.countTopicInSolo(topic['topic_id'], userId) + await battleService.countTopicInUserBattle(topic['topic_id'], userId) + await battleService.countTopicInOpponentBattle(topic['topic_id'], userId)
                    }

                    topic.dataValues.total_potato = finalPotato
                    topic.dataValues.total_accurence = total_accurence
                    return topic
                }

                return Promise.all(result.rows.map(async resData => { return await topicFunction(resData) }))
                    .then(data => {
                        var response = { status: true, count: result.count, data: data }
                        res.send(response);
                    })
            } else {
                var response = { status: false, message: config.no_data_message }
            }
            res.send(response)
        });
    } else {
        return topicService.getAllTopics(pageNo, dataLimit).then(result => {
            if (result.rows.length > 0) {
                let serverURL = config.getServerUrl(req)

                const topicFunction = async (topic) => {
                    topic['topic_image'] = serverURL + config.topicImagePath + topic['topic_image'];
                    topic.dataValues['totalAppearance'] = await question_map.totalNumberOfTopic(topic['topic_id']);
                    return topic

                }

                return Promise.all(result.rows.map(resData => topicFunction(resData)))
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
}

function getTopicById(req, res) {
    const { topicId } = req.params;
    return topicService.getTopicById(topicId).then(result => {
        if (result) {
            let serverURL = config.getServerUrl(req)
            result['topic_image'] = serverURL + config.topicImagePath + result['topic_image'];
            var response = { status: true, data: result }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    })
}

function updateTopicById(req, res) {
    upload(req, res, function (err) {
        const body = req.body;
        var topicId = body.id;
        return topicService.getTopicById(body.id).then(result => {
            if (result) {
                var topicDetails = {};
                if (body.is_delete) {
                    topicDetails.is_delete = 1;
                }
                else {
                    topicDetails.topic_image = req.file !== undefined ? req.file.filename : result.topic_image;
                    topicDetails.topic_name = (req.body.topic_name) ? req.body.topic_name : "";
                    topicDetails.topic_details = (req.body.topic_details) ? req.body.topic_details : "";
                    topicDetails._course_id = (req.body._course_id) ? req.body._course_id : "";
                    topicDetails._grade_id = (req.body._grade_id) ? req.body._grade_id : "";
                    topicDetails.sortIndex = (req.body.sortIndex) ? (req.body.sortIndex) * 1 : 0;
                }
                return topicService.updateTopicById(topicDetails, {
                    returning: true, where: { topic_id: topicId }
                }).then(result => {
                    if (result) {
                        var response = { status: true, data: result }
                    } else {
                        var response = { status: false, message: "Topic not updated!" }
                    }
                    res.send(response)
                })
            } else {
                var response = { status: false, message: "No Topic found for update detail!" }
                res.send(response);
            }
        })
    })
}

module.exports = {
    addTopic,
    getAllTopics,
    getTopicById,
    updateTopicById,
}