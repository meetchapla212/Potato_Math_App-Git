const badgeMaster = require('../models/badge_master').badgeMaster;
const sequelize = require('../db');

const addBadge = data => badgeMaster.create({
    ...data
}).then((result) => {
    var response = { status: true, message: "Success! Badge added successfully!" }
    return response;
}).catch((error) => {
    var response = { status: false, message: "Error! Invalid data found", error }
    return response;
});


const getAllBadges = (pageNo, dataLimit) => {
    var offset = (pageNo - 1) * dataLimit;
    var query = {
        where: {
            is_delete: 0
        },
        attributes: ['badge_id', 'badge_name', 'badge_image', 'badge_details', '_course_id', '_grade_id', 'potato_quantity'],
        offset: offset,
        limit: dataLimit,
        order: [['badge_id', 'DESC']]
    };
    return badgeMaster.findAndCountAll(query).then(sequelize.getValues)
}


const getBadgeById = (id) => {
    var query = {
        where: {
            badge_id: id
        },
        attributes: ['badge_id', 'badge_name', 'badge_image', 'badge_details', '_course_id', '_grade_id', 'potato_quantity'],
    };
    return badgeMaster.findOne(query).then(sequelize.getValues)
}

const getBadgeByPotatoQuantity = (courseId, quantity) => {
    var query = {
        where: {
            _course_id: courseId,
            potato_quantity: quantity
        },
        attributes: ['badge_id', 'badge_name', 'badge_image', 'badge_details', '_course_id', '_grade_id', 'potato_quantity'],
    };
    return badgeMaster.findOne(query).then(sequelize.getValues)
}


const updateBadgeById = (data, query) => {
    return badgeMaster.update(data, query).then(function ([rowsUpdate, [updatedBadge]]) {
        return updatedBadge;
    })
}

const getBadgePotatoByCourse = (courseId) => {
    var query = {
        where: {
            _course_id: courseId
        },
        attributes: ['potato_quantity'],
    };
    return badgeMaster.findAll(query).then(sequelize.getValues)
}

const getBadgeByCourse = (courseId) => {
    var query = {
        where: {
            _course_id: courseId,
            is_delete: 0
        },
        attributes: ['badge_id', 'badge_name', 'badge_image', 'badge_details', '_course_id', '_grade_id', 'potato_quantity'],
    };
    return badgeMaster.findAll(query).then(sequelize.getValues)
}

const getBadgeArray = (courseId) => {
    var query = {
        where: {
            _course_id: courseId
        },
        attributes: ['potato_quantity'],
    };
    return badgeMaster.findAll(query).then(sequelize.getValues)
}



module.exports = {
    addBadge,
    getAllBadges,
    getBadgeById,
    updateBadgeById,
    getBadgePotatoByCourse,
    getBadgeByPotatoQuantity,
    getBadgeByCourse,
    getBadgeArray
}