import React, { useEffect, useMemo, useState } from 'react';
// @ts-ignore
import * as XLSX from 'xlsx';

type GuestStatus = 'Invited' | 'Confirmed' | 'Declined' | 'Arrived';

type Guest = {
  _id: string;
  weddingID: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  status: GuestStatus;
  seatsReserved: number;
  tableNumber?: number;
  invitationSent: boolean;
  dietaryRestrictions?: string;
  group?: string;
  side?: 'bride' | 'groom' | 'shared';
  notes?: string;
};

type EditingGuest = {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  seatsReserved: number;
  tableNumber?: number;
  dietaryRestrictions?: string;
  group?: string;
  side?: 'bride' | 'groom' | 'shared';
  notes?: string;
};

export default function GuestListPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [weddingId, setWeddingId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [editingGuest, setEditingGuest] = useState<EditingGuest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'' | GuestStatus>('');
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [newGuest, setNewGuest] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    seatsReserved: 1,
    tableNumber: 0,
    dietaryRestrictions: 'רגיל',
    group: '',
    side: 'shared' as 'bride' | 'groom' | 'shared',
    notes: '',
  });

  // Excel functions
  const downloadTemplate = () => {
    const templateData = [
      {
        'שם פרטי': 'ישראל',
        'שם משפחה': 'כהן',
        'מספר טלפון': '050-1234567',
        'אימייל': 'israel@example.com',
        'מספר מקומות שמורים': 2,
        'מספר שולחן': 5,
        'תזונה': 'רגיל',
        'קבוצה': 'משפחה',
        'מהצד של': 'כלה',
        'הערות': 'אוהב מוזיקה',
        'סטטוס הזמנה': 'הוזמן'
      },
      {
        'שם פרטי': 'שרה',
        'שם משפחה': 'לוי',
        'מספר טלפון': '052-9876543',
        'אימייל': 'sarah@example.com',
        'מספר מקומות שמורים': 1,
        'מספר שולחן': 3,
        'תזונה': 'צמחוני',
        'קבוצה': 'חברים',
        'מהצד של': 'חתן',
        'הערות': '',
        'סטטוס הזמנה': 'אושר'
      },
      {
        'שם פרטי': 'דוד',
        'שם משפחה': 'גולדברג',
        'מספר טלפון': '054-5551234',
        'אימייל': 'david@example.com',
        'מספר מקומות שמורים': 4,
        'מספר שולחן': 8,
        'תזונה': 'ללא גלוטן',
        'קבוצה': 'עבודה',
        'מהצד של': 'משותף',
        'הערות': 'מגיע עם 3 ילדים',
        'סטטוס הזמנה': 'הוזמן'
      },
      {
        'שם פרטי': 'רחל',
        'שם משפחה': 'ברק',
        'מספר טלפון': '',
        'אימייל': 'rachel@example.com',
        'מספר מקומות שמורים': 2,
        'מספר שולחן': 0,
        'תזונה': 'טבעוני',
        'קבוצה': 'משפחה',
        'מהצד של': 'כלה',
        'הערות': '',
        'סטטוס הזמנה': 'הוזמן'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'רשימת מוזמנים');
    
    // Set column widths
    ws['!cols'] = [
      { width: 15 }, // שם פרטי
      { width: 15 }, // שם משפחה
      { width: 18 }, // מספר טלפון
      { width: 25 }, // אימייל
      { width: 22 }, // מספר מקומות שמורים
      { width: 15 }, // מספר שולחן
      { width: 15 }, // תזונה
      { width: 15 }, // קבוצה
      { width: 15 }, // מהצד של
      { width: 30 }, // הערות
      { width: 18 }  // סטטוס הזמנה
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
      'אימייל': guest.email || '',
      'מספר מקומות שמורים': guest.seatsReserved,
      'מספר שולחן': guest.tableNumber || '',
      'תזונה': guest.dietaryRestrictions || 'רגיל',
      'קבוצה': guest.group || '',
      'מהצד של': guest.side === 'bride' ? 'כלה' : guest.side === 'groom' ? 'חתן' : 'משותף',
      'הערות': guest.notes || '',
      'סטטוס הזמנה': getStatusText(guest.status)
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'רשימת מוזמנים');
    
    // Set column widths
    ws['!cols'] = [
      { width: 15 }, // שם פרטי
      { width: 15 }, // שם משפחה
      { width: 18 }, // מספר טלפון
      { width: 25 }, // אימייל
      { width: 22 }, // מספר מקומות שמורים
      { width: 15 }, // מספר שולחן
      { width: 15 }, // תזונה
      { width: 15 }, // קבוצה
      { width: 15 }, // מהצד של
      { width: 30 }, // הערות
      { width: 18 }  // סטטוס הזמנה
    ];

    XLSX.writeFile(wb, `רשימת_מוזמנים_${new Date().toLocaleDateString('he-IL')}.xlsx`);
  };

  const importFromExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log('Raw Excel data:', jsonData); // Debug log

      if (jsonData.length === 0) {
        alert('הקובץ ריק או לא מכיל נתונים תקינים');
        setImporting(false);
        return;
      }

      const importedGuests = jsonData.map((row: any, index: number) => {
        // Handle multiple possible column names
        const firstName = row['שם פרטי'] || row['firstName'] || row['שם'] || row['name'] || '';
        const lastName = row['שם משפחה'] || row['lastName'] || row['משפחה'] || row['family'] || '';
        const phone = row['מספר טלפון'] || row['phone'] || row['טלפון'] || row['telephone'] || '';
        const email = row['אימייל'] || row['email'] || row['אימייל'] || '';
        const seatsReserved = row['מספר מקומות שמורים'] || row['seatsReserved'] || row['מקומות'] || row['seats'] || row['מספר מוזמנים'] || row['guests'] || 1;
        const tableNumber = row['מספר שולחן'] || row['tableNumber'] || row['שולחן'] || row['table'] || 0;
        const dietaryRestrictions = row['תזונה'] || row['dietaryRestrictions'] || 'רגיל';
        const group = row['קבוצה'] || row['group'] || '';
        const side = row['מהצד של'] || row['side'] || 'משותף';
        const notes = row['הערות'] || row['notes'] || '';
        const status = row['סטטוס הזמנה'] || row['status'] || row['סטטוס'] || 'הוזמן';

        // Convert to proper types
        const parsedSeats = typeof seatsReserved === 'string' ? parseInt(seatsReserved) || 1 : seatsReserved || 1;
        const parsedTable = typeof tableNumber === 'string' ? parseInt(tableNumber) || 0 : tableNumber || 0;

        // Convert side to English
        const sideEnglish = side === 'כלה' ? 'bride' : side === 'חתן' ? 'groom' : 'shared';

        console.log(`Row ${index + 1}:`, { firstName, lastName, phone, email, seatsReserved: parsedSeats, tableNumber: parsedTable, dietaryRestrictions, group, side: sideEnglish, notes, status }); // Debug log

        return {
          firstName: firstName.toString().trim(),
          lastName: lastName.toString().trim(),
          phone: phone.toString().trim(),
          email: email.toString().trim(),
          seatsReserved: parsedSeats,
          tableNumber: parsedTable,
          dietaryRestrictions: dietaryRestrictions.toString().trim(),
          group: group.toString().trim(),
          side: sideEnglish,
          notes: notes.toString().trim(),
          status: getStatusFromText(status) as GuestStatus
        };
      });

      // Validate data - be more lenient with validation
      const validGuests = importedGuests.filter((guest, index) => {
        const isValid = guest.firstName && guest.lastName && guest.seatsReserved > 0;
        if (!isValid) {
          console.log(`Invalid guest at row ${index + 1}:`, guest); // Debug log
        }
        return isValid;
      });

      if (validGuests.length === 0) {
        alert('לא נמצאו נתונים תקינים בקובץ. אנא ודא שיש לפחות שם פרטי, שם משפחה ומספר מקומות שמורים');
        setImporting(false);
        return;
      }

      console.log('Valid guests to import:', validGuests); // Debug log

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
      setImporting(false);
    }
  };

  const addMultipleGuests = async (guestsToAdd: any[]) => {
    const token = localStorage.getItem("token");
    if (!token || !weddingId) {
      alert('שגיאה: לא נמצא משתמש מחובר או אירוע');
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const guestData of guestsToAdd) {
      try {
        console.log('Adding guest:', guestData); // Debug log
        
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
          console.log('Successfully added guest:', created); // Debug log
        } else {
          const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
          console.error('Failed to add guest:', errorData); // Debug log
          errors.push(`${guestData.firstName} ${guestData.lastName}: ${errorData.message}`);
          errorCount++;
        }
      } catch (error) {
        console.error('Error adding guest:', error);
        errors.push(`${guestData.firstName} ${guestData.lastName}: Network error`);
        errorCount++;
      }
    }

    // Show detailed results
    if (successCount > 0) {
      let message = `יובאו בהצלחה ${successCount} מוזמנים`;
      if (errorCount > 0) {
        message += `\n${errorCount} שגיאות:`;
        message += '\n' + errors.slice(0, 5).join('\n'); // Show first 5 errors
        if (errors.length > 5) {
          message += `\n...ועוד ${errors.length - 5} שגיאות`;
        }
      }
      setImportMessage(message);
      setTimeout(() => setImportMessage(null), 5000); // Clear message after 5 seconds
    } else {
      setImportMessage('לא הצלחנו לייבא אף מוזמן. אנא נסה שוב');
      setTimeout(() => setImportMessage(null), 5000);
    }
    setImporting(false);
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
        const guestsRes = await fetch(`/api/guests/by-wedding/${weddingData._id}`, {
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
      setNewGuest({ 
        firstName: '', 
        lastName: '', 
        phone: '', 
        email: '',
        seatsReserved: 1, 
        tableNumber: 0,
        dietaryRestrictions: 'רגיל',
        group: '',
        side: 'shared' as 'bride' | 'groom' | 'shared',
        notes: ''
      });
      setShowAddGuestModal(false);
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
      console.log("=== CLIENT SIDE UPDATE DEBUG ===");
      console.log("Updating guest with data:", guestData);
      console.log("Data being sent to server:", JSON.stringify(guestData, null, 2));
      
      const res = await fetch(`/api/guests/${guestData._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(guestData),
      });

      console.log("Response status:", res.status);
      console.log("Response ok:", res.ok);

      if (res.ok) {
        const updated = await res.json();
        console.log("Updated guest from server:", updated);
        console.log("=== END CLIENT SIDE UPDATE DEBUG ===");
        setGuests(guests.map(g => (g._id === guestData._id ? updated : g)));
        setEditingGuest(null);
      } else {
        const errorText = await res.text();
        console.error("Error response:", errorText);
        console.log("=== END CLIENT SIDE UPDATE DEBUG ===");
        alert("שגיאה בעדכון מוזמן");
      }
    } catch (error) {
      console.error("Error updating guest:", error);
      console.log("=== END CLIENT SIDE UPDATE DEBUG ===");
      alert("שגיאה בעדכון מוזמן");
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
      email: guest.email || '',
      seatsReserved: guest.seatsReserved,
      tableNumber: guest.tableNumber || 0,
      dietaryRestrictions: guest.dietaryRestrictions || 'רגיל',
      group: guest.group || '',
      side: guest.side || 'shared',
      notes: guest.notes || '',
    });
  }

  function cancelEditing() {
    setEditingGuest(null);
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

  const filteredGuests = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return guests.filter(g => {
      if (filterStatus && g.status !== filterStatus) return false;
      if (!term) return true;
      const name = `${g.firstName} ${g.lastName}`.toLowerCase();
      const phone = (g.phone || '').toLowerCase();
      return name.includes(term) || phone.includes(term);
    });
  }, [guests, searchTerm, filterStatus]);

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
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        padding: '20px',
        background: '#fdf3f7',
        borderRadius: '12px',
        border: '1px solid #dee2e6'
      }}>
        <h1 style={{ 
          margin: '0',
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#495057',
          textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
        }}>
          מוזמנים
        </h1>
      </div>

      {/* Summary */}
      {guests.length > 0 && (
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}> סיכום רשימת המוזמנים</h4>
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

      {/* Excel Import/Export Section */}
      <div className="card">
        <h4 style={{ margin: '0 0 15px 0', color: '#856404' }}> ייבוא וייצוא אקסל</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={downloadTemplate} 
            style={{
              padding: '12px 20px',
              background: '#f8fafc',
              color: '#1f2937',
              border: '2px solid #e5e7eb',
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: 'bold', 
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            📥 הורד תבנית
          </button>
          <button 
            onClick={exportToExcel} 
            disabled={guests.length === 0}
            style={{
              padding: '12px 20px',
              background: guests.length === 0 ? '#f3f4f6' : '#f8fafc',
              color: guests.length === 0 ? '#9ca3af' : '#1f2937',
              border: '2px solid #e5e7eb',
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: 'bold', 
              cursor: guests.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: guests.length === 0 ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (guests.length > 0) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = '#d1d5db';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            📤 ייצא ({guests.length})
          </button>
          <label 
            style={{
              padding: '12px 20px',
              background: importing ? '#f3f4f6' : '#f8fafc',
              color: importing ? '#9ca3af' : '#1f2937',
              border: '2px solid #e5e7eb',
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: 'bold', 
              cursor: importing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: importing ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!importing) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = '#d1d5db';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            {importing ? '⏳ מייבא...' : '📁 ייבא'}
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={importFromExcel}
              disabled={importing}
              style={{ display: 'none' }}
            />
          </label>
        </div>
        {importing && (
          <div style={{ 
            marginTop: '10px', 
            padding: '8px', 
            backgroundColor: '#d1ecf1', 
            border: '1px solid #bee5eb',
            borderRadius: '4px',
            color: '#0c5460'
          }}>
            ⏳ מייבא מוזמנים... אנא המתן
          </div>
        )}
        {importMessage && (
          <div style={{ 
            marginTop: '10px', 
            padding: '8px', 
            backgroundColor: importMessage.includes('בהצלחה') ? '#d4edda' : '#f8d7da', 
            border: `1px solid ${importMessage.includes('בהצלחה') ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '4px',
            color: importMessage.includes('בהצלחה') ? '#155724' : '#721c24'
          }}>
            {importMessage.includes('בהצלחה') ? '✅ ' : '❌ '}{importMessage}
          </div>
        )}
      </div>

      {/* Add Guest Button */}
      <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
        <button 
          onClick={() => setShowAddGuestModal(true)}
          style={{
            padding: '12px 20px',
            background: '#1d5a78',
            color: '#ffffff',
            border: '2px solid #3b82f6',
            borderRadius: '25px',
            fontSize: '14px',
            fontWeight: 'bold', 
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            margin: '0 auto'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            e.currentTarget.style.borderColor = '#2563eb';
            e.currentTarget.style.background = '#164e63';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.background = '#1d5a78';
          }}
        >
          ➕ הוסיפו מוזמן חדש
        </button>
      </div>

      {/* Guests Toolbar */}
      <div className="toolbar" style={{ marginBottom: 16 }}>
        <h4 style={{ margin: '0 0 12px 0' }}>סינון</h4>
        <div className="toolbar-grid">
          <div className="field">
            <label>חיפוש</label>
            <input className="input" placeholder="חפש לפי שם או טלפון" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="field">
            <label>סטטוס</label>
            <select className="select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}>
              <option value="">כולם</option>
              <option value="Invited">הוזמן</option>
              <option value="Confirmed">אושר</option>
              <option value="Declined">נדחה</option>
              <option value="Arrived">הגיע</option>
            </select>
          </div>
        </div>
      </div>

      {/* Guest List as Cards */}
      {filteredGuests.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          אין מוזמנים תואמים. נסה לסנן אחרת או להוסיף מוזמן.
        </div>
      ) : (
        <div className="card-grid">
          {filteredGuests.map(guest => (
                         <div key={guest._id} className="card">
              {editingGuest && editingGuest._id === guest._id ? (
                <>
                  <div className="card-header">
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input className="input" placeholder="שם פרטי" value={editingGuest.firstName} onChange={e => {
                        console.log("Updating firstName from:", editingGuest.firstName, "to:", e.target.value);
                        setEditingGuest({ ...editingGuest, firstName: e.target.value });
                      }} />
                      <input className="input" placeholder="שם משפחה" value={editingGuest.lastName} onChange={e => setEditingGuest({ ...editingGuest, lastName: e.target.value })} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-icon" title="שמור" onClick={() => {
                        console.log("Save button clicked, current editingGuest:", editingGuest);
                        if (editingGuest) {
                          updateGuest(editingGuest);
                        }
                      }}>💾</button>
                      <button className="btn-icon" title="בטל" onClick={cancelEditing}>✖️</button>
                    </div>
                  </div>
                  <div className="card-row">
                    <div className="field">
                      <label>טלפון</label>
                      <input className="input" placeholder="050-1234567" value={editingGuest.phone} onChange={e => setEditingGuest({ ...editingGuest, phone: e.target.value })} />
                    </div>
                    <div className="field">
                      <label>אימייל</label>
                      <input className="input" placeholder="email@example.com" value={editingGuest.email || ''} onChange={e => setEditingGuest({ ...editingGuest, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="card-row">
                    <div className="field">
                      <label>מקומות</label>
                      <input className="input" type="number" min={1} max={10} value={editingGuest.seatsReserved} onChange={e => setEditingGuest({ ...editingGuest, seatsReserved: Number(e.target.value) })} />
                    </div>
                    <div className="field">
                      <label>שולחן</label>
                      <input className="input" type="number" min={0} value={editingGuest.tableNumber || 0} onChange={e => setEditingGuest({ ...editingGuest, tableNumber: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div className="card-row">
                    <div className="field">
                      <label>תזונה</label>
                      <select className="input" value={editingGuest.dietaryRestrictions || 'רגיל'} onChange={e => setEditingGuest({ ...editingGuest, dietaryRestrictions: e.target.value })}>
                        <option value="רגיל">רגיל</option>
                        <option value="צמחוני">צמחוני</option>
                        <option value="טבעוני">טבעוני</option>
                        <option value="ללא גלוטן">ללא גלוטן</option>
                        <option value="אחר">אחר</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>קבוצה</label>
                      <input className="input" placeholder="משפחה, חברים..." value={editingGuest.group || ''} onChange={e => {
                        console.log("Updating group from:", editingGuest.group, "to:", e.target.value);
                        setEditingGuest({ ...editingGuest, group: e.target.value });
                      }} />
                    </div>
                  </div>
                  <div className="card-row">
                    <div className="field">
                      <label>מהצד של</label>
                      <select className="input" value={editingGuest.side || 'shared'} onChange={e => setEditingGuest({ ...editingGuest, side: e.target.value as 'bride' | 'groom' | 'shared' })}>
                        <option value="bride">כלה</option>
                        <option value="groom">חתן</option>
                        <option value="shared">משותף</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>סטטוס</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-icon" title="הוזמן" onClick={() => updateStatus(editingGuest!._id, 'Invited')}>⏳</button>
                        <button className="btn-icon" title="אושר" onClick={() => updateStatus(editingGuest!._id, 'Confirmed')}>✅</button>
                        <button className="btn-icon" title="נדחה" onClick={() => updateStatus(editingGuest!._id, 'Declined')}>❌</button>
                        <button className="btn-icon" title="הגיע" onClick={() => updateStatus(editingGuest!._id, 'Arrived')}>🎉</button>
                      </div>
                    </div>
                  </div>
                  <div className="card-row">
                    <div className="field" style={{ gridColumn: '1 / -1' }}>
                      <label>הערות</label>
                      <textarea className="input" placeholder="הערות נוספות..." value={editingGuest.notes || ''} onChange={e => setEditingGuest({ ...editingGuest, notes: e.target.value })} rows={2} style={{ resize: 'vertical' }} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                                     <div className="card-header">
                     <div className="card-title">{guest.firstName} {guest.lastName}</div>
                     <div style={{ display: 'flex', gap: 8 }}>
                       <button className="btn-icon" title="ערוך" onClick={() => startEditing(guest)}>✏️</button>
                       <button className="btn-icon" title="מחק" onClick={() => deleteGuest(guest._id)}>🗑️</button>
                     </div>
                   </div>
                                     <div className="card-row">
                     <div>
                       <div className="muted">טלפון</div>
                       <div>{guest.phone}</div>
                     </div>
                     <div>
                       <div className="muted">אימייל</div>
                       <div>{guest.email || '-'}</div>
                     </div>
                   </div>
                                     <div className="card-row">
                     <div>
                       <div className="muted">מקומות</div>
                       <div>{guest.seatsReserved}</div>
                     </div>
                     <div>
                       <div className="muted">שולחן</div>
                       <div>{guest.tableNumber || '-'}</div>
                     </div>
                   </div>
                                     <div className="card-row">
                     <div>
                       <div className="muted">תזונה</div>
                       <div>{guest.dietaryRestrictions || 'רגיל'}</div>
                     </div>
                     <div>
                       <div className="muted">קבוצה</div>
                       <div>{guest.group || '-'}</div>
                     </div>
                   </div>
                                     <div className="card-row">
                     <div>
                       <div className="muted">מהצד של</div>
                       <div>{guest.side === 'bride' ? 'כלה' : guest.side === 'groom' ? 'חתן' : 'משותף'}</div>
                     </div>
                     <div>
                       <div className="muted">סטטוס</div>
                       <div>
                         <span className={`chip ${guest.status === 'Invited' ? 'chip-invited' : guest.status === 'Confirmed' ? 'chip-confirmed' : guest.status === 'Declined' ? 'chip-declined' : 'chip-arrived'}`}>
                           {guest.status === 'Invited' ? '⏳ הוזמן' : guest.status === 'Confirmed' ? '✅ אושר' : guest.status === 'Declined' ? '❌ נדחה' : '🎉 הגיע'}
                         </span>
                       </div>
                     </div>
                   </div>
                                     {guest.notes && (
                     <div className="card-row">
                       <div style={{ gridColumn: '1 / -1' }}>
                         <div className="muted">הערות</div>
                         <div style={{ fontStyle: 'italic', color: '#666' }}>{guest.notes}</div>
                       </div>
                     </div>
                   )}
                                     <div className="card-row">
                     <div>
                       <div className="muted">שינוי סטטוס מהיר</div>
                       <div style={{ display: 'flex', gap: 8 }}>
                         <button className="btn-icon" title="הוזמן" onClick={() => updateStatus(guest._id, 'Invited')}>⏳</button>
                         <button className="btn-icon" title="אושר" onClick={() => updateStatus(guest._id, 'Confirmed')}>✅</button>
                         <button className="btn-icon" title="נדחה" onClick={() => updateStatus(guest._id, 'Declined')}>❌</button>
                         <button className="btn-icon" title="הגיע" onClick={() => updateStatus(guest._id, 'Arrived')}>🎉</button>
                       </div>
                     </div>
                   </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}



      {/* Add Guest Modal */}
      {showAddGuestModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '50vh',
            overflowY: 'auto',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h2 style={{ margin: 0, color: '#0F172A' }}>הוספת מוזמן חדש</h2>
              <button
                onClick={() => setShowAddGuestModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={addGuest} style={{ display: 'grid', gap: '12px' }}>
              {/* Basic Info */}
              <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#0F172A' }}>
                    שם פרטי *
                  </label>
                  <input
                    value={newGuest.firstName}
                    onChange={e => setNewGuest({ ...newGuest, firstName: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#0F172A' }}>
                    שם משפחה *
                  </label>
                  <input
                    value={newGuest.lastName}
                    onChange={e => setNewGuest({ ...newGuest, lastName: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#0F172A' }}>
                    מספר טלפון *
                  </label>
                  <input
                    value={newGuest.phone}
                    onChange={e => setNewGuest({ ...newGuest, phone: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#0F172A' }}>
                    אימייל
                  </label>
                  <input
                    type="email"
                    value={newGuest.email}
                    onChange={e => setNewGuest({ ...newGuest, email: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                  />
                </div>
              </div>

              {/* Event Details */}
              <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#0F172A' }}>
                    מספר מקומות שמורים *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newGuest.seatsReserved}
                    onChange={e => setNewGuest({ ...newGuest, seatsReserved: Number(e.target.value) })}
                    required
                    style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                  />
                  <small style={{ color: '#475569', fontSize: '11px' }}>מספר האנשים שיגיעו עם המוזמן</small>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#0F172A' }}>
                    מספר שולחן
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newGuest.tableNumber}
                    onChange={e => setNewGuest({ ...newGuest, tableNumber: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                  />
                  <small style={{ color: '#475569', fontSize: '11px' }}>אופציונלי - לשיבוץ בשולחנות</small>
                </div>
              </div>

              {/* Dietary Restrictions */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#0F172A' }}>
                  תזונה
                </label>
                <select
                  value={newGuest.dietaryRestrictions}
                  onChange={e => setNewGuest({ ...newGuest, dietaryRestrictions: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                >
                  <option value="רגיל">רגיל</option>
                  <option value="צמחוני">צמחוני</option>
                  <option value="טבעוני">טבעוני</option>
                  <option value="ללא גלוטן">ללא גלוטן</option>
                  <option value="אחר">אחר</option>
                </select>
              </div>

              {/* Group and Side */}
              <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#0F172A' }}>
                    קבוצה
                  </label>
                  <input
                    value={newGuest.group}
                    onChange={e => setNewGuest({ ...newGuest, group: e.target.value })}
                    placeholder="משפחה, חברים, עבודה..."
                    style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#0F172A' }}>
                    מהצד של
                  </label>
                  <select
                    value={newGuest.side}
                    onChange={e => setNewGuest({ ...newGuest, side: e.target.value as 'bride' | 'groom' | 'shared' })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                  >
                    <option value="bride">כלה</option>
                    <option value="groom">חתן</option>
                    <option value="shared">משותף</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#0F172A' }}>
                  הערות
                </label>
                <textarea
                  value={newGuest.notes}
                  onChange={e => setNewGuest({ ...newGuest, notes: e.target.value })}
                  placeholder="הערות נוספות על המוזמן..."
                  rows={2}
                  style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '6px', resize: 'vertical' }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '15px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddGuestModal(false)}
                  style={{
                    padding: '12px 20px',
                    background: '#6b7280',
                    color: '#ffffff',
                    border: '2px solid #6b7280',
                    borderRadius: '25px',
                    fontSize: '14px',
                    fontWeight: 'bold', 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 114, 128, 0.3)';
                    e.currentTarget.style.borderColor = '#4b5563';
                    e.currentTarget.style.background = '#4b5563';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#6b7280';
                    e.currentTarget.style.background = '#6b7280';
                  }}
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 20px',
                    background: '#1d5a78',
                    color: '#ffffff',
                    border: '2px solid #3b82f6',
                    borderRadius: '25px',
                    fontSize: '14px',
                    fontWeight: 'bold', 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.background = '#164e63';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.background = '#1d5a78';
                  }}
                >
                  הוסף מוזמן
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
