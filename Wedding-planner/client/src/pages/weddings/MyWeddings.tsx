import { useEffect, useState } from 'react';
import { apiUrl } from '../../utils/api';

type WeddingLite = { _id: string; weddingName?: string; weddingDate?: string };

export default function MyWeddings({ onOpenWedding }: { onOpenWedding: (id: string) => void }) {
  const [participating, setParticipating] = useState<WeddingLite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      const token = localStorage.getItem('token');
      if (!token) { setLoading(false); return; }
      try {
        // events by participant/co-owner
        const partRes = await fetch(apiUrl('/api/weddings/by-participant'), { headers: { Authorization: `Bearer ${token}` } });
        if (partRes.ok) {
          const data = await partRes.json();
          setParticipating(Array.isArray(data) ? data : (data ? [data] : []));
        }
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (loading) return <div style={{ padding: 20, direction: 'rtl' }}>טוען...</div>;

  function open(id: string) {
    localStorage.setItem('activeWeddingId', id);
    onOpenWedding(id);
  }

  return (
    <div style={{ direction: 'rtl', maxWidth: 900, margin: '0 auto' }}>
      <h2>האירועים שלי</h2>
      <section>
        <h3>אני שותף/בעלים-משותף</h3>
        {participating.length === 0 ? (
          <div className="muted">אין אירועים משותפים</div>
        ) : (
          <div className="card-grid">
            {participating.map(w => (
              <div key={w._id} className="card">
                <div className="card-title">{w.weddingName || 'אירוע ללא שם'}</div>
                <div className="muted">{w.weddingDate ? new Date(w.weddingDate).toLocaleDateString('he-IL') : '-'}</div>
                <button className="btn btn-primary" onClick={() => open(w._id)}>פתח</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

