const topicMaster = require('../models/topic_master').topicMaster;
const questionMaster = require('../models/question_master').questionMaster;
const sequelize = require('../db');

const addTopic = data => topicMaster.create({
    ...data
}).then((result) => {
    var response = { status: true, message: "Success! Topic added successfully!" }
    return response;
}).catch((error) => {
    var response = { status: false, message: "Error! Invalid data found", error }
    return response;
});

const addBulkTopics = (details) =>{
    return topicMaster.bulkCreate(details).then((res) => {
        return { status: true };
    }).catch((error) => {
        return { status: false };
    });
}


const getAllTopics = (pageNo, dataLimit, course_id) => {
    var offset = (pageNo - 1) * dataLimit;
    if (course_id) {
        var query = {
            where: {
                _course_id: course_id,
                is_delete: 0
            },
            attributes: ['topic_id', 'topic_name', 'topic_image', 'topic_details', '_course_id', 'sortIndex'],
            offset: offset,
            limit: dataLimit,
            order: [['sortIndex', 'ASC']]
        };
    } else {
        var query = {
            where: {
                is_delete: 0
            },
            attributes: ['topic_id', 'topic_name', 'topic_image', 'topic_details', '_course_id', 'sortIndex'],
            include: [
                {
                    model: questionMaster,
                    as: 'question_masters',
                    attributes: ['question_id', 'question_text', 'options', 'right_answer', 'explanation'],
                },
            ],
            offset: offset,
            limit: dataLimit,
            order: [['sortIndex', 'ASC']]
        };
    }

    return topicMaster.findAndCountAll(query).then(sequelize.getValues)
}


const getTopicById = (id) => {
    var query = {
        where: {
            topic_id: id
        },
        attributes: ['topic_id', 'topic_name', 'topic_image', 'topic_details', '_course_id', '_grade_id', 'sortIndex'],
        include: [
            {
                model: questionMaster,
                as: 'question_masters',
                attributes: ['question_id', 'question_text', 'options', 'right_answer', 'explanation'],
            },
        ],
    };
    return topicMaster.findOne(query).then(sequelize.getValues)
}


const updateTopicById = (data, query) => {
    return topicMaster.update(data, query).then(function ([rowsUpdate, [updatedTopic]]) {
        return updatedTopic;
    })
}


module.exports = {
    addTopic,
    getAllTopics,
    getTopicById,
    updateTopicById,
    addBulkTopics
}