/*********************************************************************************************************** */
//                                  This is API Router for Admin APP                                       //
/********************************************************************************************************* */

const validations = require('../validation/index');
const authController = require('./../controllers/auth');
const coinController = require('../controllers/coin');
const courseController = require('../controllers/course');
const questionController = require('../controllers/question');
const topicController = require('../controllers/topic');
const generalController = require('../controllers/general')
const difficultyController = require('../controllers/difficulty')
const gradeController = require('../controllers/grade')
const questionMapController = require('../controllers/question_map')
const achievementController = require('../controllers/achievement')
const resultController = require('../controllers/result')
const resultDetailController = require('../controllers/result_detail')
const badgeController = require('../controllers/badge')
const giftController = require('../controllers/gift')
const streakController = require('../controllers/streak')
const rankController = require('../controllers/rank')
const blogController = require('../controllers/blog')
const contactController = require('../controllers/contact')
const paymentController = require('../controllers/payment_history')
const app_userController = require('../controllers/app_user')
const appSettingController = require('../controllers/app_setting')
const galleryController = require('../controllers/gallery')
const appTextController = require('../controllers/app_text_configuration')
const adminController = require('../controllers/admin')
const apiEndpint = "/api/admin/v1";
const authMiddleware = require('./../middlewares/auth');

var validate = require('express-validation');
validate.options({
	errors: [],
	status: 422,
	statusText: 'Invalid Parameter..!'
});

module.exports.set = (app) => {
	app.post(apiEndpint + '/login', validate(validations.login), authController.login);
	app.post(apiEndpint + '/user', authMiddleware.checkAdminAuth, adminController.addUser);
	app.get(apiEndpint + '/user/:id', authMiddleware.checkAdminAuth, adminController.getUserById);
	app.put(apiEndpint + '/user', authMiddleware.checkAdminAuth, adminController.updateUserById);
	app.get(apiEndpint + '/user', authMiddleware.checkAdminAuth, adminController.getAllAdminUser);

	app.get(apiEndpint + '/dashboard', authMiddleware.checkAdminAuth, generalController.getCount);
	app.get(apiEndpint + '/leaderboard/:gradeId', authMiddleware.checkAdminAuth, generalController.getAdminLeaderBoard);
	app.get(apiEndpint + '/settings', authMiddleware.checkAdminAuth, appSettingController.getSettings);
	app.get(apiEndpint + '/gift-redeem', authMiddleware.checkAdminAuth, generalController.getGiftRedeem);

	app.get(apiEndpint + '/users', authMiddleware.checkAdminAuth, app_userController.getUsers);
	app.get(apiEndpint + '/users/:gradeId', authMiddleware.checkAdminAuth, app_userController.getUsers);
	// app.get(apiEndpint + '/filter-users/:gradeId', app_userController.getFilterUsers);
	app.get(apiEndpint + '/contacts/:contactId', authMiddleware.checkAdminAuth, contactController.getContactUsById);
	app.get(apiEndpint + '/contacts', authMiddleware.checkAdminAuth, contactController.getAllContactUs);

	app.get(apiEndpint + '/payments', authMiddleware.checkAdminAuth, paymentController.getAllPayments);

	app.post(apiEndpint + '/texts', authMiddleware.checkAdminAuth, appTextController.addText);
	app.get(apiEndpint + '/texts/:id', authMiddleware.checkAdminAuth, appTextController.getTextById);
	app.get(apiEndpint + '/texts', authMiddleware.checkAdminAuth, appTextController.getAllTextsForAdmin);
	app.put(apiEndpint + '/texts', authMiddleware.checkAdminAuth, appTextController.updateTextById);

	app.get(apiEndpint + '/coins/:coinId', authMiddleware.checkAdminAuth, coinController.getCoinById);
	app.get(apiEndpint + '/coins', authMiddleware.checkAdminAuth, coinController.getAllCoins);
	app.post(apiEndpint + '/coins', authMiddleware.checkAdminAuth, coinController.addCoin);
	app.put(apiEndpint + '/coins/:coinId', authMiddleware.checkAdminAuth, coinController.updateCoinById);
	app.delete(apiEndpint + '/deleteCoin/:coinId',authMiddleware.checkAuth, coinController.DeleteCoinById)

	app.post(apiEndpint + '/blogs', authMiddleware.checkAdminAuth, blogController.addBlog);
	app.get(apiEndpint + '/blogs/:blogId', authMiddleware.checkAdminAuth, blogController.getBlogByIdForAdmin);
	app.get(apiEndpint + '/blogs', authMiddleware.checkAdminAuth, blogController.getBlogs);
	app.put(apiEndpint + '/blogs', authMiddleware.checkAdminAuth, blogController.updateBlogById);

	app.post(apiEndpint + '/courses', authMiddleware.checkAdminAuth, courseController.addCourse);
	app.get(apiEndpint + '/courses/:courseId', authMiddleware.checkAdminAuth, courseController.getCourseById);
	app.get(apiEndpint + '/courses', authMiddleware.checkAdminAuth, courseController.getAllCoursesByGradesInAdmin);
	app.get(apiEndpint + '/courses-for-questions', authMiddleware.checkAdminAuth, courseController.getAllCourses);
	app.put(apiEndpint + '/courses', authMiddleware.checkAdminAuth, courseController.updateCourseById);

	app.post(apiEndpint + '/questions', authMiddleware.checkAdminAuth, questionController.addQuestion);
	app.post(apiEndpint + '/csv-questions', authMiddleware.checkAdminAuth, questionController.addCSV);
	app.get(apiEndpint + '/questions/:questionId', authMiddleware.checkAdminAuth, questionController.getQuestionById);
	app.get(apiEndpint + '/questions', authMiddleware.checkAdminAuth, questionController.getAllQuestions);
	app.get(apiEndpint + '/welcome-questions', authMiddleware.checkAdminAuth, questionController.getWelcomeQuestions);
	app.get(apiEndpint + '/grades/:gradeId/welcome-questions', authMiddleware.checkAdminAuth, questionController.getWelcomeQuestions);
	app.get(apiEndpint + '/normal-questions', authMiddleware.checkAdminAuth, questionController.getNormalQuestions);
	app.put(apiEndpint + '/questions', authMiddleware.checkAdminAuth, questionController.updateQuestionById);

	app.post(apiEndpint + '/images', authMiddleware.checkAdminAuth, galleryController.addImage);
	app.get(apiEndpint + '/images', authMiddleware.checkAdminAuth, galleryController.getImages);

	app.post(apiEndpint + '/topics', authMiddleware.checkAdminAuth, topicController.addTopic);
	app.get(apiEndpint + '/topics/:topicId', authMiddleware.checkAdminAuth, topicController.getTopicById);
	app.get(apiEndpint + '/courses/:courseId/topics', authMiddleware.checkAdminAuth, topicController.getAllTopics);
	app.get(apiEndpint + '/topics', authMiddleware.checkAdminAuth, topicController.getAllTopics);
	app.put(apiEndpint + '/topics', authMiddleware.checkAdminAuth, topicController.updateTopicById);

	app.get(apiEndpint + '/difficulties', authMiddleware.checkAdminAuth, difficultyController.getAllDifficulties);

	app.post(apiEndpint + '/grades', authMiddleware.checkAdminAuth, gradeController.addGrade);
	app.get(apiEndpint + '/grades/:gradeId', authMiddleware.checkAdminAuth, gradeController.getGradeById);
	app.get(apiEndpint + '/grades/:gradeId/courses', authMiddleware.checkAdminAuth, courseController.getAllCoursesByGradesInAdmin);
	app.get(apiEndpint + '/grades', authMiddleware.checkAdminAuth, gradeController.getAllGradesForAdmin);
	app.get(apiEndpint + '/grades-for-questions', authMiddleware.checkAdminAuth, gradeController.getAllGrades);

	app.put(apiEndpint + '/grades', authMiddleware.checkAdminAuth, gradeController.updateGradeById);

	app.post(apiEndpint + '/filter-questions', authMiddleware.checkAdminAuth, questionMapController.getFilterQuestion);
	// app.get(apiEndpint + '/maps/:mapId',authMiddleware.checkAdminAuth, questionMapController.getMapById);
	// app.get(apiEndpint + '/questions/:questionId/maps',authMiddleware.checkAdminAuth, questionMapController.getAllMaps);
	// // app.get(apiEndpint + '/maps',authMiddleware.checkAdminAuth, questionMapController.getAllMaps);
	// app.put(apiEndpint + '/maps',authMiddleware.checkAdminAuth, questionMapController.updateMapById);

	app.post(apiEndpint + '/achievements', authMiddleware.checkAdminAuth, achievementController.addAchievement);
	app.get(apiEndpint + '/achievements/:achievementId', authMiddleware.checkAdminAuth, achievementController.getAchievementById);
	app.get(apiEndpint + '/achievements', authMiddleware.checkAdminAuth, achievementController.getAllAchievements);
	app.put(apiEndpint + '/achievements', authMiddleware.checkAdminAuth, achievementController.updateAchievementById);

	app.post(apiEndpint + '/badges', authMiddleware.checkAdminAuth, badgeController.addBadge);
	app.get(apiEndpint + '/badges/:badgeId', authMiddleware.checkAdminAuth, badgeController.getBadgeById);
	app.get(apiEndpint + '/badges', authMiddleware.checkAdminAuth, badgeController.getAllBadges);
	app.put(apiEndpint + '/badges', authMiddleware.checkAdminAuth, badgeController.updateBadgeById);

	app.post(apiEndpint + '/gifts', authMiddleware.checkAdminAuth, giftController.addGift);
	app.get(apiEndpint + '/gifts/:giftId', authMiddleware.checkAdminAuth, giftController.getGiftById);
	app.get(apiEndpint + '/gifts', authMiddleware.checkAdminAuth, giftController.getGifts);
	app.put(apiEndpint + '/gifts', authMiddleware.checkAdminAuth, giftController.updateGiftById);

	app.post(apiEndpint + '/ranks', authMiddleware.checkAdminAuth, rankController.addRank);
	app.get(apiEndpint + '/ranks/:rankId', authMiddleware.checkAdminAuth, rankController.getRankById);
	app.get(apiEndpint + '/ranks', authMiddleware.checkAdminAuth, rankController.getAllRanks);
	app.put(apiEndpint + '/ranks', authMiddleware.checkAdminAuth, rankController.updateRankById);

	app.post(apiEndpint + '/streaks', authMiddleware.checkAdminAuth, streakController.addStreak);
	app.get(apiEndpint + '/streaks/:streakId', authMiddleware.checkAdminAuth, streakController.getStreakById);
	app.get(apiEndpint + '/streaks', authMiddleware.checkAdminAuth, streakController.getAllStreaks);
	app.put(apiEndpint + '/streaks', authMiddleware.checkAdminAuth, streakController.updateStreakById);


	app.post(apiEndpint + '/results', authMiddleware.checkAdminAuth, resultController.addResult);

	app.post(apiEndpint + '/resultDeatils', authMiddleware.checkAdminAuth, resultDetailController.addResultDeatil);
}
