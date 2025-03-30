const referralMaster = require('../models/referral_master').referralMaster;
const userMaster = require('../models/app_users_master').userMaster;
const sequelize = require('../db');
var Sequelize = require('sequelize');

const addRecord = data => referralMaster.create({
    ...data
}).then((result) => {
    var response = { status: true, message: "Success! added successfully!", data: data }
    return response;
}).catch((error) => {
    var response = { status: false, message: "Error! Invalid data found", error }
    return response;
});

const getInvitedFriends = (userId, isBattle) => {
    var query = {
        where: {
            _invite_id: userId,
            is_delete: 0
        },
        attributes: ['id', '_user_id', '_invite_id', 'createdAt'],
        include: [
            {
                model: userMaster,
                as: 'linked_user',
                attributes: [
                    'name',
                    'user_image'
                ],
            }
        ],
        order: [['id', 'DESC']]
    };
    if (isBattle) {
        query.where.is_battle = 0;
    }
    return referralMaster.findAll(query).then(sequelize.getValues)
}

const getReferralRecord = (userId, joinedId) => {
    var query = {
        where: {
            _invite_id: userId,
            _user_id: joinedId,
            is_delete: 0
        },
        attributes: ['id', '_user_id', '_invite_id', 'is_battle']
    };
    return referralMaster.findOne(query).then(sequelize.getValues)
}


// const updateReferralRecord = (data, query) => {
//     return referralMaster.update(data, query).then(function ([rowsUpdate, [updatedReferral]]) {
//         return updatedReferral;
//     })
// }

const updateReferralRecord = (data, Id) => {
    const query = {
        returning: true,
        where: {
            id: Id
        }
    };
    return referralMaster.update(data, query)
        .then(
            ([affectedCount, [updatedUser]]) => {
                if (affectedCount > 0) {
                    return { status: true, message: " update successfully!" }
                }
                return { status: false, message: "Something went wrong! Please try again!" }
            }
        ).catch(err => {
            console.log('====', err)
        })
}

module.exports = {
    addRecord,
    getInvitedFriends,
    getReferralRecord,
    updateReferralRecord
}