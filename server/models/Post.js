const mongoose = require('mongoose');
const slugify = require('slugify');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 2000 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replies: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  slug: { type: String, unique: true },
  content: { type: String, required: true },  // HTML from Quill
  excerpt: { type: String, maxlength: 300 },
  coverImage: { type: String, default: '' },
  coverImagePublicId: { type: String, default: '' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    enum: ['Technology', 'Lifestyle', 'Travel', 'Food', 'Health', 'Business', 'Education', 'Science', 'Politics', 'Entertainment', 'Other'],
    default: 'Other',
  },
  tags: [{ type: String, trim: true, lowercase: true }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  views: { type: Number, default: 0 },
  readTime: { type: Number, default: 1 },  // minutes
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

// Auto-slug + excerpt + readTime
postSchema.pre('save', function() {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now();
  }
  if (this.isModified('content')) {
    const plain = this.content.replace(/<[^>]*>/g, '');
    if (!this.excerpt || this.isModified('content')) {
      this.excerpt = plain.substring(0, 250).trim() + (plain.length > 250 ? '...' : '');
    }
    const words = plain.split(/\s+/).length;
    this.readTime = Math.max(1, Math.ceil(words / 200));
  }
});

postSchema.index({ title: 'text', content: 'text', tags: 'text' });
postSchema.index({ author: 1, status: 1 });
postSchema.index({ category: 1, status: 1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
