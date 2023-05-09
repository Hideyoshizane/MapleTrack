const {User, validate} = require('../models/user');
const Router = require('koa-router');
const koa = require('koa');

const router = new Router();

router.post('/', async (ctx,next) => {
    const {error} = validate(ctx.body);
    if (error) {
        ctx.throw(400, error.details[0].message);
    }

    let user = await User.findOne({ username: ctx.body.username });
    if(user){
        return ctx.throw(400, "Username already exists!");
    }
    else{
        user = new User({
            username: ctx.body.username,
            email: ctx.body.email,
            password: ctx.body.password
        });
        await user.save();
        ctx.body = user;
    }
});

module.exports = router;