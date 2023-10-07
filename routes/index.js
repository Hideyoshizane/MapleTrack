const Router = require('koa-router');

const authenticate = require('../middleware/passport');


const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const searchController = require('../controllers/searchController');
const characterController = require('../controllers/characterController');

const router = new Router();

router.get('/', async (ctx, next) => {
    await ctx.render('login');
});

router.get('/login', async (ctx, next) => {
    await ctx.render('login');
});

router.post('/login', authController.login);

router.get('/signup', async (ctx, next) => {
    await ctx.render('signup');
})

router.post('/signup', userController.signup);

router.get('/home', authenticate.ensureAuthenticated, userController.home);

router.get('/search', authenticate.ensureAuthenticated, searchController.search);

router.get('/weeklyBoss', authenticate.ensureAuthenticated, userController.weeklyBoss);

router.get('/:username/:server/:characterClass', authenticate.ensureAuthenticated, characterController.redirectCharacter);

router.get('/:username/:server/:characterCode/edit', authenticate.ensureAuthenticated, characterController.editCharacter);

router.get('/code/:username/:server/:characterCode', characterController.getCharacterData);

router.get('/userServer', authenticate.ensureAuthenticated, searchController.userServer);

router.get('/serverName/:serverID', authenticate.ensureAuthenticated, searchController.serverName);

router.get('/:username/:server', authenticate.ensureAuthenticated, characterController.fullCharacter);

router.post('/increaseDaily', authenticate.ensureAuthenticated, characterController.increaseDaily);

router.post('/increaseWeekly', authenticate.ensureAuthenticated, characterController.increaseWeekly);

router.post('/updateCharacter', authenticate.ensureAuthenticated, characterController.updateCharacter);

module.exports = router;