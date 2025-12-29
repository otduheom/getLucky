import styles from './UnreadBadge.module.css';

interface UnreadBadgeProps {
  count: number;
  className?: string;
}

export default function UnreadBadge({ count, className }: UnreadBadgeProps) {
  if (count === 0) return null;
  
  return (
    <span className={`${styles.badge} ${className || ''}`}>
      {count > 99 ? '99+' : count}
    </span>
  );
}