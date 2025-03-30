const Sequelize = require('sequelize');
const db = require('../db');
var courseMaster = require('./course_master').courseMaster
var userMaster = require('./app_users_master').userMaster

const gradeMaster = db.define('grade_masters', {
    grade_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    age: {
        type: Sequelize.INTEGER,
    },
    caption: {
        type: Sequelize.STRING(30)
    },
    category: {
        type: Sequelize.STRING(30),
    },
    _admin_id: {
        type: Sequelize.INTEGER,
    },
    is_delete: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    status: {
        type: Sequelize.STRING(15),
        defaultValue: 'active'
    },
});

gradeMaster.hasMany(courseMaster, { foreignKey: '_grade_id' })
courseMaster.belongsTo(gradeMaster, { as: 'grade_masters', foreignKey: '_grade_id' })

gradeMaster.hasMany(userMaster, { foreignKey: '_grade_id' })
userMaster.belongsTo(gradeMaster, { as: 'user_grade', foreignKey: '_grade_id' })

gradeMaster.hasMany(courseMaster, { foreignKey: '_grade_id' })
courseMaster.belongsTo(gradeMaster, { as: 'course_masters', foreignKey: '_grade_id' })


module.exports = {
    gradeMaster
}
