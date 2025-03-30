var appTextService = require('../services/app_text_configuration');
const config = require('../config');


function addText(req, res) {
    const textDetails = req.body;
    textDetails.type = typeof textDetails.value
    return appTextService.addText(textDetails).then(data => res.send(data));
};

function getAllTexts(req, res) {

    return appTextService.getAllTexts().then(result => {

        if (result) {
            var output = {};
            result.rows.forEach(element => {
                output[element.key] = element.type == 'object' ? JSON.parse(element.value) : element.value
            });
            var response = { status: true, count: result.count, data: output }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });
};

function getAllTextsForAdmin(req, res) {
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;

    return appTextService.getAllTextsForAdmin(pageNo, dataLimit).then(result => {

        if (result) {
            var response = { status: true, count: result.count, data: result.rows }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });
};

function getTextById(req, res) {
    const { id } = req.params;
    if (id) {
        return appTextService.getTextById(id).then(result => {
            var response = { status: true, data: result }
            res.send(response);
        });
    } else {
        var response = { status: false, message: 'Invalid params!' };
        res.send(response);
    }
};

function updateTextById(req, res) {
    const textDetails = req.body;
    return appTextService.getTextById(textDetails.id).then(result => {
        if (result) {
            return appTextService.updateTextById(textDetails, {
                returning: true, where: { id: textDetails.id }
            }).then(result => {
                if (result) {
                    var response = { status: true, data: result }
                } else {
                    var response = { status: false, message: "Text not updated!" }
                }
                res.send(response)
            })
        } else {
            var response = { status: false, message: "No text found for update detail!" }
            res.send(response);
        }
    })
};

module.exports = {
    addText,
    getAllTexts,
    getTextById,
    updateTextById,
    getAllTextsForAdmin
}