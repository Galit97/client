import React, { useState } from 'react';
import BudgetIcon from '../Icons/BudgetIcon';

interface BottomNavProps {
  onSelect: (page: string) => void;
  currentSection?: string;
}

const BottomNav: React.FC<BottomNavProps> = ({ onSelect, currentSection }) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navItems = [
    {
      id: 'dashboard',
      label: 'בית',
      icon: '🏠',
      route: '/dashboard'
    },
    {
      id: 'eventSettings',
      label: 'הגדרות',
      icon: '⚙️',
      route: '/eventSettings'
    },
    {
      id: 'guestList',
      label: 'מוזמנים',
      icon: '👥',
      route: '/guests'
    },
    {
      id: 'vendors',
      label: 'ספקים',
      icon: '🏢',
      route: '/vendors'
    },
    {
      id: 'budget',
      label: 'תקציב',
      icon: '💰',
      route: '/budget'
    },
    {
      id: 'comparisons',
      label: 'השוואות',
      icon: '⚖️',
      route: '/comparisons',
      type: 'dropdown',
      items: [
        { id: 'vendorCompare', label: 'השוואת ספקים', icon: '🏢' },
        { id: 'venueCompare', label: 'השוואת אולמות', icon: '🏰' }
      ]
    },
    {
      id: 'lists',
      label: 'רשימות',
      icon: '📋',
      route: '/lists',
      type: 'dropdown',
      items: [
        { id: 'checklist', label: 'משימות', icon: '✅' },
        { id: 'importantThings', label: 'דברים חשובים', icon: '⭐' },
        { id: 'weddingDay', label: 'יום החתונה', icon: '💒' }
      ]
    }
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.type === 'dropdown') {
      setActiveDropdown(activeDropdown === item.id ? null : item.id);
    } else {
      onSelect(item.id);
      setActiveDropdown(null);
    }
  };

  const handleDropdownItemClick = (itemId: string) => {
    onSelect(itemId);
    setActiveDropdown(null);
  };

  // Check if current section is active
  const isActive = (itemId: string) => {
    return currentSection === itemId;
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
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '2px',
          padding: '8px 4px',
          position: 'relative',
          maxWidth: '100%',
          overflow: 'hidden'
        }}
      >
        {/* Dropdown Overlay */}
        {activeDropdown && (
          <div
            onClick={() => setActiveDropdown(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999
            }}
          />
        )}

        {navItems.map((item) => (
          <div key={item.id} style={{ position: 'relative' }}>
            <button
              onClick={() => handleNavClick(item)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                background: 'none',
                border: 'none',
                padding: '6px 8px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: isActive(item.id) ? '#1d5a78' : '#6b7280',
                fontSize: '11px',
                fontWeight: isActive(item.id) ? 'bold' : 'normal',
                minWidth: '50px',
                flex: '0 0 auto',
              }}
            >
              <span style={{ fontSize: '16px' }}>
                {item.id === 'budget' ? (
                  <BudgetIcon size={16} />
                ) : (
                  item.icon
                )}
              </span>
              <span style={{ textAlign: 'center', lineHeight: '1.2' }}>
                {item.label}
                {item.type === 'dropdown' && (
                  <span style={{ 
                    marginRight: '2px', 
                    transform: activeDropdown === item.id ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    display: 'inline-block'
                  }}>
                    ▲
                  </span>
                )}
              </span>
            </button>

            {/* Dropdown Menu */}
            {item.type === 'dropdown' && activeDropdown === item.id && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                  border: '1px solid #e5e7eb',
                  marginBottom: '8px',
                  minWidth: '180px',
                  zIndex: 1000,
                  overflow: 'hidden'
                }}
              >
                {item.items?.map((subItem, index) => (
                  <button
                    key={subItem.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDropdownItemClick(subItem.id);
                    }}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      padding: '12px 16px',
                      textAlign: 'right',
                      fontSize: '14px',
                      cursor: 'pointer',
                      color: '#374151',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      borderBottom: index < (item.items?.length || 0) - 1 ? '1px solid #f3f4f6' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>{subItem.icon}</span>
                    <span>{subItem.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav; 