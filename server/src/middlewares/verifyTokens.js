const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyAccessToken = (req, res, next) => {
  try {
    const accessToken = req.headers.authorization.split(' ')[1]; // Bearer <token>
    const { user } = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    res.locals.user = user;

    return next();
  } catch (error) {
    console.log('Invalid access token', error);
    return res.status(403).json({ message: 'Forbidden' });
  }
};
const verifyRefreshToken = (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    
    // Если токена нет, это нормально для неавторизованного пользователя
    if (!refreshToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { user } = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    res.locals.user = user;

    return next();
  } catch (error) {
    // Токен есть, но невалидный - очищаем cookie
    // Логируем только если это не ошибка отсутствия токена
    if (error.message !== 'jwt must be provided') {
      console.log('Invalid refresh token:', error.message);
    }
    return res.clearCookie('refreshToken').status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = { verifyAccessToken, verifyRefreshToken };