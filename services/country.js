const countryMaster = require('../models/country_master').countryMaster;
const sequelize = require('../db');
var Sequelize = require('sequelize');

const addCountry = data => countryMaster.create({
    ...data
}).then((result) => {
    var response = { status: true, message: "Success! Course added successfully!" }
    return response;
}).catch((error) => {
    var response = { status: false, message: "Error! Invalid data found", error }
    return response;
});

const getAllCountries = () => {

    var query = {
        where: {
            is_delete: 0
        },
        attributes: ['country_id', 'country_name'],
        order: [['country_id', 'ASC']]
    };

    return countryMaster.findAll(query).then(sequelize.getValues)
}

module.exports = {
    getAllCountries,
    addCountry
}