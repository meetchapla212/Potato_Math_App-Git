const questionMapMaster = require('../models/question_map_master').questionMapMaster;
const courseMaster = require('../models/course_master').courseMaster;
const difficultyMaster = require('../models/difficulty_master').difficultyMaster;
const topicMaster = require('../models/topic_master').topicMaster;
const questionMaster = require('../models/question_master').questionMaster;
const sequelize = require('../db');
var Sequelize = require('sequelize');

const addMap = data => questionMapMaster.create({
    ...data
}).then((result) => {
    var response = { status: true, message: "Success! Map added successfully!" }
    return response;
}).catch((error) => {
    var response = { status: false, message: "Error! Invalid data found", error }
    return response;
});


const getFilterQuestion = (pageNo, dataLimit, body) => {
    var whereStatement = {};
    whereStatement.is_delete = 0
    if (body.grade_id) {
        whereStatement._grade_id = body.grade_id
    }
    if (body.course_id) {
        whereStatement._course_id = body.course_id
    }
    if (body.difficulty_id) {
        whereStatement._difficulty_id = body.difficulty_id
    }
    if (body.topic_id) {
        whereStatement._topic_id = body.topic_id
    }
    var offset = (pageNo - 1) * dataLimit;
    var query = {
        where: whereStatement,
        attributes: ['_question_id'],
        offset: offset,
        limit: dataLimit,
        order: [['map_id', 'DESC']]
    };
    return questionMapMaster.findAll(query).then(sequelize.getValues)
}

const getAllMaps = (pageNo, dataLimit, questionId) => {
    var offset = (pageNo - 1) * dataLimit;
    var query = {
        where: {
            _question_id: questionId,
            is_delete: 0
        },
        attributes: ['map_id'],
        include: [
            {
                model: courseMaster,
                as: 'course_masters',
                attributes: [
                    'course_name',
                ],
            },
            {
                model: topicMaster,
                as: 'topic_masters',
                attributes: [
                    'topic_name',
                ],
            },
            {
                model: difficultyMaster,
                as: 'difficulty_masters',
                attributes: [
                    'difficulty_name',
                ],
            },
        ],
        offset: offset,
        limit: dataLimit,
        order: [['map_id', 'DESC']]
    };

    return questionMapMaster.findAll(query).then(sequelize.getValues)
};

const getQuestions = (pageNo, dataLimit, topicId, difficultyId) => {
    var offset = (pageNo - 1) * dataLimit;
    var query = {
        where: {
            _topic_id: topicId,
            _difficulty_id: difficultyId,
            is_delete: 0
        },
        attributes: ['map_id'],
        include: [
            {
                model: questionMaster,
                as: 'question_masters',
                where: {
                    type: 'normal',
                    question_text: { [Sequelize.Op.ne]: null },
                    right_answer: { [Sequelize.Op.ne]: null },
                    options: { [Sequelize.Op.ne]: null },
                    is_delete: 0
                },
                attributes: [
                    'question_id',
                    'question_text',
                    'options',
                    'right_answer',
                    'explanation',
                ],
            },
        ],
        offset: offset,
        limit: dataLimit,
        order: sequelize.random()
    };

    return questionMapMaster.findAll(query).then(sequelize.getValues)
};

const getMapById = (id) => {
    var query = {
        where: {
            map_id: id
        },
        attributes: ['map_id', '_question_id', '_grade_id', '_course_id', '_topic_id', '_difficulty_id', 'eta'],
    };
    return questionMapMaster.findOne(query).then(sequelize.getValues)
};

const totalNumberOfCourse = async (courseId) => {
    var query = {
        where: {
            _course_id: courseId,
            is_delete: 0
        },
    };
    return questionMapMaster.count(query).then(sequelize.getValues)
}

const totalNumberOfTopic = async (topicId) => {
    var query = {
        where: {
            _topic_id: topicId,
            is_delete: 0
        },
    };
    return questionMapMaster.count(query).then(sequelize.getValues)
}


const updateMapById = (data, query) => {
    return questionMapMaster.update(data, query).then(function ([rowsUpdate, [updatedGrade]]) {
        return updatedGrade;
    })
};


module.exports = {
    addMap,
    getAllMaps,
    getMapById,
    updateMapById,
    getQuestions,
    totalNumberOfTopic,
    totalNumberOfCourse,
    getFilterQuestion
};