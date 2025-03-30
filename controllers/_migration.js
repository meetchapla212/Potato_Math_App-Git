const adminMaster = require('../models/admin').adminMaster;
const battleMaster = require('../models/battle_result_master').battleMaster;
const appSettingMaster = require('../models/app_setting').appSettingMaster;
const appTextMaster = require('../models/app_text_configuration').appTextMaster;
const textData = require('../pmath-config.json');

module.exports = {
    start_migration: function () {
        var admin_email = "admin@potatomath.com";
        var admin_password = "e311b07ddc7705b257871d6bbe1931789920824b0b02758127b9e1cc4b46c6d5";
        var data = { _user_id: 0, _opponent_id: 0, _course_id: 0, _topic_id: 0, _difficulty_id: 0, challenge_id: 0 }
        var admin = { email_id: admin_email, password: admin_password, first_name: 'Master', last_name: "Admin", role: 1 };
        var setting = [{ key: "Daily coin", value: 5 }, { key: "Initial coin", value: 50 }];

        adminMaster.count()
            .then(count => {
                if (count > 0) {
                    return false;
                }
                else {
                    adminMaster.create(admin);
                }
            });

        appSettingMaster.count()
            .then(count => {
                if (count > 0) {
                    return false;
                }
                else {
                    setting.forEach((ele) => {
                        appSettingMaster.create(ele);
                    })
                }
            });

        appTextMaster.count()
            .then(count => {
                if (count > 0) {
                    return false;
                }
                else {
                    for (var key in textData) {
                        var jsonObject = {
                            key: key,
                            value: typeof textData[key] == 'object' ? JSON.stringify(textData[key]) : textData[key],
                            type: typeof textData[key]
                        }
                        appTextMaster.create(jsonObject);
                    }
                }
            });

        battleMaster.count()
            .then(count => {
                if (count > 0) {
                    return false;
                } else {
                    battleMaster.create(data)
                }
            })
    }
};