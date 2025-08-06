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
    { id: "wedding", label: "האירוע שלנו", onClick: () => onSelect("wedding") },
    { id: "checklist", label: "צ׳קליסט", onClick: () => onSelect("checklist") },
    { id: "budget", label: "ניהול תקציב", onClick: () => onSelect("budget") },
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
        <span
          style={{ fontWeight: "bold", fontSize: "16px", marginLeft: "20px" }}
        >
          שלום, {currentUserName}
        </span>
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
                    background: currentSection === item.id ? "#e3f2fd" : "none",
                    border: currentSection === item.id ? "2px solid #2196F3" : "none",
                    padding: "0 10px",
                    fontSize: "16px",
                    cursor: "pointer",
                    color: currentSection === item.id ? "#1976D2" : "black",
                    borderRadius: currentSection === item.id ? "4px" : "0",
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
