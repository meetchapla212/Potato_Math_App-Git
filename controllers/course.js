const courseService = require('../services/course');
const resultService = require('../services/result');
const battle_result = require('../services/battle_result');
const question_map = require('../services/question_map');
const config = require('../config');
var multer = require('multer');
const mkdirp = require('mkdirp');

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        var path = config.uploadDir + config.courseImagePath;
        mkdirp(path, err => callback(null, path))
    },
    filename: function (req, file, callback) {
        callback(null, 'course_image_' + Date.now());
    }
});

var upload = multer({ storage: storage }).single('course_image');

function addCourse(req, res) {
    upload(req, res, function (err) {
        var _admin_id = req.adminuser.id;
        var courseDetails = {};
        courseDetails.course_image = req.file !== undefined ? req.file.filename : 'default';
        courseDetails.course_name = (req.body.course_name) ? req.body.course_name : "";
        courseDetails.course_details = (req.body.course_details) ? req.body.course_details : "";
        courseDetails._grade_id = (req.body._grade_id) ? (req.body._grade_id) * 1 : 0;
        courseDetails._admin_id = (_admin_id) * 1;
        courseDetails.sortIndex = (req.body.sortIndex) ? (req.body.sortIndex) * 1 : 0;
        return courseService.addCourse(courseDetails)
            .then(data => res.send(data));
    });
}

async function PotatoInUserBattleCourse(userId, courseId) {
    return battle_result.PotatoInUserBattleCourse(userId, courseId).then(userBattlePotato => {
        if (userBattlePotato[0] !== undefined) {
            return (userBattlePotato[0].dataValues.user_total_potato) * 1
        }
        else {
            return 0
        }
    })
}

async function PotatoInOpponentBattleCourse(userId, courseId) {
    return battle_result.PotatoInOpponentBattleCourse(userId, courseId).then(opponentBattlePotato => {
        if (opponentBattlePotato[0] !== undefined) {
            return (opponentBattlePotato[0].dataValues.opponent_total_potato) * 1
        }
        else {
            return 0
        }
    })
}

async function PotatoInCourse(userId, courseId) {
    return resultService.PotatoInCourse(userId, courseId).then(potato => {
        if (potato[0] !== undefined) {
            return (potato[0].dataValues.total_potato) * 1
        } else {
            return 0
        }
    })
}

function getAllCourses(req, res) {
    const { gradeId } = req.params;
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;

    if (gradeId) {
        var userId = req.user.id
        return courseService.getAllCourses(pageNo, dataLimit, gradeId).then(result => {
            if (result.rows.length > 0) {
                let serverURL = config.getServerUrl(req)
                const potatoFunction = async (course) => {
                    var finalPotato = 0;
                    course['course_image'] = serverURL + config.courseImagePath + course['course_image'];


                    var PotatoInUserBattle = await PotatoInUserBattleCourse(userId, course['course_id']);
                    finalPotato = finalPotato + PotatoInUserBattle;

                    var PotatoInOpponentBattle = await PotatoInOpponentBattleCourse(userId, course['course_id']);
                    finalPotato = finalPotato + PotatoInOpponentBattle;

                    var potatoInSolo = await PotatoInCourse(userId, course['course_id']);
                    finalPotato = finalPotato + potatoInSolo;

                    course.dataValues.total_potato = finalPotato
                    return course

                }

                return Promise.all(result.rows.map(resData => potatoFunction(resData)))
                    .then(data => {
                        var response = { status: true, counts: result.count, data: data }
                        res.send(response);
                    })
            } else {
                var response = { status: false, message: config.no_data_message }
                res.send(response)
            }
        });
    }
    else {
        return courseService.getAllCourses(pageNo, dataLimit).then((result) => {

            if (result.rows.length > 0) {
                let serverURL = config.getServerUrl(req)

                const courseFunction = async (course) => {
                    course['course_image'] = serverURL + config.courseImagePath + course['course_image'];
                    course.dataValues['totalAppearance'] = await question_map.totalNumberOfCourse(course['course_id']);
                    return course

                }

                return Promise.all(result.rows.map(resData => courseFunction(resData)))
                    .then(data => {
                        var response = { status: true, counts: result.count, data: data }
                        res.send(response);
                    })
            } else {
                var response = { status: false, message: config.no_data_message }
            }
            res.send(response)
        });
    }
}


function getAllCoursesByGradesInAdmin(req, res) {
    const { gradeId } = req.params;
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;

    if (gradeId) {
        return courseService.getAllCoursesByGradesInAdmin(pageNo, dataLimit, gradeId).then(result => {
            if (result) {
                let serverURL = config.getServerUrl(req)

                const courseFunction = async (course) => {
                    course['course_image'] = serverURL + config.courseImagePath + course['course_image'];
                    course.dataValues['totalAppearance'] = await question_map.totalNumberOfCourse(course['course_id']);
                    return course

                }

                return Promise.all(result.rows.map(resData => courseFunction(resData)))
                    .then(data => {
                        var response = { status: true, counts: result.count, data: data }
                        res.send(response);
                    })
            } else {
                var response = { status: false, message: config.no_data_message }
                res.send(response)
            }
        });
    }
    else {
        return courseService.getAllCoursesByGradesInAdmin(pageNo, dataLimit).then(result => {
            if (result) {
                let serverURL = config.getServerUrl(req)

                const courseFunction = async (course) => {
                    course['course_image'] = serverURL + config.courseImagePath + course['course_image'];
                    course.dataValues['totalAppearance'] = await question_map.totalNumberOfCourse(course['course_id']);
                    return course

                }

                return Promise.all(result.rows.map(resData => courseFunction(resData)))
                    .then(data => {
                        var response = { status: true, counts: result.count, data: data }
                        res.send(response);
                    })
            } else {
                var response = { status: false, message: config.no_data_message }
                res.send(response)
            }
        });
    }
}

function getCourseById(req, res) {
    const { courseId } = req.params;
    return courseService.getCourseById(courseId).then(result => {
        if (result) {
            let serverURL = config.getServerUrl(req)
            result['course_image'] = serverURL + config.courseImagePath + result['course_image'];
            var response = { status: true, data: result };
        } else {
            var response = { status: false, message: config.no_data_message };
        }
        res.send(response)
    })
}

function updateCourseById(req, res) {
    upload(req, res, function (err) {
        const body = req.body;
        var courseId = body.id;
        return courseService.getCourseById(body.id).then(result => {
            if (result) {
                var courseDetails = {};
                if (body.is_delete) {
                    courseDetails.is_delete = 1;
                }
                else {
                    courseDetails.course_image = req.file !== undefined ? req.file.filename : result.course_image;
                    courseDetails.course_name = (req.body.course_name) ? req.body.course_name : "";
                    courseDetails.course_details = (req.body.course_details) ? req.body.course_details : "";
                    courseDetails._grade_id = (req.body._grade_id) ? req.body._grade_id : "";
                    courseDetails.sortIndex = (req.body.sortIndex) ? (req.body.sortIndex) * 1 : 0;
                }
                return courseService.updateCourseById(courseDetails, {
                    returning: true, where: { course_id: courseId }
                }).then(result => {
                    if (result) {
                        var response = { status: true, data: result }
                    } else {
                        var response = { status: false, message: "Course not updated!" }
                    }
                    res.send(response)
                })
            } else {
                var response = { status: false, message: "No course found for update detail!" }
                res.send(response);
            }
        })
    })
}


module.exports = {
    addCourse,
    getAllCourses,
    getCourseById,
    updateCourseById,
    getAllCoursesByGradesInAdmin
}