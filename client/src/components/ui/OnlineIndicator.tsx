import styles from './OnlineIndicator.module.css';

interface OnlineIndicatorProps {
  isOnline: boolean;
  className?: string;
}

export default function OnlineIndicator({ isOnline, className }: OnlineIndicatorProps) {
  if (!isOnline) return null;
  return <div className={`${styles.indicator} ${className || ''}`} />;
}