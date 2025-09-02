import { useEffect, useState } from 'react';
import { useNotification } from '../../components/Notification/NotificationContext';
import { apiUrl } from '../../utils/api';

export default function AccountSettings() {
  const { showNotification } = useNotification();
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
      const res = await fetch(apiUrl(`/api/users/${userId}`), {
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
      showNotification('פרטי המשתמש נשמרו בהצלחה!', 'success');
      // Clear the password field after successful save
      setForm(prev => ({ ...prev, password: '' }));
    } catch {
      showNotification('שמירה נכשלה', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ direction: 'rtl', maxWidth: 600, margin: '0 auto', padding: '20px' }}>
      <h2 style={{ color: '#0F172A', marginBottom: '20px' }}>הגדרות משתמש</h2>
      <div style={{ display: 'grid', gap: 16 }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>שם פרטי</label>
          <input 
            className="input" 
            value={form.firstName} 
            onChange={e => setForm({ ...form, firstName: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '4px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>שם משפחה</label>
          <input 
            className="input" 
            value={form.lastName} 
            onChange={e => setForm({ ...form, lastName: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '4px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>אימייל</label>
          <input 
            className="input" 
            value={form.email} 
            onChange={e => setForm({ ...form, email: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '4px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>טלפון</label>
          <input 
            className="input" 
            value={form.phone} 
            onChange={e => setForm({ ...form, phone: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '4px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>סיסמה חדשה (השאר ריק אם לא רוצה לשנות)</label>
          <input 
            className="input" 
            type="password" 
            value={form.password} 
            onChange={e => setForm({ ...form, password: e.target.value })}
            placeholder="הכנס סיסמה חדשה או השאר ריק"
            style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '4px' }}
          />
        </div>
        <div>
          <button 
            className="save-btn" 
            onClick={save} 
            disabled={saving}
          >
            {saving ? 'שומר...' : 'שמור שינויים'}
          </button>
        </div>
      </div>
    </div>
  );
}

