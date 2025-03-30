const galleryService = require('../services/gallery');
const config = require('../config');
var multer = require('multer');
const mkdirp = require('mkdirp');

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        var path = config.uploadDir + config.galleryImagePath;
        mkdirp(path, err => callback(null, path))
    },
    filename: function (req, file, callback) {
        callback(null, 'image_' + Date.now());
    }
});

var upload = multer({ storage: storage }).single('image');

function addImage(req, res) {

    upload(req, res, function (err) {
        var imageDetails = {};
        imageDetails.image = req.file !== undefined ? req.file.filename : 'default';
        return galleryService.addImage(imageDetails).then(data => res.send(data))
    });
}

function getImages(req, res) {
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;
    return galleryService.getImages(pageNo, dataLimit).then(result => {
        if (result.length > 0) {
            let serverURL = config.getServerUrl(req)
            result.forEach(element => {
                element['image'] = serverURL + config.galleryImagePath + element['image'];
            });
            var response = { status: true, data: result }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });
}

function getImageById(req, res) {
    const { imageId } = req.params;
    return galleryService.getImageById(imageId).then(result => {
        if (result) {
            let serverURL = config.getServerUrl(req)
            result['image'] = serverURL + config.galleryImagePath + result['image'];
            var response = { status: true, data: result }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    })
}


module.exports = {
    addImage,
    getImages,
    getImageById,
}