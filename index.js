const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const flash = require('express-flash');
const mongoose = require('mongoose');
const path = require('path');
const router = require('./routes');

require('dotenv').config();

const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017';
const app = express();

app.use(expressSession({
  secret: process.env.SECRET || 'random',
  resave: true,
  saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(flash());
app.use(express.json()); 

mongoose.connect(DB_URL);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected.");
});

app.use(express.static(path.join(__dirname)));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  // Check if the client is requesting a forced cache based on a custom header
  if (req.headers['x-force-cache'] === 'true') {
    // Apply the specific Cache-Control header for forced cache
    res.setHeader('Cache-Control', 'public, max-age=604800');
  }
  // Continue to the next middleware
  next();
});


app.use(express.static(path.join(__dirname, 'public'), { maxAge: 604800000 }));


app.use('/', router);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}.`);
});
