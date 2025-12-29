const aiService = require('../services/ai.service');

class AiController {
  static async interpretTarotReading(req, res) {
    const { question, cards } = req.body;

    const interpretation = await aiService.interpretTarotReading(question, cards);

    res.json({ interpretation });
  }
}

module.exports = AiController;
