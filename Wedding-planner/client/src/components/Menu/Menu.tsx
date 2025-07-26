import React from "react";

type MenuItem = {
  id: string;
  label: string;
  onClick: () => void;
};

type Props = {
  onSelect: (section: string) => void;
  currentUserName: string | null;
};

export default function Menu({ onSelect, currentUserName }: Props) {
  const menuItems: MenuItem[] = [
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
                    background: "none",
                    border: "none",
                    padding: "0 10px",
                    fontSize: "16px",
                    cursor: "pointer",
                    color: "black",
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
