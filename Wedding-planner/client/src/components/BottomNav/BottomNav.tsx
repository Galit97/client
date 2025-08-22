import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BudgetIcon from '../Icons/BudgetIcon';

interface BottomNavProps {
  onSelect: (page: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ onSelect }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      id: 'dashboard',
      label: 'בית',
      icon: '🏠',
      route: '/dashboard'
    },
    {
      id: 'budget',
      label: 'תקציב',
      icon: '💰',
      route: '/budget'
    },
    {
      id: 'vendors',
      label: 'ספקים',
      icon: '🏢',
      route: '/vendors'
    },
    {
      id: 'guests',
      label: 'מוזמנים',
      icon: '👥',
      route: '/guests'
    },
    {
      id: 'tasks',
      label: 'משימות',
      icon: '📋',
      route: '/tasks'
    },
    {
      id: 'settings',
      label: 'הגדרות',
      icon: '⚙️',
      route: '/settings'
    }
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    onSelect(item.id);
  };

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--color-white)',
        borderTop: '1px solid var(--border-strong)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 'var(--spacing-sm)',
          padding: 'var(--spacing-sm)',
        }}
      >
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              background: 'none',
              border: 'none',
              padding: 'var(--spacing-sm)',
              borderRadius: 'var(--border-radius-sm)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              color: location.pathname === item.route ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontSize: 'var(--font-size-small)',
              fontWeight: location.pathname === item.route ? 'bold' : 'normal',
            }}
          >
            <span style={{ fontSize: '20px' }}>
              {item.id === 'budget' ? (
                <BudgetIcon size={20} />
              ) : (
                item.icon
              )}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav; 