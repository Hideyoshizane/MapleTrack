const koa = require('koa');
const bodyParser = require('koa-bodyparser');
const passport = require('koa-passport');
const views = require('koa-views');
const serve = require('koa-static');
const session = require('koa-session');
const mongoose = require('mongoose');
const path = require('path');
const router = require('./routes');
const flash = require('./middleware/flash');
require('dotenv').config();


const DB_URL = process.env.DB_URL;
const app = new koa();


app.keys = [process.env.SECRET];

app.use(session({}, app));
app.use(bodyParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});



const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected.");
});

app.use(require('koa-static')(path.join(__dirname)));

app.use(views(path.join(__dirname, 'views'), { extension: 'ejs' }));
app.use(serve(path.join(__dirname, 'public')));


app.use(router.routes());
app.use(router.allowedMethods());



app.listen(8080, () =>{
    console.log('Server is listening on port 8080.');
});
