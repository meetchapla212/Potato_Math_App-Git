var gradeService = require('../services/grade');
const config = require('../config');


function addGrade(req, res) {
    var _admin_id = req.adminuser.id;
    const gradeDetails = req.body;
    gradeDetails._admin_id = (_admin_id) * 1;
    return gradeService.addGrade(gradeDetails).then(data => res.send(data));
};

function getAllGradesForApp(req, res) {
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;

    return gradeService.getAllGradesForApp(pageNo, dataLimit).then(result => {

        if (result) {
            var response = { status: true, count: result.count, data: result.rows }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });
};

function getAllGrades(req, res) {
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;

    return gradeService.getAllGrades(pageNo, dataLimit).then(result => {

        if (result) {
            var response = { status: true, count: result.count, data: result.rows }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });
};

function getAllGradesForAdmin(req, res) {
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;

    return gradeService.getAllGradesForAdmin(pageNo, dataLimit).then(result => {

        if (result) {
            var response = { status: true, count: result.count, data: result.rows }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });
};

function getGradeById(req, res) {
    const { gradeId } = req.params;
    if (gradeId) {
        return gradeService.getGradeById(gradeId).then(result => {
            var response = { status: true, data: result }
            res.send(response);
        });
    } else {
        var response = { status: false, message: 'Invalid params!' };
        res.send(response);
    }
};

function updateGradeById(req, res) {
    const gradeDetails = req.body;
    return gradeService.getGradeById(gradeDetails.id).then(result => {
        if (result) {
            return gradeService.updateGradeById(gradeDetails, {
                returning: true, where: { grade_id: gradeDetails.id }
            }).then(result => {
                if (result) {
                    var response = { status: true, data: result }
                } else {
                    var response = { status: false, message: "Grade not updated!" }
                }
                res.send(response)
            })
        } else {
            var response = { status: false, message: "No grade found for update detail!" }
            res.send(response);
        }
    })
};

module.exports = {
    addGrade,
    getAllGrades,
    getGradeById,
    updateGradeById,
    getAllGradesForAdmin,
    getAllGradesForApp
}