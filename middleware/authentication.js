const jwt = require('jsonwebtoken');
require('dotenv').config();

const extractUserInfo = (req, res, next) => {
	const token = req.cookies.token;

	if (!token) {
		return res.redirect('/login');
	}

	jwt.verify(token, process.env.SECRET, (err, decoded) => {
		if (err) {
			return res.status(401).json({ message: 'Invalid token' });
		}
		res.locals.username = decoded.username;
		res.locals._id = decoded._id;

		next();
	});
};

const redirectHome = (req, res, next) => {
	const token = req.cookies.token;
	if (!token) {
		next();
	} else {
		res.redirect('/home');
	}
};

const ensureAuthentication = (req, res, next) => {
	const searchUsername = req.body.username || req.params.username;
	const loggedUsername = res.locals.username;
	const token = req.cookies.token;

	if (searchUsername && loggedUsername) {
		if (searchUsername === loggedUsername) {
			next();
		} else {
			const redirectPath = token ? '/home' : '/login';
			res.redirect(redirectPath);
		}
	} else {
		res.status(400).send('Bad Request');
	}
};

module.exports = {
	extractUserInfo,
	ensureAuthentication,
	redirectHome,
};
