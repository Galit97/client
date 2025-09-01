import { useState, useEffect } from 'react';
import { Settings_24, Heart_24 } from '../Icons/WeddingIconsLibrary';

interface MenuProps {
  onSelect: (page: string) => void;
  onLogout?: () => void;
}

export default function Menu({ onSelect, onLogout }: MenuProps) {
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const currentUserRaw = localStorage.getItem("currentUser");
    if (currentUserRaw) {
      try {
        const currentUser = JSON.parse(currentUserRaw);
        const name =
          currentUser.firstName && currentUser.lastName
            ? `${currentUser.firstName} ${currentUser.lastName}`
            : currentUser.name || null;
        setCurrentUserName(name);
      } catch {
        setCurrentUserName(null);
      }
    }
  }, []);

  const handleMenuItemClick = (page: string) => {
    onSelect(page);
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  // רק פריטים בסיסיים לתפריט העליון - רק הדרופדאון של המשתמש נשאר

  return (
    <div style={{ display: "flex", alignItems: "center", direction: "rtl", position: "relative" }}>


      {/* שם המשתמש */}
      {currentUserName && (
        <div style={{ position: 'relative', marginLeft: '20px' }}>
          <details>
            <summary style={{ listStyle: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', color: '#1d5a78' }}>
              שלום, {currentUserName} ▼
            </summary>
            <div style={{ 
              position: 'absolute', 
              right: 0, 
              background: 'white', 
              borderRadius: 8, 
              marginTop: 8, 
              minWidth: 180, 
              zIndex: 10,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              border: '1px solid #e5e7eb'
            }}>
              <button 
                onClick={() => handleMenuItemClick('accountSettings')} 
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  textAlign: 'right', 
                  padding: '12px 16px', 
                  background: 'none', 
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  borderBottom: '1px solid #f3f4f6'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
              >
                <Settings_24 style={{ width: '16px', height: '16px', marginLeft: '8px' }} /> הגדרות משתמש
              </button>
              <button 
                onClick={() => handleMenuItemClick('myWeddings')} 
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  textAlign: 'right', 
                  padding: '12px 16px', 
                  background: 'none', 
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  borderBottom: '1px solid #f3f4f6'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
              >
                <Heart_24 style={{ width: '16px', height: '16px', marginLeft: '8px' }} /> האירועים שלי
              </button>
              <button 
                onClick={handleLogout}
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  textAlign: 'right', 
                  padding: '12px 16px', 
                  background: 'none', 
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#dc2626',
                  fontWeight: 'bold'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
              >
                התנתקות
              </button>
            </div>
          </details>
        </div>
      )}



      {/* Close dropdowns when clicking outside */}
      {showUserMenu && (
        <div
          onClick={() => {
            setShowUserMenu(false);
          }}
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


    </div>
  );
}
