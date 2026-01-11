import { useState, FormEvent } from 'react';
import { Chat } from '../../../entities/messages/MessagesApi';
import styles from './ChatSearchForm.module.css';

interface ChatSearchFormProps {
  chats: Chat[];
  onSearchResults: (results: Chat[]) => void;
}

export default function ChatSearchForm({ chats, onSearchResults }: ChatSearchFormProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      onSearchResults(chats);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = chats.filter(chat => {
      let chatName = '';
      if (chat.type === 'private' && chat.friend) {
        chatName = (chat.friend.nickname || 
          (chat.friend.firstName && chat.friend.lastName 
            ? `${chat.friend.firstName} ${chat.friend.lastName}` 
            : chat.friend.name)).toLowerCase();
      } else if (chat.type === 'group' && chat.group) {
        chatName = chat.group.name.toLowerCase();
      }
      const lastMessageText = chat.lastMessage?.text.toLowerCase() || '';
      return chatName.includes(query) || lastMessageText.includes(query);
    });

    onSearchResults(filtered);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (!value.trim()) {
      onSearchResults(chats);
      return;
    }

    const query = value.toLowerCase().trim();
    const filtered = chats.filter(chat => {
      let chatName = '';
      if (chat.type === 'private' && chat.friend) {
        chatName = (chat.friend.nickname || 
          (chat.friend.firstName && chat.friend.lastName 
            ? `${chat.friend.firstName} ${chat.friend.lastName}` 
            : chat.friend.name)).toLowerCase();
      } else if (chat.type === 'group' && chat.group) {
        chatName = chat.group.name.toLowerCase();
      }
      const lastMessageText = chat.lastMessage?.text.toLowerCase() || '';
      return chatName.includes(query) || lastMessageText.includes(query);
    });

    onSearchResults(filtered);
  };

  return (
    <form onSubmit={handleSearch} className={styles.searchContainer}>
      <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <input
        type="text"
        placeholder="Поиск по чатам..."
        value={searchQuery}
        onChange={handleInputChange}
        className={styles.searchInput}
      />
    </form>
  );
}
