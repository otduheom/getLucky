import styles from './UserAvatar.module.css';

interface UserAvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function UserAvatar({ src, name, size = 'md', className }: UserAvatarProps) {
  // если нет src, то показываем инициалы
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`${styles.avatar} ${styles[size]} ${className || ''}`}>
      {src ? (
        <img src={src} alt={name} className={styles.image} />
      ) : (
        <div className={styles.initials}>{initials}</div>
      )}
    </div>
  );
}