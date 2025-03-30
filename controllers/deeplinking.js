
// var difficultyService = require('../services/de');
const config = require('../config');
const apiEndpint = "/api/v1";

function generateLink(req, res) {
    var user_id = req.user.id;
    if (user_id) {
        var link = config.domain + '/invites?url=potatomath://battleinvite/' + user_id;
        var response = { status: true, data: link }
    }
    else {
        var response = { status: false, message: link }
    }
    res.send(response)
};

module.exports = {
    generateLink
}