const userMaster = require('../models/app_users_master').userMaster;
const gradeMaster = require('../models/grade_master').gradeMaster;
const resultMaster = require('../models/result_master').resultMaster;
const battleMaster = require('../models/battle_result_master').battleMaster;
const sequelize = require('../db');
const config = require('../config');
const CustomError = require('../customError');
var Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
var crypto = require('crypto');
const Op = Sequelize.Op;

const checkEmailExist = email_id => userMaster.findOne({
    where: { email_id, is_delete: 0 }
});
const checkEmailExistForUpdate = (email_id, user_id) => userMaster.findOne({
    where: { email_id, is_delete: 0, user_id: { [Sequelize.Op.ne]: user_id } }
});
const checkUsernameExist = username => {
    //  here name as username field 
    return userMaster.findOne({
        where: { name: username, is_delete: 0 }
    });
}
const checkUsernameExistForUpdate = (username, user_id) => userMaster.findOne({
    where: { username, is_delete: 0, user_id: { [Sequelize.Op.ne]: user_id } }
});
const checkAccountIdExist = account_id => userMaster.findOne({
    where: { account_id, is_delete: 0 }
});

const getUserDetails = (id) => {
    const query = {
        where: {
            user_id: id,
            is_verified: 1
        },
        attributes: [
            'login_type', 'user_id', '_coin_id', 'name', 'username', 'email_id', 'user_image', '_grade_id', 'potato_earn', 'gams_earn', 'coins_earn', 'last_login_date', 'last_notification_date', 'stripe_customer_id', 'coin_spent', 'onboarding_potato', 'otp_number', '_streak_applied_id', 'iap_subscription', 'device_type', 'is_friend_request_allow', 'is_challenge_request_allow', 'is_leaderboards_allow', 'is_practice_reminder'
        ]
    };
    return userMaster.findOne(query).then(sequelize.getValues)
};

const getUserByEmail = (email) => {
    const query = {
        where: {
            login_type: 'normal',
            email_id: email
        },
    };
    return userMaster.findOne(query).then(sequelize.getValues)
};

const getUserDetailsForVarification = (emailToken, email) => {
    const query = {
        where: {
            email_token: emailToken,
            email_id: email
        },
        attributes: [
            'user_id', 'is_verified'
        ]
    };
    return userMaster.findOne(query).then(sequelize.getValues)
};

const getUserRankInLeaderBoard = async (potato, gradeId) => {
    var whereStatement = {};
    whereStatement.is_delete = 0;
    whereStatement._grade_id = gradeId
    whereStatement.potato_earn = {
        [Sequelize.Op.gte]: potato,
    }
    var query = {
        where: whereStatement
    };
    return userMaster.count(query).then(sequelize.getValues)
}

const getUserDetailsByCustomerId = (id) => {
    const query = {
        where: {
            stripe_customer_id: id
        },
        attributes: [
            'user_id', 'name', 'username', 'email_id', 'user_image', '_grade_id', 'potato_earn', 'gams_earn', 'coins_earn', '_coin_id'
        ]
    };
    return userMaster.findOne(query).then(sequelize.getValues)
};

const getMultipleUserDetails = (friendArray) => {
    const query = {
        where: {
            user_id: {
                [Sequelize.Op.in]: friendArray
            },
            is_verified: 1
        },
        attributes: [
            'user_id', 'name', 'username', 'email_id', 'user_image', '_grade_id', 'potato_earn', 'gams_earn', 'coins_earn'
        ]
    };
    return userMaster.findAll(query).then(sequelize.getValues)
};

const getUserName = (data) => {
    var whereStatement = {};
    whereStatement.is_delete = 0;
    if (data.name && data.name != '') {
        whereStatement.name = {
            [Sequelize.Op.like]: '%' + data.name + '%'
        }
    }
    const query = {
        where: whereStatement,
        attributes: [
            'user_id', 'name'
        ]
    };
    return userMaster.findAll(query).then(sequelize.getValues)
}

const getAllUsers = (pageNo, dataLimit, user_id) => {
    var offset = (pageNo - 1) * dataLimit;
    var query = {
        where: {
            is_delete: 0,
            is_verified: 1,
            user_id: { [Sequelize.Op.ne]: user_id }
        },
        attributes: ['user_id', 'name', 'username', 'email_id', 'user_image', '_grade_id', 'potato_earn', 'gams_earn', 'coins_earn'],
        offset: offset,
        limit: dataLimit,
        order: [['user_id', 'DESC']]
    };

    return userMaster.findAll(query).then(sequelize.getValues)
};

const getUsers = (pageNo, dataLimit, gradeId) => {
    var offset = (pageNo - 1) * dataLimit;
    var query = {
        where: {
            is_delete: 0,
            is_verified: 1
        },
        attributes: ['user_id', 'name', 'username', 'email_id', 'user_image', 'login_type', '_grade_id', 'potato_earn', 'gams_earn', 'coins_earn', 'stripe_customer_id',
            'last_4digit', '_coin_id', 'plan_start_date', 'plan_end_date', 'createdAt'],
        include: [
            {
                model: gradeMaster,
                as: 'user_grade',
                attributes: [
                    'caption'
                ]
            }
        ],
        offset: offset,
        limit: dataLimit,
        order: [['user_id', 'ASC']]
    };
    if (gradeId) {
        query.where._grade_id = gradeId
    }
    return userMaster.findAndCountAll(query).then(sequelize.getValues)
};
const getallUserforplan_end_date = (today) => {
    var query = {
        where: {
            is_delete: 0,
            is_verified: 1,
            iap_subscription: true,
            plan_end_date: {
                [Op.lte]: today
            }
        },
        attributes: ['user_id', 'name', 'plan_start_date', 'plan_end_date', '_coin_id', 'coins_earn', 'device_type']
    };
    return userMaster.findAll(query).then(sequelize.getValues)

}
const getUsersForOpponent = (gradeId, userId) => {
    // var offset = (pageNo - 1) * dataLimit;
    var query = {
        where: {
            is_delete: 0,
            is_verified: 1,
            user_id: { [Sequelize.Op.ne]: userId }
        },
        attributes: ['user_id'],
        order: [['user_id', 'ASC']]
    };
    if (gradeId) {
        query.where._grade_id = gradeId
    }
    return userMaster.findAll(query).then(sequelize.getValues)
};

const getSuggestionFriend = (pageNo, dataLimit, data, friendArray) => {
    var whereStatement = {};
    whereStatement.is_delete = 0;
    whereStatement.is_verified = 1;
    if (friendArray)
        whereStatement.user_id = {
            [Sequelize.Op.not]: friendArray
        }
    if (data.name) {
        whereStatement.name = {
            [Sequelize.Op.like]: '%' + data.name + '%'
        }
    }
    var offset = (pageNo - 1) * dataLimit;
    var query = {
        where: whereStatement,
        attributes: ['user_id', 'name', 'username', 'email_id', 'user_image', '_grade_id', 'potato_earn', 'gams_earn', 'coins_earn'],
        offset: offset,
        limit: dataLimit,
        order: [['user_id', 'DESC']]
    };

    return userMaster.findAll(query).then(sequelize.getValues)
};

const getMainLeaderBoard = (pageNo, dataLimit, data, gradeId) => {
    var whereStatement = {};
    whereStatement.is_delete = 0;
    whereStatement.is_verified = 1;
    whereStatement._grade_id = gradeId;
    if (data.name) {
        whereStatement.name = {
            [Sequelize.Op.like]: '%' + data.name + '%'
        }

    }
    var offset = (pageNo - 1) * dataLimit;
    var query = {
        where: whereStatement,
        attributes: ['user_id', 'name', 'user_image', 'potato_earn'],
        include: [
            {
                model: gradeMaster,
                as: 'user_grade',
                attributes: [
                    'caption'
                ]
            }
        ],
        offset: offset,
        limit: dataLimit,
        order: [['potato_earn', 'DESC']]
    };

    return userMaster.findAll(query).then(sequelize.getValues)
};

const updateUserProfile = (data, userId) => {
    const query = {
        returning: true,
        where: {
            user_id: userId
        }
    };
    return userMaster.update(data, query)
        .then(
            ([affectedCount, [updatedUser]]) => {
                if (affectedCount > 0) {
                    return { status: true, message: "Profile update successfully!", data: updatedUser }
                }
                return { status: false, message: "Something went wrong! Please try again!" }
            }
        ).catch(err => {
            console.log('====', err)
        })
}

const authenticate = params => {
    return userMaster.findOne({
        where: {
            email_id: params.email_id,
        },
        raw: true
    }).then(user => {
        if (!user)
            throw new CustomError('Account not Found!');
        if (user.login_type != 'normal') {
            throw new CustomError('Account already exists with this email address!')
        }
        const password = crypto.createHmac('sha256', config.jwtSecret).update(params.password).digest('hex');
        if (user.password !== password)
            throw new CustomError('Invalid Password.')

        const payload = {
            name: user.name,
            username: user.username,
            email_id: user.email_id,
            id: user.user_id,
            time: new Date()
        };

        var token = jwt.sign(payload, config.jwtSecret, {
            expiresIn: config.appTokenExpireTime
        });
        var appUserDetails = {};
        appUserDetails.user_id = (user.user_id) ? user.user_id : 0;
        appUserDetails.name = (user.name) ? user.name : '';
        appUserDetails.username = (user.username) ? user.username : '';
        appUserDetails.email_id = (user.email_id) ? user.email_id : '';
        appUserDetails.user_image = (user.user_image) ? user.user_image : 'default.png';
        appUserDetails._grade_id = (user._grade_id) ? user._grade_id : 0;
        appUserDetails.potato_earn = (user.potato_earn) ? user.potato_earn : 0;
        appUserDetails.gams_earn = (user.gams_earn) ? user.gams_earn : 0;
        appUserDetails.coins_earn = (user.coins_earn) ? user.coins_earn : 0;
        appUserDetails.last_login_date = (user.last_login_date) ? user.last_login_date : '';
        appUserDetails._coin_id = (user._coin_id) ? user._coin_id : '';
        appUserDetails.is_verified = user.is_verified;
        appUserDetails.is_friend_request_allow = user.is_friend_request_allow;
        appUserDetails.is_challenge_request_allow = user.is_challenge_request_allow;
        appUserDetails.is_leaderboards_allow = user.is_leaderboards_allow;
        appUserDetails.is_practice_reminder = user.is_practice_reminder;
        return { token: token, data: appUserDetails };
    });
}

const authenticateFacebook = params => {
    return userMaster.findOne({
        where: {
            account_id: params.account_id
        },
    }).then(user => {
        if (!user)
            throw new CustomError('Facebook account not Found!');

        const payload = {
            name: user.name,
            username: user.username,
            email_id: user.email_id,
            id: user.user_id,
            time: new Date()
        };

        var token = jwt.sign(payload, config.jwtSecret, {
            expiresIn: config.appTokenExpireTime
        });
        var appUserDetails = {};
        appUserDetails.user_id = (user.user_id) ? user.user_id : 0;
        appUserDetails.name = (user.name) ? user.name : '';
        appUserDetails.username = (user.username) ? user.username : '';
        appUserDetails.email_id = (user.email_id) ? user.email_id : '';
        appUserDetails.user_image = (user.user_image) ? user.user_image : 'default.png';
        appUserDetails._grade_id = (user._grade_id) ? user._grade_id : 0;
        appUserDetails.account_id = (user.account_id) ? user.account_id : '';
        appUserDetails.gams_earn = (user.gams_earn) ? user.gams_earn : 0;
        appUserDetails.potato_earn = (user.potato_earn) ? user.potato_earn : 0;
        appUserDetails.coins_earn = (user.coins_earn) ? user.coins_earn : 0;
        appUserDetails.last_login_date = (user.last_login_date) ? user.last_login_date : '';
        appUserDetails._coin_id = (user._coin_id) ? user._coin_id : '';
        appUserDetails.is_verified = user.is_verified;
        appUserDetails.is_friend_request_allow = user.is_friend_request_allow;
        appUserDetails.is_challenge_request_allow = user.is_challenge_request_allow;
        appUserDetails.is_leaderboards_allow = user.is_leaderboards_allow;
        appUserDetails.is_verified = user.is_practice_reminder;
        return { token: token, data: appUserDetails };
    });
}

const registerUser = data => userMaster.create({
    ...data
}).then((result) => {
    var response = { status: true, message: "Success! User added successfully!", data: result }
    return response;
}).catch((error) => {
    var response = { status: false, message: "Error! Invalid data found", error }
    return response;
});


const getAdminLeaderBoard = (pageNo, dataLimit, gradeId) => {
    var offset = (pageNo - 1) * dataLimit;
    var query = {
        where: {
            is_delete: 0,
            is_verified: 1,
        },
        attributes: ['user_id', 'name', 'user_image', 'potato_earn'],
        include: [
            {
                model: gradeMaster,
                as: 'user_grade',
                attributes: [
                    'caption'
                ]
            }
        ],
        offset: offset,
        limit: dataLimit,
        order: [['potato_earn', 'DESC']]
    };
    if (gradeId) {
        query.where._grade_id = gradeId
    }
    return userMaster.findAndCountAll(query).then(sequelize.getValues)
};

const getAllUserForCron = () => {
    var query = {
        where: {
            is_delete: 0,
            is_verified: 1,
        },
        attributes: ['user_id', 'name', 'username', 'email_id'],
        order: [['user_id', 'DESC']]
    };

    return userMaster.findAll(query).then(sequelize.getValues)
};

const leaderboardByUserInSolo = (pageNo, dataLimit, userId, searchParams) => {
    var offset = (pageNo - 1) * dataLimit;
    var query = {
        where: {
            is_delete: 0
        },
        attributes: ['_user_id', [Sequelize.fn('sum', Sequelize.col('potato_earn')), 'total_potato']],
        group: ['_user_id'],
        order: [[Sequelize.fn('sum', Sequelize.col('potato_earn')), 'DESC']],
        offset: offset,
        limit: dataLimit,
    };

    if (userId) {
        query.where._user_id = userId;
    }

    if (searchParams._difficulty_id && searchParams._difficulty_id.length > 0) {
        query.where._difficulty_id = { [Sequelize.Op.in]: searchParams._difficulty_id }

    }
    if (searchParams._course_id && searchParams._course_id.length > 0) {
        query.where._course_id = { [Sequelize.Op.in]: (searchParams._course_id) }
    }

    if (searchParams.challenge_type && searchParams.challenge_type.length > 0) {
        query.where.challenge_type = { [Sequelize.Op.in]: (searchParams.challenge_type) }
    }


    if (searchParams.startDate && !searchParams.endDate) {
        query.where.createdAt = {
            [Sequelize.Op.gte]: searchParams.startDate,
        }
    }
    else if (!searchParams.startDate && searchParams.endDate) {
        query.where.createdAt = {
            [Sequelize.Op.lte]: searchParams.endDate,
        }
    }
    else if (searchParams.startDate && searchParams.endDate) {
        query.where.createdAt = {
            [Sequelize.Op.between]: [searchParams.startDate, searchParams.endDate]
        }
    }

    return resultMaster.findOne(query).then(sequelize.getValues)
};

const leaderboardByUserInBattleInUserColumn = (pageNo, dataLimit, userId, searchParams) => {
    var winnerCondition = [0, userId]
    var offset = (pageNo - 1) * dataLimit;
    var query = {
        where: {
            is_delete: 0,
            battle_status: { [Sequelize.Op.ne]: 'pending' },
            winner_user_id: { [Sequelize.Op.in]: winnerCondition }
        },
        attributes: ['_user_id', [Sequelize.fn('sum', Sequelize.col('user_potato_earn')), 'total_potato']],
        group: ['_user_id'],
        order: [[Sequelize.fn('sum', Sequelize.col('user_potato_earn')), 'DESC']],
        offset: offset,
        limit: dataLimit,
    };

    if (userId) {
        query.where._user_id = userId;
    }

    if (searchParams._difficulty_id && searchParams._difficulty_id.length > 0) {
        query.where._difficulty_id = { [Sequelize.Op.in]: searchParams._difficulty_id }

    }
    if (searchParams._course_id && searchParams._course_id.length > 0) {
        query.where._course_id = { [Sequelize.Op.in]: (searchParams._course_id) }
    }

    if (searchParams.challenge_type && searchParams.challenge_type.length > 0) {
        query.where.challenge_type = { [Sequelize.Op.in]: (searchParams.challenge_type) }
    }


    if (searchParams.startDate && !searchParams.endDate) {
        query.where.createdAt = {
            [Sequelize.Op.gte]: searchParams.startDate,
        }
    }
    else if (!searchParams.startDate && searchParams.endDate) {
        query.where.createdAt = {
            [Sequelize.Op.lte]: searchParams.endDate,
        }
    }
    else if (searchParams.startDate && searchParams.endDate) {
        query.where.createdAt = {
            [Sequelize.Op.between]: [searchParams.startDate, searchParams.endDate]
        }
    }

    return battleMaster.findOne(query).then(sequelize.getValues)
};

const leaderboardByUserInBattleInOpponentColumn = (pageNo, dataLimit, userId, searchParams) => {
    var winnerCondition = [0, userId]
    var offset = (pageNo - 1) * dataLimit;
    var query = {
        where: {
            is_delete: 0,
            battle_status: 'complete',
            winner_user_id: { [Sequelize.Op.in]: winnerCondition }
        },
        attributes: ['_opponent_id', [Sequelize.fn('sum', Sequelize.col('opponent_potato_earn')), 'total_potato']],
        group: ['_opponent_id'],
        order: [[Sequelize.fn('sum', Sequelize.col('opponent_potato_earn')), 'DESC']],
        offset: offset,
        limit: dataLimit,
    };

    if (userId) {
        query.where._opponent_id = userId;
    }

    if (searchParams._difficulty_id && searchParams._difficulty_id.length > 0) {
        query.where._difficulty_id = { [Sequelize.Op.in]: searchParams._difficulty_id }

    }
    if (searchParams._course_id && searchParams._course_id.length > 0) {
        query.where._course_id = { [Sequelize.Op.in]: (searchParams._course_id) }
    }

    if (searchParams.challenge_type && searchParams.challenge_type.length > 0) {
        query.where.challenge_type = { [Sequelize.Op.in]: (searchParams.challenge_type) }
    }


    if (searchParams.startDate && !searchParams.endDate) {
        query.where.createdAt = {
            [Sequelize.Op.gte]: searchParams.startDate,
        }
    }
    else if (!searchParams.startDate && searchParams.endDate) {
        query.where.createdAt = {
            [Sequelize.Op.lte]: searchParams.endDate,
        }
    }
    else if (searchParams.startDate && searchParams.endDate) {
        query.where.createdAt = {
            [Sequelize.Op.between]: [searchParams.startDate, searchParams.endDate]
        }
    }

    return battleMaster.findOne(query).then(sequelize.getValues)
};

const updateNotificationSetting = (data, userId) => {
    const query = {
        returning: true,
        where: {
            user_id: userId
        }
    };
    return userMaster.update(data, query)
        .then(
            ([affectedCount, [updatedUser]]) => {
                if (affectedCount > 0) {
                    return { status: true, message: "Notification update successfully!", data: updatedUser }
                }
                return { status: false, message: "Something went wrong! Please try again!" }
            }
        ).catch(err => {
            console.log('====', err)
        })
}

const getAllUserForPracticeReminderCron = () => {
    var query = {
        where: {
            is_delete: 0,
            is_verified: 1,
            is_practice_reminder: true
        },
        attributes: ['user_id', 'name', 'username', 'email_id'],
        order: [['user_id', 'DESC']]
    };

    return userMaster.findAll(query).then(sequelize.getValues)
};

module.exports = {
    registerUser,
    authenticate,
    checkEmailExist,
    checkUsernameExist,
    checkAccountIdExist,
    getUserDetails,
    authenticateFacebook,
    updateUserProfile,
    checkEmailExistForUpdate,
    checkUsernameExistForUpdate,
    getAllUsers,
    getSuggestionFriend,
    getMainLeaderBoard,
    getUserName,
    getMultipleUserDetails,
    getUsers,
    getUsersForOpponent,
    getAdminLeaderBoard,
    getUserDetailsByCustomerId,
    getUserRankInLeaderBoard,
    getUserDetailsForVarification,
    getAllUserForCron,
    leaderboardByUserInSolo,
    leaderboardByUserInBattleInUserColumn,
    leaderboardByUserInBattleInOpponentColumn,
    getUserByEmail,
    getallUserforplan_end_date,
    updateNotificationSetting,
    getAllUserForPracticeReminderCron
}