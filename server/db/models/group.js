'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    static associate(models) {
      Group.belongsTo(models.User, {
        foreignKey: 'creatorId',
        as: 'creator',
      });
      Group.belongsToMany(models.User, {
        through: models.GroupMember,
        as: 'members',
        foreignKey: 'groupId',
        otherKey: 'userId',
      });
      Group.hasMany(models.Message, {
        foreignKey: 'groupId',
        as: 'messages',
      });
    }
  }

  Group.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      creatorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Group',
    },
  );

  return Group;
};
