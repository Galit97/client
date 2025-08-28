import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'disabled';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button'
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid transparent',
    borderRadius: 'var(--border-radius-sm)',
    fontWeight: 'bold',
    textDecoration: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all var(--transition-fast)',
    fontFamily: 'var(--font-family)',
    outline: 'none',
  };

  const sizeStyles = {
    small: {
      padding: 'var(--spacing-sm) var(--spacing-md)',
      fontSize: 'var(--font-size-small)',
    },
    medium: {
      padding: 'var(--spacing-md) var(--spacing-lg)',
      fontSize: 'var(--font-size-base)',
    },
    large: {
      padding: 'var(--spacing-lg) var(--spacing-xl)',
      fontSize: 'var(--font-size-large)',
    },
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--brand-primary)',
      color: '#fff',
      borderColor: 'var(--brand-primary)',
      '&:hover': {
        backgroundColor: 'var(--brand-primary-hover)',
        borderColor: 'var(--brand-primary-hover)',
      },
      '&:focus': {
        outline: '2px solid var(--focus-ring)',
        outlineOffset: '2px',
      },
    },
    secondary: {
      backgroundColor: 'transparent',
      color: 'var(--text-primary)',
      borderColor: 'var(--border-strong)',
      '&:hover': {
        backgroundColor: 'var(--surface-sky-50)',
      },
      '&:focus': {
        outline: '2px solid var(--focus-ring)',
        outlineOffset: '2px',
      },
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--brand-primary)',
      borderColor: 'transparent',
      '&:hover': {
        backgroundColor: 'var(--surface-sky-50)',
      },
      '&:focus': {
        outline: '2px solid var(--focus-ring)',
        outlineOffset: '2px',
      },
    },
    destructive: {
      backgroundColor: '#B91C1C',
      color: '#fff',
      borderColor: '#B91C1C',
      '&:hover': {
        backgroundColor: '#DC2626',
        borderColor: '#DC2626',
      },
      '&:focus': {
        outline: '2px solid var(--focus-ring)',
        outlineOffset: '2px',
      },
    },
    disabled: {
      backgroundColor: 'var(--color-gray-medium)',
      color: 'var(--text-secondary)',
      borderColor: 'var(--color-gray-medium)',
      cursor: 'not-allowed',
      opacity: 0.6,
    },
  };

  const getStyles = () => {
    const base = { ...baseStyles, ...sizeStyles[size] };
    const selectedVariant = variantStyles[disabled ? 'disabled' : variant];
    
    return {
      ...base,
      ...selectedVariant,
    };
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={getStyles()}
    >
      {children}
    </button>
  );
};

export default Button; 