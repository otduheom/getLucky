import { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import { Message } from '../../../entities/messages/MessagesApi';
import styles from './ChatPage.module.css';

interface MessagesListProps {
  messages: Message[];
  currentUserId: number;
}

export default function MessagesList({ messages, currentUserId }: MessagesListProps) {
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
        <MessageItem
          key={message.id}
          message={message}
          isOwnMessage={message.senderId === currentUserId}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

