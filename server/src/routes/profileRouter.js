const express = require('express');
const ProfileController = require('../controllers/ProfileController');
const { verifyAccessToken } = require('../middlewares/verifyTokens');
const { uploadAvatar } = require('../configs/multerConfig');

const profileRouter = express.Router();

profileRouter.get('/:userId', ProfileController.getProfile);
profileRouter.put('/', verifyAccessToken, ProfileController.updateProfile);
profileRouter.post('/avatar', verifyAccessToken, uploadAvatar.single('avatar'), ProfileController.uploadAvatar);

module.exports = profileRouter;