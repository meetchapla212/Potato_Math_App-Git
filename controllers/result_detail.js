var resultDetailService = require('../services/result_detail');
const config = require('../config');


function addResultDeatil(req, res) {
    const resultDetails = req.body;
    resultDetails._result_id = (resultDetails._result_id) ? (resultDetails._result_id) * 1 : 0;
    resultDetails._question_id = (resultDetails._question_id) ? (resultDetails._question_id) * 1 : 0;
    resultDetails._map_id = (resultDetails._map_id) ? (resultDetails._map_id) * 1 : 0;
    resultDetails.time = (resultDetails.time) ? (resultDetails.time) * 1 : 0;
    resultDetails.potato = (resultDetails.potato) ? (resultDetails.potato) * 1 : 0;
    resultDetails.user_answer = (resultDetails.user_answer) ? resultDetails.user_answer : '';
    resultDetails.answer_status = (resultDetails.answer_status) ? resultDetails.answer_status : '';
    return resultDetailService.addResultDeatil(resultDetails).then(data => res.send(data));
};


module.exports = {
    addResultDeatil,
}