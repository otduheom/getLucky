const jwt = require('jsonwebtoken');
const { User, Message, Friendship, GroupMember } = require('../../db/models');
const { Op } = require('sequelize');
const MessagesService = require('../services/MessagesService');
const GroupsService = require('../services/GroupsService');

// Хранилище активных подключений (userId -> socketId)
const activeUsers = new Map();

const authenticateSocket = (socket, next) => {
  try {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: Token required'));
    }

    const { user } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    socket.userId = user.id;
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};

const setupSocket = (io) => {
  // Middleware для аутентификации
  io.use(authenticateSocket);

  io.on('connection', async (socket) => {
    const { userId } = socket;
    console.log(`User ${userId} connected with socket ${socket.id}`);

    // Сохраняем активное подключение
    activeUsers.set(userId, socket.id);

    // Обновляем lastSeen при подключении
    try {
      await User.update({ lastSeen: new Date() }, { where: { id: userId } });
    } catch (error) {
      console.error('Error updating lastSeen on socket connection:', error);
    }

    // Уведомляем всех друзей о том, что пользователь онлайн
    socket.broadcast.emit('user-online', { userId });

    // Присоединяем пользователя в его личную комнату
    socket.join(`user-${userId}`);

    // Получаем все группы пользователя и присоединяем к комнатам
    try {
      const userGroups = await GroupsService.getUserGroups(userId);
      userGroups.forEach((groupChat) => {
        socket.join(`group-${groupChat.group.id}`);
      });
    } catch (error) {
      console.error('Error joining group rooms:', error);
    }

    // Обработка отправки сообщения в группу
    socket.on('send-group-message', async (data) => {
      try {
        const { groupId, text } = data;

        if (!text || text.trim().length === 0) {
          return socket.emit('error', {
            message: 'Текст сообщения не может быть пустым',
          });
        }

        if (!groupId) {
          return socket.emit('error', { message: 'ID группы не указан' });
        }

        // Проверка участия в группе
        const membership = await GroupMember.findOne({
          where: {
            groupId: parseInt(groupId, 10),
            userId,
          },
        });

        if (!membership) {
          return socket.emit('error', {
            message: 'Вы не являетесь участником этой группы',
          });
        }

        // Создание сообщения через MessagesService.sendGroupMessage
        const message = await MessagesService.sendGroupMessage(
          userId,
          parseInt(groupId, 10),
          text.trim(),
        );

        // Отправка в комнату группы (не конкретному пользователю!)
        io.to(`group-${groupId}`).emit('new-group-message', message);

        // Обновление списка чатов для всех участников
        const members = await GroupMember.findAll({
          where: { groupId: parseInt(groupId, 10) },
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
      } catch (error) {
        console.error('Error in send-group-message:', error);
        socket.emit('error', { message: 'Ошибка отправки сообщения в группу' });
      }
    });

    socket.on('join-group', async (data) => {
      try {
        const { groupId } = data;

        if (!groupId) {
          return socket.emit('error', { message: 'ID группы не указан' });
        }

        // Проверяем, что пользователь является участником группы
        const membership = await GroupMember.findOne({
          where: {
            groupId: parseInt(groupId, 10),
            userId,
          },
        });

        if (!membership) {
          return socket.emit('error', {
            message: 'Вы не являетесь участником этой группы',
          });
        }

        socket.join(`group-${groupId}`);
        socket.emit('joined-group', { groupId });
      } catch (error) {
        console.error('Error in join-group:', error);
        socket.emit('error', { message: 'Ошибка присоединения к группе' });
      }
    });

    socket.on('leave-group', async (data) => {
      try {
        const { groupId } = data;

        if (!groupId) {
          return socket.emit('error', { message: 'ID группы не указан' });
        }

        // Проверяем, что пользователь является участником группы
        const membership = await GroupMember.findOne({
          where: {
            groupId: parseInt(groupId, 10),
            userId,
          },
        });

        if (!membership) {
          return socket.emit('error', {
            message: 'Вы не являетесь участником этой группы',
          });
        }

        socket.leave(`group-${groupId}`);
        socket.emit('left-group', { groupId });
      } catch (error) {
        console.error('Error in leave-group:', error);
        socket.emit('error', { message: 'Ошибка выхода из группы' });
      }
    });

    // ---------------------------------------------------------------

    // Обработка отправки сообщения
    socket.on('send-message', async (data) => {
      try {
        const { receiverId, text } = data;

        if (!text || text.trim().length === 0) {
          return socket.emit('error', {
            message: 'Текст сообщения не может быть пустым',
          });
        }

        // Проверяем дружбу
        const friendship = await Friendship.findOne({
          where: {
            [Op.or]: [
              { userId, friendId: receiverId, status: 'accepted' },
              { userId: receiverId, friendId: userId, status: 'accepted' },
            ],
          },
        });

        if (!friendship) {
          return socket.emit('error', { message: 'Вы не друзья с этим пользователем' });
        }

        // Создаем сообщение в БД
        const message = await MessagesService.sendMessage(
          userId,
          receiverId,
          text.trim(),
        );

        // Отправляем сообщение получателю
        io.to(`user-${receiverId}`).emit('new-message', message);

        // Подтверждение отправителю
        socket.emit('message-sent', message);

        // Обновляем список чатов для обоих пользователей
        const senderChats = await MessagesService.getChats(userId);
        const receiverChats = await MessagesService.getChats(receiverId);

        io.to(`user-${userId}`).emit('chats-updated', senderChats);
        io.to(`user-${receiverId}`).emit('chats-updated', receiverChats);
      } catch (error) {
        console.error('Error in send-message:', error);
        socket.emit('error', { message: 'Ошибка отправки сообщения' });
      }
    });

    // Обработка отметки сообщений как прочитанных
    socket.on('mark-read', async (data) => {
      try {
        const { friendId } = data;
        const updatedCount = await MessagesService.markAllAsRead(userId, friendId);

        // Уведомляем отправителя об обновлении
        io.to(`user-${friendId}`).emit('messages-read', {
          userId,
          updatedCount,
        });

        // Обновляем чаты для обоих пользователей
        const senderChats = await MessagesService.getChats(userId);
        const friendChats = await MessagesService.getChats(friendId);

        io.to(`user-${userId}`).emit('chats-updated', senderChats);
        io.to(`user-${friendId}`).emit('chats-updated', friendChats);
      } catch (error) {
        console.error('Error in mark-read:', error);
        socket.emit('error', { message: 'Ошибка отметки сообщений' });
      }
    });

    // Обработка отключения
    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
      activeUsers.delete(userId);

      // Уведомляем всех друзей о том, что пользователь оффлайн
      socket.broadcast.emit('user-offline', { userId });
    });
  });

  return io;
};

module.exports = { setupSocket, activeUsers };
