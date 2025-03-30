const resultMaster = require('../models/result_master').resultMaster;
const resultDetailMaster = require('../models/result_detail_master').resultDetailMaster;
const topicMaster = require('../models/topic_master').topicMaster;
const userMaster = require('../models/app_users_master').userMaster;
const sequelize = require('../db');
var Sequelize = require('sequelize');

function addResultDetailData(_difficulty_id, result_id, answerDetails, answerData) {
    answerData.forEach(function (ans) {
        var answerArray = {
            _result_id: result_id,
            _question_id: ans.question_id,
            _map_id: ans.map_id,
            time: ans.time,
            user_answer: ans.question_answer,
            answer_status: ans.answer_status,
            potato: ans.answer_status ? 5 * _difficulty_id : 0
        }
        answerDetails.push(answerArray);
    })
    if (answerDetails.length > 0) {
        return resultDetailMaster.bulkCreate(answerDetails).then(() => {
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


const addResult = data => resultMaster.create({
    ...data
}).then((result) => {
    var _difficulty_id = result._difficulty_id;
    var result_id = result.result_id;
    var answerDetails = [];
    var answerData = data.answer
    return addResultDetailData(_difficulty_id, result_id, answerDetails, answerData).then((resp) => {
        if (resp.status === true) {
            var response = { status: true, message: "Success! Result and ResultDetails are added successfully!", data: result }
            return response;
        }
    })
}).catch((error) => {
    var response = { status: false, message: "Error! Invalid data found", error }
    return response;
});


const getFilterSolo = (userId, searchParams) => {
    var whereStatement = {};
    whereStatement.is_delete = 0;
    if (userId)
        whereStatement._user_id = userId;
    if (searchParams._difficulty_id && searchParams._difficulty_id.length > 0) {
        whereStatement._difficulty_id = { [Sequelize.Op.in]: searchParams._difficulty_id }

    }
    if (searchParams._topic_id && searchParams._topic_id.length > 0) {
        whereStatement._topic_id = { [Sequelize.Op.in]: (searchParams._topic_id) }
    }
    if (searchParams.challenge_type && searchParams.challenge_type.length > 0) {
        whereStatement.challenge_type = { [Sequelize.Op.in]: (searchParams.challenge_type) }
    }


    if (searchParams.startDate && !searchParams.endDate) {
        whereStatement.createdAt = {
            [Sequelize.Op.gte]: searchParams.startDate,
        }
    }
    else if (!searchParams.startDate && searchParams.endDate) {
        whereStatement.createdAt = {
            [Sequelize.Op.lte]: searchParams.endDate,
        }
    }
    else if (searchParams.startDate && searchParams.endDate) {
        whereStatement.createdAt = {
            [Sequelize.Op.between]: [searchParams.startDate, searchParams.endDate]
        }
    }
    var query = {
        where: whereStatement,
        attributes: ['result_id', '_topic_id', '_difficulty_id', 'challenge_type', 'right_answer', 'potato_earn', 'createdAt'],
        include: [
            {
                model: topicMaster,
                as: 'topic_master',
                attributes: [
                    'topic_name',
                    'topic_image'
                ],
            }, {
                model: userMaster,
                as: 'app_users',
                attributes: [
                    'name',
                    'user_image'
                ],
            }
        ],
        order: [['_topic_id', 'DESC']]
    };

    return resultMaster.findAll(query).then(sequelize.getValues)
}

const leaderboardByCourseInSolo = async (pageNo, dataLimit, courseId, searchParams, userId) => {
    var offset = (pageNo - 1) * dataLimit;
    var query = {
        where: {
            _course_id: courseId,
            _user_id: userId,
            is_delete: 0
        },
        attributes: ['_user_id', [Sequelize.fn('sum', Sequelize.col('potato_earn')), 'total_potato']],
        group: ['_user_id'],
        order: [[Sequelize.fn('sum', Sequelize.col('potato_earn')), 'DESC']],
        offset: offset,
        limit: dataLimit,
    };

    if (searchParams._difficulty_id && searchParams._difficulty_id.length > 0) {
        query.where._difficulty_id = { [Sequelize.Op.in]: searchParams._difficulty_id }

    }
    if (searchParams._topic_id && searchParams._topic_id.length > 0) {
        query.where._topic_id = { [Sequelize.Op.in]: (searchParams._topic_id) }
    }

    if (searchParams.challenge_type && searchParams.challenge_type.length > 0) {
        query.where.challenge_type = { [Sequelize.Op.in]: (searchParams.challenge_type) }
    }


    if (searchParams.startDate && !searchParams.endDate) {
        query.where.createdAt = {
            [Sequelize.Op.gte]: searchParams.startDate,
        }
    }
    else if (!searchParams.startDate && searchParams.endDate) {
        query.where.createdAt = {
            [Sequelize.Op.lte]: searchParams.endDate,
        }
    }
    else if (searchParams.startDate && searchParams.endDate) {
        query.where.createdAt = {
            [Sequelize.Op.between]: [searchParams.startDate, searchParams.endDate]
        }
    }



    return resultMaster.findOne(query).then(sequelize.getValues)
};

const topicPotatoInSolo = (topicId, userId) => {
    var query = {
        where: {
            _topic_id: topicId,
            _user_id: userId,
            is_delete: 0
        },
        attributes: [[Sequelize.fn('sum', Sequelize.col('potato_earn')), 'total_potato']]
    };

    return resultMaster.findAll(query).then(sequelize.getValues)
};

const countTopicInSolo = async (topicId, userId) => {
    var query = {
        where: {
            _topic_id: topicId,
            _user_id: userId,
            is_delete: 0
        },
    };
    return resultMaster.count(query).then(sequelize.getValues)
}



const userPotatoByCourse = (userId) => {
    var query = {
        where: {
            _user_id: userId,
            is_delete: 0
        },
        attributes: ['_course_id', [Sequelize.fn('sum', Sequelize.col('potato_earn')), 'total_potato']],
        group: ['_course_id'],
        order: [[Sequelize.fn('sum', Sequelize.col('potato_earn')), 'DESC']],
    };

    return resultMaster.findAll(query).then(sequelize.getValues)
};

const PotatoInCourse = (userId, courseId) => {
    var query = {
        where: {
            _user_id: userId,
            _course_id: courseId,
            is_delete: 0
        },
        attributes: ['_course_id', [Sequelize.fn('sum', Sequelize.col('potato_earn')), 'total_potato']],
        group: ['_course_id'],
        // order: [[Sequelize.fn('sum', Sequelize.col('potato_earn')), 'DESC']],
    };

    return resultMaster.findAll(query).then(sequelize.getValues)
};


const progessBySolo = async (userId, searchParams) => {
    var query = {
        where: {
            _user_id: userId,
            is_delete: 0
        },
        attributes: [[Sequelize.fn('sum', Sequelize.col('potato_earn')), 'total_potato'], [Sequelize.fn('sum', Sequelize.col('quizTime')), 'total_time']],
        group: ['_user_id']
    };
    if (searchParams.weekago && searchParams.today) {
        query.where.createdAt = {
            [Sequelize.Op.between]: [searchParams.weekago, searchParams.today]
        }
    }
    return resultMaster.findAll(query).then(sequelize.getValues)
};

const progessBySoloCount = async (userId, searchParams) => {
    var query = {
        where: {
            _user_id: userId,
            is_delete: 0
        },
    }
    if (searchParams.weekago && searchParams.today) {
        query.where.createdAt = {
            [Sequelize.Op.between]: [searchParams.weekago, searchParams.today]
        }
    }
    return resultMaster.count(query).then(sequelize.getValues)
};


module.exports = {
    addResult,
    leaderboardByCourseInSolo,
    userPotatoByCourse,
    getFilterSolo,
    PotatoInCourse,
    topicPotatoInSolo,
    countTopicInSolo,
    progessBySolo,
    progessBySoloCount
};
