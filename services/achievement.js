const achievementMaster = require('../models/achievement_master').achievementMaster;
const sequelize = require('../db');

const addAchievement = data => achievementMaster.create({
    ...data
}).then((result) => {
    var response = { status: true, message: "Success! Achievement added successfully!" }
    return response;
}).catch((error) => {
    var response = { status: false, message: "Error! Invalid data found", error }
    return response;
});

const getAllAchievements = (pageNo, dataLimit) => {
    var offset = (pageNo - 1) * dataLimit;
    var query = {
        where: {
            is_delete: 0
        },
        attributes: ['achievement_id', '_course_id', 'title', 'achievement_image', 'potato_quantity', 'quiz_type', 'gamification_mechanics',
            'duration', 'daily', 'start_date', 'end_date', 'gem_reward'],
        offset: offset,
        limit: dataLimit,
        order: [['achievement_id', 'DESC']]
    };

    return achievementMaster.findAll(query).then(sequelize.getValues)
};

const getAchievementById = (id) => {
    var query = {
        where: {
            achievement_id: id
        },
        attributes: ['achievement_id', '_course_id', 'title', 'achievement_image', 'potato_quantity', 'quiz_type', 'gamification_mechanics',
            'duration', 'daily', 'start_date', 'end_date', 'gem_reward'],
    };
    return achievementMaster.findOne(query).then(sequelize.getValues)
};

const updateAchievementById = (data, query) => {
    return achievementMaster.update(data, query).then(function ([rowsUpdate, [updatedCoin]]) {
        return updatedCoin;
    })
};

module.exports = {
    addAchievement,
    getAllAchievements,
    getAchievementById,
    updateAchievementById,
};