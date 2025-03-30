var appSettingService = require('../services/app_setting');
const config = require('../config');


// function addGrade(req, res) {
//     const gradeDetails = req.body;
//     return appSettingService.addGrade(gradeDetails).then(data => res.send(data));
// };

function getSettings(req, res) {
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;

    return appSettingService.getSettings(pageNo, dataLimit).then(result => {

        if (result) {
            var response = { status: true, data: result }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });
};

// function getGradeById(req, res) {
//     const { gradeId } = req.params;
//     if (gradeId) {
//         return appSettingService.getGradeById(gradeId).then(result => {
//             var response = { status: true, data: result }
//             res.send(response);
//         });
//     } else {
//         var response = { status: false, message: 'Invalid params!' };
//         res.send(response);
//     }
// };

// function updateGradeById(req, res) {
//     const gradeDetails = req.body;
//     return appSettingService.getGradeById(gradeDetails.id).then(result => {
//         if (result) {
//             return appSettingService.updateGradeById(gradeDetails, {
//                 returning: true, where: { grade_id: gradeDetails.id }
//             }).then(result => {
//                 if (result) {
//                     var response = { status: true, data: result }
//                 } else {
//                     var response = { status: false, message: "Grade not updated!" }
//                 }
//                 res.send(response)
//             })
//         } else {
//             var response = { status: false, message: "No grade found for update detail!" }
//             res.send(response);
//         }
//     })
// };

module.exports = {
    // addGrade,
    getSettings,
    // getGradeById,
    // updateGradeById
}