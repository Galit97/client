import React, { useEffect, useState } from 'react';

export default function AccountSettings() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [userId, setUserId] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const currentUserRaw = localStorage.getItem('currentUser');
    if (currentUserRaw) {
      try {
        const u = JSON.parse(currentUserRaw);
        setUserId(u._id);
        setForm({ firstName: u.firstName || '', lastName: u.lastName || '', email: u.email || '', phone: u.phone || '', password: '' });
      } catch {}
    }
  }, []);

  async function save() {
    if (!userId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          ...(form.password ? { passwordHash: form.password } : {}),
        }),
      });
      if (!res.ok) throw new Error('failed');
      const updated = await res.json();
      localStorage.setItem('currentUser', JSON.stringify(updated));
      alert('פרטי המשתמש נשמרו');
    } catch {
      alert('שמירה נכשלה');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ direction: 'rtl', maxWidth: 600, margin: '0 auto' }}>
      <h2>הגדרות משתמש</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        <div>
          <label>שם פרטי</label>
          <input className="input" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
        </div>
        <div>
          <label>שם משפחה</label>
          <input className="input" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
        </div>
        <div>
          <label>אימייל</label>
          <input className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label>טלפון</label>
          <input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label>סיסמה (החלפה)</label>
          <input className="input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        </div>
        <div>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'שומר...' : 'שמור'}</button>
        </div>
      </div>
    </div>
  );
}

