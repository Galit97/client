import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'accepting' | 'success' | 'error' | 'login'>('idle');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    async function accept() {
      const auth = localStorage.getItem('token');
      if (!auth) { setStatus('login'); return; }
      try {
        setStatus('accepting');
        const res = await fetch(`/api/weddings/invites/accept/${token}`, { method: 'POST', headers: { Authorization: `Bearer ${auth}` } });
        if (!res.ok) {
          const text = await res.text();
          setStatus('error'); setMessage(text || 'Failed to accept invite');
          return;
        }
        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 1200);
      } catch (e: any) {
        setStatus('error'); setMessage(e?.message || 'Error');
      }
    }
    if (token) accept();
  }, [token]);

  if (status === 'login') {
    return (
      <div style={{ padding: 40, textAlign: 'center', direction: 'rtl' }}>
        <h2>כדי להצטרף כאדמין לאירוע יש להתחבר או להירשם</h2>
        <button onClick={() => navigate('/')} style={{ padding: '10px 16px' }}>עבור למסך הראשי</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, textAlign: 'center', direction: 'rtl' }}>
      {status === 'accepting' && <h2>מצטרף לאירוע...</h2>}
      {status === 'success' && <h2>מצטרפת/מצטרף לאירוע בהצלחה! מעביר למסך הבית...</h2>}
      {status === 'error' && (
        <>
          <h2>שגיאה בהצטרפות</h2>
          <div style={{ color: '#f44336' }}>{message}</div>
        </>
      )}
    </div>
  );
}

