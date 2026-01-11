# Доклад: WebSockets и Rooms в проекте GetLucky

**Время: 5-10 минут**

---

## 1. Что такое WebSockets? (1-2 минуты)

### Краткое объяснение:

**WebSockets** - это протокол двусторонней связи между клиентом и сервером. В отличие от обычного HTTP, где клиент всегда инициирует запрос, WebSocket позволяет серверу отправлять данные клиенту в реальном времени без необходимости постоянных запросов.

### Основные преимущества:

- ✅ **Реальное время** - мгновенная передача данных
- ✅ **Эффективность** - один открытый канал вместо множества HTTP-запросов
- ✅ **Двусторонняя связь** - сервер может отправлять данные клиенту

### Сравнение HTTP и WebSocket:

```mermaid
sequenceDiagram
    participant Client as Клиент
    participant Server as Сервер

    Note over Client,Server: HTTP (Request-Response)
    Client->>Server: GET /api/messages
    Server-->>Client: Response (данные)
    Note over Client,Server: Клиент должен постоянно запрашивать данные

    Note over Client,Server: WebSocket (Двусторонняя связь)
    Client->>Server: WebSocket Connection
    Server-->>Client: Connection Established
    Note over Client,Server: Один открытый канал
    Server->>Client: Push: новое сообщение
    Server->>Client: Push: обновление чата
    Client->>Server: Send: новое сообщение
    Server->>Client: Push: подтверждение
```

### В нашем проекте:

Мы используем **Socket.io** - библиотеку для работы с WebSockets, которая упрощает реализацию и добавляет полезные функции (переподключение, rooms и др.)

---

## 2. Что такое Rooms? (2-3 минуты)

### Концепция Rooms:

**Rooms** - это способ группировки клиентских подключений (sockets). Вместо того, чтобы отправлять сообщения каждому клиенту отдельно, вы можете отправить сообщение всем участникам комнаты одновременно.

### Зачем нужны Rooms?

**Без Rooms:**

```javascript
// Плохо: нужно отправлять каждому участнику отдельно
socket1.emit("message", data);
socket2.emit("message", data);
socket3.emit("message", data);
// ... и так для каждого пользователя
```

**С Rooms:**

```javascript
// Хорошо: отправляем один раз всей комнате
io.to("room-name").emit("message", data);
// Все участники комнаты получат сообщение автоматически
```

### Визуализация концепции Rooms:

```mermaid
graph TB
    subgraph WithoutRooms["❌ Без Rooms"]
        S1[Socket 1]
        S2[Socket 2]
        S3[Socket 3]
        S4[Socket 4]
        Server1[Сервер]
        Server1 -->|"emit отдельно"| S1
        Server1 -->|"emit отдельно"| S2
        Server1 -->|"emit отдельно"| S3
        Server1 -->|"emit отдельно"| S4
        Note1["4 отдельных отправки<br/>Неэффективно!"]
    end

    subgraph WithRooms["✅ С Rooms"]
        R1[Room: group-123]
        S5[Socket 5]
        S6[Socket 6]
        S7[Socket 7]
        S8[Socket 8]
        Server2[Сервер]
        S5 -->|join| R1
        S6 -->|join| R1
        S7 -->|join| R1
        S8 -->|join| R1
        Server2 -->|"io.to('group-123').emit()"| R1
        R1 -->|"автоматически всем"| S5
        R1 -->|"автоматически всем"| S6
        R1 -->|"автоматически всем"| S7
        R1 -->|"автоматически всем"| S8
        Note2["1 отправка в комнату<br/>Эффективно!"]
    end
```

### Типы Rooms в нашем проекте:

1. **Личные комнаты** (`user-${userId}`)

   - Каждый пользователь имеет свою комнату
   - Используется для отправки сообщений конкретному пользователю
   - Пример: `user-123` - комната пользователя с ID 123

2. **Групповые комнаты** (`group-${groupId}`)
   - Комнаты для групповых чатов
   - Все участники группы автоматически присоединяются
   - Пример: `group-456` - комната группы с ID 456

---

## 3. Реализация в проекте GetLucky (4-5 минут)

### 3.1 Настройка WebSocket на сервере

**Файл: `server/src/socket/socketHandler.js`**

#### При подключении пользователя:

```javascript
io.on("connection", async (socket) => {
  const { userId } = socket;

  // 1. Присоединяем пользователя в его личную комнату
  socket.join(`user-${userId}`);

  // 2. Получаем все группы пользователя
  const userGroups = await GroupsService.getUserGroups(userId);

  // 3. Присоединяем ко всем группам автоматически
  userGroups.forEach((groupChat) => {
    socket.join(`group-${groupChat.group.id}`);
  });
});
```

**Что происходит:**

```mermaid
sequenceDiagram
    participant Client as Клиент (userId: 123)
    participant Server as Сервер
    participant DB as База данных

    Client->>Server: WebSocket Connection (с JWT токеном)
    Server->>Server: Аутентификация (проверка токена)
    Server-->>Client: Connection Established

    Note over Server,DB: Автоматическое присоединение к комнатам
    Server->>Server: socket.join('user-123')
    Note over Server: Пользователь в личной комнате

    Server->>DB: GroupsService.getUserGroups(123)
    DB-->>Server: [группа-1, группа-2]

    Server->>Server: socket.join('group-1')
    Server->>Server: socket.join('group-2')

    Note over Client,Server: Теперь пользователь получает сообщения<br/>через комнаты: user-123, group-1, group-2
```

- При подключении пользователь автоматически попадает в свою личную комнату
- Затем он автоматически присоединяется ко всем группам, в которых состоит
- Теперь сервер может отправлять ему сообщения через эти комнаты

---

### 3.2 Отправка личных сообщений через Rooms

**Сценарий:** Пользователь А отправляет сообщение пользователю Б

#### Серверная часть:

```javascript
socket.on("send-message", async (data) => {
  const { receiverId, text } = data;
  const userId = socket.userId;

  // 1. Создаем сообщение в базе данных
  const message = await MessagesService.sendMessage(
    userId,
    receiverId,
    text.trim()
  );

  // 2. Отправляем сообщение получателю через его личную комнату
  io.to(`user-${receiverId}`).emit("new-message", message);

  // 3. Обновляем список чатов для обоих пользователей
  const senderChats = await MessagesService.getChats(userId);
  const receiverChats = await MessagesService.getChats(receiverId);

  io.to(`user-${userId}`).emit("chats-updated", senderChats);
  io.to(`user-${receiverId}`).emit("chats-updated", receiverChats);
});
```

**Ключевой момент:**

```javascript
io.to(`user-${receiverId}`).emit("new-message", message);
```

Эта строка отправляет сообщение всем подключениям пользователя с `receiverId`. Если пользователь открыт на нескольких устройствах - он получит сообщение везде!

### Поток отправки личного сообщения:

```mermaid
sequenceDiagram
    participant UserA as Пользователь А<br/>(отправитель)
    participant Server as Сервер
    participant DB as База данных
    participant RoomB as Room: user-B
    participant UserB1 as Пользователь Б<br/>(устройство 1)
    participant UserB2 as Пользователь Б<br/>(устройство 2)

    UserA->>Server: send-message {receiverId: B, text: "Привет"}
    Server->>DB: MessagesService.sendMessage(A, B, "Привет")
    DB-->>Server: Сообщение создано

    Server->>RoomB: io.to('user-B').emit('new-message')
    RoomB->>UserB1: new-message (получено)
    RoomB->>UserB2: new-message (получено)
    Note over UserB1,UserB2: Получатель на всех устройствах<br/>получает сообщение одновременно!

    Server->>DB: getChats(A)
    Server->>DB: getChats(B)
    DB-->>Server: Списки чатов

    Server->>UserA: chats-updated (обновлен список)
    Server->>RoomB: io.to('user-B').emit('chats-updated')
    RoomB->>UserB1: chats-updated
    RoomB->>UserB2: chats-updated
```

---

### 3.3 Отправка групповых сообщений через Rooms

**Сценарий:** Пользователь отправляет сообщение в групповой чат

### Структура комнат для групповых сообщений:

```mermaid
graph TB
    subgraph GroupRoom["Room: group-123"]
        U1[User 1<br/>Socket]
        U2[User 2<br/>Socket]
        U3[User 3<br/>Socket]
        U4[User 4<br/>Socket]
        U5[User 5<br/>Socket]
    end

    Server[Сервер]
    Server -->|"io.to('group-123').emit()"| GroupRoom
    GroupRoom -->|"автоматически всем"| U1
    GroupRoom -->|"автоматически всем"| U2
    GroupRoom -->|"автоматически всем"| U3
    GroupRoom -->|"автоматически всем"| U4
    GroupRoom -->|"автоматически всем"| U5

    Note1["1 отправка в комнату =<br/>5 пользователей получают сообщение<br/>Масштабируется до N пользователей!"]
```

#### Серверная часть:

```javascript
socket.on('send-group-message', async (data) => {
  const { groupId, text } = data;
  const userId = socket.userId;

  // 1. Проверяем, что пользователь состоит в группе
  const membership = await GroupMember.findOne({
    where: { groupId, userId }
  });

  if (!membership) {
    return socket.emit('error', {
      message: 'Вы не являетесь участником этой группы'
    });
  }

  // 2. Создаем сообщение в базе данных
  const message = await MessagesService.sendGroupMessage(
    userId,
    groupId,
    text.trim()
  );

  // 3. Отправляем ВСЕМ участникам группы через комнату
  io.to(`group-${groupId}`).emit('new-group-message', message);

  // 4. Обновляем список чатов для всех участников
  const members = await GroupMember.findAll({
    where: { groupId }
  });

  members.forEach((member) => {
    const chats = await MessagesService.getChats(member.userId);
    io.to(`user-${member.userId}`).emit('chats-updated', chats);
  });
});
```

**Ключевой момент:**

```javascript
io.to(`group-${groupId}`).emit("new-group-message", message);
```

Одна строка отправляет сообщение всем участникам группы, независимо от их количества! Если в группе 100 человек - все получат сообщение одновременно.

### Поток отправки группового сообщения:

```mermaid
sequenceDiagram
    participant User1 as Пользователь 1<br/>(отправитель)
    participant Server as Сервер
    participant DB as База данных
    participant GroupRoom as Room: group-123
    participant User2 as Пользователь 2
    participant User3 as Пользователь 3
    participant User4 as Пользователь 4

    User1->>Server: send-group-message {groupId: 123, text: "Привет всем!"}
    Server->>DB: Проверка членства (User1 в group-123)
    DB-->>Server: Членство подтверждено

    Server->>DB: MessagesService.sendGroupMessage(User1, 123, "Привет всем!")
    DB-->>Server: Сообщение создано

    Server->>GroupRoom: io.to('group-123').emit('new-group-message')
    Note over GroupRoom: Одна отправка в комнату

    GroupRoom->>User1: new-group-message (получено)
    GroupRoom->>User2: new-group-message (получено)
    GroupRoom->>User3: new-group-message (получено)
    GroupRoom->>User4: new-group-message (получено)

    Note over User1,User4: Все участники группы<br/>получают сообщение одновременно!

    Server->>DB: Получение списка участников группы
    DB-->>Server: [User1, User2, User3, User4]

    loop Для каждого участника
        Server->>DB: getChats(userId)
        Server->>Server: io.to('user-${userId}').emit('chats-updated')
    end
```

---

### 3.4 Динамическое присоединение к группам

**Сценарий:** Пользователь присоединяется к новой группе

```javascript
socket.on("join-group", async (data) => {
  const { groupId } = data;
  const userId = socket.userId;

  // 1. Проверяем членство
  const membership = await GroupMember.findOne({
    where: { groupId, userId },
  });

  if (!membership) {
    return socket.emit("error", {
      message: "Вы не являетесь участником этой группы",
    });
  }

  // 2. Присоединяем к комнате группы
  socket.join(`group-${groupId}`);

  socket.emit("joined-group", { groupId });
});
```

**Что происходит:**

- Пользователь присоединяется к комнате группы
- Теперь он будет получать все сообщения этой группы
- Если он выходит из группы, можно использовать `socket.leave()`

---

### 3.5 Клиентская часть

**Файл: `client/src/shared/lib/socketInstance.ts`**

#### Инициализация соединения:

```typescript
export function initSocket(token: string): Socket {
  socket = io(socketUrl, {
    auth: {
      token, // Аутентификация через JWT токен
    },
    transports: ["websocket", "polling"],
    reconnection: true,
  });

  return socket;
}
```

#### Использование в компонентах:

**Файл: `client/src/components/pages/ChatPage.tsx`**

```typescript
useEffect(() => {
  const socket = initSocket(token);

  // Слушаем новые сообщения
  socket.on("new-message", (newMessage: Message) => {
    if (
      newMessage.senderId === friendIdNum ||
      newMessage.receiverId === friendIdNum
    ) {
      setMessages((prev) => [...prev, newMessage]);
    }
  });

  // Слушаем обновления списка чатов
  socket.on("chats-updated", (chats: Chat[]) => {
    // Обновляем UI
  });

  return () => {
    socket.off("new-message");
    socket.off("chats-updated");
  };
}, [friendId]);
```

---

## 4. Преимущества использования Rooms

### Сравнение эффективности:

```mermaid
graph LR
    subgraph WithoutRooms["❌ Без Rooms (N отправок)"]
        Server1[Сервер]
        U1[User 1]
        U2[User 2]
        U3[User 3]
        U4[User N]
        Server1 -->|"emit #1"| U1
        Server1 -->|"emit #2"| U2
        Server1 -->|"emit #3"| U3
        Server1 -->|"emit #N"| U4
        Note1["N операций отправки<br/>N обращений к сокетам<br/>Высокая нагрузка"]
    end

    subgraph WithRooms["✅ С Rooms (1 отправка)"]
        Server2[Сервер]
        Room[Room: group-123]
        U5[User 1]
        U6[User 2]
        U7[User 3]
        U8[User N]
        Server2 -->|"io.to('group-123').emit()<br/>1 операция"| Room
        Room -->|"автоматически"| U5
        Room -->|"автоматически"| U6
        Room -->|"автоматически"| U7
        Room -->|"автоматически"| U8
        Note2["1 операция отправки<br/>1 обращение к комнате<br/>Низкая нагрузка<br/>Масштабируется до N пользователей"]
    end
```

### ✅ Эффективность

- Одно сообщение вместо множества отправок
- Меньше нагрузки на сервер

### ✅ Масштабируемость

- Легко добавлять новых участников
- Работает с любым количеством пользователей

### ✅ Простота кода

```javascript
// Вместо цикла по всем пользователям:
io.to("group-123").emit("message", data);

// Это проще и эффективнее, чем:
members.forEach((member) => {
  io.to(`user-${member.id}`).emit("message", data);
});
```

### ✅ Гибкость

- Пользователь может быть в нескольких комнатах одновременно
- Легко добавлять/удалять пользователей из комнат

---

## 5. Итоги и выводы

### Что мы реализовали:

1. ✅ **Личные комнаты** для отправки сообщений конкретным пользователям
2. ✅ **Групповые комнаты** для групповых чатов
3. ✅ **Автоматическое присоединение** к комнатам при подключении
4. ✅ **Динамическое управление** (присоединение/выход из групп)
5. ✅ **Реальное время** - сообщения приходят мгновенно

### Результат:

- Мгновенная доставка сообщений
- Эффективное использование ресурсов
- Простой и понятный код
- Готовность к масштабированию

---

## Дополнительные примеры кода

### Отправка сообщения конкретному пользователю:

```javascript
io.to(`user-${userId}`).emit("new-message", message);
```

### Отправка всем участникам группы:

```javascript
io.to(`group-${groupId}`).emit("new-group-message", message);
```

### Отправка всем, кроме отправителя:

```javascript
socket.broadcast.to(`group-${groupId}`).emit("message", data);
```

### Проверка, находится ли пользователь в комнате:

```javascript
const sockets = await io.in(`group-${groupId}`).fetchSockets();
// Получаем список всех подключений в комнате
```

---

**Спасибо за внимание! Вопросы?**
