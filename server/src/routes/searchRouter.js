const express = require('express');
const SearchController = require('../controllers/SearchController');

const searchRouter = express.Router();

searchRouter.get('/users', SearchController.searchUsers);

module.exports = searchRouter;