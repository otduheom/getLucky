const MessagesService = require('../services/MessagesService');

class MessagesController {
  // Получить все сообщения с другом
  static async getMessagesWithFriend(req, res) {
    try {
      const userId = res.locals.user.id;
      const { friendId } = req.params;

      const messages = await MessagesService.getMessagesWithFriend(
        userId,
        parseInt(friendId, 10),
      );

      // Отмечаем все сообщения как прочитанные при получении
      await MessagesService.markAllAsRead(userId, parseInt(friendId, 10));

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

      if (!text || text.trim().length === 0) {
        return res.status(400).json({ message: 'Текст сообщения не может быть пустым' });
      }

      const message = await MessagesService.sendMessage(
        userId,
        parseInt(receiverId, 10),
        text.trim(),
      );

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
      const { friendId } = req.params;

      const updatedCount = await MessagesService.markAllAsRead(
        userId,
        parseInt(friendId, 10),
      );

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
