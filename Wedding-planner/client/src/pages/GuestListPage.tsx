import React, { useEffect, useState } from 'react';

type GuestStatus = 'Invited' | 'Confirmed' | 'Declined' | 'Arrived';

type Guest = {
  _id: string;
  weddingID: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: GuestStatus;
  seatsReserved: number;
  tableNumber?: number;
  invitationSent: boolean;
};

export default function GuestListPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [newGuest, setNewGuest] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    seatsReserved: 1,
  });

  useEffect(() => {
    async function fetchGuests() {
      const res = await fetch('/api/guests'); 
      const data = await res.json();
      setGuests(data);
    }
    fetchGuests();
  }, []);

  async function addGuest(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGuest),
    });
    const created = await res.json();
    setGuests([...guests, created]);
    setNewGuest({ firstName: '', lastName: '', phone: '', seatsReserved: 1 });
  }

  async function updateStatus(id: string, status: GuestStatus) {
    await fetch(`/api/guests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setGuests(guests.map(g => (g._id === id ? { ...g, status } : g)));
  }

  async function deleteGuest(id: string) {
    await fetch(`/api/guests/${id}`, { method: 'DELETE' });
    setGuests(guests.filter(g => g._id !== id));
  }

  return (
    <div>
      <h1>רשימת מוזמנים</h1>

      <form onSubmit={addGuest}>
        <input
          placeholder="שם פרטי"
          value={newGuest.firstName}
          onChange={e => setNewGuest({ ...newGuest, firstName: e.target.value })}
          required
        />
        <input
          placeholder="שם משפחה"
          value={newGuest.lastName}
          onChange={e => setNewGuest({ ...newGuest, lastName: e.target.value })}
          required
        />
        <input
          placeholder="טלפון"
          value={newGuest.phone}
          onChange={e => setNewGuest({ ...newGuest, phone: e.target.value })}
        />
        <input
          type="number"
          min={1}
          placeholder="מספר מקומות שמורים"
          value={newGuest.seatsReserved}
          onChange={e =>
            setNewGuest({ ...newGuest, seatsReserved: Number(e.target.value) })
          }
          required
        />
        <button type="submit">הוסף מוזמן</button>
      </form>

      <ul>
        {guests.map(guest => (
          <li key={guest._id}>
            {guest.firstName} {guest.lastName} - סטטוס:
            <select
              value={guest.status}
              onChange={e => updateStatus(guest._id, e.target.value as GuestStatus)}
            >
              <option value="Invited">הוזמן</option>
              <option value="Confirmed">אושר</option>
              <option value="Declined">נדחה</option>
              <option value="Arrived">הגיע</option>
            </select>
            <button onClick={() => deleteGuest(guest._id)}>מחק</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
