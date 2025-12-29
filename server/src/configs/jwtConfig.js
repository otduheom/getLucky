const jwtConfig = {
    // токен доступа
    access: { 
      expiresIn: 1000 * 5,
    },
    // токен обновления
    refresh: {
      expiresIn: 1000 * 60 * 60 * 5,
    },
  };

  module.exports = jwtConfig;