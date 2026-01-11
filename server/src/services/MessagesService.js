const { Message, User, Friendship, Group, GroupMember } = require('../../db/models');
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

  /**
   * Отправляет сообщение в группу
   * Проверяет, что отправитель - участник группы
   * receiverId = null, groupId = groupId
   */
  static async sendGroupMessage(senderId, groupId, text) {
    // Проверяем, что отправитель является участником группы
    const membership = await GroupMember.findOne({
      where: {
        groupId,
        userId: senderId,
      },
    });

    if (!membership) {
      throw new Error('Вы не являетесь участником этой группы');
    }

    // Создаем сообщение
    const message = await Message.create({
      senderId,
      receiverId: null,
      groupId,
      text,
      isRead: false, // Для групповых сообщений это поле не используется напрямую
    });

    // Получаем сообщение с отправителем и группой
    const messageWithData = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: { exclude: ['password'] },
        },
        {
          model: Group,
          as: 'group',
          attributes: ['id', 'name', 'avatar'],
        },
      ],
    });

    return messageWithData.get();
  }

  /**
   * Получает все сообщения группы
   * Проверяет участие пользователя
   */
  static async getGroupMessages(groupId, userId) {
    // Проверяем, что пользователь является участником группы
    const membership = await GroupMember.findOne({
      where: {
        groupId,
        userId,
      },
    });

    if (!membership) {
      throw new Error('Вы не являетесь участником этой группы');
    }

    // Получаем все сообщения группы
    const messages = await Message.findAll({
      where: {
        groupId,
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: { exclude: ['password'] },
        },
        {
          model: Group,
          as: 'group',
          attributes: ['id', 'name', 'avatar'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    return messages.map((message) => message.get());
  }

  /**
   * Отмечает сообщения группы как прочитанные
   * Для групп это будет отдельная логика (пока заглушка)
   */
  static async markGroupMessagesAsRead(groupId, userId) {
    // Проверяем, что пользователь является участником группы
    const membership = await GroupMember.findOne({
      where: {
        groupId,
        userId,
      },
    });

    if (!membership) {
      throw new Error('Вы не являетесь участником этой группы');
    }

    // TODO: Реализовать через таблицу MessageRead для групповых сообщений
    // Пока возвращаем 0, так как для групп нужна отдельная таблица MessageRead
    return 0;
  }

  /**
   * Обновленный getChats - возвращает и личные, и групповые чаты
   * Объединяет в один список, отсортированный по последнему сообщению
   */
  static async getChats(userId) {
    // Получаем личные чаты
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

    const privateChats = await Promise.all(
      friendships.map(async (friendship) => {
        const friend = friendship.userId === userId ? friendship.friend : friendship.user;

        const lastmessage = await Message.findOne({
          where: {
            [Op.or]: [
              { senderId: userId, receiverId: friend.id },
              { senderId: friend.id, receiverId: userId },
            ],
            groupId: null, // Только личные сообщения
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
            groupId: null, // Только личные сообщения
          },
        });

        const friendData = friend.get({ plain: true });
        // Нормализуем путь к аватару
        if (friendData.avatar) {
          friendData.avatar = `/uploads/avatars/${path.basename(friendData.avatar)}`;
        }
        
        return {
          type: 'private',
          friend: friendData,
          lastMessage: lastmessage ? lastmessage.get() : null,
          unreadCount,
        };
      }),
    );

    // Получаем групповые чаты
    const memberships = await GroupMember.findAll({
      where: {
        userId,
      },
      include: [
        {
          model: Group,
          as: 'group',
          include: [
            {
              model: User,
              as: 'creator',
              attributes: { exclude: ['password'] },
            },
          ],
        },
      ],
    });

    const groupChats = await Promise.all(
      memberships.map(async (membership) => {
        const group = membership.group;

        // Получаем последнее сообщение группы
        const lastMessage = await Message.findOne({
          where: {
            groupId: group.id,
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

        // Для групп непрочитанные сообщения пока не считаем (нужна таблица MessageRead)
        const unreadCount = 0;

        const groupData = group.get({ plain: true });
        // Нормализуем путь к аватару создателя
        if (groupData.creator && groupData.creator.avatar) {
          groupData.creator.avatar = `/uploads/avatars/${path.basename(groupData.creator.avatar)}`;
        }
        // Нормализуем путь к аватару группы, если есть
        if (groupData.avatar) {
          groupData.avatar = `/uploads/avatars/${path.basename(groupData.avatar)}`;
        }

        return {
          type: 'group',
          group: groupData,
          lastMessage: lastMessage ? lastMessage.get() : null,
          unreadCount,
        };
      }),
    );

    // Объединяем и сортируем по дате последнего сообщения
    const allChats = [...privateChats, ...groupChats];
    
    allChats.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
    });

    return allChats;
  }
}

module.exports = MessagesService;
