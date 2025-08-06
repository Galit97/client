import React, { useEffect, useState, useMemo } from "react";

type VendorStatus = "Pending" | "Confirmed" | "Paid";
type VendorType = "music" | "food" | "photography" | "decor" | "clothes" | "makeup_hair" | "internet_orders" | "other";

type Vendor = {
  _id: string;
  weddingID: string;
  vendorName: string;
  price: number;
  notes?: string;
  contractURL?: string;
  proposalURL?: string;
  status: VendorStatus;
  type: VendorType;
};

type FilterOptions = {
  type: string;
  status: string;
  sortBy: 'vendorName' | 'price' | 'type';
  sortOrder: 'asc' | 'desc';
};

export default function VendorsListPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [weddingId, setWeddingId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [newVendor, setNewVendor] = useState({
    vendorName: "",
    price: 0,
    notes: "",
    contractURL: "",
    proposalURL: "",
    status: "Pending" as VendorStatus,
    type: "music" as VendorType,
  });

  const [filters, setFilters] = useState<FilterOptions>({
    type: '',
    status: '',
    sortBy: 'vendorName',
    sortOrder: 'asc'
  });

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        setLoading(false);
        return;
      }

      try {
        console.log("Starting to fetch vendor data...");
        
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

        // Fetch vendors for this wedding
        console.log("Fetching vendors for wedding:", weddingData._id);
        const vendorsRes = await fetch('/api/vendors', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Vendors response status:", vendorsRes.status);

        if (vendorsRes.ok) {
          const vendorsData = await vendorsRes.json();
          setVendors(vendorsData);
          console.log("Fetched vendors:", vendorsData);
        } else {
          console.log("No vendors found or error fetching");
          setVendors([]);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter and sort vendors
  const filteredAndSortedVendors = useMemo(() => {
    let filtered = vendors.filter(vendor => {
      // Search filter
      if (searchTerm && !vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      // Type filter
      if (filters.type && vendor.type !== filters.type) {
        return false;
      }
      // Status filter
      if (filters.status && vendor.status !== filters.status) {
        return false;
      }
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'vendorName':
          aValue = a.vendorName.toLowerCase();
          bValue = b.vendorName.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        default:
          return 0;
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [vendors, searchTerm, filters]);

  const totalPrice = useMemo(() => {
    return filteredAndSortedVendors.reduce((sum, v) => sum + v.price, 0);
  }, [filteredAndSortedVendors]);

  async function addVendor(e: React.FormEvent) {
    e.preventDefault();
    if (!newVendor.vendorName.trim()) return alert("אנא הכנס שם ספק");
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
      const vendorData = {
        ...newVendor,
        weddingID: weddingId,
      };

      console.log("Adding vendor:", vendorData);

      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(vendorData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error adding vendor:", errorText);
        alert("שגיאה בהוספת ספק");
        return;
      }

      const created = await res.json();
      console.log("Vendor created:", created);
      setVendors([...vendors, created]);
      setNewVendor({
        vendorName: "",
        price: 0,
        notes: "",
        contractURL: "",
        proposalURL: "",
        status: "Pending",
        type: "music",
      });
    } catch (error) {
      console.error("Error adding vendor:", error);
      alert("שגיאה בהוספת ספק");
    }
  }

  async function updateVendor(updatedVendor: Vendor) {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/vendors/${updatedVendor._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedVendor),
      });

      if (res.ok) {
        const updated = await res.json();
        setVendors(vendors.map(v => v._id === updatedVendor._id ? updated : v));
        setEditingVendor(null);
      }
    } catch (error) {
      console.error("Error updating vendor:", error);
    }
  }

  async function deleteVendor(id: string) {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!confirm("האם אתה בטוח שברצונך למחוק ספק זה?")) return;

    try {
      const res = await fetch(`/api/vendors/${id}`, { 
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setVendors(vendors.filter(v => v._id !== id));
      }
    } catch (error) {
      console.error("Error deleting vendor:", error);
    }
  }

  function startEditing(vendor: Vendor) {
    setEditingVendor(vendor);
  }

  function cancelEditing() {
    setEditingVendor(null);
  }

  function getStatusColor(status: VendorStatus) {
    switch (status) {
      case 'Pending': return '#ff9800';
      case 'Confirmed': return '#2196F3';
      case 'Paid': return '#4CAF50';
      default: return '#ddd';
    }
  }

  function getStatusText(status: VendorStatus) {
    switch (status) {
      case 'Pending': return 'ממתין';
      case 'Confirmed': return 'אושר';
      case 'Paid': return 'שולם';
      default: return status;
    }
  }

  function getTypeText(type: VendorType) {
    switch (type) {
      case 'music': return 'מוזיקה';
      case 'food': return 'אוכל';
      case 'photography': return 'צילום';
      case 'decor': return 'קישוט';
      case 'clothes': return 'בגדים';
      case 'makeup_hair': return 'איפור ושיער';
      case 'internet_orders': return 'הזמנות מקוונות';
      case 'other': return 'אחר';
      default: return type;
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
        <p>אנא צור אירוע קודם כדי להוסיף ספקים</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1400px', 
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
        ניהול ספקים
      </h1>

      {/* Help Section */}
      <div style={{
        background: '#e3f2fd',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #2196F3'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>💡 איך לנהל ספקים:</h4>
        <div style={{ fontSize: '14px', lineHeight: '1.5', color: '#333' }}>
          <div><strong>סטטוס:</strong> ממתין → אושר → שולם</div>
          <div><strong>סוג ספק:</strong> בחר את סוג השירות שהספק מספק</div>
          <div><strong>קישורים:</strong> הוסף קישורים לחוזים והצעות</div>
          <div><strong>סינון ומיון:</strong> השתמש בפילטרים כדי למצוא ספקים ספציפיים</div>
        </div>
      </div>

      {/* Add Vendor Form */}
      <div style={{
        background: '#f9f9f9',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid #ddd'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>הוסף ספק חדש</h3>
        <form onSubmit={addVendor} style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              שם הספק *
            </label>
            <input
            
              value={newVendor.vendorName}
              onChange={(e) => setNewVendor({ ...newVendor, vendorName: e.target.value })}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              מחיר (₪) *
            </label>
            <input
              type="number"
              min={0}
              placeholder="לדוגמה: 5000"
              value={newVendor.price}
              onChange={(e) => setNewVendor({ ...newVendor, price: Number(e.target.value) })}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              סוג ספק *
            </label>
            <select
              value={newVendor.type}
              onChange={(e) => setNewVendor({ ...newVendor, type: e.target.value as VendorType })}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="music">מוזיקה</option>
              <option value="food">אוכל</option>
              <option value="photography">צילום</option>
              <option value="decor">קישוט</option>
              <option value="clothes">בגדים</option>
              <option value="makeup_hair">איפור ושיער</option>
              <option value="internet_orders">הזמנות מקוונות</option>
              <option value="other">אחר</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              סטטוס
            </label>
            <select
              value={newVendor.status}
              onChange={(e) => setNewVendor({ ...newVendor, status: e.target.value as VendorStatus })}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="Pending">ממתין</option>
              <option value="Confirmed">אושר</option>
              <option value="Paid">שולם</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              הערות
            </label>
            <input
              placeholder="פרטים נוספים על הספק"
              value={newVendor.notes}
              onChange={(e) => setNewVendor({ ...newVendor, notes: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              קישור חוזה
            </label>
            <input
              placeholder="https://example.com/contract"
              value={newVendor.contractURL}
              onChange={(e) => setNewVendor({ ...newVendor, contractURL: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              קישור הצעה
            </label>
            <input
              placeholder="https://example.com/proposal"
              value={newVendor.proposalURL}
              onChange={(e) => setNewVendor({ ...newVendor, proposalURL: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
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
              הוסף ספק
            </button>
          </div>
        </form>
      </div>

      {/* Filters */}
      <div style={{
        background: '#f5f5f5',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #ddd'
      }}>
        <h4 style={{ margin: '0 0 15px 0' }}>סינון ומיון</h4>
        <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>חיפוש:</label>
            <input
              type="text"
              placeholder="חפש לפי שם ספק"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>סוג ספק:</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">כל הסוגים</option>
              <option value="music">מוזיקה</option>
              <option value="food">אוכל</option>
              <option value="photography">צילום</option>
              <option value="decor">קישוט</option>
              <option value="clothes">בגדים</option>
              <option value="makeup_hair">איפור ושיער</option>
              <option value="internet_orders">הזמנות מקוונות</option>
              <option value="other">אחר</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>סטטוס:</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">כל הסטטוסים</option>
              <option value="Pending">ממתין</option>
              <option value="Confirmed">אושר</option>
              <option value="Paid">שולם</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>מיון לפי:</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value as any})}
              style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="vendorName">שם ספק</option>
              <option value="price">מחיר</option>
              <option value="type">סוג ספק</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>סדר:</label>
            <select
              value={filters.sortOrder}
              onChange={(e) => setFilters({...filters, sortOrder: e.target.value as any})}
              style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="asc">עולה</option>
              <option value="desc">יורד</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vendors List */}
      <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ 
          background: '#f5f5f5', 
          padding: '15px 20px', 
          borderBottom: '1px solid #ddd',
          fontWeight: 'bold'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr', gap: '10px' }}>
            <div>שם הספק</div>
            <div>מחיר (₪)</div>
            <div>סוג ספק</div>
            <div>הערות</div>
            <div>קישור חוזה</div>
            <div>קישור הצעה</div>
            <div>סטטוס</div>
            <div>פעולות</div>
          </div>
        </div>

        {filteredAndSortedVendors.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            אין ספקים ברשימה. הוסף ספק ראשון!
          </div>
        ) : (
          filteredAndSortedVendors.map(vendor => (
            <div key={vendor._id} style={{ 
              padding: '15px 20px', 
              borderBottom: '1px solid #eee',
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
              gap: '10px',
              alignItems: 'center'
            }}>
              {editingVendor && editingVendor._id === vendor._id ? (
                // Edit mode
                <>
                  <input
                    value={editingVendor.vendorName}
                    onChange={e => setEditingVendor({...editingVendor, vendorName: e.target.value})}
                    style={{ padding: '4px', border: '1px solid #ddd', borderRadius: '2px' }}
                  />
                  <input
                    type="number"
                    value={editingVendor.price}
                    onChange={e => setEditingVendor({...editingVendor, price: Number(e.target.value)})}
                    style={{ padding: '4px', border: '1px solid #ddd', borderRadius: '2px' }}
                  />
                  <select
                    value={editingVendor.type}
                    onChange={e => setEditingVendor({...editingVendor, type: e.target.value as VendorType})}
                    style={{ padding: '4px', border: '1px solid #ddd', borderRadius: '2px' }}
                  >
                    <option value="music">מוזיקה</option>
                    <option value="food">אוכל</option>
                    <option value="photography">צילום</option>
                    <option value="decor">קישוט</option>
                    <option value="clothes">בגדים</option>
                    <option value="makeup_hair">איפור ושיער</option>
                    <option value="internet_orders">הזמנות מקוונות</option>
                    <option value="internet_orders">תאורה והגברה</option>

                    <option value="other">אחר</option>
                  </select>
                  <input
                    value={editingVendor.notes || ''}
                    onChange={e => setEditingVendor({...editingVendor, notes: e.target.value})}
                    style={{ padding: '4px', border: '1px solid #ddd', borderRadius: '2px' }}
                  />
                  <input
                    value={editingVendor.contractURL || ''}
                    onChange={e => setEditingVendor({...editingVendor, contractURL: e.target.value})}
                    style={{ padding: '4px', border: '1px solid #ddd', borderRadius: '2px' }}
                  />
                  <input
                    value={editingVendor.proposalURL || ''}
                    onChange={e => setEditingVendor({...editingVendor, proposalURL: e.target.value})}
                    style={{ padding: '4px', border: '1px solid #ddd', borderRadius: '2px' }}
                  />
                  <select
                    value={editingVendor.status}
                    onChange={e => setEditingVendor({...editingVendor, status: e.target.value as VendorStatus})}
                    style={{ padding: '4px', border: '1px solid #ddd', borderRadius: '2px' }}
                  >
                    <option value="Pending">ממתין</option>
                    <option value="Confirmed">אושר</option>
                    <option value="Paid">שולם</option>
                  </select>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button 
                      onClick={() => updateVendor(editingVendor)}
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
                    {vendor.vendorName}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {vendor.price.toLocaleString()} ₪
                  </div>
                  <div>
                    {getTypeText(vendor.type)}
                  </div>
                  <div>
                    {vendor.notes || '-'}
                  </div>
                  <div>
                    {vendor.contractURL ? (
                      <a href={vendor.contractURL} target="_blank" rel="noreferrer" style={{ color: '#2196F3' }}>
                        קישור
                      </a>
                    ) : '-'}
                  </div>
                  <div>
                    {vendor.proposalURL ? (
                      <a href={vendor.proposalURL} target="_blank" rel="noreferrer" style={{ color: '#2196F3' }}>
                        קישור
                      </a>
                    ) : '-'}
                  </div>
                  <div>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: getStatusColor(vendor.status),
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {getStatusText(vendor.status)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button 
                      onClick={() => startEditing(vendor)}
                      style={{ padding: '4px 8px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
                    >
                      ערוך
                    </button>
                    <button 
                      onClick={() => deleteVendor(vendor._id)}
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
      {vendors.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#e8f5e8',
          borderRadius: '8px',
          border: '1px solid #4CAF50'
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>📊 סיכום ספקים</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
            <div><strong>סה"כ ספקים:</strong> {vendors.length}</div>
            <div><strong>סה"כ עלות:</strong> {vendors.reduce((sum, v) => sum + v.price, 0).toLocaleString()} ₪</div>
            <div><strong>ממתינים:</strong> {vendors.filter(v => v.status === 'Pending').length}</div>
            <div><strong>אושרו:</strong> {vendors.filter(v => v.status === 'Confirmed').length}</div>
            <div><strong>שולמו:</strong> {vendors.filter(v => v.status === 'Paid').length}</div>
            <div><strong>עלות ממוצעת:</strong> {Math.round(vendors.reduce((sum, v) => sum + v.price, 0) / vendors.length).toLocaleString()} ₪</div>
          </div>
        </div>
      )}
    </div>
  );
}
