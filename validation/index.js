const Joi = require('joi');

module.exports = {
    login: {
        body: {
            email_id: Joi.string().required(),
            password: Joi.string().required()
        }
    }
}; 