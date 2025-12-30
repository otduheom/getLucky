import { useNavigate } from 'react-router';
import UserAvatar from '../../ui/UserAvatar';
import AddFriendButton from '../../ui/AddFriendButton';
import FriendsApi, { Friend } from '../../../entities/friends/FriendsApi';
import styles from './UserCard.module.css';

interface UserCardProps {
    user: Friend;
}

export default function UserCard({ user }: UserCardProps) {
    const navigate = useNavigate();

    const handleProfileClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/profile/${user.id}`);
    };
    
    const displayName = user.nickname || 
        (user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.name);

    return (
        <div className={styles.card}>
            <div 
                onClick={handleProfileClick}
                className={styles.profileSection}
            >
                <UserAvatar 
                    src={user.avatar ? `http://localhost:3001${user.avatar}` : undefined} 
                    name={user.name} 
                    size="lg"
                />
                <h3 className={styles.name}>{displayName}</h3>
                <button
                    onClick={handleProfileClick}
                    className={styles.profileButton}
                >
                    Открыть профиль
                </button>
            </div>
            <AddFriendButton 
                userId={user.id} 
                onSuccess={() => {console.log('Заявка отправлена')}} 
            />
        </div>
    );
}