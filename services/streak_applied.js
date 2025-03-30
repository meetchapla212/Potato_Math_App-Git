const streakAppliedMaster = require('../models/streak_applied_master').streakAppliedMaster;
const courseMaster = require('../models/course_master').courseMaster;
const sequelize = require('../db');
var Sequelize = require('sequelize');

var moment = require('moment');

const addActiveStreak = data => streakAppliedMaster.create({
    ...data
}).then((result) => {
    var response = { status: true, message: "Success! ActiveStreak added successfully!" }
    return response;
}).catch((error) => {
    var response = { status: false, message: "Error! Invalid data found", error }
    return response;
});

const getActiveStreak = (userId, courseId) => {
    var query = {
        where: {
            _user_id: userId,
            _course_id: courseId,
            streak_status: 'active',
            _streak_type: { [Sequelize.Op.ne]: 'battle' },
            // potato_required: { [Sequelize.Op.gt]: sequelize.col('potato_earn') },
            is_delete: 0
        },
        attributes: ['streak_applied_id', '_streak_id', 'potato_earn', 'potato_required', '_streak_type'],
        order: ['streak_applied_id'],
    };

    return streakAppliedMaster.findOne(query).then(sequelize.getValues)
};

const getActiveStreakForBattle = (userId, courseId) => {
    var query = {
        where: {
            _user_id: userId,
            _course_id: courseId,
            streak_status: 'active',
            _streak_type: { [Sequelize.Op.ne]: 'solo' },
            is_delete: 0
        },
        attributes: ['streak_applied_id', '_streak_id', 'potato_earn', 'potato_required', '_streak_type'],
        order: ['streak_applied_id'],
    };

    return streakAppliedMaster.findOne(query).then(sequelize.getValues)
};

const getAllActiveStreak = () => {
    var query = {
        where: {
            streak_status: 'active',
            end_time: {
                [Sequelize.Op.lte]: moment().toISOString()
            },
            is_delete: 0
        },
        attributes: ['streak_applied_id', '_user_id', '_streak_id', '_course_id', 'start_time', 'end_time', 'potato_required', 'potato_earn', 'streak_status'],
        order: ['streak_applied_id'],
    };

    return streakAppliedMaster.findAll(query).then(sequelize.getValues)
};

const checkActiveStreakForUser = (userId) => {
    var query = {
        where: {
            _user_id: userId,
            streak_status: 'active',
            // potato_required: { [Sequelize.Op.gt]: sequelize.col('potato_earn') },
            is_delete: 0
        },
        attributes: ['streak_applied_id', '_user_id', '_streak_id', '_course_id', 'start_time', 'end_time', 'potato_required', 'potato_earn', 'streak_status'],
        include: [
            {
                model: courseMaster,
                as: 'applied_streak_course',
                attributes: [
                    'course_name'
                ],
            }
        ],
        order: ['streak_applied_id'],
    };

    return streakAppliedMaster.findOne(query).then(sequelize.getValues)
};

const getAplliedStreakID = (userId) => {
    var query = {
        where: {
            _user_id: userId,
            is_delete: 0
        },
        attributes: ['_streak_id'],
    };

    return streakAppliedMaster.findAll(query).then(sequelize.getValues)
};

const updateActiveStreakById = (data, query) => {
    return streakAppliedMaster.update(data, query).then(function ([rowsUpdate, [updatedStreak]]) {
        return updatedStreak;
    })
}

const totalNumberOfUser = async (streakId) => {
    var query = {
        where: {
            _streak_id: streakId,
            is_delete: 0
        },
    };
    return streakAppliedMaster.count(query).then(sequelize.getValues)
}

const totalNumberOfComplete = async (streakId) => {
    var query = {
        where: {
            _streak_id: streakId,
            streak_status: 'success',
            is_delete: 0
        },
    };
    return streakAppliedMaster.count(query).then(sequelize.getValues)
}

const totalNumberOfMiss = async (streakId) => {
    var query = {
        where: {
            _streak_id: streakId,
            streak_status: 'expired',
            is_delete: 0
        },
    };
    return streakAppliedMaster.count(query).then(sequelize.getValues)
}

const getUserPlayedStreak = (userId) => {
    var query = {
        where: {
            _user_id: userId,
            streak_status: 'success',
            is_delete: 0
        },
        attributes: ['streak_applied_id', '_user_id', '_streak_id', '_course_id', 'start_time', 'end_time', 'potato_required', 'potato_earn', 'streak_status'],
        include: [
            {
                model: courseMaster,
                as: 'applied_streak_course',
                attributes: [
                    'course_name'
                ],
            }
        ],
        order: ['streak_applied_id']
    };
    return streakAppliedMaster.findAll(query).then(sequelize.getValues)
}

const getAllAppliedStreakById = (streakId) => {
    var query = {
        where: {
            _streak_id: streakId,
            is_delete: 0
        },
        attributes: ['streak_applied_id']
    };
    return streakAppliedMaster.findAll(query).then(sequelize.getValues)
}

const getAppliedStreakById = (streakId) => {
    var query = {
        where: {
            streak_applied_id: streakId,
            is_delete: 0
        },
    };
    return streakAppliedMaster.findOne(query).then(sequelize.getValues)
}

module.exports = {
    addActiveStreak,
    getActiveStreak,
    updateActiveStreakById,
    getAllActiveStreak,
    getAplliedStreakID,
    getActiveStreakForBattle,
    checkActiveStreakForUser,
    totalNumberOfUser,
    totalNumberOfComplete,
    totalNumberOfMiss,
    getUserPlayedStreak,
    getAllAppliedStreakById,
    getAppliedStreakById
}