const jwt = require('jsonwebtoken');
const config = require('../config');
const textData = require('../pmath-config.json');
const delay = 0;
const checkAuth = async (req, res, next) => {
	const { authorization } = req.headers;

	if (!authorization) return res.status(403).send({ auth: false, message: 'No token provided.' });

	const [authType, token] = authorization.trim().split(' ')
	if (authType !== 'Bearer') return res.status(403).send({ auth: false, message: 'No token provided.' });

	if (!token)
		return res.status(403).send({ auth: false, message: 'No token provided.' });
	await sleep(delay);
	jwt.verify(token, config.jwtSecret, (err, decoded) => {
		if (err)
			return res.status(403).send({ auth: false, message: 'Failed to authenticate token.' });

		req.user = {
			email_id: decoded.email_id,
			id: decoded.id
		};
		req.config = { setting: textData }
		next();
	});
}

const checkAdminAuth = async (req, res, next) => {
	const { authorization } = req.headers;
	if (!authorization) return res.status(403).send({ auth: false, message: 'No token provided.' });

	const [authType, token] = authorization.trim().split(' ')
	if (authType !== 'Bearer') return res.status(403).send({ auth: false, message: 'No token provided.' });

	if (!token)
		return res.status(403).send({ auth: false, message: 'No token provided.' });

	await sleep(delay);
	jwt.verify(token, config.jwtSecret, (err, decoded) => {
		if (err)
			return res.status(403).send({ auth: false, message: 'Failed to authenticate token.' });

		req.adminuser = {
			email_id: decoded.email_id,
			id: decoded.id
		};
		next();
	});
}

const checkMobileAuth = async (req, res, next) => {
	const { api_key } = req.headers;
	req.config = { setting: textData }
	if (!api_key) return res.status(403).send({ auth: false, message: 'No API key provided.' });

	if (config.api_key !== api_key)
		return res.status(403).send({ auth: false, message: 'No authentication' });

	await sleep(delay);
	next();
}

function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
module.exports = {
	checkAuth,
	checkMobileAuth,
	checkAdminAuth
}
