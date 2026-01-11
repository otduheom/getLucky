const { GroupMember } = require('../../db/models');

const checkGroupMembership = async (req, res, next) => {
  try {
    const userId = res.locals.user.id;
    const groupId = parseInt(req.params.groupId || req.body.groupId);

    if (!groupId) {
      return res.status(400).json({ message: 'ID группы не указан' });
    }

    // Проверяем, является ли пользователь участником группы
    const membership = await GroupMember.findOne({
      where: {
        groupId,
        userId,
      },
    });

    if (!membership) {
      return res.status(403).json({ message: 'Вы не являетесь участником этой группы' });
    }

    res.locals.groupId = groupId;
    next();
  } catch (error) {
    console.error('Error in checkGroupMembership:', error);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = checkGroupMembership;
