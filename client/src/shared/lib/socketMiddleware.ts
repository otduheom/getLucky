import { Middleware } from '@reduxjs/toolkit';
import { initSocket, getSocket, disconnectSocket } from './socketInstance';
import { getAccessToken } from './axiosInstance';
import { baseApi } from '../../app/store';
import { addOnlineFriend, removeOnlineFriend } from '../../features/friends/friendsSlice';
import { addMessageToCache, updateMessageInCache, markMessagesAsReadInCache } from '../../features/messages/messagesSlice';

let socketInitialized = false;

const socketMiddleware: Middleware = (store) => {
  return (next) => (action) => {
    // Инициализация сокета при логине
    if (action.type === 'auth/setUser' && action.payload.status === 'logged') {
      const token = getAccessToken();
      if (token && !socketInitialized) {
        const socket = initSocket(token);
        socketInitialized = true;

        // Обработка новых сообщений
        socket.on('new-message', (message: any) => {
          // Получаем текущего пользователя из store
          const state = store.getState();
          const currentUserId = (state as any).auth?.user?.id;
          
          // Определяем ID друга (не текущего пользователя)
          // Если текущий пользователь - получатель, то друг - отправитель, и наоборот
          const friendId = currentUserId === message.receiverId 
            ? message.senderId 
            : message.receiverId;
          
          if (friendId) {
            // Обновляем кэш RTK Query с правильным ID друга
            store.dispatch(
              baseApi.util.updateQueryData('getMessages', friendId, (draft) => {
                if (!draft.some((msg) => msg.id === message.id)) {
                  draft.push(message);
                }
              })
            );
            // Добавляем в локальный кэш
            const key = `chat-${friendId}`;
            store.dispatch(addMessageToCache({ key, message }));
          }
        });

        // Обработка отправленных сообщений
        socket.on('message-sent', (message: any) => {
          // Получаем текущего пользователя из store
          const state = store.getState();
          const currentUserId = (state as any).auth?.user?.id;
          
          // Для отправленных сообщений используем receiverId (ID друга, которому отправляем)
          const friendId = message.receiverId;
          
          if (friendId) {
            store.dispatch(
              baseApi.util.updateQueryData('getMessages', friendId, (draft) => {
                const index = draft.findIndex((msg) => msg.id === message.id);
                if (index >= 0) {
                  draft[index] = message;
                } else {
                  draft.push(message);
                }
              })
            );
          }
        });

        // Обработка групповых сообщений
        socket.on('new-group-message', (message: any) => {
          if (message.groupId) {
            store.dispatch(
              baseApi.util.updateQueryData('getGroupMessages', message.groupId, (draft) => {
                if (!draft.some((msg) => msg.id === message.id)) {
                  draft.push(message);
                }
              })
            );
            const key = `group-${message.groupId}`;
            store.dispatch(addMessageToCache({ key, message }));
          }
        });

        // Обработка прочитанных сообщений
        socket.on('messages-read', (data: { userId?: number; friendId?: number }) => {
          if (data.friendId && data.userId) {
            // Получаем текущего пользователя из store
            const state = store.getState();
            const currentUserId = (state as any).auth?.user?.id;
            
            // data.userId - пользователь, который прочитал сообщения
            // data.friendId - отправитель сообщений (кому нужно обновить метки)
            // Если текущий пользователь - это data.friendId, значит нужно обновить метки
            if (currentUserId === data.friendId) {
              // ID друга, с которым ведется чат (тот, кто прочитал)
              const friendId = data.userId;
              const senderId = currentUserId; // Текущий пользователь - отправитель сообщений
              const receiverId = data.userId; // Пользователь, который прочитал
              
              // Обновляем кэш RTK Query напрямую
              // updateQueryData работает даже если кэш еще не загружен (создаст пустой массив)
              store.dispatch(
                baseApi.util.updateQueryData('getMessages', friendId, (draft) => {
                  // Если кэш пустой, возвращаем как есть
                  if (!draft || draft.length === 0) {
                    return draft;
                  }
                  // Обновляем статус прочитанности для сообщений от текущего пользователя к другу
                  return draft.map((msg) => {
                    if (msg.senderId === senderId && msg.receiverId === receiverId && !msg.isRead) {
                      return { ...msg, isRead: true };
                    }
                    return msg;
                  });
                })
              );
              
              // Обновляем локальный кэш
              const key = `chat-${friendId}`;
              store.dispatch(
                markMessagesAsReadInCache({
                  key,
                  senderId,
                  receiverId,
                })
              );
            }
          }
        });

        // Обработка обновления списка чатов
        socket.on('chats-updated', () => {
          store.dispatch(baseApi.util.invalidateTags(['Chat']));
        });

        // Обработка онлайн статусов
        socket.on('user-online', (data: { userId: number }) => {
          store.dispatch(addOnlineFriend(data.userId));
        });

        socket.on('user-offline', (data: { userId: number }) => {
          store.dispatch(removeOnlineFriend(data.userId));
        });

        // Обработка отключения
        socket.on('disconnect', () => {
          socketInitialized = false;
        });
      }
    }

    // Отключение сокета при логауте
    if (action.type === 'auth/setUser' && action.payload.status === 'guest') {
      if (socketInitialized) {
        disconnectSocket();
        socketInitialized = false;
      }
    }

    return next(action);
  };
};

export default socketMiddleware;
