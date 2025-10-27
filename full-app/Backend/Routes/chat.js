// routes/chat.js
const express = require('express');
const router = express.Router();
const chatController = require('../Controller/chatController');
const authenticate = require('../middlewares/auth');

router.get('/conversations', authenticate, chatController.getUserConversations);
router.get('/conversations/:id', authenticate, chatController.getConversationById);
router.post('/conversations', authenticate, chatController.createConversation);
router.post('/messages', authenticate, chatController.sendMessage);
router.post('/messages/read', authenticate, chatController.markMessagesAsRead);
router.put('/messages/:id', authenticate, chatController.updateMessage);
router.delete('/messages/:id', authenticate, chatController.deleteMessage);
module.exports = router;