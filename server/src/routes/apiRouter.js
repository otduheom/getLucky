const express = require('express');
const authRouter = require('./authRouter');
const aiRouter = require('./ai.router');
const profileRouter = require('./profileRouter');
const friendsRouter = require('./friendsRouter');
const searchRouter = require('./searchRouter');
const messagesRouter = require('./messagesRouter');
const groupsRouter = require('./groupsRouter');

const apiRouter = express.Router();
const { verifyAccessToken } = require('../middlewares/verifyTokens');
const updateLastSeen = require('../middlewares/updateLastSeen');

apiRouter.use('/auth', authRouter);
apiRouter.use('/ai', aiRouter);
apiRouter.use('/profile', updateLastSeen, profileRouter);
apiRouter.use('/friends', updateLastSeen, friendsRouter);
apiRouter.use('/search', updateLastSeen, searchRouter);
apiRouter.use('/messages', updateLastSeen, messagesRouter);
apiRouter.use('/groups', updateLastSeen, groupsRouter);
apiRouter.get('/test', verifyAccessToken, (req, res) => {
  const user = res.locals.user;
  console.log('Декодированные данные пользователя из токена:', user);
  res.status(200).json({
    message: 'Access granted! Token is valid.',
    userDataFromToken: user,
  });
});

module.exports = apiRouter;