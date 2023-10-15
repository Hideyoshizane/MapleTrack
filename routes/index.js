const Router = require('koa-router');

const authenticate = require('../middleware/passport');

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const searchController = require('../controllers/searchController');
const characterController = require('../controllers/characterController');
const bossController = require('../controllers/bossController');



const router = new Router();

router.get('/', async (ctx, next) => {
    await ctx.render('login');
});

router.get('/login', async (ctx, next) => {
    await ctx.render('login');
});

router.get('/signup', async (ctx, next) => {
    await ctx.render('signup');
});

router.get('/search', authenticate.ensureAuthenticated, searchController.search);
router.get('/weeklyBoss', authenticate.ensureAuthenticated, userController.weeklyBoss);
router.get('/bossList/:username', authenticate.ensureAuthenticated, bossController.getList);
router.get('/editBosses', authenticate.ensureAuthenticated, bossController.editBosses);

router.post('/login', authController.login);
router.post('/signup', userController.signup);
router.post('/increaseDaily', authenticate.ensureAuthenticated, characterController.increaseDaily);
router.post('/increaseWeekly', authenticate.ensureAuthenticated, characterController.increaseWeekly);
router.post('/updateCharacter', authenticate.ensureAuthenticated, characterController.updateCharacter);
router.post('/checkBoss', authenticate.ensureAuthenticated, bossController.increaseBoss);
router.post('/saveBossChange', authenticate.ensureAuthenticated, bossController.saveBossChange);

router.get('/userServer', authenticate.ensureAuthenticated, searchController.userServer);
router.get('/serverName/:serverID', authenticate.ensureAuthenticated, searchController.serverName);

router.get('/:username/:server/:characterClass', authenticate.ensureAuthenticated, characterController.redirectCharacter);
router.get('/:username/:server/:characterCode/edit', authenticate.ensureAuthenticated, characterController.editCharacter);
router.get('/code/:username/:server/:characterCode', characterController.getCharacterData);

router.get('/:username/:server', authenticate.ensureAuthenticated, characterController.fullCharacter);
router.get('/home', authenticate.ensureAuthenticated, userController.home);


module.exports = router;