const MessagesService = require('../services/MessagesService');
const { getIO } = require('../socket/socketInstance');

class MessagesController {
  // Получить все сообщения с другом
  static async getMessagesWithFriend(req, res) {
    try {
      const userId = res.locals.user.id;
      const { friendId } = req.params;

      const friendIdNum = parseInt(friendId, 10);
      const messages = await MessagesService.getMessagesWithFriend(
        userId,
        friendIdNum,
      );

      // Отмечаем все сообщения как прочитанные при получении
      const updatedCount = await MessagesService.markAllAsRead(userId, friendIdNum);

      // Отправляем WebSocket событие отправителю (другу), чтобы у него обновились галочки
      const io = getIO();
      if (io && updatedCount > 0) {
        io.to(`user-${friendIdNum}`).emit('messages-read', {
          userId,
          friendId: friendIdNum,
        });
      }

      return res.status(200).json(messages);
    } catch (error) {
      console.error('Error in getMessagesWithFriend:', error);
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  // Отправить сообщение
  static async sendMessage(req, res) {
    try {
      const userId = res.locals.user.id;
      const { receiverId, text } = req.body;
      const receiverIdNum = parseInt(receiverId, 10);

      if (!text || text.trim().length === 0) {
        return res.status(400).json({ message: 'Текст сообщения не может быть пустым' });
      }

      const message = await MessagesService.sendMessage(
        userId,
        receiverIdNum,
        text.trim(),
      );

      // Отправляем сообщение через WebSocket
      const io = getIO();
      if (io) {
        // Отправляем сообщение получателю
        io.to(`user-${receiverIdNum}`).emit('new-message', message);
        
        // Подтверждение отправителю (если он онлайн)
        io.to(`user-${userId}`).emit('message-sent', message);
        
        // Обновляем список чатов для обоих пользователей
        const senderChats = await MessagesService.getChats(userId);
        const receiverChats = await MessagesService.getChats(receiverIdNum);
        
        io.to(`user-${userId}`).emit('chats-updated', senderChats);
        io.to(`user-${receiverIdNum}`).emit('chats-updated', receiverChats);
      }

      return res.status(201).json(message);
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  // Отметить сообщение как прочитанное
  static async markAsRead(req, res) {
    try {
      const userId = res.locals.user.id;
      const { messageId } = req.params;

      const message = await MessagesService.markAsRead(parseInt(messageId, 10), userId);

      if (!message) {
        return res.status(404).json({ message: 'Сообщение не найдено' });
      }

      return res.status(200).json({ message: 'Сообщение отмечено как прочитанное' });
    } catch (error) {
      console.error('Error in markAsRead:', error);
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  // Отметить все сообщения в чате как прочитанные
  static async markAllAsRead(req, res) {
    try {
      const userId = res.locals.user.id;
      const friendIdNum = parseInt(req.params.friendId, 10);

      const updatedCount = await MessagesService.markAllAsRead(
        userId,
        friendIdNum,
      );

      // Отправляем WebSocket событие отправителю (другу), чтобы у него обновились галочки
      const io = getIO();
      if (io && updatedCount > 0) {
        io.to(`user-${friendIdNum}`).emit('messages-read', {
          userId,
          friendId: friendIdNum,
        });
      }

      return res.status(200).json({
        message: 'Все сообщения отмечены как прочитанные',
        updatedCount,
      });
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  // Получить список чатов
  static async getChats(req, res) {
    try {
      const userId = res.locals.user.id;
      const chats = await MessagesService.getChats(userId);

      return res.status(200).json(chats);
    } catch (error) {
      console.error('Error in getChats:', error);
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  // Получить количество непрочитанных сообщений
  static async getUnreadCount(req, res) {
    try {
      const userId = res.locals.user.id;
      const count = await MessagesService.getUnreadCount(userId);

      return res.status(200).json({ unreadCount: count });
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  // Отправить сообщение в группу
  static async sendGroupMessage(req, res) {
    try {
      const userId = res.locals.user.id;
      const { groupId, text } = req.body;
      const groupIdNum = parseInt(groupId, 10);

      if (!text || text.trim().length === 0) {
        return res.status(400).json({ message: 'Текст сообщения не может быть пустым' });
      }

      const message = await MessagesService.sendGroupMessage(
        userId,
        groupIdNum,
        text.trim(),
      );

      // Отправляем сообщение через WebSocket в комнату группы
      const io = getIO();
      if (io) {
        // Отправляем сообщение всем участникам группы в комнате
        io.to(`group-${groupIdNum}`).emit('new-group-message', message);
        
        // Обновляем список чатов для всех участников группы
        const { GroupMember } = require('../../db/models');
        const members = await GroupMember.findAll({
          where: { groupId: groupIdNum },
          attributes: ['userId'],
        });

        const memberIds = members.map((m) => m.userId);
        const allChatsPromises = memberIds.map((memberId) =>
          MessagesService.getChats(memberId).then((chats) => ({
            memberId,
            chats,
          })),
        );

        const allChats = await Promise.all(allChatsPromises);
        allChats.forEach(({ memberId, chats }) => {
          io.to(`user-${memberId}`).emit('chats-updated', chats);
        });
      }

      return res.status(201).json(message);
    } catch (error) {
      console.error('Error in sendGroupMessage:', error);
      if (error.message === 'Вы не являетесь участником этой группы') {
        return res.status(403).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  // Получить сообщения группы
  static async getGroupMessages(req, res) {
    try {
      const userId = res.locals.user.id;
      const groupId = parseInt(req.params.groupId, 10);

      const messages = await MessagesService.getGroupMessages(groupId, userId);

      return res.status(200).json(messages);
    } catch (error) {
      console.error('Error in getGroupMessages:', error);
      if (error.message === 'Вы не являетесь участником этой группы') {
        return res.status(403).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  // Отметить все сообщения группы как прочитанные
  static async markGroupMessagesAsRead(req, res) {
    try {
      const userId = res.locals.user.id;
      const groupId = parseInt(req.params.groupId, 10);

      const updatedCount = await MessagesService.markGroupMessagesAsRead(groupId, userId);

      // Отправляем WebSocket событие (если нужно)
      const io = getIO();
      if (io) {
        io.to(`group-${groupId}`).emit('group-messages-read', {
          groupId,
          userId,
        });
      }

      return res.status(200).json({
        message: 'Все сообщения группы отмечены как прочитанные',
        updatedCount,
      });
    } catch (error) {
      console.error('Error in markGroupMessagesAsRead:', error);
      if (error.message === 'Вы не являетесь участником этой группы') {
        return res.status(403).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
  }
}

module.exports = MessagesController;
