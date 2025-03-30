const config = require('../config');
var admin = require("firebase-admin");
var appNotificationService = require('../services/app_notification_token');
var battleRequest = require('../services/battle_request');

admin.initializeApp({
    credential: admin.credential.cert(require("../potato-firebase.json")),
    databaseURL: "https://potatomath-cfe27.firebaseio.com"
});

function chunkArray(array, size) {
    let result = []
    for (value of array) {
        let lastArray = result[result.length - 1]
        if (!lastArray || lastArray.length === size) {
            result.push([value])
        } else {
            lastArray.push(value)
        }
    }
    return result
}

async function sendNotification(user_id, title, body, data) {

    var badgeCount = await battleRequest.getPendingBattlesCount(user_id)

    const userTokens = []
    if (user_id) {
        var result = await appNotificationService.getTokens(user_id)
    } else {
        var result = await appNotificationService.getAllTokens()
    }
    if (result.length > 0)
        result.forEach(element => {
            userTokens.push(element.token)
        });

    let finalChunks = chunkArray(userTokens, 1000)
    // await Promise.each(finalChunks, async (chunk) => {
    finalChunks.forEach(chunk => {

        message = {
            notification: {
                title: title,
                body: body,
            },
            android: {
                priority: "high"
            },
            apns: {
                headers: {
                    "apns-priority": "10"
                },
                payload: {
                    aps: {
                        badge: parseInt(badgeCount.length) + 1,
                        sound: 'default'
                    }
                }
            },
            sound: 'default',
            badge: parseInt(badgeCount.length) + 1,
            data: data,
            tokens: chunk
        }

        return admin.messaging().sendMulticast(message)
            .then((response) => {
                return true
            })
    });
    // })
}


module.exports = {
    sendNotification
}