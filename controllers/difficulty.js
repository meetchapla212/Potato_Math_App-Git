var difficultyService = require('../services/difficulty');
const config = require('../config');


function getAllDifficulties(req, res) {
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;

    return difficultyService.getAllDifficulties(pageNo, dataLimit).then(result => {
        if (result) {
            var response = { status: true, data: result }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });
};

module.exports = {
    getAllDifficulties,
}