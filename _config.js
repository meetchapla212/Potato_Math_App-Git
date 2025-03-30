module.exports = {
	port: 5555,
	name: 'potato_math',
	dbHost: (process.env.NODE_ENV == "production") ? 'potatomath-main.csnp9nttgmlr.ap-southeast-1.rds.amazonaws.com' : 'localhost',
	dbUserName: (process.env.NODE_ENV == "production") ? 'pm_rootmaster' : 'postgres',
	dbPassword: (process.env.NODE_ENV == "production") ? '24zqP3&pXOqn' : 'agc123',
	dbName: (process.env.NODE_ENV == "production") ? 'potatomath_main' : 'potato_math',
	dbPort: '5432',
	saltRounds: 2,
	jwtSecret: 'potato_math@159*',
	api_key: 'JPcopEq16fyQGjnzY3QXVDnGDZrgQAs1',
	no_data_message: 'No data found!!',
	uploadDir: './uploads/',
	courseImagePath: 'course_images/',
	avatarImagePath: 'avatar_images/',
	quizImagePath: 'quiz_images/',
	topicImagePath: 'topic_images/',
	appUserImagePath: 'app_user_images/',
	achievementImagePath: 'archievement_Images/',
	badgeImagePath: 'badge_Images/',
	giftImagePath: 'gift_Images/',
	rankImagePath: 'rank_Images/',
	streakImagePath: 'streak_Images/',
	blogImagePath: 'blog_Images/',
	contactUsFilePath: 'contact_Us/',
	tokenExpireTime: 60 * 60 * 24,
	appTokenExpireTime: 60 * 60 * 24 * 30,
	stripe_secret_key : 'sk_test_yOHo1jYXSOOxEfiIyR01VI5A00bmJ2NpFj',
	entry_fee: 5,
	dataLimit: 10,
	Default_Potato_Rank: 'Basic Potato',
	getServerUrl(req) {
		var serverURL = (process.env.NODE_ENV == "production") ? 'http://13.251.162.218:5555/' : 'http://192.168.42.25:5555/';
		return serverURL;
	}
}

//don't store this file in repository, it's unsecure
