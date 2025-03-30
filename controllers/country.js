var countryService = require('../services/country');
const config = require('../config');

function getAllCountries(req, res) {

    return countryService.getAllCountries().then(result => {

        if (result) {
            var response = { status: true, data: result }
        } else {
            var response = { status: false, message: config.no_data_message }
        }
        res.send(response)
    });
};

module.exports = {
    getAllCountries
}