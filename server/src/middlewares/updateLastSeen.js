const { User } = require('../../db/models');

const updateLastSeen = async (req, res, next) => {
  try {
    if (res.locals.user && res.locals.user.id) {
      await User.update(
        { lastSeen: new Date() },
        { where: { id: res.locals.user.id } }
      );
    }
    next();
  } catch (error) {
    console.error('Error updating lastSeen:', error);
    next(); // Продолжаем выполнение даже если обновление не удалось
  }
};

module.exports = updateLastSeen;