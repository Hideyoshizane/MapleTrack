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

router.get('/search', searchController.search);

router.get('/:username/:server/:characterClass', authenticate.ensureAuthenticated, characterController.redirectCharacter);

router.get('/code/:username/:server/:characterCode', characterController.getCharacterData);

router.get('/username', authenticate.ensureAuthenticated, searchController.username);

router.get('/userServer', authenticate.ensureAuthenticated, searchController.userServer);

router.get('/serverName/:serverID', authenticate.ensureAuthenticated, searchController.serverName);

router.get('/:username/:server', authenticate.ensureAuthenticated, characterController.fullCharacter);

router.post('/increaseForce', authenticate.ensureAuthenticated, characterController.increaseForce);

module.exports = router;