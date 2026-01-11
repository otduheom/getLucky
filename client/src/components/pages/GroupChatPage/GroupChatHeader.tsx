import UserAvatar from '../../ui/UserAvatar';
import GroupsApi from '../../../entities/groups/GroupsApi';
import { Group } from '../../../entities/groups/GroupsApi';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { showToast } from '../../../shared/lib/toast';
import styles from '../ChatPage/ChatHeader.module.css';
import { getAvatarUrl } from '../../../shared/lib/getAvatarUrl';

interface GroupChatHeaderProps {
  group: Group;
  currentUserId?: number;
}

export default function GroupChatHeader({ group, currentUserId }: GroupChatHeaderProps) {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  const handleLeaveGroup = async () => {
    if (!confirm(`Вы уверены, что хотите покинуть группу "${group.name}"?`)) {
      return;
    }

    setLeaving(true);
    try {
      await GroupsApi.leaveGroup(group.id);
      showToast.success('Вы покинули группу');
      navigate('/chats');
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Ошибка выхода из группы');
    } finally {
      setLeaving(false);
    }
  };

  return (
    <div className={styles.header}>
      <div className={styles.avatarContainer}>
        <UserAvatar src={getAvatarUrl(group.avatar)} name={group.name} size="md" />
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{group.name}</h3>
        {group.description && <p className={styles.status}>{group.description}</p>}
      </div>
      {currentUserId && currentUserId !== group.creatorId && (
        <button
          onClick={handleLeaveGroup}
          disabled={leaving}
          style={{
            marginLeft: 'auto',
            padding: '8px 16px',
            backgroundColor: '#ff5252',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: leaving ? 'not-allowed' : 'pointer',
            fontSize: '14px',
          }}
        >
          {leaving ? 'Выход...' : 'Покинуть группу'}
        </button>
      )}
    </div>
  );
}