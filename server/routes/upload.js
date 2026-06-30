const express = require('express');
const router = express.Router();
const { upload, useCloudinary } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

// Single image upload
router.post('/image', protect, upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = useCloudinary ? req.file.path : `${process.env.SERVER_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
    res.json({ url, publicId: req.file.filename || req.file.public_id || '' });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;
