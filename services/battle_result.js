const battleMaster = require('../models/battle_result_master').battleMaster;
const userMaster = require('../models/app_users_master').userMaster;
const topicMaster = require('../models/topic_master').topicMaster;
const battleResultDetailMaster = require('../models/battle_result_detail_master').battleResultDetailMaster;
var Sequelize = require('sequelize');
const sequelize = require('../db');
const moment = require('moment');

const addBattle = data => battleMaster.create({
    ...data
}).then((result) => {
    var response = { status: true, message: "Success! Battle added successfully!" }
    return response;
}).catch((error) => {
    var response = { status: false, message: "Error! Invalid data found", error }
    return response;
});


const getBattleByHash = (hashId) => {
    var query = {
        where: {
            battle_hash: hashId,
            is_delete: 0
        },
        attributes: ['battle_id', 'battle_hash', '_user_id', '_opponent_id', '_course_id', '_topic_id', '_difficulty_id', 'challenge_type', 'user_right_answer', 'opponent_right_answer'],
    };

    return battleMaster.findOne(query).then(sequelize.getValues)
};

const getAllPendingBattles = () => {
    var query = {
        where: {
            battle_status: 'pending',
            is_delete: 0
        },
    };

    return battleMaster.findAll(query).then(sequelize.getValues)
}

function addBattleResultDetailData(_difficulty_id, battle_id, answerDetails, answerData) {
    answerData.forEach(function (ans) {
        var answerArray = {
            _battle_id: battle_id,
            _question_id: ans.question_id,
            _map_id: ans.map_id,
            time: ans.time,
            user_answer: ans.question_answer,
            answer_status: ans.answer_status,
            potato: ans.answer_status ? 9 * _difficulty_id : 0
        }
        answerDetails.push(answerArray);
    })
    if (answerDetails.length > 0) {
        return battleResultDetailMaster.bulkCreate(answerDetails).then(() => {
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

const updateBattleById = (data, query) => {
    return battleMaster.update(data, query).then(function ([rowsUpdate, [updatedBattle]]) {
        var _difficulty_id = updatedBattle._difficulty_id;
        var battle_id = updatedBattle.battle_id;
        var answerDetails = [];
        var answerData = data.answer
        return addBattleResultDetailData(_difficulty_id, battle_id, answerDetails, answerData).then((resp) => {
            if (resp.status === true) {
                var response = { status: true, message: "Success! Battle Result and ResultDetails are added successfully!", data: updatedBattle }
                return response;
            }
        })
    })
}

const userColumn = (userId) => {
    var query = {
        where: {
            _user_id: userId,
            is_delete: 0
        },
        attributes: ['battle_id'],

        order: [['battle_id', 'ASC']],
    };

    return battleMaster.findAll(query).then(sequelize.getValues)
}
const opponentColumn = (userId) => {
    var statusArray = ['rejected', 'expired']
    var query = {
        where: {
            _opponent_id: userId,
            battle_status: { [Sequelize.Op.not]: statusArray },
            is_delete: 0
        },
        attributes: ['battle_id'],

        order: [['battle_id', 'ASC']],
    };

    return battleMaster.findAll(query).then(sequelize.getValues)
}


const getFilterBattle = (battleArray, searchParams) => {
    var whereStatement = {};
    whereStatement.is_delete = 0;
    whereStatement.battle_id = { [Sequelize.Op.in]: battleArray }
    if (searchParams._difficulty_id && searchParams._difficulty_id.length > 0) {
        whereStatement._difficulty_id = { [Sequelize.Op.in]: searchParams._difficulty_id }

    }
    if (searchParams._topic_id && searchParams._topic_id.length > 0) {
        whereStatement._topic_id = { [Sequelize.Op.in]: (searchParams._topic_id) }
    }
    if (searchParams.challenge_type && searchParams.challenge_type.length > 0) {
        whereStatement.challenge_type = { [Sequelize.Op.in]: (searchParams.challenge_type) }
    }
    if (searchParams.battle_status) {
        whereStatement.battle_status = searchParams.battle_status
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
        searchParams.endDate = moment(searchParams.endDate).add(1, 'days').format('YYYY-MM-DD');
        searchParams.startDate = moment(searchParams.startDate).subtract(1, 'days').format('YYYY-MM-DD');
        whereStatement.createdAt = {
            [Sequelize.Op.between]: [searchParams.startDate, searchParams.endDate]
        }
    }
    var query = {
        where: whereStatement,
        attributes: ['battle_id', 'battle_hash', '_user_id', '_opponent_id', '_course_id', '_topic_id', '_difficulty_id', 'total_question',
            'challenge_type', 'user_right_answer', 'user_wrong_answer', 'user_potato_earn', 'user_quizTime',
            'opponent_right_answer', 'opponent_wrong_answer', 'opponent_potato_earn', 'opponent_quizTime', 'winner_user_id', 'battle_status',
            'createdAt'],
        include: [
            {
                model: topicMaster,
                as: 'topic',
                attributes: [
                    'topic_name'
                ],
            },
            {
                model: userMaster,
                as: 'main_users',
                attributes: [
                    'name', 'user_image'
                ],
            },
            {
                model: userMaster,
                as: 'opponent_users',
                attributes: [
                    'name', 'user_image'
                ],
            }
        ],
        order: [['battle_id', 'ASC']],
    };

    return battleMaster.findAll(query).then(sequelize.getValues)
}

const countTopicInUserBattle = async (topicId, userId) => {
    var query = {
        where: {
            _topic_id: topicId,
            _user_id: userId,
            is_delete: 0
        },
    };
    return battleMaster.count(query).then(sequelize.getValues)
}

const countTopicInOpponentBattle = async (topicId, userId) => {
    var query = {
        where: {
            _topic_id: topicId,
            _opponent_id: userId,
            is_delete: 0
        },
    };
    return battleMaster.count(query).then(sequelize.getValues)
}

const topicPotatoInBattleInUserColumn = (topicId, userId) => {
    var query = {
        where: {
            _topic_id: topicId,
            _user_id: userId,
            is_delete: 0
        },
        attributes: [[Sequelize.fn('sum', Sequelize.col('user_potato_earn')), 'total_potato']],
    };

    return battleMaster.findAll(query).then(sequelize.getValues)
};

const topicPotatoInBattleInOpponentColumn = (topicId, userId) => {
    var query = {
        where: {
            _topic_id: topicId,
            _opponent_id: userId,
            is_delete: 0
        },
        attributes: [[Sequelize.fn('sum', Sequelize.col('opponent_potato_earn')), 'total_potato']],
    };

    return battleMaster.findAll(query).then(sequelize.getValues)
};

const PotatoInUserBattleCourse = (userId, courseId) => {
    var query = {
        where: {
            _user_id: userId,
            _course_id: courseId,
            is_delete: 0
        },
        attributes: ['_course_id', [Sequelize.fn('sum', Sequelize.col('user_potato_earn')), 'user_total_potato']],
        group: ['_course_id'],
    };

    return battleMaster.findAll(query).then(sequelize.getValues)
};
const PotatoInOpponentBattleCourse = (userId, courseId) => {
    var query = {
        where: {
            _opponent_id: userId,
            _course_id: courseId,
            is_delete: 0
        },
        attributes: ['_course_id', [Sequelize.fn('sum', Sequelize.col('opponent_potato_earn')), 'opponent_total_potato']],
        group: ['_course_id'],
    };

    return battleMaster.findAll(query).then(sequelize.getValues)
};

const leaderboardByCourseInBattleInUserColumn = async (pageNo, dataLimit, courseId, searchParams, userId) => {
    var offset = (pageNo - 1) * dataLimit;
    var query = {
        where: {
            _course_id: courseId,
            _user_id: userId,
            is_delete: 0,
            winner_user_id: userId,
            battle_status: { [Sequelize.Op.ne]: 'pending' },
        },
        attributes: ['_user_id', [Sequelize.fn('sum', Sequelize.col('user_potato_earn')), 'total_potato']],
        group: ['_user_id'],
        order: [[Sequelize.fn('sum', Sequelize.col('user_potato_earn')), 'DESC']],
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

    return battleMaster.findOne(query).then(sequelize.getValues)
};

const leaderboardByCourseInBattleInOpponentColumn = async (pageNo, dataLimit, courseId, searchParams, userId) => {
    var offset = (pageNo - 1) * dataLimit;
    var query = {
        where: {
            _course_id: courseId,
            _opponent_id: userId,
            is_delete: 0,
            winner_user_id: userId,
            battle_status: 'complete',
        },
        attributes: ['_opponent_id', [Sequelize.fn('sum', Sequelize.col('opponent_potato_earn')), 'total_potato']],
        group: ['_opponent_id'],
        order: [[Sequelize.fn('sum', Sequelize.col('opponent_potato_earn')), 'DESC']],
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

    return battleMaster.findOne(query).then(sequelize.getValues)
};

const progessBySoloBattleInUserColumn = async (userId, searchParams) => {
    var query = {
        where: {
            _user_id: userId,
            is_delete: 0
        },
        attributes: [[Sequelize.fn('sum', Sequelize.col('user_potato_earn')), 'total_potato'], [Sequelize.fn('sum', Sequelize.col('user_quizTime')), 'total_time']],
        group: ['_user_id']
    };
    if (searchParams.weekago && searchParams.today) {
        query.where.createdAt = {
            [Sequelize.Op.between]: [searchParams.weekago, searchParams.today]
        }
    }
    return battleMaster.findAll(query).then(sequelize.getValues)
};

const progessBySoloBattleInUserColumnCount = async (userId, searchParams) => {
    var query = {
        where: {
            _user_id: userId,
            is_delete: 0
        },
    };
    if (searchParams.weekago && searchParams.today) {
        query.where.createdAt = {
            [Sequelize.Op.between]: [searchParams.weekago, searchParams.today]
        }
    }
    return battleMaster.count(query).then(sequelize.getValues)
};

const progessBySoloBattleInOpponentColumn = async (userId, searchParams) => {
    var query = {
        where: {
            _opponent_id: userId,
            is_delete: 0
        },
        attributes: [[Sequelize.fn('sum', Sequelize.col('opponent_potato_earn')), 'total_potato'], [Sequelize.fn('sum', Sequelize.col('opponent_quizTime')), 'total_time']],
        group: ['_opponent_id']
    };
    if (searchParams.weekago && searchParams.today) {
        query.where.createdAt = {
            [Sequelize.Op.between]: [searchParams.weekago, searchParams.today]
        }
    }
    return battleMaster.findAll(query).then(sequelize.getValues)
};

const progessBySoloBattleInOpponentColumnCount = async (userId, searchParams) => {
    var query = {
        where: {
            _opponent_id: userId,
            is_delete: 0
        },
    };
    if (searchParams.weekago && searchParams.today) {
        query.where.createdAt = {
            [Sequelize.Op.between]: [searchParams.weekago, searchParams.today]
        }
    }
    return battleMaster.count(query).then(sequelize.getValues)
};

const updateBattleByToken = (data, query) => {
    return battleMaster.update(data, query).then(function ([rowsUpdate, [updatedBattle]]) {
        return updatedBattle;
    })
}

const getBattleByToken = (id) => {
    var query = {
        where: {
            battle_hash: id
        },
    };
    return battleMaster.findOne(query).then(sequelize.getValues)
}

module.exports = {
    addBattle,
    getBattleByHash,
    updateBattleById,
    opponentColumn,
    userColumn,
    PotatoInUserBattleCourse,
    PotatoInOpponentBattleCourse,
    getFilterBattle,
    leaderboardByCourseInBattleInUserColumn,
    leaderboardByCourseInBattleInOpponentColumn,
    topicPotatoInBattleInOpponentColumn,
    topicPotatoInBattleInUserColumn,
    countTopicInOpponentBattle,
    countTopicInUserBattle,
    progessBySoloBattleInUserColumn,
    progessBySoloBattleInOpponentColumn,
    progessBySoloBattleInUserColumnCount,
    progessBySoloBattleInOpponentColumnCount,
    updateBattleByToken,
    getBattleByToken,
    getAllPendingBattles
}