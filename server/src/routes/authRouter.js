const authRouter = require('express').Router();
const AuthController = require('../controllers/AuthController');
const { verifyRefreshToken } = require('../middlewares/verifyTokens');

authRouter.get('/refreshTokens', verifyRefreshToken, AuthController.refreshTokens);
authRouter.post('/signup', AuthController.signUp);
authRouter.post('/login', AuthController.login);
authRouter.post('/logout', AuthController.logout);

module.exports = authRouter;
