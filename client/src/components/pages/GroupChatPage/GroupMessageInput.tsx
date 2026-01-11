import { useState, FormEvent, KeyboardEvent, useRef, useEffect } from 'react';
import MessagesApi from '../../../entities/messages/MessagesApi';
import { Message } from '../../../entities/messages/MessagesApi';
import { showToast } from '../../../shared/lib/toast';
import styles from '../ChatPage/MessageInput.module.css';

interface GroupMessageInputProps {
  groupId: number;
  onMessageSent: (message: Message) => void;
}

export default function GroupMessageInput({ groupId, onMessageSent }: GroupMessageInputProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!text.trim() || loading) return;

    const messageText = text.trim();
    setText('');
    setLoading(true);

    try {
      const message = await MessagesApi.sendGroupMessage(groupId, messageText);
      onMessageSent(message);
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Ошибка отправки сообщения');
      setText(messageText); // Восстанавливаем текст при ошибке
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.inputContainer}>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Введите сообщение..."
        rows={1}
        className={styles.textarea}
      />
      <button
        type="submit"
        disabled={loading || !text.trim()}
        className={styles.sendButton}
      >
        {loading ? 'Отправка...' : 'Отправить'}
      </button>
    </form>
  );
}