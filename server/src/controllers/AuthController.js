const { User } = require('../../db/models');
const bcrypt = require('bcrypt');
const AuthService = require('../services/AuthService');
const generateTokens = require('../utils/generateTokens');
const cookieConfig = require('../configs/cookieConfig');

class AuthController {
  static async signUp(req, res) {
    const { email, password, name } = req.body;
    const { isValid, err } = User.validateSignUpData({ email, password, name });
    if (!isValid) return res.status(400).json({ message: err });
    const hashedPassword = await bcrypt.hash(password, 10); // 10 - количество раундов шифрования

    try {
      const { user, created } = await AuthService.register({
        name,
        email,
        password: hashedPassword,
      });

      if (!created) return res.status(400).json({ message: 'User already exists' });

      // удаляем метаданные
      const plainUser = user.get();
      // удаляем пароль
      delete plainUser.password;

      // создаем токены на основе простого юзера
      const { accessToken, refreshToken } = generateTokens({ user: plainUser });
      return res
        .cookie('refreshToken', refreshToken, cookieConfig.refresh)
        .json({ accessToken, user: plainUser });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Server Error' });
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;
    const { isValid, err } = User.validateLoginData({ email, password });
    if (!isValid) return res.status(400).json({ message: err });

    try {
      const user = await AuthService.getUserByEmail({ email });
      if (!user) return res.status(400).json({ message: 'User not found' });
      // проверяем пароль: строка, которая пришла от клиента сравниваем со строкой, которая пришла из БД
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid)
        return res.status(400).json({ message: 'Invalid email or password' });

      const plainUser = user.get();
      delete plainUser.password;

      const { accessToken, refreshToken } = generateTokens({ user: plainUser });
      return res
        .cookie('refreshToken', refreshToken, cookieConfig.refresh)
        .json({ accessToken, user: plainUser });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Server Error' });
    }
  }

  static async logout(req, res) {
    return res
      .clearCookie('refreshToken', cookieConfig.refresh)
      .json({ message: 'Logout success' });
  }

  static async refreshTokens(req, res) {
    try {
      const { user } = res.locals;

      const { accessToken, refreshToken } = generateTokens({ user });

      res.status(200).cookie('refreshToken', refreshToken, cookieConfig.refresh).json({
        user,
        accessToken,
      });
    } catch ({ message }) {
      console.error(message);
      res.status(500).json({ message: 'Server error' });
    }
  }
}
module.exports = AuthController;