const adminMaster = require('../models/admin').adminMaster;
const config = require('../config');
const CustomError = require('../customError');
const jwt = require('jsonwebtoken');
var crypto = require('crypto');

const authenticate = params => {
	return adminMaster.findOne({
		where: {
			email_id: params.email_id,
			is_delete: 0
		},
		raw: true
	}).then(user => {
		if (!user)
			throw new CustomError('Account not Found!');

		const password = crypto.createHmac('sha256', config.jwtSecret).update(params.password).digest('hex');
		if (user.password !== password)
			throw new CustomError('Invalid Password.')

		const payload = {
			first_name: user.first_name,
			last_name: user.last_name,
			email_id: user.email_id,
			id: user.admin_id,
			role: user.role,
			time: new Date()
		};

		var token = jwt.sign(payload, config.jwtSecret, {
			expiresIn: config.tokenExpireTime
		});

		return token;
	});
}

module.exports = {
	authenticate
}
