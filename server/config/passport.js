const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Local Strategy
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email }).select('+password');
      if (!user) return done(null, false, { message: 'Invalid email or password' });
      if (!user.password) return done(null, false, { message: 'Please use Google login for this account' });
      const match = await user.comparePassword(password);
      if (!match) return done(null, false, { message: 'Invalid email or password' });
      return done(null, user);
    } catch (err) {
      console.error('Local auth error:', err.message);
      return done(err);
    }
  }
));

// Google OAuth Strategy
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (!email) {
          return done(new Error('No email returned from Google profile'));
        }

        user = await User.findOne({ email });
        if (user) {
          user.googleId = profile.id;
          if (!user.avatar) user.avatar = (profile.photos && profile.photos[0]) ? profile.photos[0].value : '';
          await user.save();
        } else {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName || 'Google User',
            email,
            avatar: (profile.photos && profile.photos[0]) ? profile.photos[0].value : '',
            isVerified: true,
          });
        }
      }

      return done(null, user);
    } catch (err) {
      console.error('Google OAuth error:', err.message);
      if (err.errors) {
        Object.keys(err.errors).forEach(key => {
          console.error('  Field "' + key + '":', err.errors[key].message);
        });
      }
      return done(err);
    }
  }
));