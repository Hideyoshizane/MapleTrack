const koa = require('koa');
const Joi = require('joi');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const views = require('koa-views');
const serve = require('koa-static');
const session = require('koa-session');
const  mongoose = require('mongoose');
const path = require('path');
const {User, validate} = require('./models/user');
const { Boss, createDefaultBosses } = require('./models/boss');
const { Character} = require('./models/character');
const {LinkSkill, createDefaultLinkSkill} = require('./models/linkSkill');
const {LegionSystem, createDefaultLegionSystem} = require('./models/legion');
const {Server, serverSchema , createDefaultServers, createMissingCharacters }= require('./models/servers');
const bcrypt = require('bcrypt');

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

app.keys = ['newest secret key', 'older secret key'];


app.use(require('koa-static')(path.join(__dirname)));
app.use(bodyParser());
app.use(session(app));

app.use(views(path.join(__dirname, 'views'), { extension: 'ejs' }));
app.use(serve(path.join(__dirname, 'public')));

router
      .get('/', async (ctx, next) => {
        await ctx.render('login');
      })
      .get('/login', async (ctx, next) => {
        await ctx.render('login');
      })
      .post('/login', async (ctx,next) => {
        try{
          const { username, password } = ctx.request.body;
          const user = await User.findOne({ username });
          if (!user) {
            ctx.status = 401;
            ctx.body = "Username not found";
            return;
          }
          const passwordCheck = await bcrypt.compare(password, user.password);
          if (!passwordCheck) {
            ctx.status = 400;
            ctx.body = 'Wrong password';
          }
          else{
            ctx.session.user = {
              _id: user._id,
              username: user.username,
              email: user.email,
              role: user
            };
            const ServerModel = mongoose.model('Server', serverSchema);
            await ServerModel.createMissingCharacters();
            ctx.redirect('/home');
          }
        }catch(err){
          ctx.status = 500;
          ctx.body = err.message;
        }})  
      .get('/signup', async (ctx, next) => {
        await ctx.render('signup');
      })
      .post('/signup', async (ctx) => {
        try{
          const { username, email, password } = ctx.request.body;
          const { validationError } = validate({email, username, password});
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);
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
          user = new User({ username, email, password: hashedPassword, servers: await createDefaultServers()});
          //
          await user.save();
          ctx.status = 200;
          ctx.redirect('/login');
        } catch(err){
          ctx.status = 500;
          ctx.body = err.message;
        }
      })
      .get('/home', async (ctx) => {
        const username = ctx.session.user.username;
        const user = await User.findOne({ _id: ctx.session.user }).populate({
          path: 'servers',
          populate: {
            path: 'characters',
            populate: {
              path: 'legion linkSkill'
            }
          }
        })
        await ctx.render('home', { username });
      });

app.use(router.routes());
app.use(router.allowedMethods());



app.listen(8080, () =>{
    console.log('Server is listening on port 8080');
});
