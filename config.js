module.exports = {
	port: 5555,
	name: 'potato_math',
	dbHost: 'potatomath-main.csnp9nttgmlr.ap-southeast-1.rds.amazonaws.com',
	dbUserName: 'pm_rootmaster',
	dbPassword: '24zqP3&pXOqn',
	dbName: 'potatomath_main',
	saltRounds: 2,
	jwtSecret: 'potato_math@159*',
	api_key: 'JPcopEq16fyQGjnzY3QXVDnGDZrgQAs1',
	API_KEY: 'b6be6720e6c849ae5828f7adaefeca73',
	SECRET_KEY: '8a28c99c5ba7839cef73667928bf858d',
	no_data_message: 'No data found!!',
	uploadDir: './uploads/',
	questionFiles: 'question_files/',
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
	galleryImagePath: 'gallery_image/',
	tokenExpireTime: 60 * 60 * 24,
	appTokenExpireTime: 60 * 60 * 24 * 30,
	stripe_secret_key: 'sk_test_yOHo1jYXSOOxEfiIyR01VI5A00bmJ2NpFj',
	entry_fee: 5,
	dataLimit: 10000,
	Default_Potato_Rank: 'Raw Potato',
	initial_coin: 50,
	daily_coin: 5,
	leaderboard_limit: 10,
	domain: 'http://app.potatomath.com/app',
	getServerUrl(req) {
		var serverURL = 'http://app.potatomath.com:5555/';
		return serverURL;
	},
	battle_send: "{user} has challenged you for a battle.",
	battle_send_heading: "Challenge",
	battle_result_user_message_won: "{friend} accepted your battle request, you won the challenge",
	battle_result_user_message_lost: "{friend} accepted your battle request, you lost the challenge",
	battle_result_user_message_tie: "{friend} accepted your battle request, it's a tie!",
	battle_result_user_heading_won: "Won",
	battle_result_user_heading_lost: "Lost",
	battle_result_user_heading_tie: "Tied",
	battle_declined_message: "{friend} declined your challenge",
	battle_declined_heading: "Battle Declined",
	battle_request_type: 'battle_request',
	battle_result_type: 'battle_result',
	friend_request_type: 'friend_request',
	daily_coin: 'daily_coin',
	quiz_reminder_heading: 'Free coins reminder',
	friend_request_heading: 'Friend Request',
	friend_request_message: "{user} sent you a friend request",
	quiz_reminder_message: "Collect today's daily free coin",
	friend_declined_message: "{friend} declined your friend request",
	friend_accepted_message: "{friend} accepted your friend request",
	practice_reminder_heading: "Daily quiz reminder",
	practice_reminder_message: "It's time for your daily practice",
	applepassword: 'f21df421d592469ba61876b568e1a5df',
	googlePublicKeyStrSandBox: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxsnOEK+6C3yDrPm5J/+38gExL7hRJk/EX2BZDs3gfwn0M46WDw2CJg8Bn09ogSSMwtvYmy4MCdbUE43xrJoQ2Smh7z7kjMINKOPd8h1XMNSNXW40HairM/08kQDpeZY8LRCaEjqZzh6R8sZxN3acaJt7FwmaJQR9sieAzElsOR9qf8SlXMDfdK4JaULbExQycBP6VFqbyBVnuIZ0/9MW2qkUKdEnM/nOUUrelwvNY5lp+hdmVeaVzo07rEKkN5KdTbIHSC/WOQonbA7oN3Zy/XR9pmYrm3SDBX64GjrN+zE0IeD/U3vhJPL+fRkDebRfTojDKv3bPRr+VlLRlWBWVQIDAQAB',
	googlePublicKeyStrLive: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxsnOEK+6C3yDrPm5J/+38gExL7hRJk/EX2BZDs3gfwn0M46WDw2CJg8Bn09ogSSMwtvYmy4MCdbUE43xrJoQ2Smh7z7kjMINKOPd8h1XMNSNXW40HairM/08kQDpeZY8LRCaEjqZzh6R8sZxN3acaJt7FwmaJQR9sieAzElsOR9qf8SlXMDfdK4JaULbExQycBP6VFqbyBVnuIZ0/9MW2qkUKdEnM/nOUUrelwvNY5lp+hdmVeaVzo07rEKkN5KdTbIHSC/WOQonbA7oN3Zy/XR9pmYrm3SDBX64GjrN+zE0IeD/U3vhJPL+fRkDebRfTojDKv3bPRr+VlLRlWBWVQIDAQAB',
	googleAccToken: '4/0AY0e-g7Z_5d7xNPKB9khNyXOZsQQOVPvRUdNeUKQf7tenBwfLHE_KzI9DKuVINT1Ts4vhw',
	googleRefToken: '1//04AV4vh15LAciCgYIARAAGAQSNwF-L9IrYazTTNDmpIA7Okg6M6V_n1NnsH1PpOtpCY_GF_1fcndD1GBxI0PvRonF3Jw2UhPPnNw',
	googleClientID: '584398249667-06vt0ltvke51ubhiqc3r5hjlu05rpoom.apps.googleusercontent.com',
	googleClientSecret: 'esYgT3GwH7nvURrNVE5VNCjq',
	clientEmail: 'potatomath-434@reliable-return-298711.iam.gserviceaccount.com',
	googleprivateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCQtGXmdYxohNWm\nfJNN5F9r881HuQ2sXAZjupVpByOqNoksMh4qP4hnLcI4nxEhsli8OFP1a3hM+fuT\nrjf7Ykdaf35LfkJn+2550UeETXea+SkxnjA9VI1eH6jA4ryJtNG5Sycj/UdojgbF\nnhUIq18Gx1XbJe5/AL5XWNsFsP2bWUKRYnZLQSkEyGl1htWPbuegy50KdrWuCak+\nHhrIKTxYvw/3AIRN6ALmphcBkRW+T3n3kkRMVZ+Cfo2u4NrK7L3lGszImsvboeRW\niLlfmB9GnJVByKuAo2EpgJqWqmCqNNlivTx8WJILVWJqA/QA0tM+ZTRaEOT//QY8\ndyEgsbCzAgMBAAECggEAAaJf8j81SOroeiW3CNlW8I0Dg6ywiFf5DyrzdrOzcJUx\nbb6FKQdS/uNSlGQg2Ty+lCWeC8wHwvV3JL8CIoSEzMiwKvcaleUOOtxPuUv3WViO\nDAw+0Y/WZuU8ToK2YWcZj++sL1O0I5dTC+v8oylC/KccrknFN0mmsgLZZRI6KFp7\nNSqq7/aciyAVwGo+Zbz+XHYSDvg2qV4lkqWbwAlJ6UqXUCn4oy6lMkGp8e3QvM6+\n2rB8qJ3am8WQOVZOaBoUJRcuGaTn+J3UpfjEBaeufi+QpYMr5OqE7Dyy8k4soDzv\n3SQVVsHz4ONNV9FdcC6qhA3KZnlu3dFwMt+t4skuJQKBgQDBrIR+hZVhcXSfhhne\nj1nmbwU2wIhb3keM5XF6km5X9s1Ulmjs0oNuMHp3U5/4XhGxHLejGUnqgpVQFGwL\nCXN/lD2Ti9qDAdbTgl9JBl/kaxABltM1Ve5BMwH3F6jpQrHEMaYjwaOjcx52Vsaa\n/+Hq7eJTxfL/dKV7y/jQ9EjtJQKBgQC/RaNOp63LeJfo4/S5rDBovWn9BAd/BZtk\n4ImrzddFfHXCfqRXncRBZDC99+zZXs5b7dD/eGNOhYeXkD4jQcu0i1GZkJB1Dm8H\n549qF7j0+wDJ8TulwESK+l9U7MbsVorx4uJ5VtKv7q0+lLH9VRDycQg5qcqKNLY+\nwmQcP2i69wKBgA0iw1XFf609Qbi0IrsKpAFSFFtzUYxRli7DPSAgIGXM8n5DOVie\nqpVlqli/jkENOEv386iXRYEnXDMzP2S8Pl4v0sFYIfjyvfxYglf0m7plXI+PCEI8\n0s0PRZnZu/YeNOpmp6sTLiMe4rkKB6xpoIwLmGcwLNwQsEymN/kMKIoVAoGBAKyA\nv7IWZBXX4xl1TaeO9fHgspAwbBpREj6+iytZb8cJYqNQ2CL09KUNGTCbQw8gA/jA\n2PcuulF8+DbnLkNZ+cAQzj0zNjV8GQMGAj/quTKolaOLXwI0Dx1QhV3wVc+clZ9l\nwl8wwL9PAQwpywTxDWG6M3LeAP74X0zmwKcBQREtAoGARhKwPukMf5ErDz4H8pax\nol5zn5b97uKVgRtPcKbE2V87LH1mHJlPFRo4VkirM/38iqIKtpdbXYFDM2/Al4+2\nz8NXzQ9Rz1SwiioupM57gWv6OCUrsDDn6hIWgGlB1HkB4fnvGCLJRfdo6wkSQ7i/\nbHYSPuVH7sA5tHw/YEuZImw=\n-----END PRIVATE KEY-----\n'
}

//don't store this file in repository, it's unsecure
