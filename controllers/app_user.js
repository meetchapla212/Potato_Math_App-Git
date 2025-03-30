const appUserService = require('../services/app_user');
const rankService = require('../services/rank');
const avatarService = require('../services/avatar');
const friendRequestService = require('../services/friend_request');
const appTextService = require('../services/app_text_configuration');
const mailjest = require('./mailjest');
const config = require('../config');
var multer = require('multer');
const mkdirp = require('mkdirp');
var crypto = require('crypto');
const moment = require('moment');
var uuid = require('uuid');
const appleSigninAuth = require('apple-signin-auth');

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        var path = config.uploadDir + config.appUserImagePath;
        mkdirp(path, err => callback(null, path))
    },
    filename: function (req, file, callback) {
        callback(null, 'app_user_image_' + Date.now());
    }
});

var upload = multer({ storage: storage }).single('app_user_image');

function avatarImage(avatarId) {
    return avatarService.getAvatarById(avatarId).then(avatar => {
        if (avatar) {
            return avatar.dataValues.avatar_image;
        }
    })
}
async function rankPotatoQuanntity(tempPotato) {
    return rankService.getRankByPotatoQuantity(tempPotato).then(final => {
        return final
    })
}

function registerUser(req, res) {
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;
    upload(req, res, async function (err) {

        if (req.body.login_type === 'apple') {
            appleIdTokenClaims = await appleSigninAuth.verifyIdToken(req.body.id_token, {
                /** sha256 hex hash of raw nonce */
                ignoreExpiration: true,
                nonce: req.body.nonce ? crypto.createHash('sha256').update(req.body.nonce).digest('hex') : undefined,
            });
            console.log('appleIdTokenClaims', appleIdTokenClaims)

            return appUserService.checkAccountIdExist(appleIdTokenClaims.sub || '')
                .then(exists => {
                    if (exists) {
                        return appUserService.authenticateFacebook(req.body)
                            .then(async result => {
                                if (result) {
                                    let serverURL = config.getServerUrl(req)
                                    result.data['user_image'] = serverURL + config.avatarImagePath + result.data['user_image'];

                                    var lastDate = result.data.last_login_date
                                    var today = moment(new Date()).format('YYYY-MM-DD')

                                    var profileDetails = {};
                                    result.data['daily_coin'] = false;
                                    if (lastDate < today) {
                                        result.data['daily_coin'] = true;
                                    }
                                    var rankPotatoArray = await potatoRankArray(pageNo, dataLimit);
                                    var tempPotato = getClosestValue(rankPotatoArray, result.data.potato_earn);
                                    var final = await rankPotatoQuanntity(tempPotato)
                                    result.data['rank_name'] = final ? final.dataValues.rank_name : config.Default_Potato_Rank;


                                    profileDetails.last_login_date = today;

                                    return appUserService.updateUserProfile(profileDetails, result.data.user_id).then((user) => {
                                        if (user) {
                                            res.send({
                                                status: true,
                                                token: result.token,
                                                data: result.data,
                                            });
                                        }
                                    })
                                } else {
                                    return res.status(200).send({
                                        status: false,
                                        message: "failed"
                                    });
                                }
                            })
                            .catch(err => {
                                return res.status(200).send({
                                    status: false,
                                    message: 'Failed!'
                                });
                            })
                    }
                    else {
                        var appUserDetails = {};
                        var initial_free_coins = req.config.setting.initial_free_coins;
                        appUserDetails.user_image = req.file !== undefined ? req.file.filename : 'default.png';
                        appUserDetails.account_id = (req.body.account_id) ? req.body.account_id : "";
                        //appUserDetails.name = (req.body.name) ? req.body.name : ""; // this is username
                        appUserDetails.username = (req.body.username) ? req.body.username.toLowerCase() : ""; // this  is name
                        appUserDetails.email_id = (appleIdTokenClaims) ? appleIdTokenClaims.email.toLowerCase() : "";
                        appUserDetails.login_type = (req.body.login_type) ? req.body.login_type : "";
                        appUserDetails._grade_id = (req.body._grade_id) ? (req.body._grade_id) * 1 : null;
                        appUserDetails.password = (req.body.password) ? passwordHmac : "";
                        appUserDetails.coins_earn = initial_free_coins;
                        appUserDetails.potato_earn = (req.body.potato_earn) ? req.body.potato_earn : 0;
                        appUserDetails.onboarding_potato = (req.body.potato_earn) ? req.body.potato_earn : 0;
                        appUserDetails.is_verified = 1;
                        appUserDetails.last_login_date = moment(new Date()).format('YYYY-MM-DD hh:mm');
                        appUserDetails.last_notification_date = moment(new Date()).format('YYYY-MM-DD hh:mm');

                        return appUserService.registerUser(appUserDetails)
                            .then((data) => {
                                if (data) {
                                    return appUserService.authenticateFacebook(req.body)
                                        .then(result => {

                                            let serverURL = config.getServerUrl(req)
                                            result.data['user_image'] = serverURL + config.avatarImagePath + result.data['user_image'];
                                            result.data['rank_name'] = config.Default_Potato_Rank
                                            res.send({
                                                status: true,
                                                message: 'Added!',
                                                token: result.token,
                                                data: result.data,
                                            });
                                        })
                                        .catch(err => {
                                            return res.status(200).send({
                                                status: false,
                                                message: 'Failed!'
                                            });
                                        })
                                } else {
                                    return res.status(200).send({
                                        status: false,
                                        message: 'Failed!'
                                    });
                                }
                            });
                    }
                });
        } else if (req.body.login_type === 'facebook') {
            return appUserService.checkAccountIdExist(req.body.account_id || '')
                .then(exists => {
                    if (exists) {
                        return appUserService.authenticateFacebook(req.body)
                            .then(async result => {
                                if (result && result.data.is_verified) {
                                    let serverURL = config.getServerUrl(req)
                                    result.data['user_image'] = serverURL + config.avatarImagePath + result.data['user_image'];

                                    var lastDate = result.data.last_login_date
                                    var today = moment(new Date()).format('YYYY-MM-DD')

                                    var profileDetails = {};
                                    result.data['daily_coin'] = false;
                                    if (lastDate < today) {
                                        result.data['daily_coin'] = true;
                                    }
                                    var rankPotatoArray = await potatoRankArray(pageNo, dataLimit);
                                    var tempPotato = getClosestValue(rankPotatoArray, result.data.potato_earn);
                                    var final = await rankPotatoQuanntity(tempPotato)
                                    result.data['rank_name'] = final ? final.dataValues.rank_name : config.Default_Potato_Rank;


                                    profileDetails.last_login_date = today;

                                    return appUserService.updateUserProfile(profileDetails, result.data.user_id).then((user) => {
                                        if (user) {
                                            res.send({
                                                status: true,
                                                token: result.token,
                                                data: result.data,
                                            });
                                        }
                                    })
                                } else {
                                    return res.status(200).send({
                                        status: false,
                                        message: "We’ve sent a verification link to your email address."
                                    });
                                }
                            })
                            .catch(err => {
                                return res.status(200).send({
                                    status: false,
                                    message: 'Failed!'
                                });
                            })
                    }
                    else {
                        var appUserDetails = {};
                        var initial_free_coins = req.config.setting.initial_free_coins;
                        appUserDetails.user_image = req.file !== undefined ? req.file.filename : 'default.png';
                        appUserDetails.account_id = (req.body.account_id) ? req.body.account_id : "";
                        //appUserDetails.name = (req.body.name) ? req.body.name : ""; // this is username
                        appUserDetails.username = (req.body.username) ? req.body.username.toLowerCase() : ""; // this is name
                        appUserDetails.email_id = (req.body.email_id) ? req.body.email_id.toLowerCase() : "";
                        appUserDetails.login_type = (req.body.login_type) ? req.body.login_type : "";
                        appUserDetails._grade_id = (req.body._grade_id) ? (req.body._grade_id) * 1 : null;
                        appUserDetails.password = (req.body.password) ? passwordHmac : "";
                        appUserDetails.coins_earn = initial_free_coins;
                        appUserDetails.potato_earn = (req.body.potato_earn) ? req.body.potato_earn : 0;
                        appUserDetails.onboarding_potato = (req.body.potato_earn) ? req.body.potato_earn : 0;
                        appUserDetails.is_verified = 1;
                        appUserDetails.last_login_date = moment(new Date()).format('YYYY-MM-DD hh:mm');
                        appUserDetails.last_notification_date = moment(new Date()).format('YYYY-MM-DD hh:mm');

                        return appUserService.registerUser(appUserDetails)
                            .then((data) => {
                                if (data) {
                                    return appUserService.authenticateFacebook(req.body)
                                        .then(result => {

                                            let serverURL = config.getServerUrl(req)
                                            result.data['user_image'] = serverURL + config.avatarImagePath + result.data['user_image'];
                                            result.data['rank_name'] = config.Default_Potato_Rank
                                            res.send({
                                                status: true,
                                                message: 'Added!',
                                                token: result.token,
                                                data: result.data,
                                            });
                                        })
                                        .catch(err => {
                                            return res.status(200).send({
                                                status: false,
                                                message: 'Failed!'
                                            });
                                        })
                                }
                            });
                    }
                });
        } else {
            req.body.email_id = req.body.email_id.toLowerCase()
            return appUserService.checkEmailExist(req.body.email_id || '')
                .then(async exists => {
                    var emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
                    var valid = emailRegex.test(req.body.email_id);
                    if (!valid) {
                        return res.status(200).send({
                            status: false,
                            message: 'Please enter valid Email-id!'
                        });
                    }
                    if (exists) {
                        return res.status(200).send({
                            status: false,
                            message: 'Email Id already exsist!'
                        });
                    }

                    return appUserService.checkUsernameExist(req.body.name || '')
                        .then(async exists => {
                            if (exists) {
                                return res.status(200).send({
                                    status: false,
                                    message: 'Username already exists!'
                                });
                            }

                            var appUserDetails = {};
                            var initial_free_coins = req.config.setting.initial_free_coins
                            const passwordHmac = crypto.createHmac('sha256', config.jwtSecret).update(req.body.password).digest('hex');
                            appUserDetails.user_image = req.body._avatar_id ? await avatarImage(req.body._avatar_id) : 'default.png';
                            appUserDetails.account_id = (req.body.account_id) ? req.body.account_id : "";
                            appUserDetails.name = (req.body.name) ? req.body.name : ""; // this is username
                            appUserDetails.username = (req.body.username) ? req.body.username.toLowerCase() : ""; // this is name
                            appUserDetails.email_id = (req.body.email_id) ? req.body.email_id.toLowerCase() : "";
                            appUserDetails.login_type = (req.body.login_type) ? req.body.login_type : "normal";
                            appUserDetails._grade_id = (req.body._grade_id) ? req.body._grade_id : null;
                            appUserDetails.password = (req.body.password) ? passwordHmac : "";
                            appUserDetails.coins_earn = initial_free_coins;
                            appUserDetails.potato_earn = (req.body.potato_earn) ? req.body.potato_earn : 0;
                            appUserDetails.onboarding_potato = (req.body.potato_earn) ? req.body.potato_earn : 0;
                            appUserDetails.is_verified = 0;
                            appUserDetails.email_token = uuid.v1();
                            var link = config.domain + '/verify?email=' + appUserDetails.email_id + '&token=' + appUserDetails.email_token;
                            console.log(link);

                            appUserDetails.last_login_date = moment(new Date()).format('YYYY-MM-DD hh:mm');
                            appUserDetails.last_notification_date = moment(new Date()).format('YYYY-MM-DD hh:mm');

                            return appUserService.registerUser(appUserDetails)
                                .then((data) => {
                                    console.log("data ==>", data);
                                    if (data) {
                                        return appUserService.authenticate(req.body)
                                            .then(result => {
                                                let serverURL = config.getServerUrl(req)
                                                result.data['user_image'] = serverURL + config.avatarImagePath + result.data['user_image'];
                                                result.data['rank_name'] = config.Default_Potato_Rank;
                                                var userDetails = [{
                                                    "Email": result.data.email_id,
                                                    "Name": result.data.name
                                                }]
                                                var variables = {
                                                    "name": result.data.name,
                                                    "verify_link": link
                                                }
                                                var templateId = req.config.setting.confirm_email_template
                                                var subject = 'PotatoMath: Account confirmation';
                                                mailjest.sendMail(templateId, subject, userDetails, variables)
                                                res.send({
                                                    status: true,
                                                    message: "We’ve sent a verification link to your email address."
                                                });
                                            })
                                            .catch(err => {
                                                if (err.type === 'custom') {
                                                    return res.status(200).send({
                                                        status: false,
                                                        message: err.message
                                                    });
                                                }
                                                return res.status(200).send({
                                                    status: false,
                                                    message: 'Invalid Email Id or Password!'
                                                });
                                            })
                                    }
                                });
                        });
                });
        }
    });
};

function varifiedProfile(req, res) {
    var email = req.query.email;
    var token = req.query.token;

    return appUserService.getUserByEmail(email)
        .then(userRes => {
            if (userRes.dataValues.is_verified) {
                res.writeHead(301,
                    { Location: 'http://potatomath.com/thankyou/?code=3' }
                );
                res.end();
            } else {
                return appUserService.getUserDetailsForVarification(token, email).then((user) => {
                    if (user) {
                        var profileDetails = {};
                        profileDetails.email_token = "";
                        profileDetails.is_verified = 1;
                        return appUserService.updateUserProfile(profileDetails, user.dataValues.user_id).then(async result => {
                            if (result) {
                                var userDetails = [{
                                    "Email": result.data.email_id,
                                    "Name": result.data.name
                                }]
                                var variables = {
                                    "name": result.data.name,
                                    "course_link": "https://potatomath.com/"
                                }
                                var text = await appTextService.getTextByKey('welcome_email_template');

                                var templateId = (text.dataValues.value) * 1;
                                var subject = 'Welcome on Board';
                                mailjest.sendMail(templateId, subject, userDetails, variables)
                                let serverURL = config.getServerUrl(req)
                                result.data.user_image = serverURL + config.avatarImagePath + result.data.user_image;
                                res.writeHead(301,
                                    { Location: 'http://potatomath.com/thankyou/?code=1' }
                                );
                                res.end();
                            }
                            else {
                                res.writeHead(301,
                                    { Location: 'http://potatomath.com/thankyou/?code=2' }
                                );
                                res.end();
                            }
                        })
                    } else {
                        res.writeHead(301,
                            { Location: 'http://potatomath.com/thankyou/?code=2' }
                        );
                        res.end();
                    }
                })
            }
        })
}

function loginUser(req, res) {
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;

    req.body.email_id = req.body.email_id.toLowerCase();
    return appUserService.authenticate(req.body)
        .then(async result => {
            if (result && result.data.is_verified) {
                var lastDate = result.data.last_login_date
                var today = moment(new Date()).format('YYYY-MM-DD')

                var profileDetails = {};
                result.data['daily_coin'] = false
                if (lastDate < today) {
                    result.data['daily_coin'] = true
                }
                var rankPotatoArray = await potatoRankArray(pageNo, dataLimit);
                var tempPotato = getClosestValue(rankPotatoArray, result.data.potato_earn);
                var final = await rankPotatoQuanntity(tempPotato)
                result.data['rank_name'] = final ? final.dataValues.rank_name : config.Default_Potato_Rank;

                let serverURL = config.getServerUrl(req)
                result.data['user_image'] = serverURL + config.avatarImagePath + result.data['user_image'];
                profileDetails.last_login_date = today;

                return appUserService.updateUserProfile(profileDetails, result.data.user_id).then(user => {
                    if (user) {
                        res.send({
                            status: true,
                            token: result.token,
                            data: result.data,
                        });
                    }
                })
            } else {
                return res.status(200).send({
                    status: false,
                    message: "We’ve sent a verification link to your email address."
                });
            }
        })
        .catch(err => {
            if (err.type === 'custom') {
                return res.status(200).send({
                    status: false,
                    message: err.message
                });
            }
            return res.status(200).send({
                status: false,
                message: 'Invalid Email Id or Password!'
            });
        })
};

function addGradeForFacebook(req, res) {
    var userId = req.user.id;
    var profileDetails = {};
    profileDetails._grade_id = (req.body._grade_id) * 1;
    if (userId) {
        return appUserService.updateUserProfile(profileDetails, userId).then(user => {
            if (user) {
                let serverURL = config.getServerUrl(req)
                user.data.user_image = serverURL + config.avatarImagePath + user.data.user_image;
                var response = { status: true, message: "grade added successfully!", data: user.data }
            }
            else {
                var response = { status: false, message: config.no_data_message }
            }
            res.send(response)
        })
    } else {
        var response = { status: false, message: config.no_data_message }
        res.send(response)
    }
}

function addDailyCoin(req, res) {
    var userId = req.user.id;
    var daily_free_coins = req.config.setting.daily_free_coins;
    if (userId) {
        return appUserService.getUserDetails(userId)
            .then(userRes => {
                if (userRes) {
                    var profileDetails = {};
                    profileDetails.coins_earn = userRes.dataValues.coins_earn + daily_free_coins
                    return appUserService.updateUserProfile(profileDetails, userId).then(user => {
                        if (user) {
                            let serverURL = config.getServerUrl(req)
                            user.data.user_image = serverURL + config.avatarImagePath + user.data.user_image;
                            var response = { status: true, message: "Daily coin collected!", data: user.data }
                        }
                        else {
                            var response = { status: false, message: config.no_data_message }
                        }
                        res.send(response)
                    })
                } else {
                    var response = { status: false, message: config.no_data_message }
                    res.send(response)
                }
            })
    } else {
        var response = { status: false, message: config.no_data_message }
        res.send(response)
    }
}


function updateUserProfile(req, res) {
    upload(req, res, function (err) {
        var user_id = req.user.id;
        var body = req.body;
        req.body.email_id = req.body.email_id.toLowerCase()
        if (body && user_id) {
            return appUserService.getUserDetails(user_id)
                .then(userRes => {
                    return appUserService.checkEmailExistForUpdate(req.body.email_id || '', user_id)
                        .then(exists => {
                            if (userRes.login_type === 'facebook' && req.body.email_id === "") {
                                console.log("User Is FB User");
                            }
                            else {
                                var emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
                                var valid = emailRegex.test(req.body.email_id);
                                if (!valid) {
                                    return res.status(200).send({
                                        status: false,
                                        message: 'Please enter valid Email-id!'
                                    });
                                }

                                if (exists) {
                                    return res.status(200).send({
                                        status: false,
                                        message: 'Email Id already exsist!'
                                    });
                                }
                            }

                            // return appUserService.checkUsernameExistForUpdate(req.body.username || '', user_id)
                            //     .then(exists => {
                            //         if (userRes.login_type === 'facebook' && req.body.username === "") {
                            //             console.log("UserName Is FB User");
                            //         }
                            //         else {
                            //             if (exists) {
                            //                 return res.status(200).send({
                            //                     status: false,
                            //                     message: 'Username already exists!'
                            //                 });
                            //             }
                            //         }

                            if (userRes) {
                                var profileDetails = {};
                                profileDetails.name = (req.body.name) ? req.body.name : ""; // this is username
                                profileDetails.username = (req.body.username) ? req.body.username.toLowerCase() : ""; // this is name 
                                profileDetails.email_id = (req.body.email_id) ? req.body.email_id.toLowerCase() : "";
                                if (req.body._avatar_id) {
                                    return avatarService.getAvatarById(req.body._avatar_id).then(avatar => {
                                        if (avatar) {
                                            profileDetails.user_image = avatar.dataValues.avatar_image;
                                            return appUserService.updateUserProfile(profileDetails, user_id).then(result => {
                                                let serverURL = config.getServerUrl(req)
                                                result.data.dataValues.user_image = serverURL + config.avatarImagePath + result.data.dataValues.user_image;
                                                var response = { status: true, message: result.message, data: result.data }
                                                res.send(response)
                                            });
                                        } else {
                                            let serverURL = config.getServerUrl(req)
                                            result.data.dataValues.user_image = serverURL + config.avatarImagePath + result.data.dataValues.user_image;
                                            var response = { status: false, message: config.no_data_message }
                                            res.send(response);
                                        }
                                    })
                                } else {
                                    return appUserService.updateUserProfile(profileDetails, user_id).then(result => {
                                        let serverURL = config.getServerUrl(req)
                                        result.data.dataValues.user_image = serverURL + config.avatarImagePath + result.data.dataValues.user_image;
                                        var response = { status: true, message: result.message, data: result.data }
                                        res.send(response)
                                    });
                                }
                            } else {
                                var response = { status: false, message: "No User found for update detail!" }
                                res.send(response);
                            }
                            // })
                        });
                });
        } else {
            var response = { status: false, message: "Invalid data!" }
            res.send(response);
        }
    })
};

function generateOTP() {
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

function requestResetPassword(req, res) {
    var body = req.body;
    body.email_id = body.email_id.toLowerCase()
    return appUserService.getUserByEmail(body.email_id)
        .then(userRes => {
            if (userRes) {
                var appUserDetails = {};
                appUserDetails.otp_number = generateOTP();
                return appUserService.updateUserProfile(appUserDetails, userRes.dataValues.user_id).then(async result => {
                    if (result) {

                        var userDetails = [{
                            "Email": result.data.email_id,
                            "Name": result.data.name
                        }]
                        var variables = {
                            "name": result.data.name,
                            "email": result.data.email_id,
                            "verification_code": appUserDetails.otp_number
                        }
                        var text = await appTextService.getTextByKey('reset_password_template');

                        var templateId = (text.dataValues.value) * 1;
                        var subject = 'One time password!';
                        mailjest.sendMail(templateId, subject, userDetails, variables)
                        var response = { status: true, message: 'OTP sent!' }
                    } else {
                        var response = { status: false, message: config.no_data_message }
                    }
                    res.send(response)
                });
            } else {
                var response = { status: false, message: "No user found!!" }
                res.send(response);
            }
        })
};

function otpVerification(req, res) {
    var body = req.body;
    body.email_id = body.email_id.toLowerCase();
    body.otp_number = parseInt(body.otp_number);
    return appUserService.getUserByEmail(body.email_id)
        .then(userRes => {
            if (userRes) {
                if (userRes.dataValues.otp_number === body.otp_number) {
                    var response = { status: true, message: 'You can do further Process!' }
                } else {
                    var response = { status: false, message: 'Something is going wrong!' }
                }
                res.send(response)
            } else {
                var response = { status: false, message: "No user found!!" }
                res.send(response);
            }
        })
};

function resetPassword(req, res) {
    var body = req.body;
    body.email_id = body.email_id.toLowerCase()
    body.otp_number = parseInt(body.otp_number);
    if (body.password_one === body.password_two) {
        return appUserService.getUserByEmail(body.email_id)
            .then(userRes => {
                if (userRes) {
                    if (userRes.dataValues.otp_number === body.otp_number) {
                        var appUserDetails = {};
                        const passwordHmac = crypto.createHmac('sha256', config.jwtSecret).update(req.body.password_one).digest('hex');
                        appUserDetails.password = (req.body.password_one) ? passwordHmac : "";
                        appUserDetails.otp_number = null;
                        return appUserService.updateUserProfile(appUserDetails, userRes.dataValues.user_id).then(result => {
                            if (result) {
                                var response = { status: true, message: 'Password changed successfully!' }
                            } else {
                                var response = { status: false, message: config.no_data_message }
                            }
                            res.send(response)
                        });
                    } else {
                        var response = { status: false, message: 'Wrong OTP!' }
                        res.send(response)
                    }
                } else {
                    var response = { status: false, message: "No user found!!" }
                    res.send(response);
                }
            })

    } else {
        var response = { status: false, message: "Both passwords are different!!" }
        res.send(response);
    }
};

function getClosestValue(standardArray, targetVal) {
    if (!(standardArray) || standardArray.length == 0) {
        return 0;
    }
    if (standardArray.length == 1) {
        return standardArray[0];
    }
    if (targetVal === 0) {
        return 0
    }

    return targetVal - standardArray.reduce(function (closest, v) {
        return targetVal >= v ? Math.min(targetVal - v, closest) : closest;
    }, 1e100);
}

async function potatoRankArray(pageNo, dataLimit) {
    return rankService.getAllRanksPotato(pageNo, dataLimit).then(result => {
        if (result) {
            var rankPotatoArray = [];
            result.map((item) => {
                rankPotatoArray.push(item.potato_quantity)
            })
            return rankPotatoArray
        }
    })
}

function getUserProfile(req, res) {
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;
    var user_id = req.user.id;
    const { uId } = req.params;
    if (uId && uId != null) {
        user_id = uId;
    }
    if (user_id) {
        return appUserService.getUserDetails(user_id)
            .then(async (userRes) => {
                if (userRes) {

                    var rankPotatoArray = await potatoRankArray(pageNo, dataLimit);

                    var tempPotato = getClosestValue(rankPotatoArray, userRes.dataValues.potato_earn)

                    return rankService.getRankByPotatoQuantity(tempPotato).then(final => {
                        let serverURL = config.getServerUrl(req)
                        userRes['user_image'] = serverURL + config.avatarImagePath + userRes['user_image'];
                        if (final) {
                            userRes.dataValues['rank_name'] = final.dataValues.rank_name;
                            var response = { status: true, data: userRes }
                        }
                        else {
                            userRes.dataValues['rank_name'] = config.Default_Potato_Rank;
                            var response = { status: true, data: userRes }
                        }
                        res.send(response);
                    })
                } else {
                    var response = { status: false, message: "No User found!" }
                    res.send(response);
                }
            })
    } else {
        var response = { status: false, message: config.no_data_message }
        res.send(response);
    }
}

async function friendArrayForSuggestion(userId) {
    return friendRequestService.getFriendPotatoFromUsers(userId).then(user => {
        var result = [];
        // result.push(userId)
        if (user) {
            user.forEach((resData) => {
                result.push(resData.dataValues._friend_id)
            });
            return friendRequestService.getFriendPotatoFromFriends(userId).then(friend => {
                if (friend) {
                    friend.forEach((friendData) => {
                        friendData.dataValues["_friend_id"] = friendData.dataValues._user_id
                        delete friendData.dataValues._user_id
                        result.push(friendData.dataValues._friend_id)
                    });
                    return result
                }
            })
        }
    })
}

function getAllUsers(req, res) {
    var user_id = req.user.id;
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;

    return appUserService.getAllUsers(pageNo, dataLimit, user_id).then(result => {
        if (result) {
            let serverURL = config.getServerUrl(req)
            result.forEach(async (user) => {
                var result = await friendArrayForSuggestion(user['user_id']);
                user['user_image'] = serverURL + config.avatarImagePath + user['user_image'];
            })
            var response = { status: true, data: result };
        } else {
            var response = { status: false, message: config.no_data_message };
        }
        res.send(response);
    });
};

function getUsers(req, res) {
    var { gradeId } = req.params;
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = (req.query.limit) ? req.query.limit : config.dataLimit;

    return appUserService.getUsers(pageNo, dataLimit, gradeId).then(async (result) => {
        if (result) {
            var rankPotatoArray = await potatoRankArray(pageNo, dataLimit);
            const userDataFunction = async (resDataItem) => {
                let serverURL = config.getServerUrl(req)
                resDataItem['user_image'] = serverURL + config.avatarImagePath + resDataItem['user_image'];
                var friendsCount = await friendArrayForSuggestion(resDataItem['user_id']);
                resDataItem.dataValues['number_of_friend'] = friendsCount.length;
                if (resDataItem.dataValues.user_grade) {
                    resDataItem.dataValues.grade_caption = resDataItem.dataValues.user_grade.dataValues.caption;
                    delete resDataItem.dataValues.user_grade;
                }
                var tempPotato = getClosestValue(rankPotatoArray, resDataItem['potato_earn'])
                return rankService.getRankByPotatoQuantity(tempPotato).then(final => {
                    if (final) {
                        resDataItem.dataValues['rank_name'] = final.dataValues.rank_name;
                        return resDataItem
                    }
                    resDataItem.dataValues['rank_name'] = config.Default_Potato_Rank;
                    return resDataItem
                })
            }
            return Promise.all(result.rows.map(resData => userDataFunction(resData)))
                .then(data => {
                    var response = { status: true, count: result.count, data: data }
                    res.send(response);
                })
        } else {
            var response = { status: false, message: config.no_data_message };
        }
        res.send(response);
    });
};

function getMainLeaderBoard(req, res) {

    var body = req.body
    var userId = req.user.id;
    const { uId } = req.params;
    if (uId && uId != null) {
        userId = uId;
    }
    userId = userId * 1;
    var pageNo = (req.query.page && req.query.page > 0) ? req.query.page : 1;
    var dataLimit = config.leaderboard_limit;
    return appUserService.getUserDetails(userId).then((user) => {
        if (user) {

            // console.log(user.dataValues)
            var gradeId = user.dataValues._grade_id
            return appUserService.getUserRankInLeaderBoard(user.dataValues.potato_earn, gradeId).then(count => {
                user.dataValues['index'] = count
                return appUserService.getMainLeaderBoard(pageNo, dataLimit, body, gradeId).then(async (result) => {
                    if (result) {
                        let userExist = false;
                        result.map(item => {
                            if (item.dataValues.user_id === user.dataValues.user_id) {
                                userExist = true;
                            }
                        })
                        if (!userExist) {
                            result.push(user)
                        }
                        var rankPotatoArray = await potatoRankArray(pageNo, dataLimit);
                        let serverURL = config.getServerUrl(req)
                        var counter = 0;
                        const userDataFunction = async (resDataItem) => {
                            let count = 0;
                            if (!resDataItem.dataValues.index) {
                                resDataItem.dataValues['index'] = ++counter;
                            }
                            resDataItem['user_image'] = serverURL + config.avatarImagePath + resDataItem['user_image'];
                            if (resDataItem.dataValues.user_grade) {
                                resDataItem.dataValues.grade_caption = resDataItem.dataValues.user_grade.dataValues.caption;
                                delete resDataItem.dataValues.user_grade;
                            }

                            let userSoloResult = await appUserService.leaderboardByUserInSolo(pageNo, dataLimit, resDataItem['user_id'], body);

                            count += userSoloResult ? (userSoloResult.dataValues.total_potato * 1) : 0

                            let userBattleResult = await appUserService.leaderboardByUserInBattleInUserColumn(pageNo, dataLimit, resDataItem['user_id'], body);

                            count += userBattleResult ? (userBattleResult.dataValues.total_potato * 1) : 0

                            let userBattleOpponentResult = await appUserService.leaderboardByUserInBattleInOpponentColumn(pageNo, dataLimit, resDataItem['user_id'], body);

                            count += userBattleOpponentResult ? (userBattleOpponentResult.dataValues.total_potato * 1) : 0
                            let onboard_potato = await appUserService.getUserDetails(resDataItem['user_id'])
                            count += onboard_potato.dataValues.onboarding_potato
                            var tempPotato = getClosestValue(rankPotatoArray, resDataItem['potato_earn']);
                            resDataItem['potato_earn'] = count;
                            return rankService.getRankByPotatoQuantity(tempPotato).then(final => {
                                if (final) {
                                    resDataItem.dataValues['rank_name'] = final.dataValues.rank_name;
                                    return resDataItem
                                }
                                resDataItem.dataValues['rank_name'] = config.Default_Potato_Rank;
                                return resDataItem
                            })
                        }

                        return Promise.all(result.map(resData => userDataFunction(resData)))
                            .then(data => {
                                var response = { status: true, data: data }
                                res.send(response);
                            })
                    } else {
                        var response = { status: false, message: config.no_data_message };
                    }
                    res.send(response);
                });
            })
        } else {
            var response = { status: false, message: config.no_data_message };
            res.send(response);
        }
    })
};

function updateNotificationSetting(req, res) {
    var body = req.body
    var userId = req.user.id;
    var data = {}
    if (body.key === 'friend_request_allow') {
        data.is_friend_request_allow = body.value
    } else if (body.key === 'challenge_request_allow') {
        data.is_challenge_request_allow = body.value
    } else if (body.key === 'leaderboards_allow') {
        data.is_leaderboards_allow = body.value
    } else if (body.key === 'practice_reminder') {
        data.is_practice_reminder = body.value
    } else {
        var response = { status: false, message: config.no_data_message }
        return res.send(response);
    }

    return appUserService.updateNotificationSetting(data, userId).then(result => {
        if (result) {
            var response = { status: true, message: 'Notification update successfully!', data: result.data }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });
}

function verifyUserName(req, res) {
    var body = req.body;
    var user_id = body.user_id;
    return appUserService.checkUsernameExist(req.body.name || '')
        .then(async exists => {
            if (exists) {
                return res.status(200).send({
                    status: false,
                    message: 'Username already exists!'
                });
            } else {
                // update username 
                var profileDetails = {};
                profileDetails.name = (req.body.name) ? req.body.name : ""; // this is username

                return appUserService.getUserDetails(user_id).then(userDetails => {
                    profileDetails.username = (!!userDetails.dataValues.username) ? userDetails.dataValues.username : req.body.name; // this is name
                    return appUserService.updateUserProfile(profileDetails, user_id).then(result => {
                        let serverURL = config.getServerUrl(req)
                        result.data.dataValues.user_image = serverURL + config.avatarImagePath + result.data.dataValues.user_image;
                        var response = { status: true, message: result.message, data: result.data }
                        res.send(response)
                    });
                });


            }

        })
}


module.exports = {
    registerUser,
    loginUser,
    updateUserProfile,
    getUserProfile,
    getAllUsers,
    getMainLeaderBoard,
    getUsers,
    addGradeForFacebook,
    addDailyCoin,
    varifiedProfile,
    resetPassword,
    requestResetPassword,
    otpVerification,
    updateNotificationSetting,
    verifyUserName
}