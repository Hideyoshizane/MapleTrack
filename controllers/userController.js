const bcrypt = require('bcrypt');
const {User, validate} = require('../models/user');
const { searchServersAndCreateMissing } = require('../models/servers');

module.exports = {
  signup: async (ctx) => {
    try {
      const { username, email, password } = ctx.request.body;
      const { validationError } = validate({ email, username, password });
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      if (validationError) {
        ctx.status = 400;
        ctx.body = "Validation Error" + validationError;
        return;
      }

      let sameUser = await User.findOne({ username });
      if (sameUser) {
        ctx.status = 400;
        ctx.body = 'That user already exists!';
        return;
      }

      createdUser = new User({ username, email, password: hashedPassword });
      searchServersAndCreateMissing(createdUser._id, createdUser.username);

      await createdUser.save();
      ctx.status = 200;
      ctx.redirect('/login');
    } catch (err) {
      ctx.status = 500;
      ctx.body = err.message;
    }
  },

  home: async (ctx) => {
    try {
      if (ctx.isAuthenticated()) {
        const { username, _id } = ctx.state.user;
        const user = await User.findOne({ _id: _id });
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
};
