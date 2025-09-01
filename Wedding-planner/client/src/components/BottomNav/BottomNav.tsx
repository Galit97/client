import React, { useState } from 'react';
import { 
  Home_24, 
  Settings_24, 
  Guests_24, 
  Suppliers_24, 
  Budget_24, 
  Tasks_24,
  Calendar_24,
  Heart_24,
  Star_24,
  ChevronRTL_24
} from '../Icons/WeddingIconsLibrary';

type IconComponent = React.FC<{ className?: string; style?: React.CSSProperties }>;

interface BottomNavProps {
  onSelect: (page: string) => void;
  currentSection?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: IconComponent | string;
  route: string;
  type?: 'dropdown';
  items?: Array<{
    id: string;
    label: string;
    icon: IconComponent | string;
  }>;
}

const BottomNav: React.FC<BottomNavProps> = ({ onSelect, currentSection }) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navItems = [
    {
      id: 'dashboard',
      label: 'בית',
      icon: Home_24,
      route: '/dashboard'
    },
    {
      id: 'eventSettings',
      label: 'הגדרות',
      icon: Settings_24,
      route: '/eventSettings'
    },
    {
      id: 'guestList',
      label: 'מוזמנים',
      icon: Guests_24,
      route: '/guests'
    },
    {
      id: 'vendors',
      label: 'ספקים',
      icon: Suppliers_24,
      route: '/vendors'
    },
    {
      id: 'budget',
      label: 'תקציב',
      icon: Budget_24,
      route: '/budget'
    },
    {
      id: 'comparisons',
      label: 'השוואות',
      icon: ChevronRTL_24,
      route: '/comparisons',
      type: 'dropdown',
      items: [
        { id: 'vendorCompare', label: 'השוואת ספקים', icon: Suppliers_24 },
        { id: 'venueCompare', label: 'השוואת אולמות', icon: Heart_24 }
      ]
    },
    {
      id: 'lists',
      label: 'רשימות',
      icon: Tasks_24,
      route: '/lists',
      type: 'dropdown',
      items: [
        { id: 'checklist', label: 'משימות', icon: Tasks_24 },
        { id: 'importantThings', label: 'דברים חשובים', icon: Star_24 },
        { id: 'weddingDay', label: 'יום החתונה', icon: Calendar_24 }
      ]
    }
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    
    if (item.type === 'dropdown') {
      const newActiveDropdown = activeDropdown === item.id ? null : item.id;
   
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
                {typeof item.icon === 'string' ? (
                  item.icon
                ) : (
                  <item.icon style={{ width: '16px', height: '16px' }} />
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
                    {item.label}
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
                      <span style={{ fontSize: '16px' }}>
                        {typeof subItem.icon === 'string' ? (
                          subItem.icon
                        ) : (
                          <subItem.icon style={{ width: '16px', height: '16px' }} />
                        )}
                      </span>
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