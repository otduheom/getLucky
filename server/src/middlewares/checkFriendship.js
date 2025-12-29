const { Friendship } = require('../../db/models');
const { Op } = require('sequelize');

const checkFriendship = async (req, res, next) => {
  try {
    const userId = res.locals.user.id;
    const friendId = parseInt(req.params.friendId || req.body.receiverId);

    if (!friendId) {
      return res.status(400).json({ message: 'ID друга не указан' });
    }

    // Проверяем, являются ли пользователи друзьями
    const friendship = await Friendship.findOne({
      where: {
        [Op.or]: [
          { userId, friendId, status: 'accepted' },
          { userId: friendId, friendId: userId, status: 'accepted' }
        ]
      }
    });

    if (!friendship) {
      return res.status(403).json({ message: 'Вы не друзья с этим пользователем' });
    }

    res.locals.friendId = friendId;
    next();
  } catch (error) {
    console.error('Error in checkFriendship:', error);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = checkFriendship;