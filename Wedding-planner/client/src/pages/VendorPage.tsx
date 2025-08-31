import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNotification } from "../components/Notification/NotificationContext";

type VendorStatus = "Pending" | "Confirmed" | "Paid";
type VendorType = "music" | "food" | "photography" | "decor" | "clothes" | "makeup_hair" | "internet_orders" | "lighting_sound" | "guest_gifts" | "venue_deposit" | "bride_dress" | "groom_suit" | "shoes" | "jewelry" | "rsvp" | "design_tables" | "bride_bouquet" | "chuppah" | "flowers" | "other";

type Vendor = {
  _id: string;
  weddingID: string;
  vendorName: string;
  price: number;
  depositPaid: boolean;
  depositAmount: number;
  notes?: string;
  contractFile?: string;
  fileURL?: string;
  status: VendorStatus;
  type: VendorType;
};

type MealPricing = {
  basePrice: number;
  childDiscount: number;
  childAgeLimit: number;
  bulkThreshold: number;
  bulkPrice: number;
  bulkMaxGuests: number;
  reservePrice: number;
  reserveThreshold: number;
  reserveMaxGuests: number;
};

type WeddingData = {
  budget: number;
  mealPricing?: MealPricing;
};

type FilterOptions = {
  type: string;
  status: string;
  sortBy: 'vendorName' | 'price' | 'type';
  sortOrder: 'asc' | 'desc';
};

export default function VendorsListPage() {
  const { showNotification } = useNotification();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [weddingId, setWeddingId] = useState<string>('');
  const [weddingData, setWeddingData] = useState<WeddingData>({ budget: 0 });
  const [loading, setLoading] = useState(true);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);

  const [newVendor, setNewVendor] = useState({
    vendorName: "",
    price: 0,
    depositPaid: false,
    depositAmount: 0,
    notes: "",
    contractFile: "",
    fileURL: "",
    status: "Pending" as VendorStatus,
    type: "music" as VendorType,
  });

  const [filters, setFilters] = useState<FilterOptions>({
    type: '',
    status: '',
    sortBy: 'vendorName',
    sortOrder: 'asc'
  });

  // Add state for manual calculation
  const [manualCalculation, setManualCalculation] = useState({
    adultGuests: 0,
    childGuests: 0
  });

  const defaultVendorsCreatedRef = useRef(false);

  // Pre-defined vendor templates
  const defaultVendors = [
    { vendorName: "אקו\"ם", type: "other" as VendorType, notes: "זכויות מוזיקה" },
    { vendorName: "דיג'יי", type: "music" as VendorType, notes: "" },
    { vendorName: "צלם", type: "photography" as VendorType, notes: "" },
    { vendorName: "רב", type: "other" as VendorType, notes: "רב לטקס" },
    { vendorName: "רבנות", type: "other" as VendorType, notes: "טפסי רבנות" },
    { vendorName: "טבעות נישואין", type: "jewelry" as VendorType, notes: "טבעות" },
    { vendorName: "תאורה והגברה", type: "lighting_sound" as VendorType, notes: "" },
    { vendorName: "מתנות לאורחים", type: "guest_gifts" as VendorType, notes: "" },
    { vendorName: "מקדמה לאולם", type: "venue_deposit" as VendorType, notes: "" },
    { vendorName: "שמלות כלה", type: "bride_dress" as VendorType, notes: "" },
    { vendorName: "חליפת חתן", type: "groom_suit" as VendorType, notes: "" },
    { vendorName: "נעליים", type: "shoes" as VendorType, notes: "" },
    { vendorName: "תכשיטים", type: "jewelry" as VendorType, notes: "" },
    { vendorName: "אישורי הגעה", type: "rsvp" as VendorType, notes: "" },
    { vendorName: "עיצוב ושולחנות", type: "design_tables" as VendorType, notes: "" },
    { vendorName: "זר כלה", type: "bride_bouquet" as VendorType, notes: "" },
    { vendorName: "חופה", type: "chuppah" as VendorType, notes: "" },
    { vendorName: "פרחים", type: "flowers" as VendorType, notes: "" },
    { vendorName: "איפור ושיער", type: "makeup_hair" as VendorType, notes: "" },
    { vendorName: "אוכל", type: "food" as VendorType, notes: "" },
    { vendorName: "קישוט", type: "decor" as VendorType, notes: "" },
    { vendorName: "הזמנות מקוונות", type: "internet_orders" as VendorType, notes: "" }
  ];



  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        
        // First, get the user's wedding
        const weddingRes = await fetch('/api/weddings/owner', {
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
        setWeddingData(weddingData);

        // Fetch vendors for this wedding
        const vendorsRes = await fetch('/api/vendors', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (vendorsRes.ok) {
          const vendorsData = await vendorsRes.json();
          setVendors(vendorsData);
          
          // If no vendors exist, create default ones
          if (vendorsData.length === 0) {
            for (const defaultVendor of defaultVendors) {
              const vendorData = {
                ...defaultVendor,
                price: 0,
                depositPaid: false,
                depositAmount: 0,
                contractFile: "",
                fileURL: "",
                status: "Pending" as VendorStatus,
                weddingID: weddingData._id,
              };

              const createRes = await fetch("/api/vendors", {
                method: "POST",
                headers: { 
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(vendorData),
              });

              if (createRes.ok) {
                const created = await createRes.json();
                setVendors(prev => [...prev, created]);
              }
            }
            defaultVendorsCreatedRef.current = true;
          }
        } else {
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

  // Create default vendors after vendors are loaded
  useEffect(() => {
    if (vendors.length > 0 && weddingId) {
      createDefaultVendorsIfNeeded();
    }
  }, [vendors, weddingId]);

  // Create default vendors if no vendors exist at all
  useEffect(() => {
    if (vendors.length === 0 && weddingId && !loading) {
      createDefaultVendorsIfNeeded();
    }
  }, [vendors.length, weddingId, loading]);

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





  async function addVendor(e: React.FormEvent) {
    e.preventDefault();
    if (!newVendor.vendorName.trim()) {
      showNotification("אנא הכנס שם ספק", "warning");
      return;
    }
    if (!weddingId) {
      showNotification("לא נמצא אירוע. אנא צור אירוע קודם.", "error");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      showNotification("לא מזוהה משתמש מחובר", "error");
      return;
    }

    try {
      const vendorData = {
        ...newVendor,
        weddingID: weddingId,
      };

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
        showNotification("שגיאה בהוספת ספק", "error");
        return;
      }

      const created = await res.json();
      setVendors([...vendors, created]);
      setNewVendor({
        vendorName: "",
        price: 0,
        depositPaid: false,
        depositAmount: 0,
        notes: "",
        contractFile: "",
        fileURL: "",
        status: "Pending",
        type: "music",
      });
      setShowAddVendorModal(false);
      
             // Trigger dashboard refresh
       if ((window as any).notifyDashboardUpdate) {
         (window as any).notifyDashboardUpdate('vendor-added');
       } else if ((window as any).triggerDashboardRefresh) {
         (window as any).triggerDashboardRefresh('vendor-added');
       }
    } catch (error) {
      console.error("Error adding vendor:", error);
      showNotification("שגיאה בהוספת ספק", "error");
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
        
                 // Trigger dashboard refresh
         if ((window as any).notifyDashboardUpdate) {
           (window as any).notifyDashboardUpdate('vendor-updated');
         } else if ((window as any).triggerDashboardRefresh) {
           (window as any).triggerDashboardRefresh('vendor-updated');
         }
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
         showNotification("הספק נמחק בהצלחה", "success");
         
         // Trigger dashboard refresh
         if ((window as any).notifyDashboardUpdate) {
           (window as any).notifyDashboardUpdate('vendor-deleted');
         } else if ((window as any).triggerDashboardRefresh) {
           (window as any).triggerDashboardRefresh('vendor-deleted');
         }
       }
    } catch (error) {
      console.error("Error deleting vendor:", error);
    }
  }

  async function createDefaultVendorsIfNeeded() {
    if (!weddingId || defaultVendorsCreatedRef.current) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Check which default vendors are missing
      const existingVendorNames = vendors.map(v => v.vendorName);
      const missingVendors = defaultVendors.filter(dv => !existingVendorNames.includes(dv.vendorName));

      if (missingVendors.length === 0) {
        defaultVendorsCreatedRef.current = true;
        return; // All default vendors already exist
      }

      // Create missing vendors
      for (const defaultVendor of missingVendors) {
        const vendorData = {
          ...defaultVendor,
          price: 0,
          depositPaid: false,
          depositAmount: 0,
          contractFile: "",
          fileURL: "",
          status: "Pending" as VendorStatus,
          weddingID: weddingId,
        };

        const res = await fetch("/api/vendors", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(vendorData),
        });

        if (res.ok) {
          const created = await res.json();
          setVendors(prev => [...prev, created]);
        } else {
          const errorText = await res.text();
          console.error(`Failed to create vendor: ${defaultVendor.vendorName}`, errorText);
          console.error('Vendor data that failed:', vendorData);
        }
      }
      
      // Trigger dashboard refresh after creating default vendors
      if ((window as any).notifyDashboardUpdate) {
        (window as any).notifyDashboardUpdate('default-vendors-created');
      } else if ((window as any).triggerDashboardRefresh) {
        (window as any).triggerDashboardRefresh('default-vendors-created');
      }
      
      defaultVendorsCreatedRef.current = true;
    } catch (error) {
      console.error("Error creating default vendors:", error);
      defaultVendorsCreatedRef.current = true; // Even if there's an error, don't try again
    }
  }

  // File upload functions
  async function uploadFile(file: File): Promise<string | null> {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        return result.filename;
      } else {
        console.error("Failed to upload file:", await res.text());
        return null;
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    }
  }



  function viewFile(filename: string) {
    const baseUrl = import.meta.env.VITE_API_URL || 'https://wedding-planner-wj86.onrender.com';
    const url = `${baseUrl}/uploads/${encodeURIComponent(filename)}`;
    window.open(url, '_blank');
  }



  function startEditing(vendor: Vendor) {
    setEditingVendor(vendor);
  }

  function cancelEditing() {
    setEditingVendor(null);
  }

  // removed unused helpers (replaced with chips and icons)

  function getTypeText(type: VendorType) {
    switch (type) {
      case 'music': return 'מוזיקה';
      case 'food': return 'אוכל';
      case 'photography': return 'צילום';
      case 'decor': return 'קישוט';
      case 'clothes': return 'בגדים';
      case 'makeup_hair': return 'איפור ושיער';
      case 'internet_orders': return 'הזמנות מקוונות';
      case 'lighting_sound': return 'תאורה והגברה';
      case 'guest_gifts': return 'מתנות לאורחים';
      case 'venue_deposit': return 'מקדמה לאולם';
      case 'bride_dress': return 'שמלות כלה';
      case 'groom_suit': return 'חליפת חתן';
      case 'shoes': return 'נעליים';
      case 'jewelry': return 'תכשיטים';
      case 'rsvp': return 'אישורי הגעה';
      case 'design_tables': return 'עיצוב ושולחנות';
      case 'bride_bouquet': return 'זר כלה';
      case 'chuppah': return 'חופה';
      case 'flowers': return 'פרחים';
      case 'other': return 'אחר';
      default: return type;
    }
  }

  // Calculate meal costs for manual input
  const calculateManualMealCost = () => {
    if (!weddingData.mealPricing) {
      const { adultGuests, childGuests } = manualCalculation;
      const totalGuests = adultGuests + childGuests;
      return { totalCost: 0, costPerPerson: 0, adultGuests, childGuests, totalGuests };
    }

    const { basePrice, childDiscount, bulkThreshold, bulkPrice, bulkMaxGuests, reservePrice } = weddingData.mealPricing;
    const { adultGuests, childGuests } = manualCalculation;
    const totalGuests = adultGuests + childGuests;

    let totalCost = 0;
    let remainingGuests = totalGuests;

    // Base price tier (0 to bulkThreshold)
    const baseGuests = Math.min(remainingGuests, bulkThreshold);
    if (baseGuests > 0) {
      const baseCost = baseGuests * basePrice;
      totalCost += baseCost;
      remainingGuests -= baseGuests;
    }

    // Bulk price tier (bulkThreshold + 1 to bulkMaxGuests)
    if (remainingGuests > 0 && bulkPrice > 0) {
      const bulkGuests = Math.min(remainingGuests, bulkMaxGuests - bulkThreshold);
      if (bulkGuests > 0) {
        const bulkCost = bulkGuests * bulkPrice;
        totalCost += bulkCost;
        remainingGuests -= bulkGuests;
      }
    }

    // Reserve price tier (reserveThreshold and above)
    if (remainingGuests > 0 && reservePrice > 0) {
      const reserveGuests = remainingGuests;
      const reserveCost = reserveGuests * reservePrice;
      totalCost += reserveCost;
    }

    // Apply child discount
    const childCost = childGuests * (basePrice * (1 - childDiscount / 100));
    totalCost += childCost;

    const costPerPerson = totalGuests > 0 ? totalCost / totalGuests : 0;

    return { totalCost, costPerPerson, adultGuests, childGuests, totalGuests };
  };

  // Calculate vendor costs for manual input
  const calculateManualVendorCost = () => {
    const { adultGuests, childGuests } = manualCalculation;
    const totalGuests = adultGuests + childGuests;
    const totalVendorCost = vendors.reduce((sum, v) => sum + v.price, 0);
    const totalDeposits = vendors.reduce((sum, v) => sum + (v.depositAmount || 0), 0);
    const remainingToPay = totalVendorCost - totalDeposits;
    const costPerPerson = totalGuests > 0 ? totalVendorCost / totalGuests : 0;

    return { 
      totalVendorCost, 
      totalDeposits, 
      remainingToPay, 
      costPerPerson, 
      adultGuests, 
      childGuests, 
      totalGuests 
    };
  };

  // Calculate total event cost (meals + vendors)
  const calculateTotalEventCost = () => {
    const mealCost = calculateManualMealCost();
    const vendorCost = calculateManualVendorCost();
    const totalEventCost = mealCost.totalCost + vendorCost.totalVendorCost;
    const eventCostPerPerson = mealCost.totalGuests > 0 ? totalEventCost / mealCost.totalGuests : 0;

    return {
      mealCost: mealCost.totalCost,
      vendorCost: vendorCost.totalVendorCost,
      totalEventCost,
      eventCostPerPerson,
      totalGuests: mealCost.totalGuests
    };
  };



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
      maxWidth: '1200px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
      direction: 'rtl',
      background: '#f0f4f8',
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
            🏢
          </div>
          <h1 style={{ 
            margin: 0,
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1d5a78'
          }}>
            ניהול ספקים
          </h1>
        </div>
        <button 
          onClick={() => setShowAddVendorModal(true)}
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
          + ספק חדש
        </button>
      </div>

      {/* Vendor Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Total Vendors */}
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
            {vendors.length}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            סה"כ ספקים
          </div>
        </div>

        {/* Total Cost */}
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
            {vendors.reduce((sum, v) => sum + v.price, 0).toLocaleString()} ₪
          </div>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            סה"כ עלות
          </div>
        </div>

        {/* Total Deposits */}
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
            {vendors.reduce((sum, v) => sum + (v.depositAmount || 0), 0).toLocaleString()} ₪
          </div>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            סה"כ מקדמות
          </div>
        </div>

        {/* Remaining to Pay */}
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
            {vendors.reduce((sum, v) => sum + (v.price - (v.depositAmount || 0)), 0).toLocaleString()} ₪
          </div>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            נותר לשלם
          </div>
        </div>

        {/* Pending Vendors */}
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
            {vendors.filter(v => v.status === 'Pending').length}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            ממתינים
          </div>
        </div>

        {/* Confirmed Vendors */}
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
            color: '#059669',
            marginBottom: '8px'
          }}>
            {vendors.filter(v => v.status === 'Confirmed').length}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            אושרו
          </div>
        </div>

        {/* Paid Vendors */}
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
            {vendors.filter(v => v.status === 'Paid').length}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            שולמו
          </div>
        </div>

        {/* Average Cost */}
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
            color: '#6366f1',
            marginBottom: '8px'
          }}>
            {vendors.length > 0 ? Math.round(vendors.reduce((sum, v) => sum + v.price, 0) / vendors.length).toLocaleString() : 0} ₪
          </div>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            עלות ממוצעת
          </div>
        </div>
      </div>

      {/* Add Another Vendor Button */}
      <div style={{
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <button 
          onClick={() => setShowAddVendorModal(true)}
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
          + עוד ספק
        </button>
      </div>

      {/* Manual Calculation Section */}
      <div style={{
        marginBottom: '30px',
        padding: '20px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ 
          margin: '0 0 20px 0',
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#1d5a78'
        }}>
          🧮 חישוב ידני - אומדן מותאם אישית
        </h2>
        
        <div style={{
          background: '#f8fafc',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          marginBottom: '20px'
        }}>
          <h3 style={{ 
            margin: '0 0 15px 0',
            fontSize: '16px',
            fontWeight: '600',
            color: '#374151'
          }}>
            הכנס מספרי אורחים לבדיקה (עלות מנות + ספקים)
          </h3>
          
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  מספר מבוגרים
                </label>
                <input
                  type="number"
                  min="0"
                  value={manualCalculation.adultGuests}
                  onChange={(e) => setManualCalculation(prev => ({
                    ...prev,
                    adultGuests: Number(e.target.value)
                  }))}
                  style={{
                    width: '100%',
                    padding: '12px',
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

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  מספר ילדים
                </label>
                <input
                  type="number"
                  min="0"
                  value={manualCalculation.childGuests}
                  onChange={(e) => setManualCalculation(prev => ({
                    ...prev,
                    childGuests: Number(e.target.value)
                  }))}
                  style={{
                    width: '100%',
                    padding: '12px',
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
            </div>
        </div>

        {/* Manual Calculation Results (Meals + Vendors) */}
        {manualCalculation.adultGuests > 0 || manualCalculation.childGuests > 0 ? (
          <div className="alert success">
            <h3 className="mb-lg">תוצאות החישוב</h3>
            
            <div className="grid grid-4">
                          <div className="text-center">
              <div className="text-secondary mb-sm">סה"כ אורחים</div>
              <div className="text-primary" style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {calculateTotalEventCost().totalGuests}
              </div>
            </div>
            <div className="text-center">
              <div className="text-secondary mb-sm">מבוגרים</div>
              <div className="text-primary" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {calculateManualMealCost().adultGuests}
              </div>
            </div>
            <div className="text-center">
              <div className="text-secondary mb-sm">ילדים</div>
              <div className="text-primary" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {calculateManualMealCost().childGuests}
              </div>
            </div>
            <div className="text-center">
              <div className="text-secondary mb-sm">עלות ממוצעת למנה</div>
              <div className="text-primary" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {calculateManualMealCost().costPerPerson.toFixed(0)} ₪
              </div>
            </div>
            <div className="text-center">
              <div className="text-secondary mb-sm">סה"כ עלות מנות</div>
              <div className="text-primary" style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {calculateTotalEventCost().mealCost.toLocaleString()} ₪
              </div>
            </div>
            <div className="text-center">
              <div className="text-secondary mb-sm">סה"כ ספקים</div>
              <div className="text-primary" style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {calculateTotalEventCost().vendorCost.toLocaleString()} ₪
              </div>
            </div>
            <div className="text-center">
              <div className="text-secondary mb-sm">סה"כ עלות אירוע</div>
              <div className="text-primary" style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {calculateTotalEventCost().totalEventCost.toLocaleString()} ₪
              </div>
            </div>
            <div className="text-center">
              <div className="text-secondary mb-sm">עלות לאיש</div>
              <div className="text-primary" style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {calculateTotalEventCost().eventCostPerPerson.toFixed(0)} ₪
              </div>
            </div>
            </div>

            {/* Detailed Breakdown */}
            {(() => {
              const mealCost = calculateManualMealCost();
              const vendorCost = calculateManualVendorCost();
              const totalCost = calculateTotalEventCost();
              return mealCost && mealCost.totalGuests && mealCost.totalGuests > 0 ? (
                <div className="card mt-lg">
                  <div className="text-primary mb-md" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    פירוט החישוב (מנות + ספקים):
                  </div>
                  <div className="text-secondary" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                    {weddingData.mealPricing ? (
                      <>
                        <div>• מבוגרים: {mealCost.adultGuests || 0} × {weddingData.mealPricing?.basePrice || 0} ₪ = {((mealCost.adultGuests || 0) * (weddingData.mealPricing?.basePrice || 0)).toLocaleString()} ₪</div>
                        <div>• ילדים: {mealCost.childGuests || 0} × {((weddingData.mealPricing?.basePrice || 0) * (1 - (weddingData.mealPricing?.childDiscount || 0) / 100)).toFixed(0)} ₪ = {((mealCost.childGuests || 0) * ((weddingData.mealPricing?.basePrice || 0) * (1 - (weddingData.mealPricing?.childDiscount || 0) / 100))).toLocaleString()} ₪</div>
                        {weddingData.mealPricing && (mealCost.totalGuests || 0) >= (weddingData.mealPricing?.bulkThreshold || 0) && (weddingData.mealPricing?.bulkPrice || 0) > 0 && (
                          <div className="text-primary" style={{ fontWeight: 'bold' }}>
                            ✓ מחיר התחייבות מיושם (מעל {weddingData.mealPricing?.bulkThreshold || 0} אורחים)
                          </div>
                        )}
                        {weddingData.mealPricing && (mealCost.totalGuests || 0) >= (weddingData.mealPricing?.reserveThreshold || 0) && (weddingData.mealPricing?.reservePrice || 0) > 0 && (
                          <div className="text-primary" style={{ fontWeight: 'bold' }}>
                            ✓ מחיר רזרבה מיושם (מעל {weddingData.mealPricing?.reserveThreshold || 0} אורחים)
                          </div>
                        )}
                      </>
                    ) : (
                      <div>• אין תמחור מנות מוגדר</div>
                    )}
                    <div className="mt-md">• הוצאות ספקים: {vendorCost.totalVendorCost.toLocaleString()} ₪</div>
                    <div>• סה"כ אירוע: {totalCost.totalEventCost.toLocaleString()} ₪</div>
                    <div>• עלות לאיש: {totalCost.eventCostPerPerson.toFixed(0)} ₪</div>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            color: '#6b7280',
            fontStyle: 'italic',
            padding: '20px'
          }}>
            הכנס מספרי אורחים כדי לראות את החישוב
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
            placeholder="חפשו לפי שם ספק..."
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
              { value: 'Pending', label: 'ממתין' },
              { value: 'Confirmed', label: 'אושר' },
              { value: 'Paid', label: 'שולם' }
            ].map((option) => (
              <button
                key={option.value + option.label}
                onClick={() => setFilters(prev => ({ ...prev, status: option.value }))}
                style={{
                  padding: '8px 16px',
                  background: filters.status === option.value ? '#1d5a78' : '#f3f4f6',
                  color: filters.status === option.value ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (filters.status !== option.value) {
                    e.currentTarget.style.background = '#e5e7eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (filters.status !== option.value) {
                    e.currentTarget.style.background = '#f3f4f6';
                  }
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <div style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '10px'
          }}>
            סוג:
          </div>
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {[
              { value: '', label: 'הכל' },
              { value: 'music', label: 'מוזיקה' },
              { value: 'food', label: 'אוכל' },
              { value: 'photography', label: 'צילום' },
              { value: 'decor', label: 'קישוט' },
              { value: 'makeup_hair', label: 'איפור ושיער' },
              { value: 'other', label: 'אחר' }
            ].map((option) => (
              <button
                key={option.value + option.label}
                onClick={() => setFilters(prev => ({ ...prev, type: option.value }))}
                style={{
                  padding: '8px 16px',
                  background: filters.type === option.value ? '#1d5a78' : '#f3f4f6',
                  color: filters.type === option.value ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (filters.type !== option.value) {
                    e.currentTarget.style.background = '#e5e7eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (filters.type !== option.value) {
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

             {/* Vendor List */}
      {filteredAndSortedVendors.length === 0 ? (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          color: '#6b7280',
          fontSize: '16px'
        }}>
          אין ספקים תואמים. נסה לסנן אחרת או להוסיף ספק.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {filteredAndSortedVendors.map(vendor => (
            <div key={vendor._id} style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #f3f4f6'
            }}>
              {editingVendor && editingVendor._id === vendor._id ? (
                <>
                  {/* Edit Mode */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px',
                    paddingBottom: '15px',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    <input
                      value={editingVendor.vendorName}
                      onChange={e => setEditingVendor({ ...editingVendor, vendorName: e.target.value })}
                      style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#1d5a78',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        padding: '8px',
                        width: '200px'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => updateVendor(editingVendor)}
                        style={{
                          padding: '6px',
                          background: '#10b981',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: 'all 0.2s ease'
                        }}
                        title="שמור"
                      >
                        💾
                      </button>
                      <button
                        onClick={cancelEditing}
                        style={{
                          padding: '6px',
                          background: '#ef4444',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: 'all 0.2s ease'
                        }}
                        title="בטל"
                      >
                        ✖️
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginBottom: '4px',
                          display: 'block'
                        }}>
                          מחיר (₪)
                        </label>
                        <input
                          type="number"
                          value={editingVendor.price}
                          onChange={e => setEditingVendor({ ...editingVendor, price: Number(e.target.value) })}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginBottom: '4px',
                          display: 'block'
                        }}>
                          סוג ספק
                        </label>
                        <select
                          value={editingVendor.type}
                          onChange={e => setEditingVendor({ ...editingVendor, type: e.target.value as VendorType })}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        >
                          <option value="music">מוזיקה</option>
                          <option value="food">אוכל</option>
                          <option value="photography">צילום</option>
                          <option value="decor">קישוט</option>
                          <option value="makeup_hair">איפור ושיער</option>
                          <option value="lighting_sound">תאורה והגברה</option>
                          <option value="guest_gifts">מתנות לאורחים</option>
                          <option value="venue_deposit">מקדמה לאולם</option>
                          <option value="bride_dress">שמלות כלה</option>
                          <option value="groom_suit">חליפת חתן</option>
                          <option value="shoes">נעליים</option>
                          <option value="jewelry">תכשיטים</option>
                          <option value="rsvp">אישורי הגעה</option>
                          <option value="design_tables">עיצוב ושולחנות</option>
                          <option value="bride_bouquet">זר כלה</option>
                          <option value="chuppah">חופה</option>
                          <option value="flowers">פרחים</option>
                          <option value="other">אחר</option>
                        </select>
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginBottom: '4px',
                          display: 'block'
                        }}>
                          סטטוס
                        </label>
                        <select
                          value={editingVendor.status}
                          onChange={e => setEditingVendor({ ...editingVendor, status: e.target.value as VendorStatus })}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        >
                          <option value="Pending">ממתין</option>
                          <option value="Confirmed">אושר</option>
                          <option value="Paid">שולם</option>
                        </select>
                      </div>
                      <div>
                        <label style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginBottom: '4px',
                          display: 'block'
                        }}>
                          מקדמה
                        </label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={editingVendor.depositPaid || false}
                            onChange={e => setEditingVendor({ ...editingVendor, depositPaid: e.target.checked })}
                          />
                          <input
                            type="number"
                            min={0}
                            max={editingVendor.price}
                            placeholder="0"
                            value={editingVendor.depositAmount || 0}
                            onChange={e => setEditingVendor({ ...editingVendor, depositAmount: Number(e.target.value) })}
                            disabled={!editingVendor.depositPaid}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #e5e7eb',
                              borderRadius: '6px',
                              fontSize: '14px',
                              backgroundColor: !editingVendor.depositPaid ? '#f5f5f5' : 'white'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        marginBottom: '4px',
                        display: 'block'
                      }}>
                        הערות
                      </label>
                      <input
                        value={editingVendor.notes || ''}
                        onChange={e => setEditingVendor({ ...editingVendor, notes: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Display Mode */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px',
                    paddingBottom: '15px',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#1d5a78',
                        marginBottom: '4px'
                      }}>
                        {vendor.vendorName}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        {getTypeText(vendor.type)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => startEditing(vendor)}
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
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteVendor(vendor._id)}
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
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '12px' }}>
                    {/* Price and Remaining */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginBottom: '4px'
                        }}>
                          מחיר
                        </div>
                        <div style={{
                          fontSize: '16px',
                          color: '#374151',
                          fontWeight: '600'
                        }}>
                          {vendor.price.toLocaleString()} ₪
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginBottom: '4px'
                        }}>
                          נותר לשלם
                        </div>
                        <div style={{
                          fontSize: '16px',
                          color: '#ef4444',
                          fontWeight: '600'
                        }}>
                          {(vendor.price - (vendor.depositAmount || 0)).toLocaleString()} ₪
                        </div>
                      </div>
                    </div>

                    {/* Deposit and Status */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginBottom: '4px'
                        }}>
                          מקדמה
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#374151'
                        }}>
                          {vendor.depositPaid ? `💵 ${vendor.depositAmount?.toLocaleString()} ₪` : '❌ לא שולם'}
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginBottom: '8px'
                        }}>
                          סטטוס
                        </div>
                        <div style={{
                          display: 'inline-block',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500',
                          background: vendor.status === 'Confirmed' ? '#dcfce7' : 
                                     vendor.status === 'Paid' ? '#dbeafe' : '#fef3c7',
                          color: vendor.status === 'Confirmed' ? '#166534' : 
                                 vendor.status === 'Paid' ? '#1e40af' : '#92400e'
                        }}>
                          {vendor.status === 'Pending' ? '⏳ ממתין' : 
                           vendor.status === 'Confirmed' ? '✅ אושר' : '💸 שולם'}
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {vendor.notes && (
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
                          {vendor.notes}
                        </div>
                      </div>
                    )}

                    {/* Files */}
                    {(vendor.contractFile || vendor.fileURL) && (
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        paddingTop: '12px',
                        borderTop: '1px solid #f3f4f6'
                      }}>
                        {vendor.contractFile && (
                          <button
                            onClick={() => viewFile(vendor.contractFile!)}
                            style={{
                              padding: '6px 12px',
                              background: '#f3f4f6',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              transition: 'all 0.2s ease'
                            }}
                            title="צפה בחוזה"
                          >
                            📄 חוזה
                          </button>
                        )}
                        {vendor.fileURL && (
                          <button
                            onClick={() => viewFile(vendor.fileURL!)}
                            style={{
                              padding: '6px 12px',
                              background: '#f3f4f6',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              transition: 'all 0.2s ease'
                            }}
                            title="צפה במסמך"
                          >
                            📄 מסמך
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Vendor Modal */}
      {showAddVendorModal && (
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
            padding: '30px',
            maxWidth: '700px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '25px'
            }}>
              <h2 style={{ margin: 0, color: '#1d5a78', fontSize: '24px', fontWeight: 'bold' }}>הוספת ספק חדש</h2>
              <button
                onClick={() => setShowAddVendorModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={addVendor} style={{ display: 'grid', gap: '20px' }}>
              {/* Basic Info */}
              <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1d5a78', fontSize: '14px' }}>
                    שם הספק *
                  </label>
                  <input
                    value={newVendor.vendorName}
                    onChange={e => setNewVendor({ ...newVendor, vendorName: e.target.value })}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1d5a78';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E7EB';
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1d5a78', fontSize: '14px' }}>
                    מחיר (₪) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newVendor.price}
                    onChange={e => setNewVendor({ ...newVendor, price: Number(e.target.value) })}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1d5a78';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E7EB';
                    }}
                  />
                </div>
              </div>

              {/* Type and Status */}
              <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1d5a78', fontSize: '14px' }}>
                    סוג ספק *
                  </label>
                  <select
                    value={newVendor.type}
                    onChange={e => setNewVendor({ ...newVendor, type: e.target.value as VendorType })}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1d5a78';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E7EB';
                    }}
                  >
                    <option value="music">מוזיקה</option>
                    <option value="food">אוכל</option>
                    <option value="photography">צילום</option>
                    <option value="decor">קישוט</option>
                    <option value="makeup_hair">איפור ושיער</option>
                    <option value="lighting_sound">תאורה והגברה</option>
                    <option value="guest_gifts">מתנות לאורחים</option>
                    <option value="venue_deposit">מקדמה לאולם</option>
                    <option value="bride_dress">שמלות כלה</option>
                    <option value="groom_suit">חליפת חתן</option>
                    <option value="shoes">נעליים</option>
                    <option value="jewelry">תכשיטים</option>
                    <option value="rsvp">אישורי הגעה</option>
                    <option value="design_tables">עיצוב ושולחנות</option>
                    <option value="bride_bouquet">זר כלה</option>
                    <option value="chuppah">חופה</option>
                    <option value="flowers">פרחים</option>
                    <option value="other">אחר</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1d5a78', fontSize: '14px' }}>
                    סטטוס
                  </label>
                  <select
                    value={newVendor.status}
                    onChange={e => setNewVendor({ ...newVendor, status: e.target.value as VendorStatus })}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1d5a78';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E7EB';
                    }}
                  >
                    <option value="Pending">ממתין</option>
                    <option value="Confirmed">אושר</option>
                    <option value="Paid">שולם</option>
                  </select>
                </div>
              </div>

              {/* Deposit */}
              <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1d5a78', fontSize: '14px' }}>
                    שולם מקדמה
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      checked={newVendor.depositPaid}
                      onChange={e => setNewVendor({ ...newVendor, depositPaid: e.target.checked })}
                      style={{ 
                        width: '18px', 
                        height: '18px',
                        accentColor: '#1d5a78'
                      }}
                    />
                    <span style={{ fontSize: '14px', color: '#374151' }}>
                      {newVendor.depositPaid ? 'כן' : 'לא'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1d5a78', fontSize: '14px' }}>
                    סכום מקדמה (₪)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={newVendor.price}
                    placeholder="0"
                    value={newVendor.depositAmount}
                    onChange={e => setNewVendor({ ...newVendor, depositAmount: Number(e.target.value) })}
                    disabled={!newVendor.depositPaid}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: !newVendor.depositPaid ? '#f5f5f5' : 'white',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => {
                      if (newVendor.depositPaid) {
                        e.target.style.borderColor = '#1d5a78';
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E7EB';
                    }}
                  />
                  {newVendor.depositPaid && newVendor.depositAmount > 0 && (
                    <small style={{ color: '#059669', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                      נותר לשלם: {(newVendor.price - newVendor.depositAmount).toLocaleString()} ₪
                    </small>
                  )}
                </div>
              </div>

              {/* File Uploads */}
              <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1d5a78', fontSize: '14px' }}>
                    העלאת חוזה
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const filename = await uploadFile(file);
                        if (filename) {
                          setNewVendor({ ...newVendor, contractFile: filename });
                        } else {
                          showNotification('שגיאה בהעלאת הקובץ', 'error');
                        }
                      }
                    }}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1d5a78';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E7EB';
                    }}
                  />
                  {newVendor.contractFile && (
                    <small style={{ color: '#059669', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                      ✓ קובץ נבחר: {newVendor.contractFile}
                    </small>
                  )}
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1d5a78', fontSize: '14px' }}>
                    העלאת מסמך נוסף
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const filename = await uploadFile(file);
                        if (filename) {
                          setNewVendor({ ...newVendor, fileURL: filename });
                        } else {
                          showNotification('שגיאה בהעלאת הקובץ', 'error');
                        }
                      }
                    }}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1d5a78';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E7EB';
                    }}
                  />
                  {newVendor.fileURL && (
                    <small style={{ color: '#059669', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                      ✓ קובץ נבחר: {newVendor.fileURL}
                    </small>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1d5a78', fontSize: '14px' }}>
                  הערות
                </label>
                <textarea
                  value={newVendor.notes}
                  onChange={e => setNewVendor({ ...newVendor, notes: e.target.value })}
                  placeholder="הערות נוספות על הספק..."
                  rows={3}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #E5E7EB', 
                    borderRadius: '8px', 
                    resize: 'vertical',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1d5a78';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB';
                  }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '25px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddVendorModal(false)}
                  style={{
                    padding: '12px 24px',
                    background: '#6b7280',
                    color: '#ffffff',
                    border: '2px solid #6b7280',
                    borderRadius: '8px',
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
                    padding: '12px 24px',
                    background: '#1d5a78',
                    color: '#ffffff',
                    border: '2px solid #1d5a78',
                    borderRadius: '8px',
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
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(29, 90, 120, 0.3)';
                    e.currentTarget.style.borderColor = '#164e63';
                    e.currentTarget.style.background = '#164e63';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#1d5a78';
                    e.currentTarget.style.background = '#1d5a78';
                  }}
                >
                  הוסף ספק
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}

