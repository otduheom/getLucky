import { useState, FormEvent } from 'react';
import SearchApi, { SearchUser } from '../../../entities/search/searchApi';
import UserCard from './UserCard';

export default function UserSearchForm() {
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch =  async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(!query.trim()) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const results = await SearchApi.searchUsers(query.trim());
            setSearchResults(results);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ошибка поиска');
      setSearchResults([]);
        }finally {
            setLoading(false);
          }
};
return (
    <div style={{ marginBottom: '24px' }}>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск пользователей по имени или нику..."
          style={{ 
            padding: '8px 12px', 
            fontSize: '16px', 
            width: '100%',
            maxWidth: '400px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '8px 16px', 
            marginLeft: '8px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Поиск...' : 'Найти'}
        </button>
      </form>

      {error && (
        <div style={{ color: 'red', marginTop: '8px' }}>
          {error}
        </div>
      )}

      {searchResults.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <h3>Результаты поиска:</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {searchResults.map((user) => (
              <UserCard key={user.id} user={user as any} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
