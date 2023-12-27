const express = require('express');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const flash = require('express-flash');

const passport = require('passport');

const mongoose = require('mongoose');
const path = require('path');
const router = require('./routes');

require('dotenv').config();

const DB_URL = process.env.DB_URL;
const app = express();

app.use(expressSession({
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.json()); 

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected.");
});

app.use(express.static(path.join(__dirname)));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}.`);
});
