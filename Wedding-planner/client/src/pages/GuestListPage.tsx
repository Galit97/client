import React, { useEffect, useMemo, useState } from 'react';
// @ts-ignore
import * as XLSX from 'xlsx';
import { apiUrl } from '../utils/api';
import { 
  Trash_24, 
  X_24, 
  Clock_24, 
  Success_24, 
  Error_24, 
  Heart_24,
  Upload_24,
  Download_24,
  Mail_24,
  Edit_24
} from '../components/Icons/WeddingIconsLibrary';

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
  const [filterSide, setFilterSide] = useState<'' | 'bride' | 'groom' | 'shared'>('');
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

      if (jsonData.length === 0) {
        setImporting(false);
        return;
      }

      const importedGuests = jsonData.map((row: any, _index: number) => {
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
      const validGuests = importedGuests.filter((guest, _index) => {
        const isValid = guest.firstName && guest.lastName && guest.seatsReserved > 0;
        return isValid;
      });

      if (validGuests.length === 0) {
        setImporting(false);
        return;
      }

      // Add guests to database
      await addMultipleGuests(validGuests);
      
      // Clear file input
      event.target.value = '';
      
    } catch (error) {
      console.error('Error importing Excel:', error);
      setImporting(false);
    }
  };

  const addMultipleGuests = async (guestsToAdd: any[]) => {
    const token = localStorage.getItem("token");
    if (!token || !weddingId) {
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const guestData of guestsToAdd) {
      try {
        const res = await fetch(apiUrl('/api/guests'), {
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
        setLoading(false);
        return;
      }

      try {
        
        // First, get the user's wedding
        const weddingRes = await fetch(apiUrl('/api/weddings/owner'), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (weddingRes.status === 404) {
          setLoading(false);
          return;
        }

        if (!weddingRes.ok) {
          throw new Error("Failed to fetch wedding");
        }

        const weddingData = await weddingRes.json();
        setWeddingId(weddingData._id);

        // Then fetch guests for this wedding
        const guestsRes = await fetch(apiUrl(`/api/guests/by-wedding/${weddingData._id}`), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (guestsRes.ok) {
          const guestsData = await guestsRes.json();
          setGuests(guestsData);
        } else {
          await guestsRes.text();
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
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    try {
      const guestData = {
        ...newGuest,
        weddingID: weddingId,
        status: 'Invited' as GuestStatus,
        invitationSent: false,
      };

              const res = await fetch(apiUrl('/api/guests'), {
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
        return;
      }

      const created = await res.json();
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
      
      // Trigger dashboard refresh
             if ((window as any).notifyDashboardUpdate) {
         (window as any).notifyDashboardUpdate('guest-added');
       } else if ((window as any).triggerDashboardRefresh) {
         (window as any).triggerDashboardRefresh('guest-added');
       }
    } catch (error) {
      console.error("Error adding guest:", error);
    }
  }

  async function updateStatus(id: string, status: GuestStatus) {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(apiUrl(`/api/guests/${id}`), {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setGuests(guests.map(g => (g._id === id ? { ...g, status } : g)));
        
        // Trigger dashboard refresh
               if ((window as any).notifyDashboardUpdate) {
         (window as any).notifyDashboardUpdate('guest-status-updated');
       } else if ((window as any).triggerDashboardRefresh) {
         (window as any).triggerDashboardRefresh('guest-status-updated');
       }
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  }

  async function updateGuest(guestData: EditingGuest) {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(apiUrl(`/api/guests/${guestData._id}`), {
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
        
        // Trigger dashboard refresh
               if ((window as any).notifyDashboardUpdate) {
         (window as any).notifyDashboardUpdate('guest-updated');
       } else if ((window as any).triggerDashboardRefresh) {
         (window as any).triggerDashboardRefresh('guest-updated');
       }
      } else {
        const errorText = await res.text();
        console.error("Error response:", errorText);
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
      const res = await fetch(apiUrl(`/api/guests/${id}`), { 
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setGuests(guests.filter(g => g._id !== id));
        
        // Trigger dashboard refresh
               if ((window as any).notifyDashboardUpdate) {
         (window as any).notifyDashboardUpdate('guest-deleted');
       } else if ((window as any).triggerDashboardRefresh) {
         (window as any).triggerDashboardRefresh('guest-deleted');
       }
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
      if (filterSide && g.side !== filterSide) return false;
      if (!term) return true;
      const name = `${g.firstName} ${g.lastName}`.toLowerCase();
      const phone = (g.phone || '').toLowerCase();
      return name.includes(term) || phone.includes(term);
    });
  }, [guests, searchTerm, filterStatus, filterSide]);

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
      direction: 'rtl',
      background: '#FFF0F5',
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        padding: '20px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#1d5a78',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '20px'
          }}>
            <Mail_24 style={{ width: '16px', height: '16px' }} />
          </div>
          <h1 style={{ 
            margin: 0,
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1d5a78'
          }}>
            ניהול מוזמנים
          </h1>
        </div>
        <button 
          onClick={() => setShowAddGuestModal(true)}
          style={{
            padding: '12px 24px',
            background: '#1d5a78',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#164e63';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#1d5a78';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          + מוזמן חדש
        </button>
      </div>

  

      {/* Guest Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Confirmed Guests */}
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#10b981',
            marginBottom: '8px'
          }}>
            {guests.filter(g => g.status === 'Confirmed').length}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            מאשרים
          </div>
        </div>

        {/* Declined Guests */}
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#ef4444',
            marginBottom: '8px'
          }}>
            {guests.filter(g => g.status === 'Declined').length}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            מסרבים
          </div>
        </div>

        {/* Total Guests */}
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1d5a78',
            marginBottom: '8px'
          }}>
            {guests.length}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            סה"כ
          </div>
        </div>

        {/* Maybe/Pending Guests */}
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#f59e0b',
            marginBottom: '8px'
          }}>
            {guests.filter(g => g.status === 'Invited').length}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            אולי
          </div>
        </div>

        {/* Arrived Guests */}
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#8b5cf6',
            marginBottom: '8px'
          }}>
            {guests.filter(g => g.status === 'Arrived').length}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            ממתינים
          </div>
        </div>
      </div>

      {/* Estimated Places */}
      <div style={{
        marginBottom: '30px',
        padding: '15px 20px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          fontSize: '16px',
          color: '#1d5a78',
          fontWeight: '500'
        }}>
          מקומות משוערים: {guests.reduce((sum, g) => sum + g.seatsReserved, 0)}
        </div>
      </div>

      {/* Add Another Guest Button */}
      <div style={{
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <button 
          onClick={() => setShowAddGuestModal(true)}
          style={{
            padding: '10px 20px',
            background: '#f8fafc',
            color: '#1d5a78',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e5e7eb';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f8fafc';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          + עוד מוזמן
        </button>
      </div>

      {/* Excel Import/Export Section */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h4 style={{ 
          margin: '0 0 15px 0', 
          color: '#1d5a78',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          ייבוא וייצוא אקסל
        </h4>
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
                          <Download_24 style={{ width: '16px', height: '16px', marginLeft: '8px' }} /> הורד תבנית
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
                          <Upload_24 style={{ width: '16px', height: '16px', marginLeft: '8px' }} /> ייצא ({guests.length})
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
            {importing ? '⏳ מייבא...' : (
              <>
                <Upload_24 style={{ width: '16px', height: '16px', marginLeft: '4px' }} />
                ייבא
              </>
            )}
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
              {importMessage.includes('בהצלחה') ? <><Success_24 style={{ width: '16px', height: '16px', marginLeft: '8px' }} /> </> : <><Error_24 style={{ width: '16px', height: '16px', marginLeft: '8px' }} /> </>}{importMessage}
            </div>
          )}
      </div>



      {/* Search and Filter Section */}
      <div style={{
        marginBottom: '30px',
        padding: '20px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {/* Search Bar */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="חפשו לפי שם / טלפון / מייל / קבוצה..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#1d5a78';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
            }}
          />
        </div>

        {/* Filter Buttons */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '10px'
          }}>
            סטטוס:
          </div>
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {[
              { value: '', label: 'הכל' },
              { value: 'Invited', label: 'טיוטה' },
              { value: 'Invited', label: 'נשלחה הזמנה' },
              { value: 'Confirmed', label: 'מאשר' },
              { value: 'Declined', label: 'מסרב' },
              { value: 'Arrived', label: 'אולי' }
            ].map((option) => (
              <button
                key={option.value + option.label}
                onClick={() => setFilterStatus(option.value as any)}
                style={{
                  padding: '8px 16px',
                  background: filterStatus === option.value ? '#1d5a78' : '#f3f4f6',
                  color: filterStatus === option.value ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (filterStatus !== option.value) {
                    e.currentTarget.style.background = '#e5e7eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (filterStatus !== option.value) {
                    e.currentTarget.style.background = '#f3f4f6';
                  }
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Side Filter */}
        <div>
          <div style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '10px'
          }}>
            צד:
          </div>
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {[
              { value: '', label: 'הכל' },
              { value: 'bride', label: 'כלה' },
              { value: 'groom', label: 'חתן' },
              { value: 'shared', label: 'משותף' }
            ].map((option) => (
              <button
                key={option.value + option.label}
                onClick={() => setFilterSide(option.value as '' | 'bride' | 'groom' | 'shared')}
                style={{
                  padding: '8px 16px',
                  background: filterSide === option.value ? '#1d5a78' : '#f3f4f6',
                  color: filterSide === option.value ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (filterSide !== option.value) {
                    e.currentTarget.style.background = '#e5e7eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (filterSide !== option.value) {
                    e.currentTarget.style.background = '#f3f4f6';
                  }
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Guest List */}
      {filteredGuests.length === 0 ? (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          color: '#6b7280',
          fontSize: '16px'
        }}>
          אין מוזמנים תואמים. נסה לסנן אחרת או להוסיף מוזמן.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {filteredGuests.map(guest => (
            <div key={guest._id} style={{
              background: 'white',
              borderRadius: '12px',
              padding: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #f3f4f6'
            }}>
              {editingGuest && editingGuest._id === guest._id ? (
                <>
                  <div className="card-header">
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input className="input" placeholder="שם פרטי" value={editingGuest.firstName} onChange={e => {
                        setEditingGuest({ ...editingGuest, firstName: e.target.value });
                      }} />
                      <input className="input" placeholder="שם משפחה" value={editingGuest.lastName} onChange={e => setEditingGuest({ ...editingGuest, lastName: e.target.value })} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-icon" title="שמור" onClick={() => {
                        if (editingGuest) {
                          updateGuest(editingGuest);
                        }
                      }}><Success_24 style={{ width: '16px', height: '16px' }} /></button>
                      <button className="btn-icon" title="בטל" onClick={cancelEditing}>
                        <X_24 style={{ width: '16px', height: '16px' }} />
                      </button>
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
                        setEditingGuest({ ...editingGuest, group: e.target.value });
                      }} />
                    </div>
                    /*update*/
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
                        <button className="btn-icon" title="הוזמן" onClick={() => updateStatus(editingGuest!._id, 'Invited')}>
                          <Clock_24 style={{ width: '16px', height: '16px' }} />
                        </button>
                        <button className="btn-icon" title="אושר" onClick={() => updateStatus(editingGuest!._id, 'Confirmed')}>
                          <Success_24 style={{ width: '16px', height: '16px' }} />
                        </button>
                        <button className="btn-icon" title="נדחה" onClick={() => updateStatus(editingGuest!._id, 'Declined')}>
                          <Error_24 style={{ width: '16px', height: '16px' }} />
                        </button>
                        <button className="btn-icon" title="הגיע" onClick={() => updateStatus(editingGuest!._id, 'Arrived')}>
                          <Heart_24 style={{ width: '16px', height: '16px' }} />
                        </button>
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
                  {/* Guest Header */}
                                     <div style={{
                     display: 'flex',
                     justifyContent: 'space-between',
                     alignItems: 'center',
                     marginBottom: '8px',
                     paddingBottom: '8px',
                     borderBottom: '1px solid #f3f4f6'
                   }}>
                    <div>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#1d5a78',
                        marginBottom: '4px'
                      }}>
                        {guest.firstName} {guest.lastName}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        {guest.phone}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => startEditing(guest)}
                        style={{
                          padding: '6px',
                          background: '#f3f4f6',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#e5e7eb';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f3f4f6';
                        }}
                        title="ערוך"
                      >
                        <Edit_24 style={{ width: '16px', height: '16px' }} />
                      </button>
                      <button
                        onClick={() => deleteGuest(guest._id)}
                        style={{
                          padding: '6px',
                          background: '#fef2f2',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#fee2e2';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#fef2f2';
                        }}
                        title="מחק"
                      >
                        <Trash_24 style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>
                  </div>

                  {/* Guest Details */}
                                     <div style={{ display: 'grid', gap: '6px' }}>
                    {/* Contact Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginBottom: '4px'
                        }}>
                          אימייל
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#374151'
                        }}>
                          {guest.email || '-'}
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginBottom: '4px'
                        }}>
                          מקומות
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#374151',
                          fontWeight: '500'
                        }}>
                          {guest.seatsReserved}
                        </div>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginBottom: '4px'
                        }}>
                          שולחן
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#374151'
                        }}>
                          {guest.tableNumber || '-'}
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginBottom: '4px'
                        }}>
                          תזונה
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#374151'
                        }}>
                          {guest.dietaryRestrictions || 'רגיל'}
                        </div>
                      </div>
                    </div>

                    {/* Group and Side */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginBottom: '4px'
                        }}>
                          קבוצה
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#374151'
                        }}>
                          {guest.group || '-'}
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginBottom: '4px'
                        }}>
                          מהצד של
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#374151'
                        }}>
                          {guest.side === 'bride' ? 'כלה' : guest.side === 'groom' ? 'חתן' : 'משותף'}
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                                             <div style={{
                         fontSize: '12px',
                         color: '#6b7280',
                         marginBottom: '4px'
                       }}>
                        סטטוס
                      </div>
                      <div style={{
                        display: 'inline-block',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: guest.status === 'Confirmed' ? '#dcfce7' : 
                                   guest.status === 'Declined' ? '#fee2e2' : 
                                   guest.status === 'Arrived' ? '#dbeafe' : '#fef3c7',
                        color: guest.status === 'Confirmed' ? '#166534' : 
                               guest.status === 'Declined' ? '#991b1b' : 
                               guest.status === 'Arrived' ? '#1e40af' : '#92400e'
                      }}>
                        {guest.status === 'Invited' ? 'הוזמן' : 
                         guest.status === 'Confirmed' ? 'אושר' : 
                         guest.status === 'Declined' ? 'נדחה' : 'הגיע'}
                      </div>
                    </div>

                    {/* Notes */}
                    {guest.notes && (
                      <div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginBottom: '4px'
                        }}>
                          הערות
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#374151',
                          fontStyle: 'italic',
                          padding: '8px',
                          background: '#f9fafb',
                          borderRadius: '6px'
                        }}>
                          {guest.notes}
                        </div>
                      </div>
                    )}

                    {/* Quick Status Actions */}
                                         <div style={{
                       display: 'flex',
                       gap: '8px',
                       paddingTop: '6px',
                       borderTop: '1px solid #f3f4f6'
                     }}>
                      <button
                        onClick={() => updateStatus(guest._id, 'Invited')}
                        style={{
                          padding: '6px 12px',
                          background: guest.status === 'Invited' ? '#fef3c7' : '#f3f4f6',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          transition: 'all 0.2s ease'
                        }}
                        title="הוזמן"
                      >
                        <Clock_24 style={{ width: '14px', height: '14px' }} />
                      </button>
                      <button
                        onClick={() => updateStatus(guest._id, 'Confirmed')}
                        style={{
                          padding: '6px 12px',
                          background: guest.status === 'Confirmed' ? '#dcfce7' : '#f3f4f6',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          transition: 'all 0.2s ease'
                        }}
                        title="אושר"
                      >
                        <Success_24 style={{ width: '14px', height: '14px' }} />
                      </button>
                      <button
                        onClick={() => updateStatus(guest._id, 'Declined')}
                        style={{
                          padding: '6px 12px',
                          background: guest.status === 'Declined' ? '#fee2e2' : '#f3f4f6',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          transition: 'all 0.2s ease'
                        }}
                        title="נדחה"
                      >
                        <Error_24 style={{ width: '14px', height: '14px' }} />
                      </button>
                      <button
                        onClick={() => updateStatus(guest._id, 'Arrived')}
                        style={{
                          padding: '6px 12px',
                          background: guest.status === 'Arrived' ? '#dbeafe' : '#f3f4f6',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          transition: 'all 0.2s ease'
                        }}
                        title="הגיע"
                      >
                        <Heart_24 style={{ width: '14px', height: '14px' }} />
                      </button>
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
