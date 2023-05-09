const koa = require('koa');
const Joi = require('joi');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const views = require('koa-views');
const serve = require('koa-static');
const  mongoose = require('mongoose');
const path = require('path');
const {User, validate} = require('./models/user');


const app = new koa();
const router = new Router();


mongoose.connect('mongodb://localhost:27017/MapleTrack', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});



const root = path.join(__dirname);
app.use(require('koa-static')(root));
app.use(bodyParser());

app.use(views(path.join(__dirname, 'views'), { extension: 'ejs' }));
app.use(serve(path.join(__dirname, 'public')));


router
      .get('/login', async (ctx, next) => {
        await ctx.render('login');
      })
      .get('/signup', async (ctx, next) => {
        await ctx.render('signup');
      })
      .post('/signup', async (ctx) => {
        try{
          const { username, email, password } = ctx.request.body;
          const { validationError } = validate({email, username, password});
          if (validationError) {
            ctx.status = 400;
            ctx.body = "Validation Error" + validationError;
            return;
          }
          let sameUser = await User.findOne({ email });
          if (sameUser) {
            ctx.status = 400;
            ctx.body = 'That user already exists!';
            return;
          }
          user = new User({ username, email, password });
          await user.save();
      
          ctx.status = 200;
          ctx.redirect('/login');
        } catch(err){
          ctx.status = 500;
          ctx.body = err.message;
        }
      })

app.use(router.routes());
app.use(router.allowedMethods());


app.listen(8080, () =>{
    console.log('Server is listening on port 8080');
});
