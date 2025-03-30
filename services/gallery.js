const galleryMaster = require('../models/gallery_master').galleryMaster;
const sequelize = require('../db');
var Sequelize = require('sequelize');

const addImage = data => galleryMaster.create({
    ...data
}).then((result) => {
    var response = { status: true, message: "Success! Image added successfully!" }
    return response;
}).catch((error) => {
    var response = { status: false, message: "Error! Invalid data found", error }
    return response;
});

const getImages = (pageNo, dataLimit) => {
    var offset = (pageNo - 1) * dataLimit;

    var query = {
        where: {
            is_delete: 0
        },
        attributes: ['image_id', 'image'],
        offset: offset,
        limit: dataLimit,
        order: [['image_id', 'DESC']]
    };

    return galleryMaster.findAll(query).then(sequelize.getValues)
}

const getImageById = (id) => {
    var query = {
        where: {
            image_id: id
        },
        attributes: ['image_id', 'image'],
    };
    return galleryMaster.findOne(query).then(sequelize.getValues)
}


module.exports = {
    addImage,
    getImages,
    getImageById,
}