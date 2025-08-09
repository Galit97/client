import React, { useEffect, useState } from 'react';

type Item = { _id?: string; text: string; done?: boolean };

export default function ImportantThingsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('token');
      if (!token) { setLoading(false); return; }
      try {
        const res = await fetch('/api/lists/importantThings', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setItems(data.items || []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function save() {
      const token = localStorage.getItem('token');
      if (!token) return;
      await fetch('/api/lists/importantThings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items }),
      });
    }
    if (!loading) save();
  }, [items, loading]);

  function add() {
    const text = newText.trim();
    if (!text) return;
    setItems(prev => [...prev, { text, done: false }]);
    setNewText('');
  }

  function update(idx: number, text: string) {
    setItems(prev => prev.map((it, i) => (i === idx ? { ...it, text } : it)));
  }

  function toggle(idx: number) {
    setItems(prev => prev.map((it, i) => (i === idx ? { ...it, done: !it.done } : it)));
  }

  function remove(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }

  if (loading) return <div style={{ padding: 20, direction: 'rtl' }}>טוען...</div>;

  return (
    <div style={{ direction: 'rtl', maxWidth: 800, margin: '0 auto' }}>
      <h2>דברים שחשוב לי שיהיו בחתונה</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input className="input" placeholder="הוסף פריט" value={newText} onChange={e => setNewText(e.target.value)} />
        <button className="btn btn-primary" onClick={add}>הוסף</button>
      </div>
      <div className="card">
        {items.length === 0 ? (
          <div className="muted">אין פריטים עדיין</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {items.map((it, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <input type="checkbox" checked={!!it.done} onChange={() => toggle(idx)} />
                <input className="input" value={it.text} onChange={e => update(idx, e.target.value)} />
                <button className="btn-icon" title="מחק" onClick={() => remove(idx)}>🗑️</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

