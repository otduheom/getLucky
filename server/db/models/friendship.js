'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Friendship extends Model {
    static associate(models) {
      Friendship.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
      Friendship.belongsTo(models.User, {
        foreignKey: 'friendId',
        as: 'friend',
      });
    }
  }

  Friendship.addHook('beforeCreate', (friendship) => {
    if (friendship.userId === friendship.friendId) {
      throw new Error('Пользователь не может добавить себя в друзья');
    }
  });
  Friendship.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      friendId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      status: {
        type: DataTypes.ENUM('pending', 'accepted', 'blocked'),
        allowNull: false,
        defaultValue: 'pending',
      },
    },
    {
      sequelize,
      modelName: 'Friendship',
      tableName: 'Friendships',
    },
  );
  return Friendship;
};

