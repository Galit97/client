import React from 'react';

interface InviteRSVPIconProps {
  size?: number;
  className?: string;
}

const InviteRSVPIcon: React.FC<InviteRSVPIconProps> = ({ size = 24, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Envelope */}
      <path
        d="M3 8l9 6 9-6M3 8v8a2 2 0 002 2h14a2 2 0 002-2V8l-9 6-9-6z"
        stroke="currentColor"
        strokeWidth="1.75"
        fill="none"
      />
      
      {/* Checkmark */}
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.75"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default InviteRSVPIcon; 