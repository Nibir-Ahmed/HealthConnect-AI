const express = require('express');
const router = express.Router();
const { getBlogs, createBlog, toggleSaveBlog, toggleLikeBlog, getSavedBlogs } = require('../controllers/blogController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', optionalAuth, getBlogs);
router.get('/saved', protect, getSavedBlogs);
router.post('/', protect, authorize('admin', 'doctor'), upload.single('image'), createBlog);
router.post('/:blogId/save', protect, toggleSaveBlog);
router.post('/:blogId/like', protect, toggleLikeBlog);

module.exports = router;
