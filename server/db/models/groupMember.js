'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class GroupMember extends Model {
    static associate(models) {
      GroupMember.belongsTo(models.Group, {
        foreignKey: 'groupId',
        as: 'group',
      });
      GroupMember.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
    }
  }

  GroupMember.init(
    {
      groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Groups',
          key: 'id',
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      role: {
        type: DataTypes.ENUM('member', 'admin'),
        allowNull: false,
        defaultValue: 'member',
      },
      joinedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'GroupMember',
      tableName: 'GroupMembers',
    },
  );

  return GroupMember;
};
