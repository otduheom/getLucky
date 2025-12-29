const { User, Friendship } = require('../../db/models');
const { Op } = require('sequelize');

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
          where: { id: { [Op.ne]: userId } },
          required: false,
        },
        {
          model: User,
          as: 'friend',
          attributes: { exclude: ['password'] },
          where: { id: { [Op.ne]: userId } },
          required: false,
        },
      ],
    });

    // преобразуем в список пользователей
    const friends = friendships.map((friendship) => {
      const friend = friendship.user == userId ? friendship.friend : friendship.user;
      return friend.get();
    });
    return friends;
  }

  static async getPopularUsers(limit = 100) {
    const users = await User.findAll({
      attributes: {
        exclude: ['password'],
        include: [
          [
            User.sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM "Friendships"
              WHERE (("Friendships"."userId" = "User"."id" OR "Friendships"."friendId" = "User"."id")
              AND "Friendships"."status" = 'accepted')
            )`),
            'friendsCount',
          ],
        ],
      },
      order: [[User.sequelize.literal('friendsCount'), 'DESC']],
      limit,
    });

    return users.map((user) => user.get());
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
    const friendship = await friendship.findOne({
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
    return { success: true, friendship };
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
        return friend?.get();
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
          where: {
            id: { [Op.ne]: userId },
            lastSeen: { [Op.gte]: fiveMinutesAgo },
          },
          required: false,
        },
        {
          model: User,
          as: 'friend',
          attributes: { exclude: ['password'] },
          where: {
            id: { [Op.ne]: userId },
            lastSeen: { [Op.gte]: fiveMinutesAgo },
          },
          required: false,
        },
      ],
    });

    const friends = friendships
      .map((friendship) => {
        const friend = friendship.userId === userId ? friendship.friend : friendship.user;
        return friend?.get();
      })
      .filter(Boolean);

    return friends;
  }
}

module.exports = FriendsService;
