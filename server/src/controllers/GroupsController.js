const GroupsService = require('../services/GroupsService');
const { getIO } = require('../socket/socketInstance');

class GroupsController {
  /**
   * Создать группу
   * POST /api/groups
   * Body: { name, description?, memberIds: number[] }
   */
  static async createGroup(req, res) {
    try {
      const userId = res.locals.user.id;
      const { name, description, memberIds = [] } = req.body;

      if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: 'Название группы не может быть пустым' });
      }

      const group = await GroupsService.createGroup(
        userId,
        name.trim(),
        description?.trim() || null,
        memberIds,
      );

      // Отправляем WebSocket событие всем участникам группы
      const io = getIO();
      if (io) {
        // Отправляем событие создателю
        io.to(`user-${userId}`).emit('group-created', group);
        
        // Отправляем событие всем участникам (если они онлайн)
        if (memberIds.length > 0) {
          memberIds.forEach((memberId) => {
            io.to(`user-${memberId}`).emit('group-created', group);
          });
        }
      }

      return res.status(201).json(group);
    } catch (error) {
      console.error('Error in createGroup:', error);
      if (error.message === 'Не все выбранные пользователи являются друзьями') {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  /**
   * Получить все группы пользователя
   * GET /api/groups
   */
  static async getUserGroups(req, res) {
    try {
      const userId = res.locals.user.id;
      const groups = await GroupsService.getUserGroups(userId);

      return res.status(200).json(groups);
    } catch (error) {
      console.error('Error in getUserGroups:', error);
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  /**
   * Получить информацию о группе
   * GET /api/groups/:groupId
   */
  static async getGroupById(req, res) {
    try {
      const userId = res.locals.user.id;
      const groupId = parseInt(req.params.groupId, 10);

      const group = await GroupsService.getGroupById(groupId, userId);

      return res.status(200).json(group);
    } catch (error) {
      console.error('Error in getGroupById:', error);
      if (error.message === 'Вы не являетесь участником этой группы' || 
          error.message === 'Группа не найдена') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  /**
   * Добавить участников в группу
   * POST /api/groups/:groupId/members
   * Body: { memberIds: number[] }
   */
  static async addMembers(req, res) {
    try {
      const userId = res.locals.user.id;
      const groupId = parseInt(req.params.groupId, 10);
      const { memberIds } = req.body;

      if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
        return res.status(400).json({ message: 'Необходимо указать хотя бы одного участника' });
      }

      const members = await GroupsService.addMembers(groupId, userId, memberIds);

      // Отправляем WebSocket событие всем участникам группы
      const io = getIO();
      if (io) {
        // Получаем информацию о группе для отправки
        const group = await GroupsService.getGroupById(groupId, userId);
        
        // Отправляем событие всем участникам группы
        const allMemberIds = members.map((m) => m.userId);
        allMemberIds.forEach((memberId) => {
          io.to(`user-${memberId}`).emit('group-members-updated', {
            groupId,
            group,
            members,
          });
        });

        // Отправляем событие новым участникам
        memberIds.forEach((memberId) => {
          io.to(`user-${memberId}`).emit('added-to-group', group);
        });
      }

      return res.status(200).json(members);
    } catch (error) {
      console.error('Error in addMembers:', error);
      if (error.message === 'Вы не являетесь участником этой группы' ||
          error.message === 'Не все выбранные пользователи являются вашими друзьями' ||
          error.message === 'Все выбранные пользователи уже являются участниками группы' ||
          error.message === 'Необходимо указать хотя бы одного участника') {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  /**
   * Удалить участника из группы
   * DELETE /api/groups/:groupId/members/:userId
   */
  static async removeMember(req, res) {
    try {
      const userId = res.locals.user.id;
      const groupId = parseInt(req.params.groupId, 10);
      const memberIdToRemove = parseInt(req.params.userId, 10);

      await GroupsService.removeMember(groupId, userId, memberIdToRemove);

      // Отправляем WebSocket событие
      const io = getIO();
      if (io) {
        // Отправляем событие удаленному участнику
        io.to(`user-${memberIdToRemove}`).emit('removed-from-group', {
          groupId,
        });

        // Отправляем событие всем участникам группы
        const members = await GroupsService.getGroupMembers(groupId);
        const allMemberIds = members.map((m) => m.userId);
        allMemberIds.forEach((memberId) => {
          io.to(`user-${memberId}`).emit('group-members-updated', {
            groupId,
            members,
          });
        });
      }

      return res.status(200).json({ message: 'Участник удален из группы' });
    } catch (error) {
      console.error('Error in removeMember:', error);
      if (error.message === 'Вы не являетесь участником этой группы' ||
          error.message === 'Вы можете удалить только себя из группы' ||
          error.message === 'Участник не найден в группе' ||
          error.message === 'Нельзя удалить создателя группы') {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  /**
   * Покинуть группу
   * DELETE /api/groups/:groupId/leave
   */
  static async leaveGroup(req, res) {
    try {
      const userId = res.locals.user.id;
      const groupId = parseInt(req.params.groupId, 10);

      await GroupsService.leaveGroup(groupId, userId);

      // Отправляем WebSocket событие
      const io = getIO();
      if (io) {
        // Отправляем событие пользователю, который покинул группу
        io.to(`user-${userId}`).emit('left-group', {
          groupId,
        });

        // Отправляем событие всем участникам группы
        const members = await GroupsService.getGroupMembers(groupId);
        const allMemberIds = members.map((m) => m.userId);
        allMemberIds.forEach((memberId) => {
          io.to(`user-${memberId}`).emit('group-members-updated', {
            groupId,
            members,
          });
        });
      }

      return res.status(200).json({ message: 'Вы покинули группу' });
    } catch (error) {
      console.error('Error in leaveGroup:', error);
      if (error.message === 'Вы не являетесь участником этой группы' ||
          error.message === 'Создатель не может покинуть группу. Сначала передайте права другому участнику.') {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  /**
   * Получить участников группы
   * GET /api/groups/:groupId/members
   */
  static async getGroupMembers(req, res) {
    try {
      const userId = res.locals.user.id;
      const groupId = parseInt(req.params.groupId, 10);

      // Проверяем, что пользователь является участником
      await GroupsService.getGroupById(groupId, userId);

      const members = await GroupsService.getGroupMembers(groupId);

      return res.status(200).json(members);
    } catch (error) {
      console.error('Error in getGroupMembers:', error);
      if (error.message === 'Вы не являетесь участником этой группы' ||
          error.message === 'Группа не найдена') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
  }
}

module.exports = GroupsController;
