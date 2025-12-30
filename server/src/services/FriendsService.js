const { User, Friendship } = require('../../db/models');
const { Op } = require('sequelize');
const path = require('path');

class FriendsService {
  static async getFriends(userId) {
    const friendships = await Friendship.findAll({
      where: {
        [Op.or]: [
          { userId, status: 'accepted' },
          { friendId: userId, status: 'accepted' },
        ],
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] },
          required: true,
        },
        {
          model: User,
          as: 'friend',
          attributes: { exclude: ['password'] },
          required: true,
        },
      ],
    });

    // преобразуем в список пользователей
    const friends = friendships
      .map((friendship) => {
        // Если текущий пользователь - это userId в friendship, то друг - это friend
        // Если текущий пользователь - это friendId в friendship, то друг - это user
        const friend = friendship.userId === userId ? friendship.friend : friendship.user;
        if (!friend) {
          return null;
        }
        const friendData = friend.get({ plain: true });
        // Убеждаемся, что мы не возвращаем текущего пользователя
        if (friendData.id === userId) {
          return null;
        }
        // Нормализуем путь к аватару
        if (friendData.avatar) {
          friendData.avatar = `/uploads/avatars/${path.basename(friendData.avatar)}`;
        }
        return friendData;
      })
      .filter(friend => friend !== null); // Убираем null значения
    
    return friends;
  }

  static async getPopularUsers(limit = 100) {
    try {
      // Используем более простой подход - сначала получаем всех пользователей,
      // затем считаем друзей для каждого
      const users = await User.findAll({
        attributes: { exclude: ['password'] },
        limit,
      });

      // Для каждого пользователя считаем количество друзей
      const usersWithFriendsCount = await Promise.all(
        users.map(async (user) => {
          const friendsCount = await Friendship.count({
            where: {
              [Op.or]: [
                { userId: user.id, status: 'accepted' },
                { friendId: user.id, status: 'accepted' },
              ],
            },
          });

          const userData = user.get({ plain: true });
          userData.friendsCount = friendsCount;
          // Нормализуем путь к аватару
          if (userData.avatar) {
            userData.avatar = `/uploads/avatars/${path.basename(userData.avatar)}`;
          }
          return userData;
        })
      );

      // Сортируем по количеству друзей
      usersWithFriendsCount.sort((a, b) => b.friendsCount - a.friendsCount);

      return usersWithFriendsCount;
    } catch (error) {
      console.error('Error in getPopularUsers service:', error);
      throw error;
    }
  }

  static async sendFriendRequest(userId, friendId) {
    const existing = await Friendship.findOne({
      where: {
        [Op.or]: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });

    if (existing) {
      return { success: false, message: 'Заявка уже существует' };
    }

    const friendship = await Friendship.create({
      userId,
      friendId,
      status: 'pending',
    });

    return { success: true, friendship };
  }

  static async acceptFriendRequest(requestId, userId) {
    const friendship = await Friendship.findOne({
      where: {
        id: requestId,
        friendId: userId,
        status: 'pending',
      },
    });
    if (!friendship) {
      return { success: false, message: 'Заявка не найдена' };
    }

    await friendship.update({ status: 'accepted' });
    
    // Преобразуем объект Sequelize в plain объект
    return { success: true, friendship: friendship.get() };
  }

  static async removeFriend(userId, friendId) {
    const deleted = await Friendship.destroy({
      where: {
        [Op.or]: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
        status: 'accepted',
      },
    });

    return deleted > 0;
  }

  static async searchFriends(userId, query) {
    const friendships = await Friendship.findAll({
      where: {
        [Op.or]: [
          { userId, status: 'accepted' },
          { friendId: userId, status: 'accepted' },
        ],
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] },
          where: {
            id: { [Op.ne]: userId },
            [Op.or]: [
              { name: { [Op.iLike]: `%${query}%` } },
              { nickname: { [Op.iLike]: `%${query}%` } },
              { firstName: { [Op.iLike]: `%${query}%` } },
              { lastName: { [Op.iLike]: `%${query}%` } },
            ],
          },
          required: false,
        },
        {
          model: User,
          as: 'friend',
          attributes: { exclude: ['password'] },
          where: {
            id: { [Op.ne]: userId },
            [Op.or]: [
              { name: { [Op.iLike]: `%${query}%` } },
              { nickname: { [Op.iLike]: `%${query}%` } },
              { firstName: { [Op.iLike]: `%${query}%` } },
              { lastName: { [Op.iLike]: `%${query}%` } },
            ],
          },
          required: false,
        },
      ],
    });

    const friends = friendships
      .map((friendship) => {
        const friend = friendship.userId === userId ? friendship.friend : friendship.user;
        if (!friend) return null;
        const friendData = friend.get({ plain: true });
        // Нормализуем путь к аватару
        if (friendData.avatar) {
          friendData.avatar = `/uploads/avatars/${path.basename(friendData.avatar)}`;
        }
        return friendData;
      })
      .filter(Boolean);

    return friends;
  }

  static async getOnlineFriends(userId) {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const friendships = await Friendship.findAll({
      where: {
        [Op.or]: [
          { userId, status: 'accepted' },
          { friendId: userId, status: 'accepted' },
        ],
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] },
          required: false,
        },
        {
          model: User,
          as: 'friend',
          attributes: { exclude: ['password'] },
          required: false,
        },
      ],
    });

    const friends = friendships
      .map((friendship) => {
        const friend = friendship.userId === userId ? friendship.friend : friendship.user;
        if (!friend) return null;
        const friendData = friend.get({ plain: true });
        // Убеждаемся, что мы не возвращаем текущего пользователя
        if (friendData.id === userId) {
          return null;
        }
        // Проверяем, что lastSeen в пределах 5 минут
        if (!friendData.lastSeen || new Date(friendData.lastSeen) < fiveMinutesAgo) {
          return null; // Не онлайн
        }
        // Нормализуем путь к аватару
        if (friendData.avatar) {
          friendData.avatar = `/uploads/avatars/${path.basename(friendData.avatar)}`;
        }
        return friendData;
      })
      .filter(Boolean);

    return friends;
  }

  static async getFriendRequests(userId) {
    // Получаем входящие заявки (где текущий пользователь - получатель)
    const requests = await Friendship.findAll({
      attributes: ['id', 'userId', 'friendId', 'status', 'createdAt', 'updatedAt'], // Явно указываем все нужные поля
      where: {
        friendId: userId,
        status: 'pending',
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] },
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const result = requests.map((request) => {
      // Используем напрямую поля объекта Sequelize
      const userData = request.user ? request.user.get({ plain: true }) : null;
      // Нормализуем путь к аватару
      if (userData && userData.avatar) {
        userData.avatar = `/uploads/avatars/${path.basename(userData.avatar)}`;
      }
      
      return {
        id: request.id, // Используем напрямую request.id
        user: userData,
        createdAt: request.createdAt,
      };
    });

    console.log('getFriendRequests - first request:', requests[0] ? { id: requests[0].id, userId: requests[0].userId, friendId: requests[0].friendId } : 'no requests');
    console.log('getFriendRequests result:', result);
    
    return result;
  }

  static async getFriendshipStatus(userId, friendId) {
    // Проверяем статус дружбы между двумя пользователями
    const friendship = await Friendship.findOne({
      where: {
        [Op.or]: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });

    if (!friendship) {
      return { status: 'none' }; // Нет связи
    }

    return {
      status: friendship.status, // 'pending', 'accepted', 'blocked'
      friendshipId: friendship.id,
      isRequester: friendship.userId === userId, // Текущий пользователь отправил заявку
    };
  }
}

module.exports = FriendsService;
