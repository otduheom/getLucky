// Middleware для копирования res.locals.user в req.user
// Это нужно для multer конфигурации, которая использует req.user
const setReqUser = (req, res, next) => {
  if (res.locals.user) {
    req.user = res.locals.user;
  } else {
    // Если user не найден, это ошибка
    return res.status(403).json({ message: 'Необходима авторизация' });
  }
  next();
};

module.exports = setReqUser;
