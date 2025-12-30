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
}

module.exports = MessagesController;
