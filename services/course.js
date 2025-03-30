const courseMaster = require('../models/course_master').courseMaster;
const topicMaster = require('../models/topic_master').topicMaster;
const gradeMaster = require('../models/grade_master').gradeMaster;
const sequelize = require('../db');

const addCourse = data => courseMaster.create({
    ...data
}).then((result) => {
    var response = { status: true, message: "Success! Course added successfully!" }
    return response;
}).catch((error) => {
    var response = { status: false, message: "Error! Invalid data found", error }
    return response;
});

const addBulkCourses = (details) =>{
    return courseMaster.bulkCreate(details).then((res) => {
        return { status: true };
    }).catch((error) => {
        return { status: false };
    });
}


const getAllCourses = (pageNo, dataLimit, gradeId) => {
    var offset = (pageNo - 1) * dataLimit;
    if (gradeId) {
        var query = {
            where: {
                _grade_id: gradeId,
                is_delete: 0
            },
            attributes: ['course_id', 'course_name', 'course_image', 'course_details', 'sortIndex'],
            include: [
                {
                    model: topicMaster,
                    as: 'topic_masters',
                    where: {
                        is_delete: 0
                    },
                    attributes: [
                        'topic_id',
                        'topic_name',
                    ],
                },
            ],
            offset: offset,
            limit: dataLimit,
            order: [['sortIndex', 'ASC']]
        };
    }
    else {
        var query = {
            where: {
                is_delete: 0
            },
            attributes: ['course_id', 'course_name', 'course_image', 'course_details', '_grade_id', 'sortIndex'],
            include: [
                {
                    model: topicMaster,
                    as: 'topic_masters',
                    where: {
                        is_delete: 0
                    },
                    attributes: [
                        'topic_id',
                        'topic_name'
                    ],
                },
                {
                    model: gradeMaster,
                    as: 'grade_masters',
                    attributes: [
                        'grade_id',
                        'caption',
                    ],
                },
            ],
            offset: offset,
            limit: dataLimit,
            order: [['sortIndex', 'ASC']]
        };
    }
    return courseMaster.findAndCountAll(query).then(sequelize.getValues)
};

const getAllCoursesByGradesInAdmin = (pageNo, dataLimit, gradeId) => {
    var offset = (pageNo - 1) * dataLimit;
    if (gradeId) {
        var query = {
            where: {
                _grade_id: gradeId,
                is_delete: 0
            },
            attributes: ['course_id', 'course_name', 'course_image', 'course_details', 'sortIndex'],
            include: [
                {
                    model: gradeMaster,
                    as: 'grade_masters',
                    attributes: [
                        'grade_id',
                        'caption',
                    ],
                }
            ],
            offset: offset,
            limit: dataLimit,
            order: [['course_id', 'DESC']]
        };
    }
    return courseMaster.findAndCountAll(query).then(sequelize.getValues)
};

const getCourseById = (id) => {
    var query = {
        where: {
            course_id: id
        },
        attributes: ['course_id', 'course_name', 'course_image', 'course_details', '_grade_id', 'sortIndex'],
    };
    return courseMaster.findOne(query).then(sequelize.getValues)
};

const getCourseByName = (name,gradeId) => {
    var query = {
        where: {
            course_name: name,
            _grade_id:gradeId
        },
        attributes: ['course_id'],
    };
    return courseMaster.findOne(query).then(sequelize.getValues)
};

const updateCourseById = (data, query) => {
    return courseMaster.update(data, query).then(function ([rowsUpdate, [updatedCourse]]) {
        return updatedCourse;
    })
};

const getAllCoursesIdOfGrade = (gradeId) => {
    if (gradeId) {
        var query = {
            where: {
                _grade_id: gradeId,
                is_delete: 0
            },
            attributes: ['course_id'],
            order: [['course_id', 'ASC']]
        };
    }
    return courseMaster.findAll(query).then(sequelize.getValues)
}

module.exports = {
    addCourse,
    getAllCourses,
    getCourseById,
    updateCourseById,
    getAllCoursesIdOfGrade,
    getAllCoursesByGradesInAdmin,
    addBulkCourses,
    getCourseByName
};
