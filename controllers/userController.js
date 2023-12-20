const bcrypt = require('bcrypt');
const { User, LASTVERSION, resetPasswordEmptyUser } = require('../models/user');
const { searchServersAndCreateMissing, getServerWithHighestLevel, getHighestLevelCharacter} = require('../models/servers');
const { createBossList, resetBossList } = require('../models/bossingList');

module.exports = {
	signup: async (ctx) => {
		try {
			const { username, email, password } = ctx.request.body;
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);

			const sameUser = await User.findOne({ username });
			if (sameUser) {
				ctx.flash('failed', 'That user already exists!');
				ctx.status = 400;
				ctx.redirect('/signup', { flash: ctx.session.flash });
				return;
			}

			createdUser = new User({ username, email, password: hashedPassword, version: LASTVERSION});
			
			await createdUser.save();
			await searchServersAndCreateMissing(createdUser._id, createdUser.username);
			await createBossList(createdUser.username);
			await createdUser.save();
			ctx.status = 200;
			ctx.flash('success', 'User created successfully!');
			ctx.redirect('/login', { flash: ctx.session.flash });
		} catch (err) {
			ctx.status = 500;
			ctx.body = err.message;
		}
	},

	home: async (ctx) => {
		try {
			if (ctx.isAuthenticated()) {
				const { username, _id } = ctx.state.user;
				await ctx.render('home', { username, _id });
			} else {
				ctx.redirect('/login');
			}
		} catch (error) {
			console.error('Error rendering home page:', error);
			ctx.status = 500;
			ctx.body = { error: 'An error occurred while rendering home page' };
		}
	},
	weeklyBoss: async (ctx) => {
		try {
			if(ctx.isAuthenticated()){
				const { username, _id } = ctx.state.user;
				resetBossList(username);
				await ctx.render('weeklyBoss', { username, _id });
			}
		} catch (error) {
			console.error('Error rendering Weekly Boss page:', error);
			ctx.status = 500;
			ctx.body = { error: 'An error occurred while rendering Weekly Boss page' };
		}
	},
	signout: async(ctx) =>{
		try{
			if(ctx.isAuthenticated()){
				ctx.logout();
				ctx.redirect('/');
			} else{
				ctx.redirect('/login');
			}

		} catch (error) {
			console.error('Error signing out', error);
			ctx.status = 500;
			ctx.body = { error: 'An error occurred while signing out'};
		}
	},
	account: async(ctx) =>{
		try{
			if(ctx.isAuthenticated()){
				const { username, _id } = ctx.state.user;
				await ctx.render('account', { username, _id });
			}

		} catch (error) {
			console.error('Error', error);
			ctx.status = 500;
		}
	},
	forgotUsername: async(ctx) =>{
		try{
			const { username} = ctx.request.body;
			const foundUser = await User.findOne({ username });
			if(!foundUser){
				ctx.body = {userFound: null};
				return;
			}
			const serverName = await getServerWithHighestLevel(foundUser._id);

			ctx.body = {
				userFound: !!foundUser,
				serverName: serverName
			  };
		} catch (error) {
			console.error('Error finding username', error);
			ctx.status = 500;
			ctx.body = { error: 'An error occurred.'};
		}
	},
	forgotPasswordLevel: async(ctx) =>{
		try{
			const {username, level} = ctx.request.body;
			const foundUser = await User.findOne({ username });
			const characterData = await getHighestLevelCharacter(foundUser._id);
			if(level == characterData.highestLevel){
				const salt = await bcrypt.genSalt(10);
				console.log(salt);
				const hashedPassword = await bcrypt.hash(characterData.characterName, salt);

				foundUser.password = hashedPassword;
				await foundUser.save();
				ctx.body = true;
			} else{
				ctx.body = false;
			}

		} catch (error) {
			console.error('Error', error);
			ctx.status = 500;
		}
	},

	resetEmptyAccount: async(ctx) =>{
		try{
			const { username} = ctx.request.body;
			resetPasswordEmptyUser(username);
			ctx.status = 200;
			console.log('password reseted successfully');
		} catch (error){
			console.error('Error finding username', error);
			ctx.status = 500;
			ctx.body = { error: 'An error occurred.'};
		}
	},
	updatePassword: async(ctx) =>{
		if(ctx.isAuthenticated()){
			const { username } = ctx.state.user;
			const { oldPassword, newPassword} = ctx.request.body;

			const foundUser = await User.findOne({ username });
			const passwordMatch = await bcrypt.compare(oldPassword, foundUser.password);
			if(passwordMatch){			
				const salt = await bcrypt.genSalt(10);
				const newHashedPassword = await bcrypt.hash(newPassword, salt);
				foundUser.password = newHashedPassword;
				await foundUser.save();
				ctx.body = true;
			}
			else{
				ctx.body = false;
			}

		}
	}	

};
