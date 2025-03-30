const questionMaster = require('../models/question_master').questionMaster;
const sequelize = require('../db');
var Sequelize = require('sequelize');
const questionTagMaster = require('../models/question_tag_master').questionTagMaster;
const questionMapMaster = require('../models/question_map_master').questionMapMaster;

function addQuestionTag(question_id, tagDetails, tagData) {
    tagData.forEach(function (tag) {
        var tagArray = {
            _question_id: question_id,
            tag: tag.name
        }
        tagDetails.push(tagArray);
    })

    if (tagDetails.length > 0) {
        return questionTagMaster.bulkCreate(tagDetails).then(() => {
            return { status: true };
        }).catch((error) => {
            return { status: false };
        });
    }
    else {
        return new Promise((resolve, reject) => {
            resolve({ status: true });
        })
    }
}

function addMappingOfQuestion(question_id, mapDetails, mapData) {

    mapData.forEach(function (item) {
        var mapArray = {
            _question_id: question_id,
            _grade_id: item._grade_id,
            _course_id: item._course_id,
            _topic_id: item._topic_id,
            _difficulty_id: item._difficulty_id,
            eta: (item.eta) * 1,
        }
        mapDetails.push(mapArray);
    })

    if (mapDetails.length > 0) {
        return questionMapMaster.bulkCreate(mapDetails).then((res) => {
            return { status: true };
        }).catch((error) => {
            return { status: false };
        });
    }
    else {
        return new Promise((resolve, reject) => {
            resolve({ status: true });
        })
    }
}

const addQuestion = data => questionMaster.create({
    ...data
}).then((result) => {
    var question_id = result.question_id
    var tagDetails = [];
    var mapDetails = [];
    var tagData = data.tags
    var mapData = data.questionMaps
    return addMappingOfQuestion(question_id, mapDetails, mapData).then((mapping) => {
        if (mapping.status) {
            return addQuestionTag(question_id, tagDetails, tagData).then((resp) => {
                if (resp.status) {
                    var response = { status: true, message: "Success! Question and Tags are added successfully!" }
                    return response;
                } else {
                    var response = { status: false, message: "Error In a Tags!" }
                    return response;
                }
            })
        } else {
            var response = { status: false, message: "Error In a Mapping!" }
            return response;
        }
    })
}).catch((error) => {
    var response = { status: false, message: "Error! Invalid data found", error }
    return response;
});


const getAllQuestions = (pageNo, dataLimit) => {
    var offset = (pageNo - 1) * dataLimit;
    query = {
        where: {
            is_delete: 0,
        },
        attributes: ['question_id', 'question_text', 'options', 'right_answer', 'explanation'],
        offset: offset,
        limit: dataLimit,
        order: [['question_id', 'DESC']]
    };

    return questionMaster.findAll(query).then(sequelize.getValues)
};

const getWelcomeQuestions = (pageNo, dataLimit, gradeId) => {
    var offset = (pageNo - 1) * dataLimit;
    query = {
        where: {
            type: 'welcome',
            is_delete: 0,
        },
        attributes: ['question_id', 'question_text', 'options', 'right_answer', 'explanation'],
        offset: offset,
        limit: dataLimit,
        order: [['question_id', 'DESC']]
    };
    if (gradeId) {
        query.where._grade_id = gradeId
    }
    return questionMaster.findAndCountAll(query).then(sequelize.getValues)
};

const getNormalQuestions = (pageNo, dataLimit) => {
    var offset = (pageNo - 1) * dataLimit;
    query = {
        where: {
            type: 'normal',
            is_delete: 0,
        },
        attributes: ['question_id', 'question_text', 'right_answer', 'explanation', 'options'],
        offset: offset,
        limit: dataLimit,
        order: [['question_id', 'DESC']]
    };

    return questionMaster.findAndCountAll(query).then(sequelize.getValues)
};

const getAllQuestionsById = (pageNo, dataLimit, array) => {
    var offset = (pageNo - 1) * dataLimit;
    query = {
        where: {
            type: 'normal',
            question_id: {
                [Sequelize.Op.in]: array
            },
            is_delete: 0,
        },
        attributes: ['question_id', 'question_text', 'options', 'right_answer', 'explanation'],
        offset: offset,
        limit: dataLimit,
        order: [['question_id', 'DESC']]
    };

    return questionMaster.findAndCountAll(query).then(sequelize.getValues)
};

const getQuestionById = (id) => {
    var query = {
        where: {
            question_id: id
        },
        include: [
            {
                model: questionTagMaster,
                as: 'question_tag_masters',
                attributes: [
                    'tag'
                ],
            },
            {
                model: questionMapMaster,
                as: 'question_map_masters',
                attributes: [
                    '_grade_id', '_course_id', '_topic_id', '_difficulty_id', 'eta'
                ],
            }
        ],
        attributes: ['question_id', 'question_text', 'options', 'right_answer', 'explanation', 'type', '_grade_id'],
    };
    return questionMaster.findOne(query).then(sequelize.getValues)
};


const updateQuestionById = (data, query) => {
    var deleteQuery = { where: { _question_id: data.id }, returning: true, checkExistance: true };
    return questionTagMaster.destroy(deleteQuery).then(function (mapInstance) {
        var deleteMapQuery = { where: { _question_id: data.id }, returning: true, checkExistance: true };
        return questionMapMaster.destroy(deleteMapQuery).then(function (instance) {
            return questionMaster.update(data, query).then(function ([rowsUpdate, [updatedQuestion]]) {
                var question_id = data.id
                var tagDetails = [];
                var tagData = data.tags;
                var mapDetails = [];
                var mapData = data.questionMaps
                return addMappingOfQuestion(question_id, mapDetails, mapData).then((mapping) => {
                    if (mapping) {
                        return addQuestionTag(question_id, tagDetails, tagData).then((resp) => {
                            if (resp.status === true) {
                                return updatedQuestion;
                            }
                        })
                    }
                })
            })
        })
    })
};


module.exports = {
    addQuestion,
    getAllQuestions,
    getQuestionById,
    updateQuestionById,
    getWelcomeQuestions,
    getNormalQuestions,
    getAllQuestionsById
};
