const passport = require('koa-passport');
const { searchServersAndCreateMissing } = require('../models/servers');
const {updateCharacters, updateCharactersWeekly, createMissingCharacters} = require('../models/character');
const {updateLastLogin, LASTVERSION, updateUserVersion} = require('../models/user');
const {resetBossList} = require('../models/bossingList');

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
            version: user.version,
            role: user.role,
          };
          if(ctx.session.user.version < LASTVERSION){
            await searchServersAndCreateMissing(ctx.session.passport.user, ctx.session.passport.user._id);
            await createMissingCharacters(ctx.session.passport.user._id, ctx.session.passport.user.username);
            await updateCharacters(ctx.session.passport.user._id);
            await updateUserVersion(ctx.session.passport.user._id);
          }
          
          await updateCharactersWeekly(ctx.session.passport.user._id);
          await resetBossList(user.username);
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
