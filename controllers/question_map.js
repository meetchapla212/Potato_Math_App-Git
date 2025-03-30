var questionMapService = require('../services/question_map');
var questionService = require('../services/question');
var resultDetailService = require('../services/result_detail');
var battleResultDetailService = require('../services/battle_result_detail');
const config = require('../config');


function addMap(req, res) {
    const mapDetails = req.body;
    return questionMapService.addMap(mapDetails).then(data => res.send(data));
};

function getAllMaps(req, res) {
    const { questionId } = req.params;
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;

    return questionMapService.getAllMaps(pageNo, dataLimit, questionId).then(result => {

        if (result) {
            var response = { status: true, data: result }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });
};

function msToHMS(ms) {
    var seconds = ms / 1000;
    var hours = parseInt(seconds / 3600);
    seconds = seconds % 3600;
    var minutes = parseInt(seconds / 60);
    seconds = (seconds % 60).toFixed(0);
    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    return (minutes + ":" + seconds);
}

function getFilterQuestion(req, res) {
    var body = req.body;
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;

    return questionMapService.getFilterQuestion(pageNo, dataLimit, body).then(result => {

        if (result) {
            var questionArray = [];
            result.forEach((question) => {
                questionArray.push(question._question_id)
            })
            return questionService.getAllQuestionsById(pageNo, dataLimit, questionArray).then(final => {
                if (final) {
                    const questionFunction = async (question) => {
                        var appearanceInSolo = await resultDetailService.totalNumberOfView(question['question_id']);
                        var appearanceTrueInSolo = await resultDetailService.totalNumberOfTrue(question['question_id']);
                        var appearanceFalseInSolo = await resultDetailService.totalNumberOfFalse(question['question_id']);

                        var appearanceInbattle = await battleResultDetailService.totalNumberOfView(question['question_id']);
                        var appearanceTrueInbattle = await battleResultDetailService.totalNumberOfTrue(question['question_id']);
                        var appearanceFalseInbattle = await battleResultDetailService.totalNumberOfFalse(question['question_id']);

                        var totalTimeInSolo = await resultDetailService.getSumOfTime(question['question_id']);
                        var totalTimeInBattle = await battleResultDetailService.getSumOfTime(question['question_id']);

                        var avgTimeInSolo = totalTimeInSolo.dataValues.total ? (totalTimeInSolo.dataValues.total) * 1 : 0;
                        var avgTimeInBattle = totalTimeInBattle.dataValues.total ? (totalTimeInBattle.dataValues.total) * 1 : 0;


                        question.dataValues['avgTime'] = (avgTimeInSolo === 0 && avgTimeInBattle === 0) ? 0 : msToHMS((avgTimeInSolo + avgTimeInBattle) / (appearanceInSolo + appearanceInbattle));
                        question.dataValues['totalAppearance'] = appearanceInSolo + appearanceInbattle;
                        question.dataValues['totalTrue'] = appearanceTrueInSolo + appearanceTrueInbattle;
                        question.dataValues['totalFalse'] = appearanceFalseInSolo + appearanceFalseInbattle;
                        return question

                    }

                    return Promise.all(final.rows.map(resData => questionFunction(resData)))
                        .then(data => {
                            var response = { status: true, count: final.count, data: data }
                            res.send(response);
                        })
                } else {
                    var response = { status: false, message: config.no_data_message }
                }
                res.send(response)
            })
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });
};



function getQuestions(req, res) {
    const { topicId } = req.params;
    const { difficultyId } = req.params;
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = req.config.setting.questions_per_quiz;
    return questionMapService.getQuestions(pageNo, dataLimit, topicId, difficultyId).then(result => {

        if (result) {
            var data = [];
            var count = 0
            result.forEach((resData) => {
                count++;
                resData.dataValues.question_masters.dataValues["map_id"] = resData.dataValues.map_id;
                data.push(resData.question_masters.dataValues)
            });
            var response = { status: true, data: data }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });
};



function getMapById(req, res) {
    const { mapId } = req.params;
    if (mapId) {
        return questionMapService.getMapById(mapId).then(result => {
            var response = { status: true, data: result }
            res.send(response);
        });
    } else {
        var response = { status: false, message: 'Invalid params!' };
        res.send(response);
    }
};

function updateMapById(req, res) {
    const mapDetails = req.body;
    return questionMapService.getMapById(mapDetails.id).then(result => {
        if (result) {
            return questionMapService.updateMapById(mapDetails, {
                returning: true, where: { map_id: mapDetails.id }
            }).then(result => {
                if (result) {
                    var response = { status: true, data: result }
                } else {
                    var response = { status: false, message: "Map not updated!" }
                }
                res.send(response)
            })
        } else {
            var response = { status: false, message: "No Map found for update detail!" }
            res.send(response);
        }
    })
};

module.exports = {
    addMap,
    getAllMaps,
    getMapById,
    updateMapById,
    getQuestions,
    getFilterQuestion
}