const gradeMaster = require('../models/grade_master').gradeMaster;
const courseMaster = require('../models/course_master').courseMaster;
const topicMaster = require('../models/topic_master').topicMaster;
const sequelize = require('../db');

const addGrade = data => gradeMaster.create({
    ...data
}).then((result) => {
    var response = { status: true, message: "Success! Grade added successfully!" }
    return response;
}).catch((error) => {
    var response = { status: false, message: "Error! Invalid data found", error }
    return response;
});


const getAllGrades = (pageNo, dataLimit) => {
    var offset = (pageNo - 1) * dataLimit;
    var query = {
        where: {
            is_delete: 0
        },
        attributes: ['grade_id', 'age', 'caption', 'category'],
        include: [
            {
                model: courseMaster,
                as: 'course_masters',
                where: {
                    is_delete: 0
                },
                attributes: [
                    'course_id',
                    'course_name'
                ],
            }
        ],
        offset: offset,
        limit: dataLimit,
        order: [['grade_id', 'DESC']]
    };

    return gradeMaster.findAndCountAll(query).then(sequelize.getValues)
};

const getAllGradesForApp = (pageNo, dataLimit) => {
    // var offset = (pageNo - 1) * dataLimit;
    var query = {
        where: {
            is_delete: 0
        },
        attributes: ['grade_id', 'age', 'caption', 'category'],
        // offset: offset,
        // limit: dataLimit,
        order: [['grade_id', 'DESC']]
    };

    return gradeMaster.findAndCountAll(query).then(sequelize.getValues)
};

const getAllGradesForAdmin = (pageNo, dataLimit) => {
    var offset = (pageNo - 1) * dataLimit;
    var query = {
        where: {
            is_delete: 0
        },
        attributes: ['grade_id', 'age', 'caption', 'category'],
        offset: offset,
        limit: dataLimit,
        order: [['grade_id', 'DESC']]
    };

    return gradeMaster.findAndCountAll(query).then(sequelize.getValues)
};


const getGradeById = (id) => {
    var query = {
        where: {
            grade_id: id
        },
        attributes: ['grade_id', 'age', 'caption', 'category'],
    };
    return gradeMaster.findOne(query).then(sequelize.getValues)
};


const updateGradeById = (data, query) => {
    return gradeMaster.update(data, query).then(function ([rowsUpdate, [updatedGrade]]) {
        return updatedGrade;
    })
};


module.exports = {
    addGrade,
    getAllGrades,
    getGradeById,
    updateGradeById,
    getAllGradesForAdmin,
    getAllGradesForApp
};
