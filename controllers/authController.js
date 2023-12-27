const passport = require('passport');
const { searchServersAndCreateMissing } = require('../models/servers');
const { updateCharacters, updateCharactersWeekly, createMissingCharacters } = require('../models/character');
const { updateLastLogin, LASTVERSION, updateUserVersion } = require('../models/user');
const { resetBossList } = require('../models/bossingList');

module.exports = {
  login: async (req, res, next) => {
    try {
      await passport.authenticate('local', async (err, user, info) => {
        if (err) {
          console.error(err);
          return next(err);
        }

        if (!user) {
          req.flash('message', 'Wrong username or password.');
          req.flash('type', 'error');
          return res.redirect('/login');
        } else {
          req.login(user, async (err) => {
            if (err) {
              console.error('Error during login:', err);
              return next(err);
            }

            req.session.user = {
              _id: user._id,
              username: user.username,
              version: user.version,
            };

            if (req.session.user.version < LASTVERSION) {
              await searchServersAndCreateMissing(user, user._id);
              await createMissingCharacters(user._id, user.username);
              await updateCharacters(user._id);
              await updateUserVersion(user._id);
            }

            await updateCharactersWeekly(user._id);
            await resetBossList(user.username);
            await updateLastLogin(user._id);
            res.redirect('/home');
          });
        }
      })(req, res, next);
    } catch (err) {
      console.error('Error during login:', err);
      res.status(500).json({ error: 'An error occurred during login' });
    }
  },
};
