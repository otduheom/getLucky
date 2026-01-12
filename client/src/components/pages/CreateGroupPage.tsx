import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useGetFriendsQuery, Friend } from '../../features/friends/friendsApi';
import { useCreateGroupMutation } from '../../features/groups/groupsApi';
import styles from './CreateGroupPage.module.css';
import { showToast } from '../../shared/lib/toast';

export default function CreateGroupPage() {
  const navigate = useNavigate();
  const { data: friends = [], isLoading: loading, error: friendsError } = useGetFriendsQuery();
  const [createGroup, { isLoading: creating }] = useCreateGroupMutation();
  const [selectedFriendIds, setSelectedFriendIds] = useState<number[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

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

    setError(null);

    try {
      const group = await createGroup({
        name: name.trim(),
        description: description.trim() || undefined,
        memberIds: selectedFriendIds,
      }).unwrap();
      showToast.success('Группа успешно создана');
      navigate(`/chat/group/${group.id}`);
    } catch (err: any) {
      const errorMessage = err.data?.message || err.message || 'Ошибка создания группы';
      setError(errorMessage);
      showToast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loading}>Загрузка друзей...</div>
      </div>
    );
  }

  if (friendsError) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.error}>
          {'data' in friendsError
            ? (friendsError.data as any)?.message || 'Ошибка загрузки друзей'
            : 'Ошибка загрузки друзей'}
        </div>
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