const FriendsService = require('../services/FriendsService');

class FriendsController {
  static async getFriends(req, res) {
    try {
      const userId = res.locals.user.id;
      const friends = await FriendsService.getFriends(userId);
      return res.status(200).json(friends);
    } catch (error) {
      console.error('Error in getFriends:', error);
      console.error('Error stack:', error.stack);
      return res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  }

  static async getPopularUsers(req, res) {
    try {
      const limit = parseInt(req.query.limit, 10) || 100;
      const users = await FriendsService.getPopularUsers(limit);
      
      // Перемешиваем и берем первые 10 для главной страницы
      const shuffled = users.sort(() => 0.5 - Math.random());
      const randomUsers = shuffled.slice(0, 10);
      
      return res.status(200).json(randomUsers);
    } catch (error) {
      console.error('Error in getPopularUsers:', error);
      console.error('Error stack:', error.stack);
      return res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  }

  static async sendFriendRequest(req, res) {
    try {
      const userId = res.locals.user.id;
      const { userId: friendId } = req.params;
      
      const result = await FriendsService.sendFriendRequest(userId, parseInt(friendId));
      
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      
      return res.status(201).json({ message: 'Заявка отправлена', friendship: result.friendship });
    } catch (error) {
      console.error('Error in sendFriendRequest:', error);
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  static async acceptFriendRequest(req, res) {
    try {
      const userId = res.locals.user.id;
      const { requestId } = req.params;
      
      const result = await FriendsService.acceptFriendRequest(parseInt(requestId, 10), userId);
      
      if (!result.success) {
        return res.status(404).json({ message: result.message });
      }
      
      return res.status(200).json({ message: 'Заявка принята', friendship: result.friendship });
    } catch (error) {
      console.error('Error in acceptFriendRequest:', error);
      return res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  }

  static async removeFriend(req, res) {
    try {
      const userId = res.locals.user.id;
      const { friendId } = req.params;
      
      const deleted = await FriendsService.removeFriend(userId, parseInt(friendId));
      
      if (!deleted) {
        return res.status(404).json({ message: 'Друг не найден' });
      }
      
      return res.status(200).json({ message: 'Друг удален' });
    } catch (error) {
      console.error('Error in removeFriend:', error);
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  static async searchFriends(req, res) {
    try {
      const userId = res.locals.user.id;
      const { query } = req.query;
      
      if (!query) {
        return res.status(400).json({ message: 'Параметр query обязателен' });
      }
      
      const friends = await FriendsService.searchFriends(userId, query);
      return res.status(200).json(friends);
    } catch (error) {
      console.error('Error in searchFriends:', error);
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  static async getOnlineFriends(req, res) {
    try {
      const userId = res.locals.user.id;
      const friends = await FriendsService.getOnlineFriends(userId);
      return res.status(200).json(friends);
    } catch (error) {
      console.error('Error in getOnlineFriends:', error);
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  static async getFriendRequests(req, res) {
    try {
      const userId = res.locals.user.id;
      const requests = await FriendsService.getFriendRequests(userId);
      return res.status(200).json(requests);
    } catch (error) {
      console.error('Error in getFriendRequests:', error);
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
  }

  static async getFriendshipStatus(req, res) {
    try {
      const userId = res.locals.user.id;
      const { friendId } = req.params;
      const status = await FriendsService.getFriendshipStatus(userId, parseInt(friendId, 10));
      return res.status(200).json(status);
    } catch (error) {
      console.error('Error in getFriendshipStatus:', error);
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
  }
}

module.exports = FriendsController;