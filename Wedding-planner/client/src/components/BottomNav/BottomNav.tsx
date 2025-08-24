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
    console.log('Nav item clicked:', item.id, 'Type:', item.type);
    console.log('Current activeDropdown:', activeDropdown);
    if (item.type === 'dropdown') {
      const newActiveDropdown = activeDropdown === item.id ? null : item.id;
      console.log('Setting active dropdown to:', newActiveDropdown);
      setActiveDropdown(newActiveDropdown);
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
               zIndex: 998
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
                    display: 'inline-block',
                    fontSize: '10px',
                    color: activeDropdown === item.id ? '#1d5a78' : '#6b7280'
                  }}>
                    ▼
                  </span>
                )}
              </span>
            </button>

                        {/* Dropdown Menu */}
            {(() => {
              console.log('Rendering dropdown for:', item.id, 'activeDropdown:', activeDropdown, 'should show:', item.type === 'dropdown' && activeDropdown === item.id);
              return null;
            })()}
                         <div
               style={{
                 position: 'fixed',
                 bottom: '80px',
                 left: '50%',
                 transform: 'translateX(-50%)',
                 backgroundColor: '#ffffff',
                 borderRadius: '12px',
                 boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                 border: '2px solid #1d5a78',
                 marginBottom: '8px',
                 minWidth: '180px',
                 zIndex: 1001,
                 overflow: 'hidden',
                 maxHeight: '300px',
                 overflowY: 'auto',
                 display: item.type === 'dropdown' && activeDropdown === item.id ? 'block' : 'none',
                 visibility: item.type === 'dropdown' && activeDropdown === item.id ? 'visible' : 'hidden',
                 opacity: item.type === 'dropdown' && activeDropdown === item.id ? 1 : 0,
                 padding: '8px 0',
                 pointerEvents: 'auto',
                 transition: 'opacity 0.2s ease, visibility 0.2s ease'
               }}
             >
                                     <div style={{ 
                     padding: '8px 16px', 
                     fontSize: '12px', 
                     color: '#1d5a78', 
                     borderBottom: '1px solid #e5e7eb',
                     textAlign: 'center',
                     fontWeight: 'bold',
                     backgroundColor: '#f0f9ff'
                   }}>
                     דרופ דאון פתוח - {item.label}
                   </div>
                                    {item.items?.map((subItem, index) => (
                    <button
                      key={subItem.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDropdownItemClick(subItem.id);
                      }}
                                             style={{
                         width: '100%',
                         background: currentSection === subItem.id ? '#f0f9ff' : '#f8fafc',
                         border: 'none',
                         padding: '12px 16px',
                         textAlign: 'right',
                         fontSize: '14px',
                         cursor: 'pointer',
                         color: currentSection === subItem.id ? '#1d5a78' : '#374151',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '8px',
                         borderBottom: index < (item.items?.length || 0) - 1 ? '1px solid #f3f4f6' : 'none',
                         fontWeight: currentSection === subItem.id ? 'bold' : 'normal'
                       }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = currentSection === subItem.id ? '#f0f9ff' : '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = currentSection === subItem.id ? '#f0f9ff' : 'none';
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>{subItem.icon}</span>
                      <span>{subItem.label}</span>
                    </button>
                  ))}
                </div>
            </div>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav; 