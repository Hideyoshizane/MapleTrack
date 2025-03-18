const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const flash = require('express-flash');
const mongoose = require('mongoose');
const path = require('path');
const router = require('./routes');
const MongoStore = require('connect-mongo');

require('dotenv').config();

const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017';
const app = express();

app.locals.globalVariable = '1.11.4';

const mongoOptions = {
	serverSelectionTimeoutMS: 10000,
	socketTimeoutMS: 20000,
};

// MongoDB connection
mongoose
	.connect(DB_URL, mongoOptions)
	.then(() => {
		console.log('Database connected.');
	})
	.catch((err) => {
		console.error('Error connecting to MongoDB', err);
		process.exit(1);
	});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

app.use(
	expressSession({
		secret: process.env.SECRET || 'random',
		resave: false,
		saveUninitialized: false,
		store: MongoStore.create({
			mongoUrl: DB_URL,
			mongoOptions,
			mongooseConnection: mongoose.connection,
		}),
	})
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(flash());
app.use(express.json());

app.use(express.static(path.join(__dirname)));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(
	'/public',
	(req, res, next) => {
		if (req.path.endsWith('.webp')) {
			// Set Cache-Control for .webp files to 4 weeks
			res.setHeader('Cache-Control', 'public, max-age=2419200');
		} else {
			// Set Cache-Control for all other files to no-cache
			res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
		}
		next();
	},
	express.static(path.join(__dirname, 'public'))
);

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 604800000 }));

app.use('/', router);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`Server is listening on port ${PORT}.`);
});
