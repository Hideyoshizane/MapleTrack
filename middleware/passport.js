const passport = require('koa-passport')
const LocalStrategy = require('passport-local').Strategy;
const bcrypt  = require('bcrypt')
const { User } = require('../models/user');

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username });

    if (!user) {
        return done(null, false, { message: 'Wrong username or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);


    if (!passwordMatch) {
        return done(null, false, { message: 'Wrong username or password' });
    }

    return done(null, user);
} catch (error) {
    return done(error);
}
}));


passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (_id, done) => {
  try {
    const user = await User.findById(_id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});


ensureAuthenticated = (ctx, next) => {
  if (ctx.isAuthenticated()) {
      return next();
  } else {
      ctx.redirect('/login'); 
  }
};

module.exports = {
  passport,
  ensureAuthenticated
}