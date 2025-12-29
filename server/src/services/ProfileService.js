const { User } = require('../../db/models');

class ProfileService {
    static async getProfileById(userId) {
        const user = await User.findByPk(userId, {
            attributes: {
                exclude: ['password']
            }
        });
        return user;
    }

    static async updateProfile(userId, profileData) {
        const allowedFields = ['nickname', 'firstName', 'lastName', 'age', 'city', 'about'];
        const updateData= {};

        allowedFields.forEach(field => {
            if(profileData[field] !== undefined) {
                updateData[field] = profileData[field];
            }
        });

        const [updatedRows] = await User.update(updateData, {
            where: { id: userId },
            returning: true
        });

        if(updatedRows === 0) {
        return null;
        }

        const updatedUser = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });

        return updatedUser;
    }

    static async updateAvatar(userId, avatarPath) {
        const [updatedRows] = await User.update({ avatar: avatarPath }, { where: { id: userId }, returning: true });

        if(updatedRows === 0) {
            return null;
        }

        const updatedUser = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });

        return updatedUser;
    }
}

module.exports = ProfileService;