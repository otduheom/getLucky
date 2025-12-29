'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Friendships', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      friendId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'blocked'),
        allowNull: false,
        defaultValue: 'pending',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
    });

    // Добавляем уникальный индекс для предотвращения дубликатов дружбы
    await queryInterface.addIndex('Friendships', ['userId', 'friendId'], {
      unique: true,
      name: 'unique_friendship',
    });

    // Добавляем индекс для быстрого поиска друзей
    await queryInterface.addIndex('Friendships', ['userId', 'status']);
    await queryInterface.addIndex('Friendships', ['friendId', 'status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Friendships');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Friendships_status";');
  },
};

