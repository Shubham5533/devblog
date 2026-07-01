const express = require('express');
const router = express.Router();
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken, protect } = require('../middleware/auth');
const { sendWelcomeEmail } = require('../utils/email');

// TEMP DEBUG
router.get('/google/test', (req, res) => {
  res.json({
    clientID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'NOT SET',
    clientURL: process.env.CLIENT_URL || 'NOT SET',
  });
});

const setCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// ── Register ──
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    setCookie(res, token);

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user).catch(() => {});

    res.status(201).json({ token, user: user.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ── Login ──
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid input' });

  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info?.message || 'Login failed' });

    const token = generateToken(user._id);
    setCookie(res, token);
    res.json({ token, user: user.toPublicJSON() });
  })(req, res, next);
});

// ── Logout ──
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

// ── Get current user ──
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
});

// ── Google OAuth ──
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) {
      console.error('Google callback error:', err.message);
      return res.redirect(`${process.env.CLIENT_URL}/login?error=google_failed`);
    }
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=google_failed`);
    }
    try {
      const token = generateToken(user._id);
      setCookie(res, token);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}?auth=success`);
    } catch (e) {
      console.error('Token generation error:', e.message);
      res.redirect(`${process.env.CLIENT_URL}/login?error=google_failed`);
    }
  })(req, res, next);
});

// ── Change password ──
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (user.password && !(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ error: 'Current password incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update password' });
  }
});

module.exports = router;
