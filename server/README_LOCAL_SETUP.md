# Настройка для локального запуска

## Шаги для запуска проекта локально

### 1. Создайте файл `.env` в папке `server/`

Скопируйте пример ниже и заполните своими значениями:

```env
# Режим работы (development для локальной разработки)
NODE_ENV=development

# Порт сервера (по умолчанию 3001)
PORT=3001

# URL клиента для Socket.io (опционально, по умолчанию http://localhost:5173)
CLIENT_URL=http://localhost:5173

# Настройки базы данных для локальной разработки
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_db_name
DB_HOST=localhost

# Или используйте DB_URL для подключения (альтернатива вышеперечисленным)
# DB_URL=postgresql://user:password@localhost:5432/dbname

# JWT секреты (для генерации токенов)
# ВАЖНО: Используйте именно эти названия переменных!
ACCESS_TOKEN_SECRET=your_access_secret_key
REFRESH_TOKEN_SECRET=your_refresh_secret_key

# GigaChat API (если используется)
GIGACHAT_KEY=your_gigachat_key
GIGACHAT_SCOPE=GIGACHAT_API_PERS
```

### 2. Убедитесь, что PostgreSQL запущен локально

Проверьте, что ваша локальная база данных доступна с указанными в `.env` учетными данными.

### 3. Запустите сервер

```bash
cd server
npm run dev
```

Сервер запустится на `http://localhost:3001`

### 4. Запустите клиент (в отдельном терминале)

```bash
cd client
npm run dev
```

Клиент запустится на `http://localhost:5173`

## Важные замечания

- **NODE_ENV**: Убедитесь, что установлен в `development` или не установлен вообще
- **CORS**: Настроен на `http://localhost:5173` и `http://localhost:5174`
- **Socket.io**: Автоматически использует `http://localhost:5173` в режиме разработки
- **База данных**: Используются переменные `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_HOST` (не
  `*_PROD`)

## Проверка настроек

После запуска проверьте в консоли:

- Сервер должен вывести: `Server is running on port 3001`
- Socket.io должен вывести: `Socket.io is ready`
- Клиент должен открыться на `http://localhost:5173`
