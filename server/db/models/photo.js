'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Photo extends Model {
    static associate(models) {
      Photo.belongsTo(models.Album, {
        foreignKey: 'albumId',
        as: 'album',
      });
      Photo.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
    }
  }
  Photo.init(
    {
      albumId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Albums',
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
      filePath: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      comment: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'Photo',
    },
  );
  return Photo;
};

