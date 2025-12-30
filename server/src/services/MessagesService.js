const { Message, User, Friendship } = require('../../db/models');
const { Op } = require('sequelize');
const path = require('path');

class MessagesService {
  static async getMessagesWithFriend(userId, friendId) {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId },
        ],
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: { exclude: ['password'] },
        },
        {
          model: User,
          as: 'receiver',
          attributes: { exclude: ['password'] },
        },
      ],
      order: [['createdAt', 'ASC']],
    });
    return messages.map((message) => message.get());
  }

  static async sendMessage(senderId, receiverId, text) {
    const message = await Message.create({
      senderId,
      receiverId,
      text,
      isRead: false,
    });

    const messageWithUsers = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: { exclude: ['password'] },
        },
        {
          model: User,
          as: 'receiver',
          attributes: { exclude: ['password'] },
        },
      ],
    });
    return messageWithUsers.get();
  }

  static async markAsRead(messageId, userId) {
    const message = await Message.findOne({
      where: {
        id: messageId,
        receiverId: userId,
      },
    });

    if (!message) {
      return null;
    }

    await message.update({ isRead: true });
    return message.get();
  }

  static async markAllAsRead(userId, friendId) {
    const [updatedCount] = await Message.update(
      { isRead: true },
      {
        where: {
          receiverId: userId,
          senderId: friendId,
          isRead: false,
        },
      },
    );

    return updatedCount;
  }

  static async getChats(userId) {
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

    const chats = await Promise.all(
      friendships.map(async (friendship) => {
        const friend = friendship.userId === userId ? friendship.friend : friendship.user;

        const lastmessage = await Message.findOne({
          where: {
            [Op.or]: [
              { senderId: userId, receiverId: friend.id },
              { senderId: friend.id, receiverId: userId },
            ],
          },
          include: [
            {
              model: User,
              as: 'sender',
              attributes: { exclude: ['password'] },
            },
          ],
          order: [['createdAt', 'DESC']],
        });

        const unreadCount = await Message.count({
          where: {
            receiverId: userId,
            senderId: friend.id,
            isRead: false,
          },
        });

        const friendData = friend.get({ plain: true });
        // Нормализуем путь к аватару
        if (friendData.avatar) {
          friendData.avatar = `/uploads/avatars/${path.basename(friendData.avatar)}`;
        }
        
        return {
          friend: friendData,
          lastMessage: lastmessage ? lastmessage.get() : null,
          unreadCount,
        };
      }),
    );

    chats.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
    });

    return chats;
  }

  static async getUnreadCount(userId) {
    const count = await Message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
    return count;
  }

  static async getUnreadCountFromFriend(userId, friendId) {
    const count = await Message.count({
      where: {
        receiverId: userId,
        senderId: friendId,
        isRead: false,
      },
    });

    return count;
  }
}

module.exports = MessagesService;
