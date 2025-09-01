import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BackRTL_24 } from '../Icons/WeddingIconsLibrary';

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
      <BackRTL_24 style={{ width: '16px', height: '16px' }} />
      חזרה
    </button>
  );
};

export default BackButton; 