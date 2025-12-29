'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Albums', {
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
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      privacy: {
        type: Sequelize.ENUM('public', 'friends', 'private'),
        allowNull: false,
        defaultValue: 'public',
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

    // Добавляем индекс для быстрого поиска альбомов пользователя
    await queryInterface.addIndex('Albums', ['userId']);
    await queryInterface.addIndex('Albums', ['userId', 'privacy']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Albums');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Albums_privacy";');
  },
};

