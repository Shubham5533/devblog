const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/auth');
const { sendCommentNotification } = require('../utils/email');

// ── Get all posts ──
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, tag, search, author, page = 1, limit = 9, sort = 'newest', status } = req.query;
    const query = {};

    if (!req.user || req.query.status !== 'draft') query.status = 'published';
    if (status === 'all' && req.user) {
      // for dashboard — only own posts
      query.author = req.user._id;
      delete query.status;
    }
    if (category) query.category = category;
    if (tag) query.tags = tag.toLowerCase();
    if (author) query.author = author;
    if (search) query.$text = { $search: search };

    const sortObj = sort === 'popular' ? { views: -1 } : sort === 'likes' ? { 'likes': -1 } : { createdAt: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [posts, total] = await Promise.all([
      Post.find(query).sort(sortObj).skip(skip).limit(parseInt(limit))
        .populate('author', 'name avatar bio')
        .select('-content'),
      Post.countDocuments(query),
    ]);

    res.json({ posts, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// ── Featured posts ──
router.get('/featured', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published', featured: true })
      .sort({ createdAt: -1 }).limit(5)
      .populate('author', 'name avatar')
      .select('title slug coverImage category excerpt author createdAt readTime views likes');
    res.json({ posts });
  } catch {
    res.json({ posts: [] });
  }
});

// ── Get single post for editing (by id, includes drafts, owner only) ──
router.get('/edit/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name avatar');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.author._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    res.json({ post });
  } catch {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// ── Get single post (by slug) ──
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { slug: req.params.slug, status: 'published' },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'name avatar bio website twitter followers')
      .populate('comments.user', 'name avatar')
      .populate('comments.replies.user', 'name avatar');

    if (!post) return res.status(404).json({ error: 'Post not found' });

    const liked = req.user ? post.likes.includes(req.user._id) : false;
    const saved = req.user ? req.user.savedPosts?.includes(post._id) : false;

    res.json({ post, liked, saved });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// ── Create post ──
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, category, tags, status, coverImage, coverImagePublicId, excerpt } = req.body;
    const tagArray = Array.isArray(tags) ? tags : (tags || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

    const post = await Post.create({
      title, content, category,
      tags: tagArray, status,
      coverImage, coverImagePublicId,
      excerpt,
      author: req.user._id,
    });

    await post.populate('author', 'name avatar');
    res.status(201).json({ post });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── Update post ──
router.put('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { title, content, category, tags, status, coverImage, coverImagePublicId, excerpt } = req.body;
    const tagArray = Array.isArray(tags) ? tags : (tags || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

    Object.assign(post, { title, content, category, tags: tagArray, status, coverImage, coverImagePublicId, excerpt });
    await post.save();
    await post.populate('author', 'name avatar');

    res.json({ post });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── Delete post ──
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// ── Like / Unlike ──
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const uid = req.user._id;
    const idx = post.likes.findIndex(id => id.toString() === uid.toString());
    if (idx === -1) post.likes.push(uid);
    else post.likes.splice(idx, 1);
    await post.save();
    res.json({ likes: post.likes.length, liked: idx === -1 });
  } catch {
    res.status(500).json({ error: 'Failed' });
  }
});

// ── Save / Unsave post ──
router.post('/:id/save', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const postId = req.params.id;
    const idx = user.savedPosts.findIndex(id => id.toString() === postId);
    if (idx === -1) user.savedPosts.push(postId);
    else user.savedPosts.splice(idx, 1);
    await user.save();
    res.json({ saved: idx === -1 });
  } catch {
    res.status(500).json({ error: 'Failed' });
  }
});

// ── Add comment ──
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Comment cannot be empty' });

    const post = await Post.findById(req.params.id).populate('author');
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.comments.push({ user: req.user._id, content: content.trim() });
    await post.save();

    const newComment = post.comments[post.comments.length - 1];
    await Post.populate(post, { path: 'comments.user', select: 'name avatar' });
    const populated = post.comments.id(newComment._id);

    // Email notification (non-blocking)
    if (post.author._id.toString() !== req.user._id.toString()) {
      sendCommentNotification({
        postAuthor: post.author,
        commenter: req.user,
        post,
        commentText: content,
      }).catch(() => {});
    }

    res.status(201).json({ comment: populated, total: post.comments.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// ── Delete comment ──
router.delete('/:postId/comments/:commentId', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    comment.deleteOne();
    await post.save();
    res.json({ message: 'Comment deleted', total: post.comments.length });
  } catch {
    res.status(500).json({ error: 'Failed' });
  }
});

// ── Like comment ──
router.post('/:postId/comments/:commentId/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    const comment = post.comments.id(req.params.commentId);
    const uid = req.user._id;
    const idx = comment.likes.findIndex(id => id.toString() === uid.toString());
    if (idx === -1) comment.likes.push(uid);
    else comment.likes.splice(idx, 1);
    await post.save();
    res.json({ likes: comment.likes.length, liked: idx === -1 });
  } catch {
    res.status(500).json({ error: 'Failed' });
  }
});

// ── Add reply ──
router.post('/:postId/comments/:commentId/reply', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.postId);
    const comment = post.comments.id(req.params.commentId);
    comment.replies.push({ user: req.user._id, content });
    await post.save();
    await Post.populate(post, { path: 'comments.replies.user', select: 'name avatar' });
    res.json({ reply: comment.replies[comment.replies.length - 1] });
  } catch {
    res.status(500).json({ error: 'Failed' });
  }
});

// ── Related posts ──
router.get('/:id/related', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.json({ posts: [] });
    const related = await Post.find({
      _id: { $ne: post._id }, status: 'published',
      $or: [{ category: post.category }, { tags: { $in: post.tags } }],
    }).limit(4).populate('author', 'name avatar').select('title slug coverImage category excerpt author readTime likes views');
    res.json({ posts: related });
  } catch {
    res.json({ posts: [] });
  }
});

module.exports = router;
