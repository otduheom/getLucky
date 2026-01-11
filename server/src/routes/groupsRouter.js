const express = require('express');
const GroupsController = require('../controllers/GroupsController');
const { verifyAccessToken } = require('../middlewares/verifyTokens');
const checkGroupMembership = require('../middlewares/checkGroupMembership');

const groupsRouter = express.Router();

// Создать группу
groupsRouter.post('/', verifyAccessToken, GroupsController.createGroup);

// Получить все группы пользователя
groupsRouter.get('/', verifyAccessToken, GroupsController.getUserGroups);

// Получить информацию о группе
groupsRouter.get('/:groupId', verifyAccessToken, checkGroupMembership, GroupsController.getGroupById);

// Добавить участников в группу
groupsRouter.post('/:groupId/members', verifyAccessToken, checkGroupMembership, GroupsController.addMembers);

// Удалить участника из группы
groupsRouter.delete('/:groupId/members/:userId', verifyAccessToken, checkGroupMembership, GroupsController.removeMember);

// Покинуть группу
groupsRouter.delete('/:groupId/leave', verifyAccessToken, checkGroupMembership, GroupsController.leaveGroup);

// Получить участников группы
groupsRouter.get('/:groupId/members', verifyAccessToken, checkGroupMembership, GroupsController.getGroupMembers);

module.exports = groupsRouter;
