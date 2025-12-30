import { useNavigate } from 'react-router';

interface MessageButtonProps {
  friendId: number;
}

export default function MessageButton({ friendId }: MessageButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/chat/${friendId}`);
  };

  return (
    <button
      onClick={handleClick}
      style={{
        padding: '6px 12px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
      }}
    >
      Написать сообщение
    </button>
  );
}