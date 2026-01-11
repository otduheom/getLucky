const { Group, GroupMember, User, Message, Friendship } = require('../../db/models');
const { Op } = require('sequelize');
const path = require('path');

class GroupsService {
  /**
   * Создает группу и добавляет создателя + выбранных участников
   * Проверяет, что все memberIds - друзья создателя
   * Возвращает группу с участниками
   */
  static async createGroup(creatorId, name, description, memberIds = []) {
    // Проверяем, что все memberIds - друзья создателя
    if (memberIds.length > 0) {
      const friendships = await Friendship.findAll({
        where: {
          [Op.or]: [
            { userId: creatorId, friendId: { [Op.in]: memberIds }, status: 'accepted' },
            { friendId: creatorId, userId: { [Op.in]: memberIds }, status: 'accepted' },
          ],
        },
      });

      const friendIds = new Set();
      friendships.forEach((friendship) => {
        const friendId = friendship.userId === creatorId ? friendship.friendId : friendship.userId;
        friendIds.add(friendId);
      });

      // Проверяем, что все memberIds являются друзьями
      const allAreFriends = memberIds.every((id) => friendIds.has(id));
      if (!allAreFriends) {
        throw new Error('Не все выбранные пользователи являются друзьями');
      }
    }

    // Создаем группу
    const group = await Group.create({
      name,
      description,
      creatorId,
    });

    // Добавляем создателя в группу с ролью admin
    await GroupMember.create({
      groupId: group.id,
      userId: creatorId,
      role: 'admin',
    });

    // Добавляем выбранных участников
    if (memberIds.length > 0) {
      await GroupMember.bulkCreate(
        memberIds.map((userId) => ({
          groupId: group.id,
          userId,
          role: 'member',
        })),
      );
    }

    // Возвращаем группу с участниками
    const groupWithMembers = await Group.findByPk(group.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: { exclude: ['password'] },
        },
        {
          model: User,
          as: 'members',
          attributes: { exclude: ['password'] },
          through: { attributes: ['role', 'joinedAt'] },
        },
      ],
    });

    const groupData = groupWithMembers.get({ plain: true });
    // Нормализуем путь к аватару создателя
    if (groupData.creator && groupData.creator.avatar) {
      groupData.creator.avatar = `/uploads/avatars/${path.basename(groupData.creator.avatar)}`;
    }
    // Нормализуем пути к аватарам участников
    if (groupData.members) {
      groupData.members.forEach((member) => {
        if (member.avatar) {
          member.avatar = `/uploads/avatars/${path.basename(member.avatar)}`;
        }
      });
    }

    return groupData;
  }

  /**
   * Получает группу с участниками
   * Проверяет, что пользователь является участником
   */
  static async getGroupById(groupId, userId) {
    // Проверяем, что пользователь является участником
    const membership = await GroupMember.findOne({
      where: {
        groupId,
        userId,
      },
    });

    if (!membership) {
      throw new Error('Вы не являетесь участником этой группы');
    }

    // Получаем группу с участниками
    const group = await Group.findByPk(groupId, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: { exclude: ['password'] },
        },
        {
          model: User,
          as: 'members',
          attributes: { exclude: ['password'] },
          through: { attributes: ['role', 'joinedAt'] },
        },
      ],
    });

    if (!group) {
      throw new Error('Группа не найдена');
    }

    const groupData = group.get({ plain: true });
    // Нормализуем путь к аватару создателя
    if (groupData.creator && groupData.creator.avatar) {
      groupData.creator.avatar = `/uploads/avatars/${path.basename(groupData.creator.avatar)}`;
    }
    // Нормализуем пути к аватарам участников
    if (groupData.members) {
      groupData.members.forEach((member) => {
        if (member.avatar) {
          member.avatar = `/uploads/avatars/${path.basename(member.avatar)}`;
        }
      });
    }

    return groupData;
  }

  /**
   * Получает все группы пользователя с последним сообщением
   * Аналогично getChats() для личных чатов
   */
  static async getUserGroups(userId) {
    // Получаем все группы пользователя
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

    const groups = await Promise.all(
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

        // Считаем непрочитанные сообщения (для групп это будет отдельная логика)
        // Пока возвращаем 0, так как для групп нужна отдельная таблица MessageRead
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
          group: groupData,
          lastMessage: lastMessage ? lastMessage.get() : null,
          unreadCount,
        };
      }),
    );

    // Сортируем по дате последнего сообщения
    groups.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
    });

    return groups;
  }

  /**
   * Добавляет новых участников в группу
   * Проверяет права (только участники группы могут добавлять)
   * Проверяет дружбу (можно добавлять только друзей)
   */
  static async addMembers(groupId, userId, newMemberIds) {
    if (!newMemberIds || newMemberIds.length === 0) {
      throw new Error('Необходимо указать хотя бы одного участника');
    }

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

    // Проверяем, что все newMemberIds - друзья пользователя, добавляющего участников
    const friendships = await Friendship.findAll({
      where: {
        [Op.or]: [
          { userId, friendId: { [Op.in]: newMemberIds }, status: 'accepted' },
          { friendId: userId, userId: { [Op.in]: newMemberIds }, status: 'accepted' },
        ],
      },
    });

    const friendIds = new Set();
    friendships.forEach((friendship) => {
      const friendId = friendship.userId === userId ? friendship.friendId : friendship.userId;
      friendIds.add(friendId);
    });

    // Проверяем, что все newMemberIds являются друзьями
    const allAreFriends = newMemberIds.every((id) => friendIds.has(id));
    if (!allAreFriends) {
      throw new Error('Не все выбранные пользователи являются вашими друзьями');
    }

    // Проверяем, что эти пользователи еще не в группе
    const existingMembers = await GroupMember.findAll({
      where: {
        groupId,
        userId: { [Op.in]: newMemberIds },
      },
    });

    const existingMemberIds = existingMembers.map((m) => m.userId);
    const newUniqueMemberIds = newMemberIds.filter((id) => !existingMemberIds.includes(id));

    if (newUniqueMemberIds.length === 0) {
      throw new Error('Все выбранные пользователи уже являются участниками группы');
    }

    // Добавляем новых участников
    await GroupMember.bulkCreate(
      newUniqueMemberIds.map((memberId) => ({
        groupId,
        userId: memberId,
        role: 'member',
      })),
    );

    // Возвращаем обновленный список участников
    return this.getGroupMembers(groupId);
  }

  /**
   * Удаляет участника из группы
   * Создатель может удалять любого, участники - только себя
   */
  static async removeMember(groupId, userId, memberIdToRemove) {
    // Проверяем, что пользователь является участником группы
    const userMembership = await GroupMember.findOne({
      where: {
        groupId,
        userId,
      },
      include: [
        {
          model: Group,
          as: 'group',
        },
      ],
    });

    if (!userMembership) {
      throw new Error('Вы не являетесь участником этой группы');
    }

    const group = userMembership.group;
    const isCreator = group.creatorId === userId;

    // Проверяем права: создатель может удалять любого, участники - только себя
    if (!isCreator && userId !== memberIdToRemove) {
      throw new Error('Вы можете удалить только себя из группы');
    }

    // Проверяем, что участник существует
    const memberToRemove = await GroupMember.findOne({
      where: {
        groupId,
        userId: memberIdToRemove,
      },
    });

    if (!memberToRemove) {
      throw new Error('Участник не найден в группе');
    }

    // Не позволяем удалить создателя
    if (group.creatorId === memberIdToRemove) {
      throw new Error('Нельзя удалить создателя группы');
    }

    // Удаляем участника
    await memberToRemove.destroy();

    return { success: true };
  }

  /**
   * Пользователь покидает группу
   */
  static async leaveGroup(groupId, userId) {
    // Проверяем, что пользователь является участником
    const membership = await GroupMember.findOne({
      where: {
        groupId,
        userId,
      },
      include: [
        {
          model: Group,
          as: 'group',
        },
      ],
    });

    if (!membership) {
      throw new Error('Вы не являетесь участником этой группы');
    }

    const group = membership.group;

    // Не позволяем создателю покинуть группу (можно добавить логику передачи прав)
    if (group.creatorId === userId) {
      throw new Error('Создатель не может покинуть группу. Сначала передайте права другому участнику.');
    }

    // Удаляем участника
    await membership.destroy();

    return { success: true };
  }

  /**
   * Получает список участников группы
   */
  static async getGroupMembers(groupId) {
    const members = await GroupMember.findAll({
      where: {
        groupId,
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] },
        },
      ],
      order: [['joinedAt', 'ASC']],
    });

    const membersData = members.map((member) => {
      const memberData = member.get({ plain: true });
      const userData = memberData.user;
      // Нормализуем путь к аватару
      if (userData && userData.avatar) {
        userData.avatar = `/uploads/avatars/${path.basename(userData.avatar)}`;
      }
      return {
        id: memberData.id,
        userId: memberData.userId,
        groupId: memberData.groupId,
        role: memberData.role,
        joinedAt: memberData.joinedAt,
        user: userData,
      };
    });

    return membersData;
  }
}

module.exports = GroupsService;