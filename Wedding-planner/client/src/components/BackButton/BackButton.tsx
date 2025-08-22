import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  className?: string;
  onClick?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ className = '', onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        background: 'none',
        border: 'none',
        color: 'var(--brand-primary)',
        fontSize: 'var(--font-size-base)',
        fontWeight: 'bold',
        cursor: 'pointer',
        padding: 'var(--spacing-sm) var(--spacing-md)',
        borderRadius: 'var(--border-radius-sm)',
        transition: 'all var(--transition-fast)',
        fontFamily: 'var(--font-family)',
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: 'rotate(180deg)' }}
      >
        <path
          d="M15 18l-6-6 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      חזרה
    </button>
  );
};

export default BackButton; 