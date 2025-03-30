var questionService = require('../services/question');
var resultDetailService = require('../services/result_detail');
var battleResultDetailService = require('../services/battle_result_detail');
const config = require('../config');
var multer = require('multer');
const mkdirp = require('mkdirp');
const fs = require("fs");
const Pool = require("pg").Pool;
const fastcsv = require("fast-csv");
var xlsx = require('node-xlsx').default;


var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        var path = config.uploadDir + config.questionFiles;
        mkdirp(path, err => callback(null, path))
    },
    filename: function (req, file, callback) {
        callback(null, 'question_file_' + Date.now() + '.csv');
    }
});

var upload = multer({ storage: storage }).single('question_file');

function addQuestion(req, res) {
    console.log('req.body', req.body)
    var _admin_id = req.adminuser.id;
    const questionDetails = req.body;
    questionDetails.right_answer = (questionDetails.right_answer) * 1;
    questionDetails._grade_id = (questionDetails._grade_id) * 1;
    questionDetails._admin_id = (_admin_id) * 1;
    return questionService.addQuestion(questionDetails).then(data => { res.send(data) });
};

function addCSV(req, res) {

    upload(req, res, function (err) {
        const workSheetsFromFile = xlsx.parse(req.file.path)
        workSheetsFromFile.forEach(async (worksheet) => {

            let records = [];
            await worksheet.data.forEach(async (ele) => {
                var vasl = ele[0].split('-')
                if (vasl[0] && vasl[1] === '1') {
                    var tagNames = [];
                    if (ele[6] && ele[6] !== 'notag') {
                        ele[6] = ele[6].split(',')
                        ele[6].forEach((item) => {
                            var data = { name: item }
                            tagNames.push(data)
                        })
                    }
                    var optionArray = [];
                    for (let index = 10; index < 20; index++) {
                        if (ele[index]) {
                            var data = { name: ele[index] }
                            optionArray.push(data)
                        } else {
                            break
                        }
                    }
                    var difficulty;
                    if ((ele[4]) === 'super hard') {
                        difficulty = 3
                    } else if ((ele[4]) === 'hard') {
                        difficulty = 3
                    } else if ((ele[4]) === 'medium') {
                        difficulty = 2
                    } else if ((ele[4]) === 'easy') {
                        difficulty = 1
                    }
                    var array = {
                        question_text: ele[7],
                        options: optionArray,
                        explanation: ele[9],
                        type: 'normal',
                        right_answer: ele[8] - 1,
                        _qsl_number: vasl[0],
                        tags: tagNames,
                        questionMaps: [
                            {
                                _grade_id: parseInt(ele[1]),
                                _course_id: parseInt(ele[2]),
                                _topic_id: parseInt(ele[3]),
                                _difficulty_id: difficulty,
                                eta: parseInt(ele[5])
                            }
                        ]
                    }
                    records.push(array)

                } else if (vasl[0] && vasl[1] !== '1') {
                    var difficulty;
                    if ((ele[4]) === 'super hard') {
                        difficulty = 3
                    } else if ((ele[4]) === 'hard') {
                        difficulty = 3
                    } else if ((ele[4]) === 'medium') {
                        difficulty = 2
                    } else if ((ele[4]) === 'easy') {
                        difficulty = 1
                    }
                    var mapData =
                    {
                        _grade_id: parseInt(ele[1]),
                        _course_id: parseInt(ele[2]),
                        _topic_id: parseInt(ele[3]),
                        _difficulty_id: difficulty,
                        eta: parseInt(ele[5])
                    }
                    records.forEach((item) => {
                        if (item._qsl_number === vasl[0]) {
                            item.questionMaps.push(mapData)
                        }
                    })
                }
            })
            // console.log(records)
            const addQuestionFunction = async (question) => {
                return questionService.addQuestion(question).then(data => {
                    return data
                });
            };
            return Promise.all(records.map(resData => addQuestionFunction(resData)))
                .then(data => {
                    if (data) {
                        var response = { status: true, message: 'Import successfully!' }
                    } else {
                        var response = { status: false, message: config.no_data_message }
                    }
                    res.send(response);
                })
        })
    });
};



function getAllQuestions(req, res) {
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;
    return questionService.getAllQuestions(pageNo, dataLimit).then(result => {
        var response = { status: true, data: result }
        res.send(response)
    });
};

function getWelcomeQuestions(req, res) {
    const { gradeId } = req.params;
    // gradeId = (gradeId) * 1;
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;
    return questionService.getWelcomeQuestions(pageNo, dataLimit, gradeId).then(result => {
        if (result) {
            var response = { status: true, count: result.count, data: result.rows }
        }
        else {
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

function getNormalQuestions(req, res) {
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;
    return questionService.getNormalQuestions(pageNo, dataLimit).then(result => {
        if (result) {
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

            return Promise.all(result.rows.map(resData => questionFunction(resData)))
                .then(data => {
                    var response = { status: true, count: result.count, data: data }
                    res.send(response);
                })
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });
};

function getQuestionById(req, res) {
    const { questionId } = req.params;
    if (questionId) {
        return questionService.getQuestionById(questionId).then(result => {
            var response = { status: true, data: result }
            res.send(response)
        });
    } else {
        var response = { status: false, message: 'Invalid params!' };
        res.send(response);
    }
};

function updateQuestionById(req, res) {
    const questionDetails = req.body;
    return questionService.getQuestionById(questionDetails.id).then(result => {
        if (result) {
            return questionService.updateQuestionById(questionDetails, {
                returning: true, where: { question_id: questionDetails.id }
            }).then(result => {
                if (result) {
                    var response = { status: true, data: result }
                } else {
                    var response = { status: false, message: "Question not updated!" }
                }
                res.send(response)
            })
        } else {
            var response = { status: false, message: "No question found for update detail!" }
            res.send(response);
        }
    })
};


module.exports = {
    addQuestion,
    getAllQuestions,
    getQuestionById,
    updateQuestionById,
    getWelcomeQuestions,
    getNormalQuestions,
    addCSV
}