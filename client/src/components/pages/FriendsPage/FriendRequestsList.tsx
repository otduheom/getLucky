import { useGetFriendRequestsQuery } from '../../../features/friends/friendsApi';
import FriendRequestItem from './FriendRequestItem';

export default function FriendRequestsList() {
  const { data: requests = [], isLoading: loading } = useGetFriendRequestsQuery();

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
            />
          );
        })}
      </div>
    </div>
  );
}

