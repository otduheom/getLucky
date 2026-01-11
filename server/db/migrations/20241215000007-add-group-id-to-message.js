'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Сначала делаем receiverId nullable
    // В PostgreSQL нужно использовать raw SQL для изменения NOT NULL на NULL с foreign key
    await queryInterface.sequelize.query(`
      ALTER TABLE "Messages" 
      ALTER COLUMN "receiverId" DROP NOT NULL;
    `);

    // Добавляем groupId column
    await queryInterface.addColumn('Messages', 'groupId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Groups',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Добавляем индекс для быстрого поиска групповых сообщений
    await queryInterface.addIndex('Messages', ['groupId']);
    await queryInterface.addIndex('Messages', ['groupId', 'createdAt']);
  },

  async down(queryInterface, Sequelize) {
    // Удаляем индексы
    await queryInterface.removeIndex('Messages', ['groupId', 'createdAt']);
    await queryInterface.removeIndex('Messages', ['groupId']);

    // Удаляем groupId column
    await queryInterface.removeColumn('Messages', 'groupId');

    // Возвращаем receiverId к not null (но только если это возможно - в production может быть проблематично)
    await queryInterface.changeColumn('Messages', 'receiverId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },
};
