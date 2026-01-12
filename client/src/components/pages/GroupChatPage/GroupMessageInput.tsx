import { useState, FormEvent, KeyboardEvent, useRef, useEffect } from 'react';
import { useSendGroupMessageMutation } from '../../../features/messages/messagesApi';
import { showToast } from '../../../shared/lib/toast';
import styles from '../ChatPage/MessageInput.module.css';

interface GroupMessageInputProps {
  groupId: number;
}

export default function GroupMessageInput({ groupId }: GroupMessageInputProps) {
  const [text, setText] = useState('');
  const [sendGroupMessage, { isLoading: loading }] = useSendGroupMessageMutation();
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

    try {
      await sendGroupMessage({ groupId, text: messageText }).unwrap();
    } catch (error: any) {
      showToast.error(error.data?.message || error.message || 'Ошибка отправки сообщения');
      setText(messageText); // Восстанавливаем текст при ошибке
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