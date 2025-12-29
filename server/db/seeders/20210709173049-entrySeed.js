'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Users',
      [
        {
          name: 'admin',
          email: 'admin@mail.ru',
          password: await bcrypt.hash('Qwerty1!', 10),
          isAdmin: true,
        },
      ],
      {},
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Entries', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  },
};