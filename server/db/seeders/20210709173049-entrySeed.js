'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Проверяем, существует ли уже пользователь с таким email
    const existingUsers = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE email = 'admin@mail.ru' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Если пользователь не существует, создаем его
    if (!existingUsers || existingUsers.length === 0) {
      await queryInterface.bulkInsert(
        'Users',
        [
          {
            name: 'admin',
            email: 'admin@mail.ru',
            password: await bcrypt.hash('Qwerty1!', 10),
            isAdmin: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        {},
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Entries', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  },
};