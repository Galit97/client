import React, { useEffect, useState } from 'react';
// @ts-ignore
import * as XLSX from 'xlsx';

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

type EditingGuest = {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  seatsReserved: number;
  tableNumber: number;
};

export default function GuestListPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [weddingId, setWeddingId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [editingGuest, setEditingGuest] = useState<EditingGuest | null>(null);
  const [newGuest, setNewGuest] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    seatsReserved: 1,
    tableNumber: 0,
  });

  // Excel functions
  const downloadTemplate = () => {
    const templateData = [
      {
        'שם פרטי': 'דוגמה',
        'שם משפחה': 'כהן',
        'מספר טלפון': '050-1234567',
        'מספר מקומות שמורים': 2,
        'מספר שולחן': 5,
        'סטטוס הזמנה': 'הוזמן'
      },
      {
        'שם פרטי': 'דוגמה',
        'שם משפחה': 'לוי',
        'מספר טלפון': '052-9876543',
        'מספר מקומות שמורים': 1,
        'מספר שולחן': 3,
        'סטטוס הזמנה': 'אושר'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'רשימת מוזמנים');
    
    // Set column widths
    ws['!cols'] = [
      { width: 15 }, // שם פרטי
      { width: 15 }, // שם משפחה
      { width: 15 }, // מספר טלפון
      { width: 20 }, // מספר מקומות שמורים
      { width: 15 }, // מספר שולחן
      { width: 15 }  // סטטוס הזמנה
    ];

    XLSX.writeFile(wb, 'תבנית_רשימת_מוזמנים.xlsx');
  };

  const exportToExcel = () => {
    if (guests.length === 0) {
      alert('אין מוזמנים לייצא');
      return;
    }

    const exportData = guests.map(guest => ({
      'שם פרטי': guest.firstName,
      'שם משפחה': guest.lastName,
      'מספר טלפון': guest.phone || '',
      'מספר מקומות שמורים': guest.seatsReserved,
      'מספר שולחן': guest.tableNumber || '',
      'סטטוס הזמנה': getStatusText(guest.status)
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'רשימת מוזמנים');
    
    // Set column widths
    ws['!cols'] = [
      { width: 15 }, // שם פרטי
      { width: 15 }, // שם משפחה
      { width: 15 }, // מספר טלפון
      { width: 20 }, // מספר מקומות שמורים
      { width: 15 }, // מספר שולחן
      { width: 15 }  // סטטוס הזמנה
    ];

    XLSX.writeFile(wb, `רשימת_מוזמנים_${new Date().toLocaleDateString('he-IL')}.xlsx`);
  };

  const importFromExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        alert('הקובץ ריק או לא מכיל נתונים תקינים');
        return;
      }

      const importedGuests = jsonData.map((row: any, guest: any) => ({
        firstName: row['שם פרטי'] || row['firstName'] || '',
        lastName: row['שם משפחה'] || row['lastName'] || '',
        phone: row['מספר טלפון'] || row['phone'] || '',
        seatsReserved: parseInt(row['מספר מקומות שמורים'] || row['seatsReserved'] || '1'),
        tableNumber: parseInt(row['מספר שולחן'] || row['tableNumber'] || '0'),
        status: getStatusFromText(row['סטטוס הזמנה'] || row['status'] || 'הוזמן') as GuestStatus
      }));

      // Validate data
      const validGuests = importedGuests.filter(guest => 
        guest.firstName.trim() && guest.lastName.trim() && guest.seatsReserved > 0
      );

      if (validGuests.length === 0) {
        alert('לא נמצאו נתונים תקינים בקובץ');
        return;
      }

      if (validGuests.length !== importedGuests.length) {
        alert(`יובאו ${validGuests.length} מוזמנים מתוך ${importedGuests.length} (חלק מהשורות לא היו תקינות)`);
      }

      // Add guests to database
      await addMultipleGuests(validGuests);
      
      // Clear file input
      event.target.value = '';
      
    } catch (error) {
      console.error('Error importing Excel:', error);
      alert('שגיאה בייבוא הקובץ. אנא ודא שהקובץ בפורמט Excel תקין');
    }
  };

  const addMultipleGuests = async (guestsToAdd: any[]) => {
    const token = localStorage.getItem("token");
    if (!token || !weddingId) return;

    let successCount = 0;
    let errorCount = 0;

    for (const guestData of guestsToAdd) {
      try {
        const res = await fetch('/api/guests', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...guestData,
            weddingID: weddingId,
            invitationSent: false,
          }),
        });

        if (res.ok) {
          const created = await res.json();
          setGuests(prev => [...prev, created]);
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error('Error adding guest:', error);
        errorCount++;
      }
    }

    if (successCount > 0) {
      alert(`יובאו בהצלחה ${successCount} מוזמנים${errorCount > 0 ? ` (${errorCount} שגיאות)` : ''}`);
    } else {
      alert('לא הצלחנו לייבא אף מוזמן. אנא נסה שוב');
    }
  };

  const getStatusFromText = (statusText: string): GuestStatus => {
    switch (statusText) {
      case 'אושר':
      case 'Confirmed':
        return 'Confirmed';
      case 'נדחה':
      case 'Declined':
        return 'Declined';
      case 'הגיע':
      case 'Arrived':
        return 'Arrived';
      default:
        return 'Invited';
    }
  };

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        setLoading(false);
        return;
      }

      try {
        console.log("Starting to fetch data...");
        
        // First, get the user's wedding
        const weddingRes = await fetch('/api/weddings/owner', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Wedding response status:", weddingRes.status);

        if (weddingRes.status === 404) {
          console.log("No wedding found for user");
          setLoading(false);
          return;
        }

        if (!weddingRes.ok) {
          throw new Error("Failed to fetch wedding");
        }

        const weddingData = await weddingRes.json();
        setWeddingId(weddingData._id);
        console.log("Found wedding ID:", weddingData._id);

        // Then fetch guests for this wedding
        console.log("Fetching guests for wedding:", weddingData._id);
        const guestsRes = await fetch('/api/guests', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Guests response status:", guestsRes.status);
        console.log("Guests response headers:", guestsRes.headers);

        if (guestsRes.ok) {
          const guestsData = await guestsRes.json();
          setGuests(guestsData);
          console.log("Fetched guests:", guestsData);
        } else {
          const errorText = await guestsRes.text();
          console.log("Error response:", errorText);
          console.log("No guests found or error fetching guests");
          setGuests([]);
        }



      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  async function addGuest(e: React.FormEvent) {
    e.preventDefault();
    if (!weddingId) {
      alert("לא נמצא אירוע. אנא צור אירוע קודם.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("לא מזוהה משתמש מחובר");
      return;
    }

    try {
      const guestData = {
        ...newGuest,
        weddingID: weddingId,
        status: 'Invited' as GuestStatus,
        invitationSent: false,
      };

      console.log("Adding guest:", guestData);

      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(guestData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error adding guest:", errorText);
        alert("שגיאה בהוספת מוזמן");
        return;
      }

      const created = await res.json();
      console.log("Guest created:", created);
      setGuests([...guests, created]);
      setNewGuest({ firstName: '', lastName: '', phone: '', seatsReserved: 1, tableNumber: 0 });
    } catch (error) {
      console.error("Error adding guest:", error);
      alert("שגיאה בהוספת מוזמן");
    }
  }

  async function updateStatus(id: string, status: GuestStatus) {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/guests/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setGuests(guests.map(g => (g._id === id ? { ...g, status } : g)));
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  }

  async function updateGuest(guestData: EditingGuest) {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/guests/${guestData._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(guestData),
      });

      if (res.ok) {
        const updated = await res.json();
        setGuests(guests.map(g => (g._id === guestData._id ? updated : g)));
        setEditingGuest(null);
      }
    } catch (error) {
      console.error("Error updating guest:", error);
    }
  }

  async function deleteGuest(id: string) {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!confirm("האם אתה בטוח שברצונך למחוק מוזמן זה?")) return;

    try {
      const res = await fetch(`/api/guests/${id}`, { 
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setGuests(guests.filter(g => g._id !== id));
      }
    } catch (error) {
      console.error("Error deleting guest:", error);
    }
  }

  function startEditing(guest: Guest) {
    setEditingGuest({
      _id: guest._id,
      firstName: guest.firstName,
      lastName: guest.lastName,
      phone: guest.phone || '',
      seatsReserved: guest.seatsReserved,
      tableNumber: guest.tableNumber || 0,
    });
  }

  function cancelEditing() {
    setEditingGuest(null);
  }

  function getStatusColor(status: GuestStatus) {
    switch (status) {
      case 'Invited': return '#ffd700';
      case 'Confirmed': return '#90EE90';
      case 'Declined': return '#ff6b6b';
      case 'Arrived': return '#4CAF50';
      default: return '#ddd';
    }
  }

  function getStatusText(status: GuestStatus) {
    switch (status) {
      case 'Invited': return 'הוזמן';
      case 'Confirmed': return 'אושר';
      case 'Declined': return 'נדחה';
      case 'Arrived': return 'הגיע';
      default: return status;
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>טוען...</div>
      </div>
    );
  }

  if (!weddingId) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>לא נמצא אירוע</h2>
        <p>אנא צור אירוע קודם כדי להוסיף מוזמנים</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
      direction: 'rtl'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        color: '#333',
        borderBottom: '2px solid #ddd',
        paddingBottom: '10px'
      }}>
        רשימת מוזמנים
      </h1>

      {/* Help Section */}
      <div style={{
        background: '#e3f2fd',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #2196F3'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>💡 איך להשתמש ברשימת המוזמנים:</h4>
        <div style={{ fontSize: '14px', lineHeight: '1.5', color: '#333' }}>
          <div><strong>מספר מקומות שמורים:</strong> כמה אנשים יגיעו עם המוזמן (לדוגמה: אם הזמנת זוג, הכנס 2)</div>
          <div><strong>מספר שולחן:</strong> אופציונלי - לשיבוץ בשולחנות (לדוגמה: שולחן מספר 5)</div>
          <div><strong>סטטוס הזמנה:</strong> הוזמן → אושר → הגיע (או נדחה אם המוזמן לא יכול להגיע)</div>
        </div>
      </div>

      {/* Excel Import/Export Section */}
      <div style={{
        background: '#fff3cd',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #ffc107'
      }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#856404' }}>📊 ייבוא וייצוא אקסל</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={downloadTemplate}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            📥 הורד תבנית אקסל
          </button>
          
          <button
            onClick={exportToExcel}
            disabled={guests.length === 0}
            style={{
              padding: '8px 16px',
              backgroundColor: guests.length === 0 ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: guests.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            📤 ייצא לאקסל ({guests.length} מוזמנים)
          </button>
          
          <label
            style={{
              padding: '8px 16px',
              backgroundColor: '#fd7e14',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'inline-block'
            }}
          >
            📁 ייבא מאקסל
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={importFromExcel}
              style={{ display: 'none' }}
            />
          </label>
        </div>
        <div style={{ fontSize: '12px', color: '#856404', marginTop: '10px' }}>
          <strong>טיפ:</strong> הורד את התבנית, מלא אותה וחזור לייבוא כקובץ xlsx הקובץ חייב לכלול את העמודות: שם פרטי, שם משפחה, מספר טלפון, מספר מקומות שמורים, מספר שולחן, סטטוס הזמנה
        </div>
      </div>

      {/* Add Guest Form */}
      <div style={{
        background: '#f9f9f9',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid #ddd'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>הוסף מוזמן חדש</h3>
        <form onSubmit={addGuest} style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              שם פרטי *
            </label>
            <input
             
              value={newGuest.firstName}
              onChange={e => setNewGuest({ ...newGuest, firstName: e.target.value })}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              שם משפחה *
            </label>
            <input
             
              value={newGuest.lastName}
              onChange={e => setNewGuest({ ...newGuest, lastName: e.target.value })}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              מספר טלפון
            </label>
            <input
              placeholder="לדוגמה: 050-1234567"
              value={newGuest.phone}
              onChange={e => setNewGuest({ ...newGuest, phone: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              מספר מקומות שמורים *
            </label>
            <input
              type="number"
              min={1}
              max={10}
           
              value={newGuest.seatsReserved}
              onChange={e => setNewGuest({ ...newGuest, seatsReserved: Number(e.target.value) })}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <small style={{ color: '#666', fontSize: '12px' }}>מספר האנשים שיגיעו עם המוזמן</small>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              מספר שולחן
            </label>
            <input
              type="number"
              min={0}
            
              value={newGuest.tableNumber}
              onChange={e => setNewGuest({ ...newGuest, tableNumber: Number(e.target.value) })}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <small style={{ color: '#666', fontSize: '12px' }}>אופציונלי - לשיבוץ בשולחנות</small>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <button 
              type="submit"
              style={{
                padding: '12px 24px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                width: '100%'
              }}
            >
              הוסף מוזמן
            </button>
          </div>
        </form>
      </div>

      {/* Guest List */}
      <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ 
          background: '#f5f5f5', 
          padding: '15px 20px', 
          borderBottom: '1px solid #ddd',
          fontWeight: 'bold'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', gap: '10px' }}>
            <div>שם המוזמן</div>
            <div>מספר טלפון</div>
            <div>מספר מקומות</div>
            <div>מספר שולחן</div>
            <div>סטטוס הזמנה</div>
            <div>פעולות</div>
          </div>
        </div>

        {guests.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            אין מוזמנים עדיין. הוסף מוזמן ראשון!
          </div>
        ) : (
          guests.map(guest => (
            <div key={guest._id} style={{ 
              padding: '15px 20px', 
              borderBottom: '1px solid #eee',
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
              gap: '10px',
              alignItems: 'center'
            }}>
              {editingGuest && editingGuest._id === guest._id ? (
                // Edit mode
                <>
                  <div>
                    <input
                      placeholder="שם פרטי"
                      value={editingGuest.firstName}
                      onChange={e => setEditingGuest({...editingGuest, firstName: e.target.value})}
                      style={{ padding: '4px', border: '1px solid #ddd', borderRadius: '2px', width: '100%' }}
                    />
                    <input
                      placeholder="שם משפחה"
                      value={editingGuest.lastName}
                      onChange={e => setEditingGuest({...editingGuest, lastName: e.target.value})}
                      style={{ padding: '4px', border: '1px solid #ddd', borderRadius: '2px', width: '100%', marginTop: '2px' }}
                    />
                  </div>
                  <input
                    placeholder="טלפון"
                    value={editingGuest.phone}
                    onChange={e => setEditingGuest({...editingGuest, phone: e.target.value})}
                    style={{ padding: '4px', border: '1px solid #ddd', borderRadius: '2px' }}
                  />
                  <input
                    type="number"
                    min={1}
                    max={10}
                    placeholder="מקומות"
                    value={editingGuest.seatsReserved}
                    onChange={e => setEditingGuest({...editingGuest, seatsReserved: Number(e.target.value)})}
                    style={{ padding: '4px', border: '1px solid #ddd', borderRadius: '2px' }}
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="שולחן"
                    value={editingGuest.tableNumber}
                    onChange={e => setEditingGuest({...editingGuest, tableNumber: Number(e.target.value)})}
                    style={{ padding: '4px', border: '1px solid #ddd', borderRadius: '2px' }}
                  />
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button 
                      onClick={() => updateGuest(editingGuest)}
                      style={{ padding: '4px 8px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
                    >
                      שמור
                    </button>
                    <button 
                      onClick={cancelEditing}
                      style={{ padding: '4px 8px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
                    >
                      ביטול
                    </button>
                  </div>
                </>
              ) : (
                // View mode
                <>
                  <div style={{ fontWeight: 'bold' }}>
                    {guest.firstName} {guest.lastName}
                  </div>
                  <div>{guest.phone || '-'}</div>
                  <div>{guest.seatsReserved}</div>
                  <div>{guest.tableNumber || '-'}</div>
                  <div>
                    <select
                      value={guest.status}
                      onChange={e => updateStatus(guest._id, e.target.value as GuestStatus)}
                      style={{
                        padding: '4px 8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        backgroundColor: getStatusColor(guest.status),
                        color: guest.status === 'Invited' ? '#333' : 'white'
                      }}
                    >
                      <option value="Invited">הוזמן</option>
                      <option value="Confirmed">אושר</option>
                      <option value="Declined">נדחה</option>
                      <option value="Arrived">הגיע</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button 
                      onClick={() => startEditing(guest)}
                      style={{ padding: '4px 8px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
                    >
                      ערוך
                    </button>
                    <button 
                      onClick={() => deleteGuest(guest._id)}
                      style={{ padding: '4px 8px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
                    >
                      מחק
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {guests.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#e8f5e8',
          borderRadius: '8px',
          border: '1px solid #4CAF50'
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>📊 סיכום רשימת המוזמנים</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
            <div><strong>סה"כ מוזמנים:</strong> {guests.length}</div>
            <div><strong>סה"כ מקומות שמורים:</strong> {guests.reduce((sum, g) => sum + g.seatsReserved, 0)}</div>
            <div><strong>אושרו להגיע:</strong> {guests.filter(g => g.status === 'Confirmed').length}</div>
            <div><strong>נדחו:</strong> {guests.filter(g => g.status === 'Declined').length}</div>
            <div><strong>הגיעו לאירוע:</strong> {guests.filter(g => g.status === 'Arrived').length}</div>
            <div><strong>ממתינים לאישור:</strong> {guests.filter(g => g.status === 'Invited').length}</div>
          </div>
        </div>
      )}
    </div>
  );
}
