const avatarMaster = require('../models/avatar_master').avatarMaster;
const sequelize = require('../db');

const getAllAvatars = (pageNo, dataLimit) => {
    var offset = (pageNo - 1) * dataLimit;
    var query = {
        where: {
            is_delete: 0
        },
        attributes: ['avatar_id', 'avatar_image', 'potato_quantity', 'is_paid'],
        offset: offset,
        limit: dataLimit,
        order: [['avatar_id', 'ASC']]
    };

    return avatarMaster.findAll(query).then(sequelize.getValues)
};

const getAvatarById = (id) => {
    var query = {
        where: {
            avatar_id: id
        },
        attributes: ['avatar_id', 'avatar_image', 'is_paid'],
    };
    return avatarMaster.findOne(query).then(sequelize.getValues)
};

module.exports = {
    getAllAvatars,
    getAvatarById
};