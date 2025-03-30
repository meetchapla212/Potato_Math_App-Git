const contactMaster = require('../models/contact_us_request').contactMaster;
const userMaster = require('../models/app_users_master').userMaster;
const sequelize = require('../db');

const addContactUs = data => contactMaster.create({
    ...data
}).then((result) => {
    var response = { status: true, message: "Success! Contact added successfully!" }
    return response;
}).catch((error) => {
    var response = { status: false, message: "Error! Invalid data found", error }
    return response;
});

const getAllContactUs = (pageNo, dataLimit) => {
    var offset = (pageNo - 1) * dataLimit;

    var query = {
        where: {
            is_delete: 0
        },
        attributes: ['contact_id', 'type', 'title', '_user_id', 'description', 'attachment'],
        include: [
            {
                model: userMaster,
                as: 'user',
                attributes: [
                    'name',
                ],
            }
        ],
        offset: offset,
        limit: dataLimit,
        order: [['contact_id', 'DESC']]
    };
    return contactMaster.findAll(query).then(sequelize.getValues)
};

const getContactUsById = (id) => {
    var query = {
        where: {
            contact_id: id
        },
        attributes: ['contact_id', 'type', 'title', '_user_id', 'description', 'attachment'],
        include: [
            {
                model: userMaster,
                as: 'user',
                attributes: [
                    'name',
                ],
            }
        ],
    };
    return contactMaster.findOne(query).then(sequelize.getValues)
};

module.exports = {
    addContactUs,
    getAllContactUs,
    getContactUsById
};
