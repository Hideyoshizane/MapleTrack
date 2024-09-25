const express = require('express');
const router = express.Router();

const authentication = require('../middleware/authentication');

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const searchController = require('../controllers/searchController');
const characterController = require('../controllers/characterController');
const bossController = require('../controllers/bossController');

router.get('/', authentication.redirectHome, async (req, res) => {
	res.render('landing');
});

router.get('/login', authentication.redirectHome, async (req, res) => {
	res.render('login', { flash: req.flash() });
});

router.get('/signup', authentication.redirectHome, async (req, res) => {
	res.render('signup', { flash: req.flash() });
});

router.get('/forgot', authentication.redirectHome, async (req, res) => {
	res.render('forgot');
});

router.get('/search', searchController.search);
router.get(
	'/weeklyBoss',
	authentication.extractUserInfo,
	userController.weeklyBoss,
);
router.get(
	'/bossList/:username',
	authentication.extractUserInfo,
	authentication.ensureAuthentication,
	bossController.getList,
);
router.get(
	'/editBosses',
	authentication.extractUserInfo,
	bossController.editBosses,
);
router.get('/signout', authentication.extractUserInfo, userController.signout);
router.get('/account', authentication.extractUserInfo, userController.account);

router.post('/login', authController.login);
router.post('/signup', userController.signup);
router.post(
	'/increaseDaily',
	authentication.extractUserInfo,
	characterController.increaseDaily,
);
router.post(
	'/increaseWeekly',
	authentication.extractUserInfo,
	characterController.increaseWeekly,
);
router.post(
	'/updateCharacter',
	authentication.extractUserInfo,
	characterController.updateCharacter,
);
router.post(
	'/checkBoss',
	authentication.extractUserInfo,
	bossController.increaseBoss,
);
router.post(
	'/saveBossChange',
	authentication.extractUserInfo,
	bossController.saveBossChange,
);
router.post('/forgotUsername', userController.forgotUsername);
router.post('/resetEmptyAccount', userController.resetEmptyAccount);
router.post('/forgotPasswordLevel', userController.forgotPasswordLevel);
router.post(
	'/updatePassword',
	authentication.extractUserInfo,
	userController.updatePassword,
);

router.get('/home', authentication.extractUserInfo, userController.home);
router.get(
	'/userServer',
	authentication.extractUserInfo,
	searchController.userServer,
);
router.get(
	'/serverName/:serverID',
	authentication.extractUserInfo,
	searchController.serverName,
);
router.get(
	'/:username/:server/:characterClass',
	authentication.extractUserInfo,
	authentication.ensureAuthentication,
	characterController.redirectCharacter,
);
router.get(
	'/:username/:server/:characterClass/edit',
	authentication.extractUserInfo,
	authentication.ensureAuthentication,
	characterController.editCharacter,
);
router.get(
	'/class/:username/:server/:characterClass',
	authentication.extractUserInfo,
	authentication.ensureAuthentication,
	characterController.getCharacterData,
);
router.get(
	'/:username/:server',
	authentication.extractUserInfo,
	authentication.ensureAuthentication,
	characterController.fullCharacter,
);

module.exports = router;
