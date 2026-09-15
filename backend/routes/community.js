import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET /api/community/posts
router.get('/posts', (req, res) => {
  try {
    const posts = db.getCommunityPosts();
    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch community reports' });
  }
});

// POST /api/community/posts
router.post('/posts', (req, res) => {
  try {
    const { userId, userName, type, tripKey, routeLabel, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Report message cannot be empty' });
    }

    const post = db.addCommunityPost({
      userId,
      userName,
      type,
      tripKey,
      routeLabel,
      message,
    });

    // Broadcast new post to all live WebSocket users
    const io = req.app.get('io');
    if (io) {
      io.emit('community:new_post', post);
    }

    res.status(201).json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to submit report' });
  }
});

// POST /api/community/posts/:id/confirm
router.post('/posts/:id/confirm', (req, res) => {
  try {
    const { id } = req.params;
    const updated = db.confirmCommunityPost(id);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('community:confirm_post', { id, confirms: updated.confirms });
    }

    res.json({ success: true, post: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to confirm report' });
  }
});

// DELETE /api/community/posts/:id
router.delete('/posts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body || {};

    const deleted = db.deleteCommunityPost(id, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('community:delete_post', { id });
    }

    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete report' });
  }
});

export default router;
