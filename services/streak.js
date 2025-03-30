const streakMaster = require('../models/streak_master').streakMaster;
const streakAppliedMaster = require('../models/streak_applied_master').streakAppliedMaster;
const courseMaster = require('../models/course_master').courseMaster;
const sequelize = require('../db');
var Sequelize = require('sequelize');

const addStreak = data => streakMaster.create({
    ...data
}).then((result) => {
    var response = { status: true, message: "Success! Streak added successfully!" }
    return response;
}).catch((error) => {
    var response = { status: false, message: "Error! Invalid data found", error }
    return response;
});


const getAllStreaks = (pageNo, dataLimit) => {
    var offset = (pageNo - 1) * dataLimit;
    var query = {
        where: {
            is_delete: 0
        },
        attributes: ['streak_id', 'streak_name', 'streak_image', 'streak_details', 'streak_time', 'streak_type', '_course_id', '_grade_id', 'potato_quantity', 'gams'],
        offset: offset,
        limit: dataLimit,
        order: [['streak_id', 'DESC']]
    };
    return streakMaster.findAndCountAll(query).then(sequelize.getValues)
}

const getUnplayedStreak = (appliedID, gradeId) => {
    var query = {
        where: {
            is_delete: 0,
            streak_id: {
                [Sequelize.Op.not]: appliedID
            },
            _grade_id: gradeId
        },
        attributes: ['streak_id', 'streak_name', 'streak_image', 'streak_details', 'streak_time', 'streak_type', '_course_id', '_grade_id', 'potato_quantity', 'gams'],
        include: [
            {
                model: courseMaster,
                as: 'streak_course',
                attributes: [
                    'course_name'
                ],
            }
        ],
        limit: 1,
        order: [['streak_id', 'DESC']]
    };
    return streakMaster.findAll(query).then(sequelize.getValues)
}


const getStreakById = (id) => {
    var query = {
        where: {
            streak_id: id
        },
        attributes: ['streak_id', 'streak_name', 'streak_image', 'streak_details', 'streak_type', 'streak_time', '_course_id', '_grade_id', 'potato_quantity', 'gams'],
    };
    return streakMaster.findOne(query).then(sequelize.getValues)
}


const updateStreakById = (data, query) => {
    return streakMaster.update(data, query).then(function ([rowsUpdate, [updatedStreak]]) {
        return updatedStreak;
    })
}



module.exports = {
    addStreak,
    getAllStreaks,
    getStreakById,
    updateStreakById,
    getUnplayedStreak
}