const ProfileService = require('../services/ProfileService');
const path = require('path');

class ProfileController {
    static async getProfile(req, res) {
        try {
            const { userId } = req.params;
            const user = await ProfileService.getProfileById(userId);

            if(!user) {
                return res.status(404).json({message: 'Пользователь не найден'});
            }

            // Преобразуем путь к аватару в URL
            const userData = user.get();
            if(userData.avatar) {
                userData.avatar = `/uploads/avatars/${path.basename(userData.avatar)}`;
            }

            return res.status(200).json(userData);
        } catch (error) {
            console.error('Error getting profile:', error);
            return res.status(500).json({message: 'Ошибка сервера'});
        }
}

static async updateProfile(req, res) {
    try {
        const userId = res.locals.user.id;
        const updatedUser = await ProfileService.updateProfile(userId, req.body);

        if(!updatedUser) {
            return res.status(404).json({message: 'Пользователь не найден'});
        }

        const userData = updatedUser.get();
        if(userData.avatar) {
            userData.avatar = `/uploads/avatars/${path.basename(userData.avatar)}`;
        }

        return res.status(200).json(userData);
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
}

static async uploadAvatar(req, res) {
    try {
        if(!req.file) {
            return res.status(400).json({message: 'Файл не загружен'});
        }

        const userId = res.locals.user.id;
        const avatarPath = req.file.path;
        const updatedUser = await ProfileService.updateAvatar(userId, avatarPath);

        if(!updatedUser) {
            return res.status(404).json({message: 'Пользователь не найден'});
        }

        const userData = updatedUser.get();
        userData.avatar = `/uploads/avatars/${path.basename(userData.avatar)}`;

        return res.status(200).json(userData);
    } catch (error) {
        console.error('Error uploading avatar:', error);
        return res.status(500).json({message: 'Ошибка сервера'});
    }
}
}
module.exports = ProfileController;