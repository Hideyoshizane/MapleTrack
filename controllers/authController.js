const passport = require('koa-passport');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { searchServersAndCreateMissing } = require('../models/servers');
const {createMissingCharacters} = require('../models/character');
const {updateCharacters} = require('../models/character');
const {updateCharactersWeekly} = require('../models/character');
const {updateLastLogin, updateWeeklyBosses} = require('../models/user');

module.exports = {
  login: async (ctx, next) => {
    try {
      await passport.authenticate('local', async (err, user, info) => {
        if (err) {
          console.log(err);
          return next(err);
        }

        if (!user) {
          ctx.status = 401;
          ctx.body = { message: info.message };
        } else {
          await ctx.login(user);
          ctx.session.user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
          };
          await searchServersAndCreateMissing(ctx.session.passport.user, ctx.session.passport.user._id);
          await createMissingCharacters(ctx.session.passport.user._id, ctx.session.passport.user.username);
          await updateCharacters(ctx.session.passport.user._id);
          await updateCharactersWeekly(ctx.session.passport.user._id);
          await updateWeeklyBosses(ctx.session.passport.user._id);
          await updateLastLogin(ctx.session.passport.user._id);
          ctx.redirect('/home');
        }
      })(ctx, next);
    } catch (err) {
      console.error('Error during login:', err);
      ctx.status = 500;
      ctx.body = { error: 'An error occurred during login' };
    }
  },
};
