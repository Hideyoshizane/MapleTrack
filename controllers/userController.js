const bcrypt = require('bcrypt');
const { User, LASTVERSION, resetPasswordEmptyUser } = require('../models/user');
const { searchServersAndCreateMissing, getServerWithHighestLevel, getHighestLevelCharacter} = require('../models/servers');
const { createBossList, resetBossList } = require('../models/bossingList');

module.exports = {
	signup: async (req, res) => {
		try {
			const { username, email, password } = req.body;
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);

			const sameUser = await User.findOne({ username });
			if (sameUser) {
				req.flash('failed', 'That user already exists!');
        		res.status(400);
        		return res.redirect('/signup');
			}

			createdUser = new User({ username, email, password: hashedPassword, version: LASTVERSION});
			
			await createdUser.save();
			await searchServersAndCreateMissing(createdUser._id, createdUser.username);
			await createBossList(createdUser.username);
			await createdUser.save();
			req.flash('message', 'User created successfully!');
          	req.flash('type', 'success');
			res.status(200);
			return res.redirect('/login');
		} catch (err) {
			console.error('Error during signup:', err);
			res.status(500).json({ error: 'An error occurred during signup' });
		}
	},

	home: async (req, res) => {
		try {
			if (req.isAuthenticated()) {
				const { username, _id } = req.user;
				return res.render('home', { username, _id });
			} else {
				return res.redirect('/login');
			}
		} catch (error) {
			console.error('Error rendering home page:', error);
			res.status(500).json({ error: 'An error occurred while rendering home page' });
		}
	},
	weeklyBoss: async (req, res) => {
		try {
			if(req.isAuthenticated()){
				const { username, _id } = req.user;
				resetBossList(username);
				await res.render('weeklyBoss', { username, _id });
			}
		} catch (error) {
			console.error('Error rendering Weekly Boss page:', error);
			res.status(500).json({ error: 'An error occurred while rendering Weekly Boss page' });
		}
	},
	signout: async(req, res) =>{
		try{
			if(req.isAuthenticated()){
				req.logout();
				res.redirect('/');
			} else{
				res.redirect('/login');
			}

		} catch (error) {
			console.error('Error signing out', error);
			res.status(500).json({ error: 'An error occurred while signing out' });
		}
	},
	account: async(req, res) =>{
		try{
			if(req.isAuthenticated()){
				const { username, _id } = req.user;
				await res.render('account', { username, _id });
			}

		} catch (error) {
			console.error('Error', error);
     		res.status(500).json({ error: 'An error occurred' });
   		}
	},
	forgotUsername: async (req, res) => {
		try{
			const { username } = req.body;
			const foundUser = await User.findOne({ username });
			if(!foundUser){
				return res.json({ userFound: null });
			}
			const serverName = await getServerWithHighestLevel(foundUser._id);

			res.json({
				userFound: !!foundUser,
				serverName: serverName,
			  });
		} catch (error) {
			console.error('Error finding username', error);
			res.status(500).json({ error: 'An error occurred.' });
		  }
	},
	forgotPasswordLevel: async (req, res) => {
		try{
			const {username, level} = req.body;
			const foundUser = await User.findOne({ username });
			const characterData = await getHighestLevelCharacter(foundUser._id);
			if(level == characterData.highestLevel){
				const salt = await bcrypt.genSalt(10);
				const hashedPassword = await bcrypt.hash(characterData.characterName, salt);

				foundUser.password = hashedPassword;
				await foundUser.save();
				return res.json(true);
			} else{
				return res.json(false);
			}

		} catch (error) {
			console.error('Error', error);
     		res.status(500).json({ error: 'An error occurred.' });
    	}
	},

	resetEmptyAccount: async (req, res) => {
		try{
			const { username } = req.body;
			resetPasswordEmptyUser(username);
   		   res.status(200).send('Password reset successfully');
		} catch (error) {
			console.error('Error finding username', error);
			res.status(500).json({ error: 'An error occurred.' });
		}
	},
	updatePassword: async (req, res) => {
		if(req.isAuthenticated()){
			const { username } = req.user;
			const { oldPassword, newPassword } = req.body;

			const foundUser = await User.findOne({ username });
			const passwordMatch = await bcrypt.compare(oldPassword, foundUser.password);
			if(passwordMatch){			
				const salt = await bcrypt.genSalt(10);
				const newHashedPassword = await bcrypt.hash(newPassword, salt);
				foundUser.password = newHashedPassword;
				await foundUser.save();
				res.json(true);
			}
			else{
				res.json(false);
			}

		}
	}	

};
