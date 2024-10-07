const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('express-flash');
const mongoose = require('mongoose');
const path = require('path');
const router = require('./routes');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const app = express();
const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017';
const PORT = process.env.PORT || 8080;

const mongoOptions = {
	serverSelectionTimeoutMS: 10000,
	socketTimeoutMS: 20000,
};

// Connect to MongoDB
mongoose
	.connect(DB_URL, mongoOptions)
	.then(() => console.log('Database connected.'))
	.catch((err) => {
		console.error('Error connecting to MongoDB:', err);
		process.exit(1);
	});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Middleware setup
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(flash());
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1w' }));

// Session setup
app.use(
	session({
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

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Cache control middleware
app.use((req, res, next) => {
	const isImageRequest = /\.(webp)$/.test(req.path);

	if (req.headers['x-force-cache'] === 'true') {
		res.setHeader('Cache-Control', 'public, max-age=604800'); // Cache for one week
	} else if (!isImageRequest) {
		// No-cache headers for non-image files
		res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
		res.setHeader('Pragma', 'no-cache');
		res.setHeader('Expires', '0');
	}
	next();
});

// Routes
app.use('/', router);

// Start the server
app.listen(PORT, () => {
	console.log(`Server is listening on port ${PORT}.`);
});
