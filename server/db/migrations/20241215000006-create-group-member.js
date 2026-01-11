'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('GroupMembers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      groupId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Groups',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
      role: {
        type: Sequelize.ENUM('member', 'admin'),
        allowNull: false,
        defaultValue: 'member',
      },
      joinedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
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

    // Добавляем уникальный индекс для предотвращения дубликатов участников
    await queryInterface.addIndex('GroupMembers', ['groupId', 'userId'], {
      unique: true,
      name: 'unique_group_member',
    });

    // Добавляем индексы для быстрого поиска
    await queryInterface.addIndex('GroupMembers', ['groupId']);
    await queryInterface.addIndex('GroupMembers', ['userId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('GroupMembers');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_GroupMembers_role";');
  },
};
