import React from 'react';

interface BudgetIconProps {
  size?: number;
  className?: string;
}

const BudgetIcon: React.FC<BudgetIconProps> = ({ size = 24, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Ring */}
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity="0.8"
      />
      
      {/* Shekel symbol */}
      <path
        d="M8 6h2v12H8V6zm4 0h2v12h-2V6zm-2 4h2v4h-2v-4z"
        fill="currentColor"
      />
      
      {/* Tiny sparkle */}
      <circle
        cx="18"
        cy="6"
        r="1"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  );
};

export default BudgetIcon; 