import React from "react";

type MenuItem = {
  id: string;
  label: string;
  onClick: () => void;
};

type Props = {
  onSelect: (section: string) => void;
  currentUserName: string | null;
  currentSection: string;
};

export default function Menu({ onSelect, currentUserName, currentSection }: Props) {
  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "דשבורד",
      onClick: () => onSelect("dashboard"),
    },
    {
      id: "guestList",
      label: "רשימת מוזמנים",
      onClick: () => onSelect("guestList"),
    },
    {
      id: "vendorsList",
      label: "ניהול ספקים",
      onClick: () => onSelect("vendorsList"),
    },
    {
      id: "vendorsCompare",
      label: "השוואת מחירי ספקים",
      onClick: () => onSelect("vendorsCompare"),
    },
    { id: "wedding", label: "האירוע שלנו", onClick: () => onSelect("wedding") },
    { id: "checklist", label: "צ׳קליסט", onClick: () => onSelect("checklist") },
    { id: "budget", label: "ניהול תקציב", onClick: () => onSelect("budget") },
    { id: "importantThings", label: "דברים שחשוב לי", onClick: () => onSelect("importantThings") },
    { id: "weddingDay", label: "יום החתונה", onClick: () => onSelect("weddingDay") },
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        direction: "rtl",
      }}
    >
      {/* שם המשתמש */}
      {currentUserName && (
        <div style={{ position: 'relative', marginLeft: '20px' }}>
          <details>
            <summary style={{ listStyle: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
              שלום, {currentUserName}
            </summary>
            <div style={{ position: 'absolute', right: 0, background: 'white', border: '1px solid #ddd', borderRadius: 6, marginTop: 6, minWidth: 160, zIndex: 10 }}>
              <button onClick={() => onSelect('accountSettings')} style={{ display: 'block', width: '100%', textAlign: 'right', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer' }}>הגדרות משתמש</button>
              <button onClick={() => onSelect('myWeddings')} style={{ display: 'block', width: '100%', textAlign: 'right', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer' }}>האירועים שלי</button>
            </div>
          </details>
        </div>
      )}

      {/* התפריט */}
      <nav>
        <ul
          style={{
            display: "flex",
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
        >
          {menuItems.map((item, idx) => (
            <React.Fragment key={item.id}>
              <li>
                                 <button
                   onClick={item.onClick}
                   style={{
                     background: "none",
                     border: "none",
                     padding: "0 10px",
                     fontSize: "16px",
                     cursor: "pointer",
                     color: "black",
                     fontWeight: currentSection === item.id ? "bold" : "normal",
                   }}
                 >
                  {item.label}
                </button>
              </li>
              {idx < menuItems.length - 1 && (
                <li style={{ padding: "0 5px", color: "black" }}>|</li>
              )}
            </React.Fragment>
          ))}
        </ul>
      </nav>
    </div>
  );
}
