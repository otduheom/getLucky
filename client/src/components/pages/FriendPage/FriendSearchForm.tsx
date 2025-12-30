import { useState, FormEvent } from 'react';
import FriendsApi, { Friend } from '../../../entities/friends/FriendsApi';
import FriendItem from './FriendItem';

interface FriendSearchFormProps {
  onSearchResults: (results: Friend[]) => void;
  onlineFriends: number[];
}

export default function FriendSearchForm({ onSearchResults, onlineFriends }: FriendSearchFormProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Friend[]>([]);

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setSearchResults([]);
      onSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await FriendsApi.searchFriends(query.trim());
      setSearchResults(results);
      onSearchResults(results);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка поиска');
      setSearchResults([]);
      onSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const isOnline = (friendId: number) => {
    return onlineFriends.includes(friendId);
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <form onSubmit={handleSearch} style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск друзей по имени или нику..."
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: '16px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              maxWidth: '400px'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {loading ? 'Поиск...' : 'Найти'}
          </button>
        </div>
      </form>

      {error && (
        <div style={{ color: 'red', marginBottom: '8px' }}>
          {error}
        </div>
      )}

      {searchResults.length > 0 && (
        <div>
          <h3>Результаты поиска ({searchResults.length}):</h3>
          <div>
            {searchResults.map((friend) => (
              <FriendItem 
                key={friend.id} 
                friend={friend} 
                isOnline={isOnline(friend.id)}
              />
            ))}
          </div>
        </div>
      )}

      {query && searchResults.length === 0 && !loading && (
        <div style={{ color: '#666', fontStyle: 'italic' }}>
          По запросу "{query}" друзья не найдены
        </div>
      )}
    </div>
  );
}