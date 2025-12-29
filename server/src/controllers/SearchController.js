const SearchService = require('../services/SearchService');

class SearchController {
  static async searchUsers(req, res) {
    try {
      const { query } = req.query;
      
      if (!query) {
        return res.status(400).json({ message: 'Параметр query обязателен' });
      }
      
      const users = await SearchService.searchUsers(query);
      return res.status(200).json(users);
    } catch (error) {
      console.error('Error in searchUsers:', error);
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
  }
}

module.exports = SearchController;