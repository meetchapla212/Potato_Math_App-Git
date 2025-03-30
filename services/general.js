const coinMaster = require('../models/coin_master').coinMaster;
const courseMaster = require('../models/course_master').courseMaster;
const topicMaster = require('../models/topic_master').topicMaster;
const questionMaster = require('../models/question_master').questionMaster;
const resultMaster = require('../models/result_master').resultMaster;
const userMaster = require('../models/app_users_master').userMaster;
const battleMaster = require('../models/battle_result_master').battleMaster;
const battleRequestMaster = require('../models/battle_request_master').battleRequestMaster;
const friendRequestMaster = require('../models/friend_request_master').friendRequestMaster;
const streakAppliedMaster = require('../models/streak_applied_master').streakAppliedMaster;
const sequelize = require('../db');
var Sequelize = require('sequelize');

const getCount = (weekago, today) => {
    var query = {
        where: {
            is_delete: 0
        },
    };

    var userQuery = {
        where: {
            createdAt: {
                [Sequelize.Op.between]: [weekago, today]
            }
        }
    }

    var activeQuery = {
        where: {
            last_login_date: {
                [Sequelize.Op.between]: [weekago, today]
            }
        }
    }

    return courseMaster.count(query).then(courseCount => {
        return coinMaster.count(query).then(coinCount => {
            return topicMaster.count(query).then(topicCount => {
                return questionMaster.count(query).then(questionCount => {
                    return userMaster.count(userQuery).then(userInWeek => {
                        return userMaster.count(activeQuery).then(activeUserInWeek => {
                            var response = { question: questionCount, course: courseCount, coin: coinCount, topic: topicCount, userInWeek: userInWeek, activeUserInWeek: activeUserInWeek }
                            return response
                        })
                    })
                });
            });
        });
    });
}

const getCountFilterData = async (userId, type, value, courseId, body) => {
    var whereStatement = {};
    whereStatement.is_delete = 0;
    if (value) {
        whereStatement.challenge_type = value
    }
    if (userId) {
        whereStatement._user_id = userId
    }
    if (courseId) {
        whereStatement._course_id = courseId
    }
    if (body._difficulty_id && body._difficulty_id.length > 0) {
        whereStatement._difficulty_id = { [Sequelize.Op.in]: body._difficulty_id }

    }
    if (body._topic_id && body._topic_id.length > 0) {
        whereStatement._topic_id = { [Sequelize.Op.in]: (body._topic_id) }
    }
    // if (body.challenge_type && body.challenge_type.length > 0) {
    //     whereStatement.challenge_type = { [Sequelize.Op.in]: (body.challenge_type) }
    // }


    if (body.startDate && !body.endDate) {
        whereStatement.createdAt = {
            [Sequelize.Op.gte]: body.startDate,
        }
    }
    else if (!body.startDate && body.endDate) {
        whereStatement.createdAt = {
            [Sequelize.Op.lte]: body.endDate,
        }
    }
    else if (body.startDate && body.endDate) {
        whereStatement.createdAt = {
            [Sequelize.Op.between]: [body.startDate, body.endDate]
        }
    }
    var query = {
        where: whereStatement,
    };
    return resultMaster.count(query).then(sequelize.getValues)
}

const getCountStreakData = async (userId, courseId) => {
    var query = {
        where: {
            _user_id: userId,
            is_delete: 0
        },
    };
    if (courseId) {
        query.where['_course_id'] = courseId
    }
    return streakAppliedMaster.count(query).then(sequelize.getValues)
}

const getSumFilterData = async (type, userId, courseId, body) => {
    var whereStatement = {};
    whereStatement.is_delete = 0;
    if (userId) {
        whereStatement._user_id = userId
    }
    if (courseId) {
        whereStatement._course_id = courseId
    }
    if (body._difficulty_id && body._difficulty_id.length > 0) {
        whereStatement._difficulty_id = { [Sequelize.Op.in]: body._difficulty_id }

    }
    if (body._topic_id && body._topic_id.length > 0) {
        whereStatement._topic_id = { [Sequelize.Op.in]: (body._topic_id) }
    }
    if (body.challenge_type && body.challenge_type.length > 0) {
        whereStatement.challenge_type = { [Sequelize.Op.in]: (body.challenge_type) }
    }


    if (body.startDate && !body.endDate) {
        whereStatement.createdAt = {
            [Sequelize.Op.gte]: body.startDate,
        }
    }
    else if (!body.startDate && body.endDate) {
        whereStatement.createdAt = {
            [Sequelize.Op.lte]: body.endDate,
        }
    }
    else if (body.startDate && body.endDate) {
        whereStatement.createdAt = {
            [Sequelize.Op.between]: [body.startDate, body.endDate]
        }
    }
    var query = {
        where: whereStatement,
        group: ['_user_id'],
        attributes: [[Sequelize.fn('sum', Sequelize.col(type)), 'total']]
    };
    return resultMaster.findOne(query).then(sequelize.getValues)
}

const getSumFilterDataInOpponentBattle = async (type, userId, courseId, body) => {
    var whereStatement = {};
    whereStatement.winner_user_id = userId;
    whereStatement.is_delete = 0;
    if (userId) {
        whereStatement._opponent_id = userId
    }
    if (courseId) {
        whereStatement._course_id = courseId
    }
    if (body._difficulty_id && body._difficulty_id.length > 0) {
        whereStatement._difficulty_id = { [Sequelize.Op.in]: body._difficulty_id }

    }
    if (body._topic_id && body._topic_id.length > 0) {
        whereStatement._topic_id = { [Sequelize.Op.in]: (body._topic_id) }
    }
    if (body.challenge_type && body.challenge_type.length > 0) {
        whereStatement.challenge_type = { [Sequelize.Op.in]: (body.challenge_type) }
    }


    if (body.startDate && !body.endDate) {
        whereStatement.createdAt = {
            [Sequelize.Op.gte]: body.startDate,
        }
    }
    else if (!body.startDate && body.endDate) {
        whereStatement.createdAt = {
            [Sequelize.Op.lte]: body.endDate,
        }
    }
    else if (body.startDate && body.endDate) {
        whereStatement.createdAt = {
            [Sequelize.Op.between]: [body.startDate, body.endDate]
        }
    }
    var query = {
        where: whereStatement,
        group: ['_opponent_id'],
        attributes: [[Sequelize.fn('sum', Sequelize.col(type)), 'total']]
    };
    return battleMaster.findOne(query).then(sequelize.getValues)
}

const getSumFilterDataInUserBattle = async (type, userId, courseId, body) => {
    var whereStatement = {};
    whereStatement.is_delete = 0;
    whereStatement.winner_user_id = userId;
    if (userId) {
        whereStatement._user_id = userId
    }
    if (courseId) {
        whereStatement._course_id = courseId
    }
    if (body._difficulty_id && body._difficulty_id.length > 0) {
        whereStatement._difficulty_id = { [Sequelize.Op.in]: body._difficulty_id }

    }
    if (body._topic_id && body._topic_id.length > 0) {
        whereStatement._topic_id = { [Sequelize.Op.in]: (body._topic_id) }
    }
    if (body.challenge_type && body.challenge_type.length > 0) {
        whereStatement.challenge_type = { [Sequelize.Op.in]: (body.challenge_type) }
    }


    if (body.startDate && !body.endDate) {
        whereStatement.createdAt = {
            [Sequelize.Op.gte]: body.startDate,
        }
    }
    else if (!body.startDate && body.endDate) {
        whereStatement.createdAt = {
            [Sequelize.Op.lte]: body.endDate,
        }
    }
    else if (body.startDate && body.endDate) {
        whereStatement.createdAt = {
            [Sequelize.Op.between]: [body.startDate, body.endDate]
        }
    }
    var query = {
        where: whereStatement,
        group: ['_user_id'],
        attributes: [[Sequelize.fn('sum', Sequelize.col(type)), 'total']]
    };
    return battleMaster.findOne(query).then(sequelize.getValues)
}
const getUserGems = async (id) => {
    const query = {
        where: {
            user_id: id
        },
        attributes: [
            'gams_earn',
            'onboarding_potato',
            'coin_spent'
        ]
    };
    return userMaster.findOne(query).then(sequelize.getValues)
};

const countInUserColumn = async (userId, courseId, body) => {
    var whereStatement = {};
    whereStatement.is_delete = 0;
    if (userId) {
        whereStatement._user_id = userId
    }
    if (courseId) {
        whereStatement._course_id = courseId
    }
    if (body._difficulty_id && body._difficulty_id.length > 0) {
        whereStatement._difficulty_id = { [Sequelize.Op.in]: body._difficulty_id }

    }
    if (body._topic_id && body._topic_id.length > 0) {
        whereStatement._topic_id = { [Sequelize.Op.in]: (body._topic_id) }
    }
    if (body.challenge_type && body.challenge_type.length > 0) {
        whereStatement.challenge_type = { [Sequelize.Op.in]: (body.challenge_type) }
    }


    if (body.startDate && !body.endDate) {
        whereStatement.createdAt = {
            [Sequelize.Op.gte]: body.startDate,
        }
    }
    else if (!body.startDate && body.endDate) {
        whereStatement.createdAt = {
            [Sequelize.Op.lte]: body.endDate,
        }
    }
    else if (body.startDate && body.endDate) {
        whereStatement.createdAt = {
            [Sequelize.Op.between]: [body.startDate, body.endDate]
        }
    }
    var query = {
        where: whereStatement,
    };

    return battleMaster.count(query).then(sequelize.getValues)
}

const countInOpponentColumn = async (userId, courseId, body) => {
    var whereStatement = {};
    whereStatement.is_delete = 0;
    if (userId) {
        whereStatement._opponent_id = userId
    }
    if (courseId) {
        whereStatement._course_id = courseId
    }
    if (body._difficulty_id && body._difficulty_id.length > 0) {
        whereStatement._difficulty_id = { [Sequelize.Op.in]: body._difficulty_id }

    }
    if (body._topic_id && body._topic_id.length > 0) {
        whereStatement._topic_id = { [Sequelize.Op.in]: (body._topic_id) }
    }
    if (body.challenge_type && body.challenge_type.length > 0) {
        whereStatement.challenge_type = { [Sequelize.Op.in]: (body.challenge_type) }
    }


    if (body.startDate && !body.endDate) {
        whereStatement.createdAt = {
            [Sequelize.Op.gte]: body.startDate,
        }
    }
    else if (!body.startDate && body.endDate) {
        whereStatement.createdAt = {
            [Sequelize.Op.lte]: body.endDate,
        }
    }
    else if (body.startDate && body.endDate) {
        whereStatement.createdAt = {
            [Sequelize.Op.between]: [body.startDate, body.endDate]
        }
    }
    var query = {
        where: whereStatement,
    };
    return battleMaster.count(query).then(sequelize.getValues)
}

const totalWonBattle = async (userId, courseId, body) => {
    var whereStatement = {};
    whereStatement.is_delete = 0;
    if (userId) {
        whereStatement.winner_user_id = userId
    }
    if (courseId) {
        whereStatement._course_id = courseId
    }
    if (body._difficulty_id && body._difficulty_id.length > 0) {
        whereStatement._difficulty_id = { [Sequelize.Op.in]: body._difficulty_id }

    }
    if (body._topic_id && body._topic_id.length > 0) {
        whereStatement._topic_id = { [Sequelize.Op.in]: (body._topic_id) }
    }
    if (body.challenge_type && body.challenge_type.length > 0) {
        whereStatement.challenge_type = { [Sequelize.Op.in]: (body.challenge_type) }
    }


    if (body.startDate && !body.endDate) {
        whereStatement.createdAt = {
            [Sequelize.Op.gte]: body.startDate,
        }
    }
    else if (!body.startDate && body.endDate) {
        whereStatement.createdAt = {
            [Sequelize.Op.lte]: body.endDate,
        }
    }
    else if (body.startDate && body.endDate) {
        whereStatement.createdAt = {
            [Sequelize.Op.between]: [body.startDate, body.endDate]
        }
    }
    var query = {
        where: whereStatement,
    };
    return battleMaster.count(query).then(sequelize.getValues)
}

const markNotificationRead = (userId, battleToken) => {
    const data = { is_read: 1 };
    const friendQuery = {
        where: {
            _user_id: userId,
            is_pending: {
                [Sequelize.Op.eq]: 1,
            }
        }
    };
    const battleRQuery = {
        where: {
            sender_user_id: userId
        }
    };
    if (battleToken) {
        battleRQuery.where.battle_token = battleToken
    }
    return friendRequestMaster.update(data, friendQuery).then(function () {
        if (battleToken) {
            return battleRequestMaster.update(data, battleRQuery).then(function () {
                return true;
            })
        } else {
            return true
        }
    })
}

// const userInWeek = async (weekago, today) => {
//     var whereStatement = {};
//     whereStatement.createdAt = {
//         [Sequelize.Op.between]: [weekago, today]
//     }
//     whereStatement.is_delete = 0
//     var query = {
//         where: whereStatement
//     };
//     return userMaster.count(query).then(sequelize.getValues)
// }

module.exports = {
    markNotificationRead,
    getCount,
    getSumFilterData,
    getCountFilterData,
    getCountStreakData,
    getUserGems,
    countInUserColumn,
    countInOpponentColumn,
    totalWonBattle,
    getSumFilterDataInUserBattle,
    getSumFilterDataInOpponentBattle
};