const appTextMaster = require('../models/app_text_configuration').appTextMaster;
const sequelize = require('../db');
var Sequelize = require('sequelize');

const addText = data => appTextMaster.create({
    ...data
}).then((result) => {
    var response = { status: true, message: "Success! Text added successfully!" }
    return response;
}).catch((error) => {
    var response = { status: false, message: "Error! Invalid data found", error }
    return response;
});


const getAllTexts = () => {

    var query = {
        where: {
            is_delete: 0
        },
        attributes: ['id', 'key', 'value', 'type'],
        order: [['id', 'DESC']]
    };

    return appTextMaster.findAndCountAll(query).then(sequelize.getValues)
}

const getAllTextsForAdmin = (pageNo, dataLimit) => {
    var offset = (pageNo - 1) * dataLimit;

    var query = {
        where: {
            is_delete: 0
        },
        attributes: ['id', 'key', 'value'],
        offset: offset,
        limit: dataLimit,
        order: [['id', 'DESC']]
    };

    return appTextMaster.findAndCountAll(query).then(sequelize.getValues)
}




const getTextById = (id) => {
    var query = {
        where: {
            id: id
        },
        attributes: ['id', 'key', 'value'],
    };
    return appTextMaster.findOne(query).then(sequelize.getValues)
}

const getTextByKey = async (key) => {
    var query = {
        where: {
            key: key
        },
        attributes: ['id', 'key', 'value'],
    };
    return appTextMaster.findOne(query).then(sequelize.getValues)
}

const updateTextById = (data, query) => {
    return appTextMaster.update(data, query).then(function ([rowsUpdate, [updatedText]]) {
        return updatedText;
    })
}


module.exports = {
    addText,
    getAllTexts,
    updateTextById,
    getTextById,
    getAllTextsForAdmin,
    getTextByKey
}