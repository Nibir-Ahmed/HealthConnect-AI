const express = require('express');
const router = express.Router();
const { getBlogs, getMyBlogs, createBlog, toggleSaveBlog, toggleLikeBlog, getSavedBlogs, deleteBlog } = require('../controllers/blogController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { upload, handleUpload } = require('../middleware/upload');

router.get('/', optionalAuth, getBlogs);
router.get('/my-blogs', protect, authorize('admin', 'doctor'), getMyBlogs);
router.get('/saved', protect, getSavedBlogs);
router.post('/', protect, authorize('admin', 'doctor'), handleUpload('image'), createBlog);
router.delete('/:id', protect, authorize('admin', 'doctor'), deleteBlog);
router.post('/:blogId/save', protect, toggleSaveBlog);
router.post('/:blogId/like', protect, toggleLikeBlog);

module.exports = router;
