require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('express-flash');
const mongoose = require('mongoose');
const path = require('path');
const compression = require('compression');
const MongoStore = require('connect-mongo');
const router = require('./routes');

const app = express();

app.locals.globalVariable = '1.13.2';

const PORT = process.env.PORT || 8080;
const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017';
const SESSION_SECRET = process.env.SECRET || 'random_secret';

// Connect to MongoDB
mongoose
	.connect(DB_URL, {
		serverSelectionTimeoutMS: 10000,
		socketTimeoutMS: 20000,
	})
	.then(() => {
		console.log('Database connected.');
	})
	.catch((err) => {
		console.error('Error connecting to MongoDB:', err);
		process.exit(1);
	});

app.use(compression());

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(
	session({
		secret: SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		store: MongoStore.create({
			mongoUrl: DB_URL,
			mongoOptions: {
				serverSelectionTimeoutMS: 10000,
				socketTimeoutMS: 20000,
			},
		}),
		cookie: {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: 1000 * 60 * 60 * 24,
		},
	})
);

// Flash messages
app.use(flash());

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Cache control
app.use('/public', (req, res, next) => {
	const ext = path.extname(req.path).toLowerCase();

	if (ext === '.webp') {
		// Cache for .webp files for 30 days
		res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
	} else {
		// No cache
		res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
	}
	next();
});

app.use('/public', express.static(path.join(__dirname, 'public')));

// Main router
app.use('/', router);

app.listen(PORT, () => console.log('Listening on port', PORT));
