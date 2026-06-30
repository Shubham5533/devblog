const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// ── Get user profile ──
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -googleId');
    if (!user) return res.status(404).json({ error: 'User not found' });
    const posts = await Post.find({ author: req.params.id, status: 'published' })
      .sort({ createdAt: -1 }).populate('author', 'name avatar').select('-content');
    const totalViews = posts.reduce((a, p) => a + p.views, 0);
    const totalLikes = posts.reduce((a, p) => a + p.likes.length, 0);
    res.json({ user, posts, stats: { posts: posts.length, totalViews, totalLikes } });
  } catch {
    res.status(500).json({ error: 'Failed' });
  }
});

// ── Update profile ──
router.put('/:id', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const { name, bio, website, twitter, notificationPrefs } = req.body;
    const update = { name, bio, website, twitter };
    if (notificationPrefs) {
      update.notificationPrefs = typeof notificationPrefs === 'string'
        ? JSON.parse(notificationPrefs)
        : notificationPrefs;
    }
    if (req.file) {
      update.avatar = req.file.path || `/uploads/${req.file.filename}`;
    }
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    res.json({ user: user.toPublicJSON() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── Get saved posts ──
router.get('/:id/saved', protect, async (req, res) => {
  try {
    if (req.params.id !== req.user._id.toString()) return res.status(403).json({ error: 'Not authorized' });
    const user = await User.findById(req.params.id).populate({
      path: 'savedPosts',
      populate: { path: 'author', select: 'name avatar' },
      options: { sort: { createdAt: -1 } },
    });
    res.json({ posts: user.savedPosts });
  } catch {
    res.status(500).json({ error: 'Failed' });
  }
});

// ── Follow / Unfollow ──
router.post('/:id/follow', protect, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) return res.status(400).json({ error: "Can't follow yourself" });
    const target = await User.findById(req.params.id);
    const me = await User.findById(req.user._id);
    const isFollowing = me.following.includes(target._id);
    if (isFollowing) {
      me.following.pull(target._id);
      target.followers.pull(me._id);
    } else {
      me.following.push(target._id);
      target.followers.push(me._id);
    }
    await Promise.all([me.save(), target.save()]);
    res.json({ following: !isFollowing, followerCount: target.followers.length });
  } catch {
    res.status(500).json({ error: 'Failed' });
  }
});

// ── Dashboard stats ──
router.get('/:id/dashboard', protect, async (req, res) => {
  try {
    if (req.params.id !== req.user._id.toString()) return res.status(403).json({ error: 'Not authorized' });
    const allPosts = await Post.find({ author: req.params.id }).select('title slug views likes comments status createdAt category');
    const published = allPosts.filter(p => p.status === 'published');
    const drafts = allPosts.filter(p => p.status === 'draft');
    const totalViews = published.reduce((a, p) => a + p.views, 0);
    const totalLikes = published.reduce((a, p) => a + p.likes.length, 0);
    const totalComments = published.reduce((a, p) => a + p.comments.length, 0);
    res.json({ posts: allPosts, stats: { total: allPosts.length, published: published.length, drafts: drafts.length, totalViews, totalLikes, totalComments } });
  } catch {
    res.status(500).json({ error: 'Failed' });
  }
});

module.exports = router;
