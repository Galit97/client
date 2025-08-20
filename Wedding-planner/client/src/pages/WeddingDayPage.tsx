import React, { useEffect, useState } from 'react';

type WDItem = { id: string; text: string; done?: boolean };

const DEFAULTS: string[] = [
  'טבעות',
  'תעודות זהות (של שניכם)',
  'כסף מזומן לטיפים (בכמה מעטפות נפרדות)',
  'נעליים נוחות להחלפה',
  'ערכת תיקונים (סיכות ביטחון, חוט ומחט, פלסטרים)',
  'דאודורנט',
  'מגבונים (רגילים / לחים)',
  'בושם',
  'מטען / סוללה ניידת',
  'ליפסטיק / גלוס',
  'מים',
  'נשנוש קל (פירות יבשים, חטיף אנרגיה)',
  'מגבת קטנה / טישו לניגוב זיעה',
  'סיכות לשיער / גומיות',
  'מסרק קטן',
  'תרופות אישיות (משכך כאבים, כדור נגד צרבת וכו’)',
  'כפכפים / סנדלים להחלפה בסוף האירוע',
  'משקפי שמש לצילומים בחוץ',
  'צעיף / של קליל (אם יהיה קר בערב)',
  'משקפי ראייה / עדשות רזרבה אם צריך',
  'קליפס/קלאמר לשיער אם תרצי לשנות תסרוקת',
  'בגד נוסף להחלפה בסוף האירוע'
];

export default function WeddingDayPage() {
  const [items, setItems] = useState<WDItem[]>([]);
  const [newText, setNewText] = useState('');

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('token');
      if (!token) {
        setItems(DEFAULTS.map((t, i) => ({ id: `d-${i}`, text: t, done: false })));
        return;
      }
      try {
        const res = await fetch('/api/lists/weddingDay', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          const arr = (data.items && Array.isArray(data.items) && data.items.length > 0)
            ? data.items
            : DEFAULTS.map((t, i) => ({ id: `d-${i}`, text: t, done: false }));
          setItems(arr);
        }
      } catch {
        setItems(DEFAULTS.map((t, i) => ({ id: `d-${i}`, text: t, done: false })));
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function save() {
      const token = localStorage.getItem('token');
      if (!token) return;
      await fetch('/api/lists/weddingDay', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items }),
      });
    }
    if (items.length > 0) save();
  }, [items]);

  function add() {
    const text = newText.trim();
    if (!text) return;
    setItems(prev => [...prev, { id: `${Date.now()}`, text, done: false }]);
    setNewText('');
  }
  function toggle(id: string) {
    setItems(prev => prev.map(it => (it.id === id ? { ...it, done: !it.done } : it)));
  }
  function update(id: string, text: string) {
    setItems(prev => prev.map(it => (it.id === id ? { ...it, text } : it)));
  }
  function remove(id: string) {
    setItems(prev => prev.filter(it => it.id !== id));
  }

  return (
    <div style={{ direction: 'rtl', maxWidth: 900, margin: '0 auto' }}>
      <h2>יום החתונה</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <input className="input" placeholder="הוסף פריט" value={newText} onChange={e => setNewText(e.target.value)} />
        <button className="btn btn-primary" onClick={add}>הוסף</button>
      </div>
      <div className="card">
        {items.length === 0 ? (
          <div className="muted">אין פריטים ברשימה</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {items.map(it => (
              <li key={it.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 8, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #E5E7EB' }}>
                <input type="checkbox" checked={!!it.done} onChange={() => toggle(it.id)} />
                <input className="input" value={it.text} onChange={e => update(it.id, e.target.value)} />
                <button className="btn-icon" title="מחק" onClick={() => remove(it.id)}>🗑️</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

