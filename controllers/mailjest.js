const config = require('../config');

var API_KEY = config.API_KEY; // (Put in file config)
var SECRET_KEY = config.SECRET_KEY; // (Put in file config)

var Mailjet = require("node-mailjet").connect(API_KEY, SECRET_KEY, {
    url: "api.mailjet.com", // default is the API url
    version: "v3.1", // default is '/v3'
    perform_api_call: true // used for tests. default is true
});

var emailObj = Mailjet.post('send');

function sendMail(templateId, subject, userDetails, variables) {
    console.log(templateId, subject, userDetails, variables)
    var emailData = {
        "Messages": [
            {
                "From": {
                    "Email": "hi@potatomath.com", // take from config file
                    "Name": "PotatoMath" //  take from config file
                },
                "To": userDetails,
                "TemplateID": templateId,
                "TemplateLanguage": true,
                "Subject": subject,
                "Variables": variables
            }
        ]
    }

    emailObj.request(emailData)
        .then((response) => {
            var responseBody = response.body;
            if (responseBody.Messages[0].Status == 'success') {
                console.log("Mail Sent..");
            }
        })
        .catch((error) => {
            console.log("Error", error);
        });
}

module.exports = {
    sendMail
}