import React, { useEffect, useState } from 'react';

type ChecklistItem = {
  _id: string;
  task: string;
  done: boolean;
  notes?: string;
  dueDate?: string;
  relatedVendorId?: string;
  relatedRoleId?: string;
};

type Vendor = {
  _id: string;
  vendorName: string;
};

type User = {
  _id: string;
  firstName: string;
  lastName: string;
};

export default function CheckListPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [newTask, setNewTask] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newRelatedVendorId, setNewRelatedVendorId] = useState('');
  const [newRelatedRoleId, setNewRelatedRoleId] = useState('');

  useEffect(() => {
    async function fetchChecklist() {
      const res = await fetch('/api/checklists');
      if (!res.ok) {
        alert('שגיאה בטעינת צ\'קליסט');
        return;
      }
      const data = await res.json();
      setItems(data);
    }

    async function fetchVendors() {
      const res = await fetch('/api/vendors');
      if (!res.ok) {
        alert('שגיאה בטעינת ספקים');
        return;
      }
      const data = await res.json();
      setVendors(data);
    }

    async function fetchUsers() {
      const res = await fetch('/api/users');
      if (!res.ok) {
        alert('שגיאה בטעינת משתמשים');
        return;
      }
      const data = await res.json();
      setUsers(data);
    }

    fetchChecklist();
    fetchVendors();
    fetchUsers();
  }, []);

  async function toggleDone(id: string) {
    const item = items.find(i => i._id === id);
    if (!item) return;

    const res = await fetch(`/api/checklists/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !item.done }),
    });

    if (!res.ok) {
      alert('שגיאה בעדכון המשימה');
      return;
    }

    setItems(items.map(i => i._id === id ? { ...i, done: !i.done } : i));
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return alert('יש להזין משימה');

    const res = await fetch('/api/checklists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: newTask,
        notes: newNotes,
        dueDate: newDueDate || undefined,
        relatedVendorId: newRelatedVendorId || undefined,
        relatedRoleId: newRelatedRoleId || undefined,
      }),
    });

    if (!res.ok) {
      alert('שגיאה ביצירת המשימה');
      return;
    }

    const created = await res.json();
    setItems([...items, created]);

    setNewTask('');
    setNewNotes('');
    setNewDueDate('');
    setNewRelatedVendorId('');
    setNewRelatedRoleId('');
  }

  async function deleteTask(id: string) {
    const res = await fetch(`/api/checklists/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      alert('שגיאה במחיקת המשימה');
      return;
    }
    setItems(items.filter(i => i._id !== id));
  }

  return (
    <div>
      <h1>צ׳קליסט</h1>

      <form onSubmit={addTask} style={{ marginBottom: 20 }}>
        <input
          placeholder="משימה חדשה"
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          required
        />
        <input
          placeholder="הערות"
          value={newNotes}
          onChange={e => setNewNotes(e.target.value)}
        />
        <input
          type="date"
          value={newDueDate}
          onChange={e => setNewDueDate(e.target.value)}
        />

        <select
          value={newRelatedVendorId}
          onChange={e => setNewRelatedVendorId(e.target.value)}
        >
          <option value="">בחר ספק קשור (אופציונלי)</option>
          {vendors.map(v => (
            <option key={v._id} value={v._id}>
              {v.vendorName}
            </option>
          ))}
        </select>

        {/* Dropdown למשתמשים / תפקידים */}
        <select
          value={newRelatedRoleId}
          onChange={e => setNewRelatedRoleId(e.target.value)}
        >
          <option value="">בחר תפקיד קשור (אופציונלי)</option>
          {users.map(u => (
            <option key={u._id} value={u._id}>
              {u.firstName} {u.lastName}
            </option>
          ))}
        </select>

        <button type="submit">הוסף</button>
      </form>

      <ul>
        {items.map(item => (
          <li
            key={item._id}
            style={{
              textDecoration: item.done ? 'line-through' : 'none',
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => toggleDone(item._id)}
            />
            <div style={{ flexGrow: 1 }}>
              <strong>{item.task}</strong>
              {item.notes && ` - ${item.notes}`}
              {item.dueDate && ` (לתאריך ${item.dueDate.slice(0, 10)})`}
              {item.relatedVendorId && (
                <div>ספק קשור: {vendors.find(v => v._id === item.relatedVendorId)?.vendorName || item.relatedVendorId}</div>
              )}
              {item.relatedRoleId && (
                <div>תפקיד קשור: {users.find(u => u._id === item.relatedRoleId)?.firstName} {users.find(u => u._id === item.relatedRoleId)?.lastName}</div>
              )}
            </div>
            <button onClick={() => deleteTask(item._id)}>מחק</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
