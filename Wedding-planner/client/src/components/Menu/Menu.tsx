import React, { useState, useEffect } from 'react';

interface MenuProps {
  onSelect: (page: string) => void;
  onLogout?: () => void;
}

export default function Menu({ onSelect, onLogout }: MenuProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
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
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setIsMobileMenuOpen(false);
  };

  const toggleDropdown = (dropdownName: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "מסך הבית",
      onClick: () => handleMenuItemClick("dashboard"),
    },
    {
      id: "eventSettings",
      label: "הגדרות האירוע",
      onClick: () => handleMenuItemClick("eventSettings"),
    },
    {
      id: "guestList",
      label: "רשימת מוזמנים",
      onClick: () => handleMenuItemClick("guestList"),
    },
    {
      id: "vendors",
      label: "ניהול ספקים",
      onClick: () => handleMenuItemClick("vendors"),
    },
    {
      id: "budget",
      label: "ניהול תקציב",
      onClick: () => handleMenuItemClick("budget"),
    },
    {
      id: "comparisons",
      label: "השוואות",
      type: "dropdown",
      items: [
        {
          id: "vendorCompare",
          label: "השוואת מחירי ספקים",
          onClick: () => handleMenuItemClick("vendorCompare"),
        },
        {
          id: "venueCompare",
          label: "השוואת מחירי אולמות",
          onClick: () => handleMenuItemClick("venueCompare"),
        },
      ],
    },
    {
      id: "lists",
      label: "רשימות",
      type: "dropdown",
      items: [
        {
          id: "checklist",
          label: "צ'קליסט",
          onClick: () => handleMenuItemClick("checklist"),
        },
        {
          id: "importantThings",
          label: "דברים שחשוב לי",
          onClick: () => handleMenuItemClick("importantThings"),
        },
        {
          id: "weddingDay",
          label: "יום החתונה",
          onClick: () => handleMenuItemClick("weddingDay"),
        },
      ],
    },
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", direction: "rtl", position: "relative" }}>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        style={{
          display: "none",
          background: "none",
      
          cursor: "pointer",
          padding: "8px",
          marginLeft: "10px",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "30px",
          height: "25px",
        }}
        className="mobile-menu-button"
      >
        <span style={{
          width: "100%",
          height: "3px",
          backgroundColor: "#000",
          transition: "all 0.3s ease",
          transform: isMobileMenuOpen ? "rotate(45deg) translate(5px, 5px)" : "none"
        }}></span>
        <span style={{
          width: "100%",
          height: "3px",
          backgroundColor: "#000",
          transition: "all 0.3s ease",
          opacity: isMobileMenuOpen ? "0" : "1"
        }}></span>
        <span style={{
          width: "100%",
          height: "3px",
          backgroundColor: "#000",
          transition: "all 0.3s ease",
          transform: isMobileMenuOpen ? "rotate(-45deg) translate(7px, -6px)" : "none"
        }}></span>
      </button>

      {/* שם המשתמש */}
      {currentUserName && (
        <div style={{ position: 'relative', marginLeft: '20px' }}>
          <details>
            <summary style={{ listStyle: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
              שלום, {currentUserName}
            </summary>
            <div style={{ position: 'absolute', right: 0, background: 'white', borderRadius: 6, marginTop: 6, minWidth: 160, zIndex: 10 }}>
              <button onClick={() => handleMenuItemClick('accountSettings')} style={{ display: 'block', width: '100%', textAlign: 'right', padding: '8px 12px', background: 'none', cursor: 'pointer' }}>הגדרות משתמש</button>
              <button onClick={() => handleMenuItemClick('myWeddings')} style={{ display: 'block', width: '100%', textAlign: 'right', padding: '8px 12px', background: 'none', cursor: 'pointer' }}>האירועים שלי</button>
            </div>
          </details>
        </div>
      )}

      {/* Desktop Menu */}
      <nav className="desktop-menu">
        <ul style={{ display: "flex", listStyle: "none", margin: 0, padding: 0 }}>
          {menuItems.map((item, idx) => (
            <React.Fragment key={item.id}>
              <li>
                {item.type === 'dropdown' ? (
                  <div style={{ position: 'relative', zIndex: 1001 }}>
                    <button
                      onClick={(e) => toggleDropdown(item.id, e)}
                      style={{
                        background: "none",
                        border: "none",
                        padding: "0 10px",
                        fontSize: "16px",
                        cursor: "pointer",
                        color: "black",
                        fontWeight: "bold",
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      {item.label}
                      <span style={{ transform: activeDropdown === item.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
                        ▼
                      </span>
                    </button>
                                         {activeDropdown === item.id && (
                       <div
                         className="card"
                         style={{
                           position: 'absolute',
                           top: '100%',
                           right: 0,
                           minWidth: '200px',
                           zIndex: 1000,
                           marginTop: '5px',
                           boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                           border: 'none'
                         }}
                       >
                        {item.items?.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              subItem.onClick();
                            }}
                            style={{
                              width: '100%',
                              background: 'none',
                              border: 'none',
                              padding: '10px 16px',
                              textAlign: 'right',
                              fontSize: '14px',
                              cursor: 'pointer',
                              color: '#333',
                              display: 'block',
                              borderBottom: '1px solid #eee'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#f5f5f5';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'none';
                            }}
                          >
                            {subItem.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={item.onClick}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "0 10px",
                      fontSize: "16px",
                      cursor: "pointer",
                      color: "black",
                      fontWeight: "bold",
                    }}
                  >
                    {item.label}
                  </button>
                )}
              </li>
              {idx < menuItems.length - 1 && (
                <li style={{ padding: "0 5px", color: "black" }}>|</li>
              )}
            </React.Fragment>
          ))}
        </ul>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
          }}
        />
      )}

      {/* Mobile Menu */}
      <nav
        className="mobile-menu"
        style={{
          position: "fixed",
          top: 0,
          right: isMobileMenuOpen ? "0" : "-300px",
          width: "280px",
          height: "100vh",
          backgroundColor: "white",
    
          transition: "right 0.3s ease",
          zIndex: 1001,
          padding: "20px",
          direction: "rtl",
          overflowY: "auto",
        }}
      >
        <div style={{ marginBottom: "30px" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>תפריט</h3>
          {currentUserName && (
            <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
              שלום, {currentUserName}
            </p>
          )}
        </div>

        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {menuItems.map((item) => (
            <li key={item.id} style={{ marginBottom: "10px" }}>
              {item.type === 'dropdown' ? (
                <div>
                  <button
                    onClick={(e) => toggleDropdown(item.id, e)}
                    style={{
                      width: "100%",
                      background: "none",
                      border: "none",
                      padding: "12px 15px",
                      fontSize: "16px",
                      cursor: "pointer",
                      color: "#333",
                      fontWeight: "bold",
                      textAlign: "right",
                      borderRadius: "6px",
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    {item.label}
                    <span style={{ transform: activeDropdown === item.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
                      ▼
                    </span>
                  </button>
                  {activeDropdown === item.id && (
                    <div style={{ paddingRight: '20px' }}>
                      {item.items?.map((subItem) => (
                        <button
                          key={subItem.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            subItem.onClick();
                          }}
                          style={{
                            width: "100%",
                            background: "none",
                            border: "none",
                            padding: "8px 15px",
                            fontSize: "14px",
                            cursor: "pointer",
                            color: "#666",
                            textAlign: "right",
                            borderRadius: "6px",
                            marginBottom: "8px",
                          }}
                        >
                          {subItem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={item.onClick}
                  style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    padding: "12px 15px",
                    fontSize: "16px",
                    cursor: "pointer",
                    color: "#333",
                    fontWeight: "bold",
                    textAlign: "right",
                    borderRadius: "6px",
                    transition: "background-color 0.2s ease",
                  }}
                >
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>

        {/* User Settings in Mobile Menu */}
        {currentUserName && (
          <div style={{ marginTop: "30px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
            <h4 style={{ margin: "0 0 15px 0", color: "#333", fontSize: "16px" }}>הגדרות</h4>
            <button
              onClick={() => handleMenuItemClick("accountSettings")}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                padding: "10px 15px",
                fontSize: "14px",
                cursor: "pointer",
                color: "#666",
                textAlign: "right",
                borderRadius: "6px",
                marginBottom: "8px",
              }}
            >
              הגדרות משתמש
            </button>
            <button
              onClick={() => handleMenuItemClick("myWeddings")}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                padding: "10px 15px",
                fontSize: "14px",
                cursor: "pointer",
                color: "#666",
                textAlign: "right",
                borderRadius: "6px",
                marginBottom: "8px",
              }}
            >
              האירועים שלי
            </button>
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                padding: "10px 15px",
                fontSize: "14px",
                cursor: "pointer",
                color: "#d32f2f",
                textAlign: "right",
                borderRadius: "6px",
                fontWeight: "bold",
              }}
            >
              התנתקות
            </button>
          </div>
        )}
      </nav>

      {/* Close dropdowns when clicking outside */}
      {(activeDropdown || showUserMenu) && (
        <div
          onClick={() => {
            setActiveDropdown(null);
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

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-button {
            display: flex !important;
          }
          .desktop-menu {
            display: none !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-menu {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
