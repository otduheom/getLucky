const express = require('express');
const FriendsController = require('../controllers/FriendsController');
const { verifyAccessToken } = require('../middlewares/verifyTokens');

const friendsRouter = express.Router();

friendsRouter.get('/popular', FriendsController.getPopularUsers);
friendsRouter.get('/', verifyAccessToken, FriendsController.getFriends);
friendsRouter.get('/online', verifyAccessToken, FriendsController.getOnlineFriends);
friendsRouter.get('/requests', verifyAccessToken, FriendsController.getFriendRequests);
friendsRouter.get('/status/:friendId', verifyAccessToken, FriendsController.getFriendshipStatus);
friendsRouter.get('/search', verifyAccessToken, FriendsController.searchFriends);
friendsRouter.post('/request/:userId', verifyAccessToken, FriendsController.sendFriendRequest);
friendsRouter.put('/accept/:requestId', verifyAccessToken, FriendsController.acceptFriendRequest);
friendsRouter.delete('/:friendId', verifyAccessToken, FriendsController.removeFriend);

module.exports = friendsRouter;