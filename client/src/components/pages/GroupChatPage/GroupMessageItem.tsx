import { Message } from '../../../entities/messages/MessagesApi';
import styles from '../ChatPage/MessageItem.module.css';

interface GroupMessageItemProps {
  message: Message;
  isOwnMessage: boolean;
}

export default function GroupMessageItem({ message, isOwnMessage }: GroupMessageItemProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const senderName = message.sender?.name || 'Неизвестный';

  return (
    <div className={`${styles.messageWrapper} ${isOwnMessage ? styles.own : ''}`}>
      {!isOwnMessage && (
        <div style={{ fontSize: '12px', color: '#707579', marginBottom: '4px', paddingLeft: '8px' }}>
          {senderName}
        </div>
      )}
      <div className={`${styles.message} ${isOwnMessage ? styles.own : styles.other}`}>
        <div className={styles.text}>{message.text}</div>
        <div className={styles.meta}>
          <span className={styles.time}>{formatTime(message.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}