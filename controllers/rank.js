var rankService = require('../services/rank');
const config = require('../config');
var multer = require('multer');
const mkdirp = require('mkdirp');

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        var path = config.uploadDir + config.rankImagePath;
        mkdirp(path, err => callback(null, path))
    },
    filename: function (req, file, callback) {
        callback(null, 'rank_image_' + Date.now());
    }
});

var upload = multer({ storage: storage }).single('rank_image');

function addRank(req, res) {

    upload(req, res, function (err) {
        var rankDetails = {};
        rankDetails.rank_image = req.file !== undefined ? req.file.filename : 'default';
        rankDetails.rank_name = (req.body.rank_name) ? req.body.rank_name : "";
        rankDetails.potato_quantity = (req.body.potato_quantity) ? (req.body.potato_quantity) * 1 : 0;

        return rankService.addRank(rankDetails).then(data => res.send(data));
    });

};

function getAllRanks(req, res) {
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;

    return rankService.getAllRanks(pageNo, dataLimit).then(result => {
        if (result) {
            let serverURL = config.getServerUrl(req)
            result.rows.forEach((rank) => {
                rank['rank_image'] = serverURL + config.rankImagePath + rank['rank_image'];
            })
            var response = { status: true, count: result.count, data: result.rows };
        } else {
            var response = { status: false, message: config.no_data_message };
        }
        res.send(response);
    });
};

function getRankById(req, res) {
    const { rankId } = req.params;
    if (rankId) {
        return rankService.getRankById(rankId).then(result => {
            let serverURL = config.getServerUrl(req)
            result['rank_image'] = serverURL + config.rankImagePath + result['rank_image'];
            var response = { status: true, data: result };
            res.send(response);
        })
    } else {
        var response = { status: false, message: config.no_data_message };
        res.send(response);
    }
};

function updateRankById(req, res) {
    upload(req, res, function (err) {
        const body = req.body;
        var rankId = body.id;
        return rankService.getRankById(body.id).then(result => {
            if (result) {
                var rankDetails = {};
                if (body.is_delete) {
                    rankDetails.is_delete = 1;
                }
                else {
                    rankDetails.rank_image = req.file !== undefined ? req.file.filename : result.rank_image;
                    rankDetails.rank_name = (req.body.rank_name) ? req.body.rank_name : "";
                    rankDetails.potato_quantity = (req.body.potato_quantity) ? (req.body.potato_quantity) * 1 : 0;
                }
                return rankService.updateRankById(rankDetails, {
                    returning: true, where: { rank_id: rankId }
                }).then(result => {
                    if (result) {
                        var response = { status: true, data: result }
                    } else {
                        var response = { status: false, message: "Rank not updated!" }
                    }
                    res.send(response)
                })
            } else {
                var response = { status: false, message: "No rank found for update detail!" }
                res.send(response);
            }
        })
    })
};


module.exports = {
    addRank,
    getAllRanks,
    getRankById,
    updateRankById
}