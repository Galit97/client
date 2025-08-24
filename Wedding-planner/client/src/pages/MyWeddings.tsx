import React, { useState, useEffect } from 'react';

type Wedding = {
  _id: string;
  weddingName: string;
  weddingDate: string;
  status: string;
  userRole: 'owner' | 'participant';
  canDelete: boolean;
  ownerID: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  participants: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    role?: string;
  }>;
};

export default function MyWeddings({ onOpenWedding }: { onOpenWedding?: () => void }) {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeddings();
  }, []);

  async function fetchWeddings() {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/weddings/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setWeddings(data);
      } else {
        console.error('Error fetching weddings');
      }
    } catch (error) {
      console.error('Error fetching weddings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteWedding(weddingId: string) {
    if (!confirm("האם אתה בטוח שברצונך למחוק את האירוע? פעולה זו אינה הפיכה.")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/weddings/${weddingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert('האירוע נמחק בהצלחה!');
        fetchWeddings(); // Refresh the list
      } else {
        const errorText = await res.text();
        console.error('Error deleting wedding:', errorText);
        alert('שגיאה במחיקת האירוע');
      }
    } catch (error) {
      console.error('Error deleting wedding:', error);
      alert('שגיאה במחיקת האירוע');
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'Planning': return 'מתכננים';
      case 'Confirmed': return 'מאושר';
      case 'Cancelled': return 'מבוטל';
      case 'Finished': return 'הושלם';
      case 'Postponed': return 'נדחה';
      default: return status;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'Planning': return '#3b82f6';
      case 'Confirmed': return '#3b82f6';
      case 'Cancelled': return '#ef4444';
      case 'Finished': return '#3b82f6';
      case 'Postponed': return '#3b82f6';
      default: return '#6b7280';
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>טוען...</div>
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
        borderBottom: '2px solid #E5E7EB',
        paddingBottom: '10px'
      }}>
        האירועים שלי
      </h1>

      {weddings.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '50px',
          background: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ color: '#6b7280', marginBottom: '10px' }}>אין אירועים</h3>
          <p style={{ color: '#9ca3af' }}>טרם יצרת או הצטרפת לאירועים</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {weddings.map((wedding) => (
            <div key={wedding._id} style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    margin: '0 0 8px 0', 
                    color: '#1f2937',
                    fontSize: '20px'
                  }}>
                    {wedding.weddingName || 'אירוע ללא שם'}
                  </h3>
                  
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ color: '#6b7280', fontSize: '14px' }}>
                      📅 {formatDate(wedding.weddingDate)}
                    </div>
                    
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: getStatusColor(wedding.status) + '20',
                      color: getStatusColor(wedding.status),
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {getStatusText(wedding.status)}
                    </span>
                    
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: wedding.userRole === 'owner' ? '#dcfce7' : '#fef3c7',
                      color: wedding.userRole === 'owner' ? '#166534' : '#92400e',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {wedding.userRole === 'owner' ? 'בעלים' : 'שותף'}
                    </span>
                  </div>
                  
                  <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '10px' }}>
                    <strong>בעלים:</strong> {wedding.ownerID.firstName} {wedding.ownerID.lastName}
                  </div>
                  
                  {wedding.participants.length > 0 && (
                    <div style={{ color: '#6b7280', fontSize: '14px' }}>
                      <strong>שותפים:</strong> {wedding.participants.length} משתמשים
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => window.location.href = `/eventSettings?weddingId=${wedding._id}`}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#2563eb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#3b82f6';
                    }}
                  >
                    ✏️ ערוך
                  </button>
                  
                  {wedding.canDelete && (
                    <button
                      onClick={() => deleteWedding(wedding._id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#dc2626';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ef4444';
                      }}
                    >
                      🗑️ מחק
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div style={{ 
        textAlign: 'center', 
        marginTop: '30px',
        padding: '20px',
        background: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <button
          onClick={() => window.location.href = '/eventSettings'}
          style={{
            padding: '12px 24px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#059669';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#10b981';
          }}
        >
          ➕ צור אירוע חדש
        </button>
      </div>
    </div>
  );
} 