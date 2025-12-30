import ChatItem from './ChatItem';
import { Chat } from '../../../entities/messages/MessagesApi';

interface ChatsListProps {
  chats: Chat[];
}

export default function ChatsList({ chats }: ChatsListProps) {
  if (chats.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        У вас пока нет чатов
      </div>
    );
  }

  return (
    <div>
      {chats.map((chat) => (
        <ChatItem key={chat.friend.id} chat={chat} />
      ))}
    </div>
  );
}

