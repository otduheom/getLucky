const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Создаем директории для загрузок, если их нет
const uploadsDir = path.join(__dirname, '../../public/uploads');
const avatarsDir = path.join(uploadsDir, 'avatars');
const photosDir = path.join(uploadsDir, 'photos');

[uploadsDir, avatarsDir, photosDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Настройка для аватаров
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user?.id || 'unknown';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Настройка для фото
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, photosDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user?.id || 'unknown';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `photo-${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Фильтр для изображений
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Разрешена загрузка только изображений'), false);
  }
};

// Multer конфигурации
const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const uploadPhoto = multer({
  storage: photoStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

module.exports = { uploadAvatar, uploadPhoto };