/*********************************************************************************************************** */
//                                  This is API Router for Mobile APP                                       //
/********************************************************************************************************* */
const validations = require('../validation/index');
const apiEndpint = "/api/v1";
const coinController = require('../controllers/coin');
const courseController = require('../controllers/course');
const topicController = require('../controllers/topic');
const app_userController = require('../controllers/app_user');
const difficultyController = require('../controllers/difficulty');
const FriendRequestController = require('../controllers/friend_request');
const gradeController = require('../controllers/grade');
const avatarController = require('../controllers/avatar');
const questionController = require('../controllers/question');
const questionMapController = require('../controllers/question_map');
const resultController = require('../controllers/result')
const badgeController = require('../controllers/badge')
const giftController = require('../controllers/gift')
const generalController = require('../controllers/general')
const rankController = require('../controllers/rank')
const blogController = require('../controllers/blog')
const streakAppliedController = require('../controllers/streak_applied')
const battleController = require('../controllers/battle_result')
const giftRedeemController = require('../controllers/gift_redeem')
const contactController = require('../controllers/contact')
const paymentController = require('../controllers/payment_history')
const stripeController = require('../controllers/stripe')
const userAvatarController = require('../controllers/user_avatar')
const deepLinkingController = require('../controllers/deeplinking')
const referralController = require('../controllers/referral')
const authMiddleware = require('./../middlewares/auth');
const appTextController = require('../controllers/app_text_configuration');
const battleRequestController = require('../controllers/battle_request');
const countryController = require('../controllers/country');
const appNotificationController = require('../controllers/app_notification_token');
const inAppPurchaseController = require('./../controllers/in-app-purchase')
const iapManagerController = require('../controllers/iap-manager');

var deeplink = require('node-deeplink');

var validate = require('express-validation');
validate.options({
    errors: [],
    status: 422,
    statusText: 'Invalid Parameter..!'
});

module.exports.set = (app) => {
    /************************** With API_KEY ************************/
    app.get(apiEndpint + '/ranks', authMiddleware.checkMobileAuth, rankController.getAllRanks);
    app.get(apiEndpint + '/countries', authMiddleware.checkMobileAuth, countryController.getAllCountries);
    app.get(apiEndpint + '/coins', authMiddleware.checkMobileAuth, coinController.getAllCoins);
    app.get(apiEndpint + '/coins/:coinId', authMiddleware.checkMobileAuth, coinController.getCoinById);
    app.get(apiEndpint + '/courses', authMiddleware.checkMobileAuth, courseController.getAllCourses);
    app.get(apiEndpint + '/courses/:courseId', authMiddleware.checkMobileAuth, courseController.getCourseById);
    app.get(apiEndpint + '/grades/:gradeId/courses', authMiddleware.checkAuth, authMiddleware.checkMobileAuth, courseController.getAllCourses);
    app.get(apiEndpint + '/topics', authMiddleware.checkMobileAuth, topicController.getAllTopics);
    app.get(apiEndpint + '/courses/:courseId/topics', authMiddleware.checkMobileAuth, authMiddleware.checkAuth, topicController.getAllTopics);
    app.get(apiEndpint + '/topics/:topicId', authMiddleware.checkMobileAuth, topicController.getTopicById);
    app.get(apiEndpint + '/difficulties', authMiddleware.checkMobileAuth, difficultyController.getAllDifficulties);
    app.get(apiEndpint + '/grades', authMiddleware.checkMobileAuth, gradeController.getAllGradesForApp);
    app.get(apiEndpint + '/grades/:gradeId', authMiddleware.checkMobileAuth, gradeController.getGradeById);
    app.get(apiEndpint + '/all-avatars', authMiddleware.checkAuth, authMiddleware.checkMobileAuth, avatarController.getAllAvatars);
    app.get(apiEndpint + '/avatars', authMiddleware.checkMobileAuth, avatarController.getAvatars);
    app.get(apiEndpint + '/questions/:topicId/:difficultyId', authMiddleware.checkMobileAuth, questionMapController.getQuestions);
    app.get(apiEndpint + '/welcome-questions/:gradeId', authMiddleware.checkMobileAuth, questionController.getWelcomeQuestions);
    app.get(apiEndpint + '/normal-questions', authMiddleware.checkMobileAuth, questionController.getNormalQuestions);
    app.post(apiEndpint + '/leaderboard/:courseId', authMiddleware.checkAuth, authMiddleware.checkMobileAuth, resultController.leaderboard);
    app.get(apiEndpint + '/blogs', authMiddleware.checkMobileAuth, blogController.getBlogs);

    app.post(apiEndpint + '/battle-results', authMiddleware.checkMobileAuth, battleController.updateBattleByHash);
    app.get(apiEndpint + '/texts', authMiddleware.checkMobileAuth, appTextController.getAllTexts);

    app.post(apiEndpint + '/register', authMiddleware.checkMobileAuth, app_userController.registerUser);
    app.post(apiEndpint + '/verify-username', authMiddleware.checkMobileAuth, app_userController.verifyUserName);
    app.post(apiEndpint + '/login', validate(validations.login), app_userController.loginUser);
    app.get(apiEndpint + '/cron-check-streak', generalController.cronCheckStreak);
    app.get(apiEndpint + '/cron-check-pending-battles', generalController.cronCheckPendingBattles);

    app.post(apiEndpint + '/request-for-reset-password', authMiddleware.checkMobileAuth, app_userController.requestResetPassword);
    app.post(apiEndpint + '/otp-verification', authMiddleware.checkMobileAuth, app_userController.otpVerification);
    app.put(apiEndpint + '/reset-password', authMiddleware.checkMobileAuth, app_userController.resetPassword);
    /************************** With TOKEN ************************/
    app.post(apiEndpint + '/results', authMiddleware.checkAuth, resultController.addResult);
    app.post(apiEndpint + '/add-grade', authMiddleware.checkAuth, app_userController.addGradeForFacebook);
    app.post(apiEndpint + '/add-daily-coin', authMiddleware.checkAuth, app_userController.addDailyCoin);
    app.get(apiEndpint + '/blogs/:blogId', authMiddleware.checkAuth, blogController.getBlogById);
    app.post(apiEndpint + '/referral-data', authMiddleware.checkAuth, referralController.addRecord);
    app.get(apiEndpint + '/invited-friend', authMiddleware.checkAuth, referralController.getInvitedFriends);
    app.get(apiEndpint + '/new-joined', authMiddleware.checkAuth, referralController.userNotification);
    app.post(apiEndpint + '/streaks', authMiddleware.checkAuth, streakAppliedController.addActiveStreak);

    app.put(apiEndpint + '/profile', authMiddleware.checkAuth, app_userController.updateUserProfile);
    app.get(apiEndpint + '/profile', authMiddleware.checkAuth, app_userController.getUserProfile);
    app.get(apiEndpint + '/user/profile/:uId', authMiddleware.checkAuth, app_userController.getUserProfile);
    app.get(apiEndpint + '/users', authMiddleware.checkAuth, app_userController.getAllUsers);
    app.post(apiEndpint + '/main-leaderboard', authMiddleware.checkAuth, app_userController.getMainLeaderBoard);
    app.post(apiEndpint + '/user/main-leaderboard/:uId', authMiddleware.checkAuth, app_userController.getMainLeaderBoard);
    app.get(apiEndpint + '/gifts', authMiddleware.checkAuth, giftController.getGifts);
    app.post(apiEndpint + '/send-request', authMiddleware.checkAuth, FriendRequestController.sendRequest);
    app.get(apiEndpint + '/random-opponent', authMiddleware.checkAuth, FriendRequestController.randomOpponent);
    app.get(apiEndpint + '/pending-request', authMiddleware.checkAuth, FriendRequestController.getPendingRequest);
    app.put(apiEndpint + '/accept-request', authMiddleware.checkAuth, FriendRequestController.acceptRequest);
    app.post(apiEndpint + '/suggested-friends', authMiddleware.checkAuth, FriendRequestController.getSuggestionFriend);
    app.post(apiEndpint + '/recent-friend', authMiddleware.checkAuth, FriendRequestController.getRecentFriend);
    app.post(apiEndpint + '/is-your-friend', authMiddleware.checkAuth, FriendRequestController.isYourFriend);
    app.post(apiEndpint + '/user/recent-friend/:uId', authMiddleware.checkAuth, FriendRequestController.getRecentFriend);
    app.get(apiEndpint + '/badges', authMiddleware.checkAuth, badgeController.getBadgeByUser);
    app.get(apiEndpint + '/user/badges/:uId', authMiddleware.checkAuth, badgeController.getBadgeByUser);
    app.post(apiEndpint + '/get-activities', authMiddleware.checkAuth, resultController.getFilterData);
    app.post(apiEndpint + '/user/get-activities/:uId', authMiddleware.checkAuth, resultController.getFilterData);
    app.post(apiEndpint + '/counts', authMiddleware.checkAuth, generalController.getCountForApp);
    app.post(apiEndpint + '/user/counts/:uId', authMiddleware.checkAuth, generalController.getCountForApp);
    app.post(apiEndpint + '/counts/:courseId', authMiddleware.checkAuth, generalController.getCountForApp);
    app.post(apiEndpint + '/user/counts/:uId/:courseId', authMiddleware.checkAuth, generalController.getCountForApp);
    app.get(apiEndpint + '/active-streak', authMiddleware.checkAuth, streakAppliedController.checkActiveStreakForUser);
    app.get(apiEndpint + '/show-other-streak', authMiddleware.checkAuth, streakAppliedController.showOtherStreak);
    app.get(apiEndpint + '/streaks', authMiddleware.checkAuth, streakAppliedController.getAplliedStreakID);
    app.post(apiEndpint + '/entry-fee', authMiddleware.checkAuth, generalController.enrtyFee);
    app.post(apiEndpint + '/gift-redeem', authMiddleware.checkAuth, giftRedeemController.giftRedeem);
    app.post(apiEndpint + '/contact-us', authMiddleware.checkAuth, contactController.addContactUs);
    app.post(apiEndpint + '/charges', authMiddleware.checkAuth, stripeController.charges);
    app.post(apiEndpint + '/subscription-webhooks', stripeController.webHooks);
    app.post(apiEndpint + '/avatar-purchase', authMiddleware.checkAuth, userAvatarController.avatarPurchase);
    app.get(apiEndpint + '/user-avatar', authMiddleware.checkAuth, userAvatarController.getUserAvatar);
    app.get(apiEndpint + '/played-streaks', authMiddleware.checkAuth, streakAppliedController.getUserPlayedStreak);
    app.get(apiEndpint + '/user/played-streaks/:uId', authMiddleware.checkAuth, streakAppliedController.getUserPlayedStreak);
    app.get(apiEndpint + '/cron-progress-report', generalController.progressReport);
    app.get(apiEndpint + '/cron-quiz-reminder', generalController.quizReminder);
    app.get(apiEndpint + '/cron-practice-reminder', generalController.practiceReminder);

    app.get(apiEndpint + '/payments', authMiddleware.checkAuth, paymentController.getAllPaymentsOfUser);
    app.get(apiEndpint + '/battle-results', authMiddleware.checkAuth, battleController.getBattleResult);
    app.get(apiEndpint + '/next-rank', authMiddleware.checkAuth, generalController.nextRankOfUser);
    app.get(apiEndpint + '/link-generate', authMiddleware.checkAuth, deepLinkingController.generateLink);
    app.get('/verify', app_userController.varifiedProfile);
    app.get('/invites',
        deeplink({
            fallback: 'http://potatomath.com',
            android_package_name: 'com.potatomath',
            ios_store_link: 'com.acquaint.potatomath'
        })
    );
    app.post(apiEndpint + '/next-badge', authMiddleware.checkAuth, badgeController.nextBadgeByCourse);
    app.get(apiEndpint + '/request-check', authMiddleware.checkAuth, FriendRequestController.notifyFriend);
    app.post(apiEndpint + '/add-battle', authMiddleware.checkAuth, battleController.addBattleResult);
    app.post(apiEndpint + '/add-battle-request', authMiddleware.checkAuth, battleRequestController.addBattleRequest);
    app.post(apiEndpint + '/update-battle-request', authMiddleware.checkAuth, battleRequestController.updateBattleRequestByToken);
    app.get(apiEndpint + '/get-battle-request', authMiddleware.checkAuth, battleRequestController.getBattleRequestByReceiverId);
    app.get(apiEndpint + '/get-complete-battle-notification', authMiddleware.checkAuth, battleRequestController.getBattleRequestBySenderId);
    app.get(apiEndpint + '/get-pending-battles', authMiddleware.checkAuth, battleRequestController.getPendingBattlesCount);
    app.post(apiEndpint + '/mark-read-notification', authMiddleware.checkAuth, generalController.markNotificationRead);
    app.post(apiEndpint + '/view-battle-result', authMiddleware.checkAuth, battleRequestController.getBattleRequestByToken);
    app.post(apiEndpint + '/set-notification-token', authMiddleware.checkAuth, appNotificationController.setNotificationToken);
    app.post(apiEndpint + '/log-out', authMiddleware.checkAuth, appNotificationController.logout);

    //inapppurchase
    app.post(apiEndpint + '/chargesforIAP', authMiddleware.checkAuth, inAppPurchaseController.charges)
    app.get(apiEndpint + '/iap_subscriptionRenewalandCancel', iapManagerController.renewOrCancelSubscriptions)
    app.put(apiEndpint + '/notification_settings', authMiddleware.checkAuth, app_userController.updateNotificationSetting);
}