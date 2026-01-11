import { useEffect, useRef } from 'react';
import GroupMessageItem from './GroupMessageItem';
import { Message } from '../../../entities/messages/MessagesApi';
import styles from '../ChatPage/ChatPage.module.css';

interface GroupMessagesListProps {
  messages: Message[];
  currentUserId?: number;
}

export default function GroupMessagesList({ messages, currentUserId }: GroupMessagesListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className={styles.messagesContainer}>
        <div className={styles.emptyState}>Пока нет сообщений. Начните общение!</div>
      </div>
    );
  }

  return (
    <div className={styles.messagesContainer}>
      {messages.map((message) => (
        <GroupMessageItem
          key={message.id}
          message={message}
          isOwnMessage={message.senderId === currentUserId}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}