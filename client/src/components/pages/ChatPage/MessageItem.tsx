import { Message } from '../../../entities/messages/MessagesApi';
import styles from './MessageItem.module.css';

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
}

export default function MessageItem({ message, isOwnMessage }: MessageItemProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`${styles.messageWrapper} ${isOwnMessage ? styles.own : ''}`}>
      <div className={`${styles.message} ${isOwnMessage ? styles.own : styles.other}`}>
        <div className={styles.text}>{message.text}</div>
        <div className={styles.meta}>
          <span className={styles.time}>{formatTime(message.createdAt)}</span>
          {isOwnMessage && (
            <span className={`${styles.checkmarks} ${message.isRead ? '' : styles.unread}`}>
              {message.isRead ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

