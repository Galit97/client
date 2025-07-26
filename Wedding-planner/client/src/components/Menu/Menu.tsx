import React, { useState } from 'react';

type MenuItem = {
  id: string;
  label: string;
  onClick: () => void;
};

type Props = {
  onSelect: (section: string) => void;
};

export default function Menu({ onSelect }: Props) {
  const menuItems: MenuItem[] = [
    { id: 'guestList', label: 'רשימת מוזמנים', onClick: () => onSelect('guestList') },
    { id: 'vendorsList', label: 'ניהול ספקים', onClick: () => onSelect('vendorsList') },
    { id: 'wedding', label: 'האירוע שלנו', onClick: () => onSelect('wedding') },
    { id: 'checklist', label: 'צ\'קליסט', onClick: () => onSelect('checklist') },
  ];

  return (
    <nav>
      <ul>
        {menuItems.map(item => (
          <li key={item.id}>
            <button onClick={item.onClick}>{item.label}</button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
