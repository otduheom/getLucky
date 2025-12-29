'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      Message.belongsTo(models.User, {
        foreignKey: 'senderId',
        as: 'sender',
      });
      Message.belongsTo(models.User, {
        foreignKey: 'receiverId',
        as: 'receiver',
      });
    }
  }
  Message.init(
    {
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'Message',
    },
  );
  return Message;
};

