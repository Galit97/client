import React, { useEffect, useState } from 'react';
import { Trash_24 } from '../components/Icons/WeddingIconsLibrary';
import { apiUrl } from '../utils/api';

type VendorStatus = 'Pending' | 'Confirmed' | 'Paid';
type VendorType = 'music' | 'food' | 'photography' | 'decor' | 'clothes' | 'makeup_hair' | 'internet_orders' | 'lighting_sound' | 'guest_gifts' | 'venue_deposit' | 'bride_dress' | 'groom_suit' | 'shoes' | 'jewelry' | 'rsvp' | 'design_tables' | 'bride_bouquet' | 'chuppah' | 'flowers' | 'other';

type Vendor = {
  _id: string;
  weddingID: string;
  vendorName: string;
  price: number;
  depositPaid: boolean;
  depositAmount: number;
  notes?: string;
  status: VendorStatus;
  type: VendorType;
};

type ExtraComparison = { id: string; name: string; price: number; notes: string; phone?: string; instagram?: string };

const allTypes: VendorType[] = [
  'photography',
  'music',
  'food',
  'decor',
  'clothes',
  'makeup_hair',
  'lighting_sound',
  'guest_gifts',
  'venue_deposit',
  'bride_dress',
  'groom_suit',
  'shoes',
  'jewelry',
  'rsvp',
  'design_tables',
  'bride_bouquet',
  'chuppah',
  'flowers',
  'internet_orders',
  'other',
];

const hebrewTypeMap: Record<VendorType, string> = {
  photography: 'צלם',
  music: 'דיג׳יי/מוזיקה',
  food: 'אוכל',
  decor: 'קישוט',
  clothes: 'בגדים',
  makeup_hair: 'איפור ושיער',
  lighting_sound: 'תאורה והגברה',
  guest_gifts: 'מתנות לאורחים',
  venue_deposit: 'מקדמה לאולם',
  bride_dress: 'שמלות כלה',
  groom_suit: 'חליפת חתן',
  shoes: 'נעליים',
  jewelry: 'תכשיטים',
  rsvp: 'אישורי הגעה',
  design_tables: 'עיצוב ושולחנות',
  bride_bouquet: 'זר כלה',
  chuppah: 'חופה',
  flowers: 'פרחים',
  internet_orders: 'הזמנות מקוונות',
  other: 'אחר',
};

export default function VendorComparisonPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<VendorType[]>([]);
  const [typeToAdd, setTypeToAdd] = useState<VendorType>('photography');
  const [extraComparisons, setExtraComparisons] = useState<Record<VendorType, ExtraComparison[]>>({} as Record<VendorType, ExtraComparison[]>);
  const [search, setSearch] = useState('');
  const [weddingId, setWeddingId] = useState<string>('');
  const [userId] = useState<string>('');
  const [noWeddingFound, setNoWeddingFound] = useState(false);

  useEffect(() => {
    async function init() {
      const token = localStorage.getItem('token');
      if (!token) { setLoading(false); return; }
      try {
        // Try to get wedding as owner first
        let weddingId = '';
        let wed = await fetch(apiUrl('/api/weddings/owner'), { headers: { Authorization: `Bearer ${token}` } });
        
        if (wed.ok) {
          const w = await wed.json();
          weddingId = w._id;
        } else {
          // If not owner, try as participant
          const participantWed = await fetch(apiUrl('/api/weddings/by-participant'), { headers: { Authorization: `Bearer ${token}` } });
          if (participantWed.ok) {
            const participantWeddings = await participantWed.json();
            if (participantWeddings.length > 0) {
              weddingId = participantWeddings[0]._id; // Use the first wedding they're participating in
            }
          }
        }
        
        if (weddingId) {
          setWeddingId(weddingId);
          
          // Load comparisons from server
          const comparisonsRes = await fetch(apiUrl(`/api/comparisons/vendor/${weddingId}`), { 
            headers: { Authorization: `Bearer ${token}` } 
          });
          if (comparisonsRes.ok) {
            const serverComparisons = await comparisonsRes.json();
            setExtraComparisons(serverComparisons);
            
            // Set selected types based on server data
            const keys = Object.keys(serverComparisons) as VendorType[];
            if (keys.length > 0) {
              setSelectedTypes(keys);
            }
          }
          
          // Load vendors for this wedding
          const res = await fetch(apiUrl('/api/vendors'), { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) setVendors(await res.json());
          else setVendors([]);
        } else {
          setVendors([]);
          setNoWeddingFound(true);
        }
      } catch (error) {
        console.error("Error loading vendor comparisons:", error);
        setVendors([]);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // removed seeding of default comparison rows

  // Removed manual save function and auto-save useEffect - now saving automatically when adding comparisons

  // keep selected types in sync with existing comparisons (and persist)
  useEffect(() => {
    if (!userId) return;
    const keys = Object.keys(extraComparisons) as VendorType[];
    if (keys.length > 0) {
      setSelectedTypes(keys);
    }
  }, [extraComparisons, userId]);





  const handleAddComparison = async (type: VendorType, entry: Omit<ExtraComparison, 'id'>) => {
    setExtraComparisons(prev => {
      const list = prev[type] || [];
      const id = `${type}-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      return { ...prev, [type]: [...list, { id, ...entry }] };
    });
    
    // Auto-save to server after adding
    try {
      const token = localStorage.getItem('token');
      if (!token || !weddingId) return;
      
      const updatedComparisons = {
        ...extraComparisons,
        [type]: [...(extraComparisons[type] || []), { id: `${type}-${Date.now()}-${Math.round(Math.random() * 1e6)}`, ...entry }]
      };
      
      const response = await fetch(apiUrl('/api/comparisons/vendor'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          weddingID: weddingId,
          comparisons: updatedComparisons
        }),
      });
      
      if (response.ok) {
      } else {
        console.error('Failed to save vendor comparison after adding:', await response.text());
      }
    } catch (error) {
      console.error("Error saving vendor comparison after adding:", error);
    }
  };

  const handleRemoveComparison = (type: VendorType, id: string) => {
    setExtraComparisons(prev => ({ ...prev, [type]: (prev[type] || []).filter(e => e.id !== id) }));
  };

  const filteredBySearch = <T extends { name: string }>(items: T[]) => {
    if (!search.trim()) return items;
    const term = search.trim().toLowerCase();
    return items.filter(i => i.name.toLowerCase().includes(term));
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>טוען...</div>
    );
  }

  if (noWeddingFound) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '18px', marginBottom: '20px', color: '#666' }}>
          לא נמצא חתונה עבורך
        </div>
        <div style={{ color: '#999' }}>
          עליך להיות בעל חתונה או משתתף בחתונה כדי לגשת להשוואת ספקים
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 1400, margin: '0 auto', direction: 'rtl' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 20 }}>השוואת מחירי ספקים</h1>

      <div className="toolbar" style={{ marginBottom: 16 }}>
        <div className="toolbar-grid">
          <div className="field">
            <label>חיפוש ספק לפי שם</label>
            <input className="input" placeholder="חפש ספק" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <AddToolbar 
            onAdd={(payload) => {
              if (!selectedTypes.includes(payload.type)) {
                setSelectedTypes(prev => [...prev, payload.type]);
              }
              const { type, ...entry } = payload;
              handleAddComparison(type, entry as any);
            }} 
            typeToAdd={typeToAdd} 
            setTypeToAdd={setTypeToAdd} 
          />
        </div>
      </div>

      <div className="card-grid">
        {selectedTypes.map(type => {
          const existing = vendors.filter(v => v.type === type).map(v => ({ id: v._id, name: v.vendorName, price: v.price, notes: v.notes || '', phone: undefined, instagram: undefined }));
          const extras = extraComparisons[type] || [];
          const rows = filteredBySearch([...existing, ...extras]);
          const minPrice = rows.length > 0 ? Math.min(...rows.map(r => r.price || 0)) : undefined;

          return (
            <div key={type} className="card">
              <div className="card-header">
                <div className="card-title">{hebrewTypeMap[type]}</div>
              </div>

              {rows.length === 0 ? (
                <div className="muted" style={{ marginBottom: 10 }}>אין ספקים להשוואה כרגע. הוסף ספק להשוואה.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1.5fr 2fr auto', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <div className="muted">שם ספק</div>
                  <div className="muted">מחיר (₪)</div>
                  <div className="muted">טלפון</div>
                  <div className="muted">אינסטגרם</div>
                  <div className="muted">הערות</div>
                  <div className="muted">פעולות</div>
                </div>
              )}

              {rows.map(r => (
                <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1.5fr 2fr auto', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontWeight: 600 }}>{r.name}</div>
                  <div style={{ color: r.price === minPrice ? '#2e7d32' : undefined, fontWeight: r.price === minPrice ? 700 : 400 }}>{r.price.toLocaleString()} ₪</div>
                  <div>{r.phone || '-'}</div>
                  <div>{r.instagram ? (<a href={r.instagram} target="_blank" rel="noreferrer">קישור</a>) : '-'}</div>
                  <div>{r.notes || '-'}</div>
                  <div>
                    {extras.find(e => e.id === r.id) ? (
                      <button className="btn-icon" title="הסר" onClick={() => handleRemoveComparison(type, r.id)}>
                        <Trash_24 style={{ width: '16px', height: '16px' }} />
                      </button>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </div>
                </div>
              ))}

              {/* Add extra comparison row - only after at least one exists */}
              {rows.length > 0 ? (
                <AddComparisonForm onAdd={(entry) => handleAddComparison(type, entry)} />
              ) : (
                <div className="muted">הוסף ספק ראשון בעזרת הסרגל למעלה כדי להוסיף הצעות נוספות.</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AddComparisonForm({ onAdd }: { onAdd: (entry: { name: string; price: number; notes: string; phone?: string; instagram?: string }) => void }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');

  const canAdd = name.trim() && typeof price === 'number' && price >= 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAdd) return;
    onAdd({ name: name.trim(), price: Number(price), notes: notes.trim(), phone: phone.trim() || undefined, instagram: instagram.trim() || undefined });
    setName('');
    setPrice('');
    setNotes('');
    setPhone('');
    setInstagram('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 8 }}>
      <div className="card-row">
        <div className="field">
          <label>שם ספק להשוואה</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="שם הספק" />
        </div>
        <div className="field">
          <label>מחיר (₪)</label>
          <input className="input" type="number" min={0} value={price} onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0" />
        </div>
      </div>
      <div className="card-row">
        <div className="field">
          <label>טלפון</label>
          <input className="input" value={phone} onChange={e => setPhone(e.target.value)}  />
        </div>
        <div className="field">
          <label>אינסטגרם</label>
          <input className="input" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="https://instagram.com/example" />
        </div>
      </div>
      <div className="field" style={{ marginTop: 8 }}>
        <label>הערות</label>
        <input className="input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="פרטים/תנאים מיוחדים" />
      </div>
      <div style={{ marginTop: 8 }}>
        <button className="btn btn-primary" type="submit" disabled={!canAdd}>הוסף להשוואה</button>
      </div>
    </form>
  );
}

function AddToolbar({ onAdd, typeToAdd, setTypeToAdd }: { onAdd: (payload: { type: VendorType; name: string; price: number; notes: string; phone?: string; instagram?: string }) => void; typeToAdd: VendorType; setTypeToAdd: (t: VendorType) => void }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const canAdd = name.trim() && typeof price === 'number' && price >= 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAdd) return;
    onAdd({ type: typeToAdd, name: name.trim(), price: Number(price), notes: notes.trim(), phone: phone.trim() || undefined, instagram: instagram.trim() || undefined });
    setName(''); setPrice(''); setNotes(''); setPhone(''); setInstagram('');
  };

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
      <div className="field">
        <label>הוסף ספק להשוואה</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1.5fr 2fr auto', gap: 8 }}>
          <select className="select" value={typeToAdd} onChange={(e) => setTypeToAdd(e.target.value as VendorType)}>
            {allTypes.map(t => (
              <option key={t} value={t}>{hebrewTypeMap[t]}</option>
            ))}
          </select>
          <input className="input" placeholder="שם ספק" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" type="number" min={0} placeholder="מחיר" value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} />
          <input className="input" placeholder="טלפון" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className="input" placeholder="קישור אינסטגרם" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
          <button className="btn btn-primary" type="submit" disabled={!canAdd}>הוסף</button>
        </div>
      </div>
      <div className="field">
        <label>הערות</label>
        <input className="input" placeholder="פרטים/תנאים" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
    </form>
  );
}

