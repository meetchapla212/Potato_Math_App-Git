const userAvatarMaster = require('../models/user_avatar_master').userAvatarMaster;
const sequelize = require('../db');

const avatarPurchase = data => userAvatarMaster.create({
    ...data
}).then((result) => {
    var response = { status: true, message: "Success! Purchase added successfully!" }
    return response;
}).catch((error) => {
    var response = { status: false, message: "Error! Invalid data found", error }
    return response;
});


const getUserAvatar = (userId) => {
    var query = {
        where: {
            _user_id: userId,
            is_delete: 0
        },
        attributes: ['_avatar_id'],
        // order: [['user_avatar_id', 'ASC']]
    };
    return userAvatarMaster.findAll(query).then(sequelize.getValues)
}

module.exports = {
    avatarPurchase,
    getUserAvatar,
}