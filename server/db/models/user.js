'use strict';

const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Связь многие-ко-многим для друзей через таблицу Friendship
      User.belongsToMany(models.User, {
        through: models.Friendship,
        as: 'friends',
        foreignKey: 'userId',
        otherKey: 'friendId',
      });

      // Обратная связь для друзей (чтобы можно было получить друзей, у которых текущий пользователь в friendId)
      User.belongsToMany(models.User, {
        through: models.Friendship,
        as: 'friendOf',
        foreignKey: 'friendId',
        otherKey: 'userId',
      });

      // Пользователь отправляет много сообщений
      User.hasMany(models.Message, {
        foreignKey: 'senderId',
        as: 'sentMessages',
      });

      // Пользователь получает много сообщений
      User.hasMany(models.Message, {
        foreignKey: 'receiverId',
        as: 'receivedMessages',
      });

      // Пользователь принадлежит многим группам
      User.belongsToMany(models.Group, {
        through: models.GroupMember,
        as: 'groups',
        foreignKey: 'userId',
        otherKey: 'groupId',
      });
    }

    static validateEmail(email) {
      const emailPattern = /^[A-z0-9._%+-]+@[A-z0-9.-]+\.[A-z]{2,}$/;
      return emailPattern.test(email);
    }

    static validatePassword(password) {
      const hasUpperCase = /[A-Z]/;
      const hasLowerCase = /[a-z]/;
      const hasNumbers = /\d/;
      const hasSpecialCharacters = /[!@#$%^&*()-,.?":{}|<>]/;
      const isValidLength = password.length >= 8;

      if (
        !hasUpperCase.test(password) ||
        !hasLowerCase.test(password) ||
        !hasNumbers.test(password) ||
        !hasSpecialCharacters.test(password) ||
        !isValidLength
      ) {
        return false;
      }

      return true;
    }

    static validateLoginData({ email, password }) {
      if (
        !email ||
        typeof email !== 'string' ||
        email.trim().length === 0 ||
        !this.validateEmail(email)
      ) {
        return {
          isValid: false,
          err: 'Email не должен быть пустым и должен быть валидным',
        };
      }

      if (
        !password ||
        typeof password !== 'string' ||
        password.trim().length === 0 ||
        !this.validatePassword(password)
      ) {
        return {
          isValid: false,
          err: 'Пароль не должен быть пустым, должен содержать хотя бы одну цифру, одну заглавную букву, одну строчную букву, один специальный символ и быть не менее 8 символов',
        };
      }

      return {
        isValid: true,
        err: null,
      };
    }

    static validateSignUpData({ name, email, password }) {
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return {
          isValid: false,
          err: 'Поле name не должно быть пустым',
        };
      }

      if (
        !email ||
        typeof email !== 'string' ||
        email.trim().length === 0 ||
        !this.validateEmail(email)
      ) {
        return {
          isValid: false,
          err: 'Email должен быть валидным',
        };
      }

      if (
        !password ||
        typeof password !== 'string' ||
        password.trim().length === 0 ||
        !this.validatePassword(password)
      ) {
        return {
          isValid: false,
          err: 'Пароль не должен быть пустым, должен содержать одну большую букву, одну маленькую, один специальный символ, и не должен быть короче 8 символов',
        };
      }

      return {
        isValid: true,
        err: null,
      };
    }
  }
  User.init(
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      avatar: DataTypes.STRING,
      nickname: {
        type: DataTypes.STRING,
        unique: true,
      },
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      age: DataTypes.INTEGER,
      city: DataTypes.STRING,
      about: DataTypes.TEXT,
      lastSeen: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'User',
    },
  );
  return User;
};
