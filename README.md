# GetLucky - Социальная сеть

## Описание проекта

GetLucky - это полнофункциональная социальная сеть с возможностью поиска пользователей, добавления в друзья, создания фотоальбомов и управления приватностью контента.

## Требуемый функционал

### Основные возможности:

- ✅ Поиск пользователей по ФИО или никам
- ✅ Добавление других пользователей в друзья
- ✅ Отображение друзей онлайн (зеленый индикатор)
- ✅ Создание фотоальбомов
- ✅ Загрузка фотографий с комментариями
- ✅ Настройка приватности альбомов (всем, только друзьям, только себе)

### Страницы приложения:

1. **Главная страница (`/`)**

   - 10 случайных пользователей из топ-100 популярных (больше всего друзей)
   - Карточки с фото, ФИО/ник и кнопкой "Добавить в друзья"
   - Клик по карточке → переход на личную страницу пользователя
   - Форма поиска пользователя по ФИО/нику

2. **Моя страница (`/profile` или `/profile/:userId`)**

   - Добавление/обновление фотографии профиля
   - Редактирование анкеты (имя, возраст, город и др.)
   - Список всех друзей (онлайн помечены зеленым кружочком)
   - Список всех фотоальбомов (превью с случайным фото или "пока нет фото")

3. **Страница друзей (`/friends`)**

   - Список всех друзей (аватарка, ФИО/ник)
   - Клик по аватарке/ФИО → переход на страницу друга
   - Форма поиска по друзьям

4. **Страница фотографий (`/photos` или `/photos/:userId`)**
   - Отображение всех альбомов пользователя
   - Форма создания нового альбома (название + приватность)
   - Просмотр альбома (все фото + форма загрузки новой)
   - Добавление комментария к фото при загрузке

---

## План реализации

### Этап 1: Расширение модели User и базы данных

#### 1.1 Миграция для расширения таблицы Users

- Добавить поля в модель User:
  - `avatar` (STRING) - путь к аватару
  - `nickname` (STRING, unique) - никнейм
  - `firstName` (STRING) - имя
  - `lastName` (STRING) - фамилия
  - `age` (INTEGER) - возраст
  - `city` (STRING) - город
  - `about` (TEXT) - информация о себе
  - `lastSeen` (DATE) - время последней активности (для определения онлайн статуса)
- Обновить модель `server/db/models/user.js`

#### 1.2 Создание новых моделей

- **Friendship** (многие-ко-многим для друзей)
  - `userId` (INTEGER, FK → Users.id)
  - `friendId` (INTEGER, FK → Users.id)
  - `status` (ENUM: 'pending', 'accepted', 'blocked')
  - `createdAt`, `updatedAt`
- **Album**
  - `id` (INTEGER, PK)
  - `userId` (INTEGER, FK → Users.id)
  - `name` (STRING) - название альбома
  - `privacy` (ENUM: 'public', 'friends', 'private')
  - `createdAt`, `updatedAt`
- **Photo**
  - `id` (INTEGER, PK)
  - `albumId` (INTEGER, FK → Albums.id)
  - `userId` (INTEGER, FK → Users.id)
  - `filePath` (STRING) - путь к файлу
  - `comment` (TEXT) - комментарий к фото
  - `createdAt`, `updatedAt`

#### 1.3 Настройка связей (associations)

- User.hasMany(Album)
- User.hasMany(Photo)
- User.belongsToMany(User, { through: Friendship, as: 'Friends', foreignKey: 'userId', otherKey: 'friendId' })
- Album.belongsTo(User)
- Album.hasMany(Photo)
- Photo.belongsTo(Album)
- Photo.belongsTo(User)

---

### Этап 2: Backend API - Профили и друзья

#### 2.1 Роутер для профилей (`server/src/routes/profileRouter.js`)

- `GET /api/profile/:userId` - получение профиля пользователя
- `PUT /api/profile` - обновление своего профиля (verifyAccessToken)
- `POST /api/profile/avatar` - загрузка аватара (verifyAccessToken)

#### 2.2 Контроллер профилей (`server/src/controllers/ProfileController.js`)

- Методы для получения и обновления профиля
- Валидация данных профиля
- Работа с файлами (multer для загрузки изображений)

#### 2.3 Роутер для друзей (`server/src/routes/friendsRouter.js`)

- `GET /api/friends` - список друзей текущего пользователя
- `GET /api/friends/popular` - топ-100 популярных пользователей (по количеству друзей)
- `POST /api/friends/request/:userId` - отправка заявки в друзья
- `PUT /api/friends/accept/:requestId` - принятие заявки
- `DELETE /api/friends/:friendId` - удаление из друзей
- `GET /api/friends/search?query=...` - поиск по друзьям
- `GET /api/friends/online` - друзья онлайн

#### 2.4 Контроллер друзей (`server/src/controllers/FriendsController.js`)

- Логика управления дружбой
- Подсчет популярности пользователей
- Определение онлайн статуса (проверка lastSeen)

#### 2.5 Роутер для поиска (`server/src/routes/searchRouter.js`)

- `GET /api/search/users?query=...` - поиск пользователей по ФИО/нику

---

### Этап 3: Backend API - Фотоальбомы

#### 3.1 Роутер для альбомов (`server/src/routes/albumsRouter.js`)

- `GET /api/albums/user/:userId` - все альбомы пользователя (с учетом приватности)
- `GET /api/albums/:albumId` - конкретный альбом
- `POST /api/albums` - создание альбома (verifyAccessToken)
- `PUT /api/albums/:albumId` - обновление альбома (verifyAccessToken)
- `DELETE /api/albums/:albumId` - удаление альбома (verifyAccessToken)
- `GET /api/albums/:albumId/preview` - случайное фото для превью

#### 3.2 Роутер для фотографий (`server/src/routes/photosRouter.js`)

- `GET /api/photos/album/:albumId` - все фото альбома
- `POST /api/photos/album/:albumId` - загрузка фото в альбом (verifyAccessToken, multer)
- `DELETE /api/photos/:photoId` - удаление фото (verifyAccessToken)
- `GET /api/photos/:photoId` - получение конкретного фото

#### 3.3 Контроллеры для альбомов и фото

- `server/src/controllers/AlbumsController.js`
- `server/src/controllers/PhotosController.js`
- Логика проверки приватности
- Обработка файлов (multer, сохранение в `server/public/uploads/`)

---

### Этап 4: Backend - Middleware и утилиты

#### 4.1 Middleware для проверки приватности

- `server/src/middlewares/checkAlbumPrivacy.js` - проверка прав доступа к альбому

#### 4.2 Обновление lastSeen

- Middleware `server/src/middlewares/updateLastSeen.js` - обновление времени последней активности при каждом запросе (для авторизованных)

#### 4.3 Настройка multer

- Конфигурация для загрузки изображений (`server/src/configs/multerConfig.js`)
- Ограничение размера файла, типы файлов

---

### Этап 5: Frontend - Компоненты и страницы

#### 5.1 Главная страница (`client/src/components/pages/HomePage.tsx`)

- Компонент `PopularUsersList` - список популярных пользователей
- Компонент `UserCard` - карточка пользователя (фото, ФИО/ник, кнопка "Добавить в друзья")
- Компонент `UserSearchForm` - форма поиска пользователей
- Использование API: `GET /api/friends/popular`, `GET /api/search/users`

#### 5.2 Страница профиля (`client/src/components/pages/ProfilePage.tsx`)

- Компонент `ProfileHeader` - аватар, кнопка редактирования
- Компонент `ProfileEditForm` - форма редактирования анкеты
- Компонент `FriendsList` - список друзей с индикатором онлайн
- Компонент `AlbumsList` - список альбомов с превью
- Использование API: `GET /api/profile/:userId`, `PUT /api/profile`, `POST /api/profile/avatar`

#### 5.3 Страница друзей (`client/src/components/pages/FriendsPage.tsx`)

- Компонент `FriendsList` - список всех друзей
- Компонент `FriendSearchForm` - поиск по друзьям
- Компонент `FriendItem` - элемент списка (аватарка, ФИО/ник, ссылка на профиль)
- Использование API: `GET /api/friends`, `GET /api/friends/search`

#### 5.4 Страница фотографий (`client/src/components/pages/PhotosPage.tsx`)

- Компонент `AlbumsGrid` - сетка альбомов
- Компонент `AlbumCard` - карточка альбома (превью, название, приватность)
- Компонент `CreateAlbumForm` - форма создания альбома
- Компонент `AlbumView` - просмотр альбома (все фото)
- Компонент `PhotoUploadForm` - форма загрузки фото с комментарием
- Использование API: все endpoints альбомов и фото

#### 5.5 Страница просмотра альбома (`client/src/components/pages/AlbumPage.tsx`)

- Отображение всех фото альбома
- Форма загрузки новой фотографии
- Возможность удаления своих фото

#### 5.6 Компоненты UI

- `OnlineIndicator` - зеленый кружочек для онлайн статуса
- `UserAvatar` - компонент аватара с fallback
- `PrivacyBadge` - бейдж приватности альбома
- `AddFriendButton` - кнопка добавления в друзья

---

### Этап 6: Frontend - API клиенты

#### 6.1 API модули (`client/src/entities/`)

- `profile/ProfileApi.ts` - API для профилей
- `friends/FriendsApi.ts` - API для друзей
- `albums/AlbumsApi.ts` - API для альбомов
- `photos/PhotosApi.ts` - API для фото
- `search/SearchApi.ts` - API для поиска

#### 6.2 Обновление роутинга (`client/src/App.tsx`)

- Добавить маршруты:
  - `/friends` → FriendsPage
  - `/profile/:userId?` → ProfilePage
  - `/photos/:userId?` → PhotosPage
  - `/albums/:albumId` → AlbumPage

---

### Этап 7: Улучшения и оптимизация

#### 7.1 Реализация онлайн статуса

- WebSocket или периодический polling для обновления lastSeen
- Сервис для определения онлайн (например, lastSeen < 5 минут = онлайн)

#### 7.2 Пагинация

- Добавить пагинацию для списков (популярные пользователи, друзья, фото)
- Backend: query параметры `limit`, `offset`
- Frontend: бесконечная прокрутка или кнопка "Загрузить еще"

#### 7.3 Оптимизация изображений

- Ресайз изображений при загрузке (sharp или jimp)
- Генерация превью для альбомов

#### 7.4 Уведомления о заявках в друзья

- Система уведомлений для новых заявок
- Счетчик непрочитанных заявок

---

## Структура API Endpoints

### Авторизация (уже реализовано)

- `POST /api/auth/signup` - регистрация
- `POST /api/auth/login` - вход
- `POST /api/auth/refreshTokens` - обновление токенов

### Профили

- `GET /api/profile/:userId` - получить профиль
- `PUT /api/profile` - обновить свой профиль (требует токен)
- `POST /api/profile/avatar` - загрузить аватар (требует токен)

### Друзья

- `GET /api/friends` - список друзей (требует токен)
- `GET /api/friends/popular` - топ-100 популярных
- `POST /api/friends/request/:userId` - отправить заявку (требует токен)
- `PUT /api/friends/accept/:requestId` - принять заявку (требует токен)
- `DELETE /api/friends/:friendId` - удалить друга (требует токен)
- `GET /api/friends/search?query=...` - поиск по друзьям (требует токен)
- `GET /api/friends/online` - друзья онлайн (требует токен)

### Поиск

- `GET /api/search/users?query=...` - поиск пользователей

### Альбомы

- `GET /api/albums/user/:userId` - альбомы пользователя
- `GET /api/albums/:albumId` - получить альбом
- `POST /api/albums` - создать альбом (требует токен)
- `PUT /api/albums/:albumId` - обновить альбом (требует токен)
- `DELETE /api/albums/:albumId` - удалить альбом (требует токен)
- `GET /api/albums/:albumId/preview` - превью альбома (случайное фото)

### Фотографии

- `GET /api/photos/album/:albumId` - фото альбома
- `POST /api/photos/album/:albumId` - загрузить фото (требует токен)
- `GET /api/photos/:photoId` - получить фото
- `DELETE /api/photos/:photoId` - удалить фото (требует токен)

---

## Порядок реализации (рекомендуемый)

1. **Этап 1**: Расширение модели User + создание моделей Friendship, Album, Photo
2. **Этап 2**: Backend API для профилей и друзей
3. **Этап 3**: Backend API для альбомов и фото
4. **Этап 4**: Frontend - главная страница и поиск
5. **Этап 5**: Frontend - страница профиля
6. **Этап 6**: Frontend - страница друзей
7. **Этап 7**: Frontend - страница фотографий и альбомов
8. **Этап 8**: Улучшения (онлайн статус, пагинация, оптимизация)

---

## Технический стек

### Backend

- Node.js + Express
- Sequelize ORM
- PostgreSQL (предположительно)
- JWT для аутентификации
- Multer для загрузки файлов

### Frontend

- React + TypeScript
- React Router
- Axios для HTTP запросов
- CSS Modules (судя по структуре)

---

## Дополнительные заметки

- Приватность альбомов:

  - `public` - видят все пользователи
  - `friends` - только друзья владельца
  - `private` - только владелец

- Определение популярности:

  - Сортировка по количеству принятых дружеских связей (status = 'accepted')

- Онлайн статус:

  - Проверка поля `lastSeen` пользователя
  - Если `lastSeen` < 5 минут от текущего времени → онлайн

- Загрузка файлов:
  - Сохранение в `server/public/uploads/avatars/` и `server/public/uploads/photos/`
  - Имена файлов: `userId_timestamp.extension` или UUID
