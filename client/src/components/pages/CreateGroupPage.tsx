import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import FriendsApi, { Friend } from '../../entities/friends/FriendsApi';
import GroupsApi from '../../entities/groups/GroupsApi';
import styles from './CreateGroupPage.module.css';
import { showToast } from '../../shared/lib/toast';

export default function CreateGroupPage() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriendIds, setSelectedFriendIds] = useState<number[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        setError(null);
        const friendsList = await FriendsApi.getFriends();
        setFriends(friendsList);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка загрузки друзей');
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const handleFriendToggle = (friendId: number) => {
    setSelectedFriendIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId],
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast.error('Название группы не может быть пустым');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const group = await GroupsApi.createGroup(
        name.trim(),
        description.trim() || undefined,
        selectedFriendIds,
      );
      showToast.success('Группа успешно создана');
      navigate(`/chat/group/${group.id}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ошибка создания группы';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loading}>Загрузка друзей...</div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>Создать группу</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            Название группы *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            placeholder="Введите название группы"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            Описание (необязательно)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.textarea}
            placeholder="Введите описание группы"
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Выберите друзей ({selectedFriendIds.length} выбрано)
          </label>
          {friends.length === 0 ? (
            <div className={styles.emptyState}>
              У вас пока нет друзей для добавления в группу
            </div>
          ) : (
            <div className={styles.friendsList}>
              {friends.map((friend) => {
                const displayName =
                  friend.nickname ||
                  (friend.firstName && friend.lastName
                    ? `${friend.firstName} ${friend.lastName}`
                    : friend.name);
                const isSelected = selectedFriendIds.includes(friend.id);

                return (
                  <label
                    key={friend.id}
                    className={`${styles.friendItem} ${isSelected ? styles.selected : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleFriendToggle(friend.id)}
                      className={styles.checkbox}
                    />
                    <span className={styles.friendName}>{displayName}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => navigate('/chats')}
            className={styles.cancelButton}
            disabled={creating}
          >
            Отмена
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={creating || !name.trim()}
          >
            {creating ? 'Создание...' : 'Создать группу'}
          </button>
        </div>
      </form>
    </div>
  );
}