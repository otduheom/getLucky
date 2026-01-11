const express = require('express');
const MessagesController = require('../controllers/MessagesController');
const { verifyAccessToken } = require('../middlewares/verifyTokens');
const checkFriendship = require('../middlewares/checkFriendship');
const checkGroupMembership = require('../middlewares/checkGroupMembership');

const messagesRouter = express.Router();

// Личные сообщения
messagesRouter.get('/chats', verifyAccessToken, MessagesController.getChats);
messagesRouter.get('/unread-count', verifyAccessToken, MessagesController.getUnreadCount);
messagesRouter.get('/chat/:friendId', verifyAccessToken, checkFriendship, MessagesController.getMessagesWithFriend);
messagesRouter.post('/', verifyAccessToken, checkFriendship, MessagesController.sendMessage);
messagesRouter.put('/:messageId/read', verifyAccessToken, MessagesController.markAsRead);
messagesRouter.put('/chat/:friendId/read-all', verifyAccessToken, checkFriendship, MessagesController.markAllAsRead);

// Групповые сообщения
messagesRouter.post('/group', verifyAccessToken, checkGroupMembership, MessagesController.sendGroupMessage);
messagesRouter.get('/group/:groupId', verifyAccessToken, checkGroupMembership, MessagesController.getGroupMessages);
messagesRouter.put('/group/:groupId/read-all', verifyAccessToken, checkGroupMembership, MessagesController.markGroupMessagesAsRead);

module.exports = messagesRouter;