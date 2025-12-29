'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Album extends Model {
    static associate(models) {
      Album.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
      Album.hasMany(models.Photo, {
        foreignKey: 'albumId',
        as: 'photos',
      });
    }
  }
  Album.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      privacy: {
        type: DataTypes.ENUM('public', 'friends', 'private'),
        allowNull: false,
        defaultValue: 'public',
      },
    },
    {
      sequelize,
      modelName: 'Album',
    },
  );
  return Album;
};

