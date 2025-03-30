const authService = require('../services/auth');

function login(req, res) {
	return authService.authenticate(req.body)
		.then(token => {
			res.send({
				status: true,
				data: { token }
			});
		})
		.catch(err => {
			if (err.type === 'custom') {
				return res.status(403).send({
					status: false,
					message: err.message
				});
			}
			return res.status(403).send({
				status: false,
				message: 'Invalid Email Id or Password!'
			});
		})
};

module.exports = {
	login
}
