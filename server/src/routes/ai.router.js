const AiController = require('../controllers/ai.controller');

const aiRouter = require('express').Router();

aiRouter.post('/interpretation', AiController.interpretTarotReading);

module.exports = aiRouter;
