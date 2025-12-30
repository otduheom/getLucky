import { useEffect, useState } from 'react';
import FriendsApi, { Friend } from '../../../entities/friends/FriendsApi';
import FriendRequestItem from './FriendRequestItem';

export default function FriendRequestsList() {
  const [requests, setRequests] = useState<Array<{ id: number; user: Friend; createdAt: string }>>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const friendRequests = await FriendsApi.getFriendRequests();
      console.log('Заявки в друзья:', friendRequests); // Для отладки
      setRequests(friendRequests);
    } catch (error: any) {
      console.error('Ошибка загрузки заявок:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRequestAccepted = () => {
    fetchRequests(); // Перезагружаем список после принятия заявки
  };

  if (loading) {
    return <div>Загрузка заявок...</div>;
  }

  if (requests.length === 0) {
    return <div style={{ padding: '16px', color: '#666' }}>У вас нет новых заявок в друзья</div>;
  }

  return (
    <div>
      <h2>Заявки в друзья ({requests.length})</h2>
      <div>
        {requests.map((request) => {
          if (!request.id) {
            console.error('Request without id:', request);
            return null;
          }
          return (
            <FriendRequestItem
              key={request.id}
              requestId={request.id}
              user={request.user}
              onAccepted={handleRequestAccepted}
            />
          );
        })}
      </div>
    </div>
  );
}

