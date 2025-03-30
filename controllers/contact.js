const contactService = require('../services/contact');
const config = require('../config');
var multer = require('multer');
const mkdirp = require('mkdirp');

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        var path = config.uploadDir + config.contactUsFilePath;
        mkdirp(path, err => callback(null, path))
    },
    filename: function (req, file, callback) {
        callback(null, 'attachment_' + Date.now());
    }
});

var upload = multer({ storage: storage }).single('attachment');

function addContactUs(req, res) {
    upload(req, res, function (err) {
        var contactDetails = {};
        contactDetails.attachment = req.file !== undefined ? req.file.filename : 'default';
        contactDetails.type = (req.body.type) ? req.body.type : "";
        contactDetails.title = (req.body.title) ? req.body.title : "";
        contactDetails.description = (req.body.description) ? req.body.description : "";
        contactDetails._user_id = (req.user.id) ? (req.user.id) * 1 : 0;
        return contactService.addContactUs(contactDetails)
            .then(data => res.send(data));
    });
}

function getAllContactUs(req, res) {
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;


    return contactService.getAllContactUs(pageNo, dataLimit).then(result => {
        if (result.length > 0) {
            let serverURL = config.getServerUrl(req)
            result.forEach((contact) => {
                contact.dataValues['user_name'] = contact['user'].name
                delete contact.dataValues['user']
                contact['attachment'] = serverURL + config.contactUsFilePath + contact['attachment'];
            })
            var response = { status: true, data: result }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });
}

function getContactUsById(req, res) {
    const { contactId } = req.params;
    return contactService.getContactUsById(contactId).then(result => {
        if (result) {
            let serverURL = config.getServerUrl(req)
            result.dataValues['user_name'] = result['user'].name
            delete result.dataValues['user']
            result['attachment'] = serverURL + config.contactUsFilePath + result['attachment'];
            var response = { status: true, data: result };
        } else {
            var response = { status: false, message: config.no_data_message };
        }
        res.send(response)
    })
}




module.exports = {
    addContactUs,
    getAllContactUs,
    getContactUsById,
}