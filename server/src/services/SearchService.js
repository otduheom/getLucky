const { User } = require('../../db/models');
const { Op } = require('sequelize');

class SearchService {
  static async searchUsers(query) {
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { nickname: { [Op.iLike]: `%${query}%` } },
          { firstName: { [Op.iLike]: `%${query}%` } },
          { lastName: { [Op.iLike]: `%${query}%` } }
        ]
      },
      attributes: { exclude: ['password'] },
      limit: 50
    });

    return users.map(user => user.get());
  }
}

module.exports = SearchService;