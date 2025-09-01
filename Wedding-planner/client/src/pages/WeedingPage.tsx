import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useNotification } from "../components/Notification/NotificationContext";
import { apiUrl } from "../utils/api";
import { 
  Heart_24, 
  Success_24, 
  Trash_24, 
  Link_24, 
  Copy_24, 
  Budget_24,
  Clock_24,
  Guests_24,
  Settings_24,
  Edit_24,
  Plus_24
} from "../components/Icons/WeddingIconsLibrary";

type Participant = {
  id: string;
  name: string;
};

type WeddingStatus =
  | "Planning"
  | "Confirmed"
  | "Cancelled"
  | "Finished"
  | "Postponed";

type MealPricing = {
  basePrice: number;
  childDiscount: number; // percentage
  childAgeLimit: number;
  bulkThreshold: number;
  bulkPrice: number;
  bulkMaxGuests: number;
  reservePrice: number;
  reserveThreshold: number;
  reserveMaxGuests: number;
};

type WeddingData = {
  _id?: string;
  weddingName: string;
  weddingDate: string;
  startTime?: string;
  location?: string;
  addressDetails?: string;
  budget?: number;
  notes?: string;
  status: WeddingStatus;
  participants: Participant[];
  mealPricing?: MealPricing;
};

// Minimal vendor type for totals
type Vendor = {
  _id: string;
  price: number;
};

const initialWedding: WeddingData = {
  weddingName: "",
  weddingDate: "",
  startTime: "",
  location: "",
  addressDetails: "",
  budget: 0,
  notes: "",
  status: "Planning",
  participants: [],
  mealPricing: {
    basePrice: 0,
    childDiscount: 50,
    childAgeLimit: 12,
    bulkThreshold: 250,
    bulkPrice: 0,
    bulkMaxGuests: 300,
    reservePrice: 0,
    reserveThreshold: 300,
    reserveMaxGuests: 500
  }
};

export default function WeddingPage() {
  const { showNotification } = useNotification();
  const [searchParams] = useSearchParams();
  const weddingId = searchParams.get('weddingId');
  
  const [wedding, setWedding] = useState<WeddingData>(initialWedding);
  const [allUsers, setAllUsers] = useState<Participant[]>([]);
  const [selectedParticipantId, setSelectedParticipantId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [mealCalculation, setMealCalculation] = useState({
    adultGuests: 0,
    childGuests: 0,
    totalGuests: 0,
    totalCost: 0,
    costPerPerson: 0
  });

  // Add state for guest counts by status
  const [guestCounts, setGuestCounts] = useState({
    confirmed: 0,
    maybe: 0,
    pending: 0,
    total: 0
  });

  // Add state for editing meal pricing
  const [isEditingMealPricing, setIsEditingMealPricing] = useState(false);

  // Add state for manual calculation
  const [manualCalculation, setManualCalculation] = useState({
    adultGuests: 0,
    childGuests: 0
  });

  // Vendors for total expenses in manual calc (vendors + meals)
  const [vendors, setVendors] = useState<Vendor[]>([]);

  // Add state for auto-saving indicator
  const [autoSaving, setAutoSaving] = useState(false);

  // Add ref for debounce timeout
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(apiUrl("/api/users"));
        if (!res.ok) throw new Error(res.statusText);
        const users = await res.json();

        setAllUsers(
          users.map((u: any) => ({
            id: u._id,
            name: `${u.firstName} ${u.lastName}`,
          }))
        );
        return users; // Return users for fetchWedding to use
      } catch (error) {
        console.error("שגיאה בשליפת משתמשים", error);
        return [];
      }
    }

    async function fetchWedding(users: any[]) {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // If weddingId is provided, fetch that specific wedding, otherwise fetch user's wedding
        const endpoint = weddingId ? `/api/weddings/${weddingId}` : "/api/weddings/owner";
        const res = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 404) {
          setWedding(initialWedding);
          setLoading(false);
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch wedding");

        const data = await res.json();

        // Convert date to string format for the input field
        const formattedDate = data.weddingDate 
          ? new Date(data.weddingDate).toISOString().split('T')[0]
          : "";

        // Handle participants - they come as ObjectIds from server
        const participants = (data.participants || []).map((p: any) => {
          if (typeof p === "string") {
            // If it's just an ID string, find the user name
            const user = users.find((u: any) => u._id === p);
            return { id: p, name: user ? `${user.firstName} ${user.lastName}` : "Unknown User" };
          } else if (p._id) {
            // If it's an object with _id
            const user = users.find((u: any) => u._id === p._id);
            return { id: p._id, name: user ? `${user.firstName} ${user.lastName}` : p.name || "Unknown User" };
          }
          return { id: p.id || p, name: p.name || "Unknown User" };
        });

        const weddingData = { 
          ...data, 
          weddingDate: formattedDate,
          participants,
          mealPricing: data.mealPricing || initialWedding.mealPricing
        };
        
        setWedding(weddingData);
      } catch (error) {
        console.error("שגיאה בשליפת אירוע", error);
      } finally {
        setLoading(false);
      }
    }

    // Execute in sequence: fetchUsers first, then fetchWedding
    fetchUsers().then(fetchWedding);
  }, []);

  // Fetch vendors for totals
  useEffect(() => {
    async function fetchVendors() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(apiUrl("/api/vendors"), { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setVendors(data);
        }
      } catch (e) {
        // ignore
      }
    }
    fetchVendors();
  }, []);

  // Fetch guest counts from guest list
  useEffect(() => {
    async function fetchGuestCounts() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(apiUrl("/api/guests"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const guests = await res.json();
          const counts = {
            confirmed: guests.filter((g: any) => g.status === 'Confirmed').length,
            maybe: guests.filter((g: any) => g.status === 'Maybe').length,
            pending: guests.filter((g: any) => g.status === 'Pending').length,
            total: guests.length
          };
          setGuestCounts(counts);
        }
      } catch (error) {
        console.error('Error fetching guest counts:', error);
      }
    }

    fetchGuestCounts();
  }, []);

  function handleInputChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;
    setWedding((prev) => ({
      ...prev,
      [name]: name === "budget" ? Number(value) : value,
    }));
  }

  function handleAddParticipant() {
    if (!selectedParticipantId) return;
    if (wedding.participants.some((p) => p.id === selectedParticipantId)) return;

    const participant = allUsers.find((u) => u.id === selectedParticipantId);
    if (!participant) return;

    setWedding((prev) => ({
      ...prev,
      participants: [...prev.participants, participant],
    }));
    setSelectedParticipantId("");
  }

  function handleRemoveParticipant(id: string) {
    const participant = wedding.participants.find((p) => p.id === id);
    if (!participant) return;

    const confirmMessage = `האם אתה בטוח שברצונך להסיר את ${participant.name} מהאירוע?`;
    if (!confirm(confirmMessage)) {
      return;
    }

    setWedding((prev) => ({
      ...prev,
      participants: prev.participants.filter((p) => p.id !== id),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await saveWeddingData();
  }

  async function saveWeddingData() {
    setSaving(true);
    
    const currentUserRaw = localStorage.getItem("currentUser");
    const token = localStorage.getItem("token");
    const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;

    if (!currentUser || !currentUser._id) {
      showNotification("לא מזוהה משתמש מחובר", "error");
      setSaving(false);
      return;
    }

    const participantIds = wedding.participants.map((p) => p.id);
    if (!participantIds.includes(currentUser._id)) participantIds.push(currentUser._id);

    const weddingToSave = {
      weddingName: wedding.weddingName,
      weddingDate: wedding.weddingDate,
      startTime: wedding.startTime,
      location: wedding.location,
      addressDetails: wedding.addressDetails,
      budget: wedding.budget,
      notes: wedding.notes,
      status: wedding.status,
      ownerID: currentUser._id,
      participants: participantIds,
      mealPricing: wedding.mealPricing,
    };



          try {
        let res;
        if (wedding._id) {
          res = await fetch(`/api/weddings/${wedding._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(weddingToSave),
        });
      } else {
        res = await fetch("/api/weddings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(weddingToSave),
        });
      }



      if (!res.ok) {
        const text = await res.text();
        console.error("❌ שגיאה בשמירת אירוע:", text);
        showNotification("שגיאה בשמירת האירוע", "error");
        return;
      }

      const saved = await res.json();
      setWedding({ ...wedding, _id: saved._id });
      
      // Only show alert for manual saves, not auto-saves
      if (!autoSaving) {
        showNotification("האירוע נשמר בהצלחה!", "success");
      }
    } catch (error) {
      console.error("❌ שגיאה בשמירת אירוע:", error);
      if (!autoSaving) {
        showNotification("שגיאה בשמירת האירוע", "error");
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteWedding() {
    if (!wedding._id) {
      showNotification("לא ניתן למחוק אירוע שלא נשמר", "warning");
      return;
    }

    if (!confirm("האם אתה בטוח שברצונך למחוק את האירוע? פעולה זו אינה הפיכה ותמחק את כל הנתונים הקשורים לאירוע.")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      showNotification("לא מזוהה משתמש מחובר", "error");
      return;
    }

    try {
      const res = await fetch(`/api/weddings/${wedding._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error deleting wedding:", errorText);
        showNotification("שגיאה במחיקת האירוע", "error");
        return;
      }

      showNotification("האירוע נמחק בהצלחה!", "success");
      // Redirect to MyWeddings page if we came from there, otherwise to dashboard
      if (weddingId) {
        window.location.href = "/dashboard?section=myWeddings";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("Error deleting wedding:", error);
      showNotification("שגיאה במחיקת האירוע", "error");
    }
  }

  function getStatusColor(status: WeddingStatus) {
    switch (status) {
          case 'Planning': return '#3b82f6';
    case 'Confirmed': return '#3b82f6';
    case 'Cancelled': return '#ef4444';
    case 'Finished': return '#3b82f6';
    case 'Postponed': return '#3b82f6';
      default: return '#ddd';
    }
  }

  function getStatusText(status: WeddingStatus) {
    switch (status) {
      case 'Planning': return 'מתכננים';
      case 'Confirmed': return 'מאושר';
      case 'Cancelled': return 'מבוטל';
      case 'Finished': return 'הושלם';
      case 'Postponed': return 'נדחה';
      default: return status;
    }
  }

  function handleMealPricingChange(field: keyof MealPricing, value: number) {
    
    
    setWedding(prev => {
      const newWedding = {
        ...prev,
        mealPricing: {
          ...prev.mealPricing!,
          [field]: value
        }
      };
      return newWedding;
    });

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      setAutoSaving(true);
      saveWeddingData().finally(() => {
        setAutoSaving(false);
      });
    }, 2000); // 2 seconds delay
  }

  function calculateMealCost() {
    if (!wedding.mealPricing) return;

    const { basePrice, childDiscount, bulkThreshold, bulkPrice, bulkMaxGuests, reservePrice } = wedding.mealPricing;
    const { adultGuests, childGuests } = mealCalculation;
    const totalGuests = adultGuests + childGuests;

    // Calculate costs for each tier
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

    setMealCalculation(prev => ({
      ...prev,
      totalGuests,
      totalCost,
      costPerPerson
    }));
  }



  // Recalculate when meal pricing or guest counts change
  useEffect(() => {
    calculateMealCost();
  }, [wedding.mealPricing, mealCalculation.adultGuests, mealCalculation.childGuests]);

  // Calculate meal costs by guest status
  function calculateMealCostByStatus() {
    if (!wedding.mealPricing) return {};

    const { basePrice, bulkThreshold, bulkPrice, bulkMaxGuests, reservePrice } = wedding.mealPricing;

    const calculateForCount = (count: number) => {
      let totalCost = 0;
      let remainingGuests = count;

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
        totalCost += reserveGuests * reservePrice;
      }

      const costPerPerson = count > 0 ? totalCost / count : 0;
      return { totalCost, costPerPerson };
    };

    return {
      confirmed: calculateForCount(guestCounts.confirmed),
      maybe: calculateForCount(guestCounts.maybe),
      pending: calculateForCount(guestCounts.pending),
      total: calculateForCount(guestCounts.total)
    };
  }

  // Calculate meal cost for manual input
  function calculateManualMealCost() {
    if (!wedding.mealPricing) return { totalCost: 0, costPerPerson: 0, adultGuests: 0, childGuests: 0, totalGuests: 0, eventTotalCost: 0, eventCostPerPerson: 0 };

    const { basePrice, childDiscount, bulkThreshold, bulkPrice, bulkMaxGuests, reservePrice } = wedding.mealPricing;
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
      totalCost += reserveGuests * reservePrice;
    }

    // Apply child discount
    const childCost = childGuests * (basePrice * (1 - childDiscount / 100));
    totalCost += childCost;

    const costPerPerson = totalGuests > 0 ? totalCost / totalGuests : 0;

    // Vendors + meals totals similar to Budget page logic
    const totalVendors = vendors.reduce((sum, v) => sum + (v.price || 0), 0);
    const eventTotalCost = totalCost + totalVendors;
    const eventCostPerPerson = totalGuests > 0 ? eventTotalCost / totalGuests : 0;

    return { totalCost, costPerPerson, adultGuests, childGuests, totalGuests, eventTotalCost, eventCostPerPerson };
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
      direction: 'rtl',
      background: '#f0f4f8',
      minHeight: '100vh'
    }}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      
      {/* Header Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '30px',
        padding: '20px',
        background: 'linear-gradient(135deg, #1d5a78 0%, #2d7a9a 100%)',
        borderRadius: '16px',
        color: 'white',
        boxShadow: '0 4px 20px rgba(29, 90, 120, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px'
          }}>
            <Settings_24 style={{ width: '16px', height: '16px' }} />
          </div>
          <div>
            <h1 style={{ 
              margin: '0 0 5px 0',
              fontSize: '28px',
              fontWeight: 'bold',
              color: 'white'
            }}>
              הגדרות האירוע
            </h1>
            <p style={{ 
              margin: '0',
              fontSize: '16px',
              opacity: '0.9',
              color: 'white'
            }}>
              ניהול פרטי האירוע, שותפים ומחירי מנות
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              padding: '12px 24px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (!saving) {
               
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!saving) {
             
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {saving ? (
              <>
                <span style={{ animation: 'spin 1s linear infinite' }}>⟳</span>
                שומר...
              </>
            ) : (
              <>
                <Success_24 style={{ width: '16px', height: '16px', marginLeft: '8px' }} /> שמור אירוע
              </>
            )}
          </button>
        </div>
      </div>

 

      {/* Wedding Form */}
      <div style={{
        background: '#FFFFFF',
        padding: '25px',
        borderRadius: '12px',
        border: '1px solid #CBD5E1',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #EFF5FB, #FAFAFA)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '15px'
          }}>
            <Heart_24 style={{ width: '24px', height: '24px' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0', color: '#1d5a78' }}>פרטי האירוע</h3>
            <p style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '14px' }}>
              הגדרת פרטי האירוע הבסיסיים
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                שם הזוג *
              </label>
              <input
                name="weddingName"
                value={wedding.weddingName}
                onChange={handleInputChange}
                required
                placeholder="הזינו את שם הזוג"
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #D1D5DB', 
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1d5a78';
                  e.target.style.boxShadow = '0 0 0 3px rgba(29, 90, 120, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                תאריך האירוע *
              </label>
              <input
                name="weddingDate"
                type="date"
                value={wedding.weddingDate}
                onChange={handleInputChange}
                required
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #D1D5DB', 
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1d5a78';
                  e.target.style.boxShadow = '0 0 0 3px rgba(29, 90, 120, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                שעת התחלה
              </label>
              <input
                name="startTime"
                type="time"
                value={wedding.startTime}
                onChange={handleInputChange}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #D1D5DB', 
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1d5a78';
                  e.target.style.boxShadow = '0 0 0 3px rgba(29, 90, 120, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                מיקום
              </label>
              <input
                name="location"
                value={wedding.location}
                onChange={handleInputChange}
                placeholder="הזינו את מיקום האירוע"
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #D1D5DB', 
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1d5a78';
                  e.target.style.boxShadow = '0 0 0 3px rgba(29, 90, 120, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                תקציב (₪)
              </label>
              <input
                name="budget"
                type="number"
                min={0}
                value={wedding.budget}
                onChange={handleInputChange}
                placeholder="הזינו את התקציב"
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #D1D5DB', 
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1d5a78';
                  e.target.style.boxShadow = '0 0 0 3px rgba(29, 90, 120, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                סטטוס
              </label>
              <select
                name="status"
                value={wedding.status}
                onChange={handleInputChange}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #D1D5DB', 
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                  background: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1d5a78';
                  e.target.style.boxShadow = '0 0 0 3px rgba(29, 90, 120, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="Planning">מתכננים</option>
                <option value="Confirmed">מאושר</option>
                <option value="Cancelled">מבוטל</option>
                <option value="Finished">הושלם</option>
                <option value="Postponed">נדחה</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
              פרטים נוספים לכתובת
            </label>
            <textarea
              name="addressDetails"
              value={wedding.addressDetails}
              onChange={handleInputChange}
              placeholder="פרטים נוספים לכתובת האירוע"
              rows={3}
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #D1D5DB', 
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1d5a78';
                e.target.style.boxShadow = '0 0 0 3px rgba(29, 90, 120, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#D1D5DB';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
              הערות
            </label>
            <textarea
              name="notes"
              value={wedding.notes}
              onChange={handleInputChange}
              placeholder="הערות נוספות על האירוע"
              rows={4}
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #D1D5DB', 
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1d5a78';
                e.target.style.boxShadow = '0 0 0 3px rgba(29, 90, 120, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#D1D5DB';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

                     {/* Participants Section */}
           <div style={{
             background: '#FFFFFF',
             padding: '25px',
             borderRadius: '12px',
             border: '1px solid #CBD5E1',
             marginBottom: '20px',
             boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
           }}>
             <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
               <div style={{
                 width: '50px',
                 height: '50px',
                 borderRadius: '50%',
                 background: 'linear-gradient(135deg, #EDF8F4, #FCF3F7)',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 marginLeft: '15px'
               }}>
                 <Guests_24 style={{ width: '24px', height: '24px' }} />
               </div>
               <div style={{ flex: 1 }}>
                 <h3 style={{ margin: '0', color: '#0F172A' }}>שותפים לאירוע</h3>
                 <p style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '14px' }}>
                   ניהול שותפים לאירוע והזמנת שותפים חדשים
                 </p>
               </div>
             </div>

          

             {/* Invite Link Section */}
             <div style={{ marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
               <h4 style={{ margin: '0 0 15px 0', color: '#1d5a78', fontSize: '16px' }}>קישור הזמנה</h4>
               <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                 <button
                   type="button"
                   onClick={async () => {
                     const token = localStorage.getItem('token');
                     if (!token || !wedding._id) return;
                     try {
                       setCreatingInvite(true);
                       const res = await fetch(apiUrl('/api/weddings/invites'), { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
                       if (!res.ok) throw new Error('failed');
                       const data = await res.json();
                       const url = `${window.location.origin}/invite/${data.token}`;
                       setInviteLink(url);
                                           } catch (e) {
                        showNotification('שגיאה ביצירת קישור הזמנה', 'error');
                      } finally {
                       setCreatingInvite(false);
                     }
                   }}
                   disabled={creatingInvite || !wedding._id}
                   style={{
                     padding: '10px 20px',
                     background: creatingInvite || !wedding._id ? '#e5e7eb' : '#1d5a78',
                     color: 'white',
                     border: 'none',
                     borderRadius: '8px',
                     cursor: creatingInvite || !wedding._id ? 'not-allowed' : 'pointer',
                     fontSize: '14px',
                     fontWeight: '600',
                     transition: 'all 0.2s ease'
                   }}
                   onMouseEnter={(e) => {
                     if (!creatingInvite && wedding._id) {
                       e.currentTarget.style.background = '#164e63';
                       e.currentTarget.style.transform = 'translateY(-1px)';
                     }
                   }}
                   onMouseLeave={(e) => {
                     if (!creatingInvite && wedding._id) {
                       e.currentTarget.style.background = '#1d5a78';
                       e.currentTarget.style.transform = 'translateY(0)';
                     }
                   }}
                 >
                   {creatingInvite ? 'יוצר קישור...' : <><Link_24 style={{ width: '16px', height: '16px', marginLeft: '8px' }} /> צור קישור להזמנת שותף</>}
                 </button>
                 {inviteLink && (
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '300px' }}>
                     <input 
                       style={{ 
                         flex: 1, 
                         padding: '10px', 
                         border: '1px solid #d1d5db', 
                         borderRadius: '6px',
                         fontSize: '14px',
                         background: '#f9fafb'
                       }} 
                       readOnly 
                       value={inviteLink} 
                     />
                     <button 
                       style={{
                         padding: '10px 16px',
                         background: '#10b981',
                         color: 'white',
                         border: 'none',
                         borderRadius: '6px',
                         cursor: 'pointer',
                         fontSize: '14px',
                         fontWeight: '600',
                         transition: 'all 0.2s ease'
                       }}
                       onMouseEnter={(e) => {
                         e.currentTarget.style.background = '#059669';
                         e.currentTarget.style.transform = 'translateY(-1px)';
                       }}
                       onMouseLeave={(e) => {
                         e.currentTarget.style.background = '#10b981';
                         e.currentTarget.style.transform = 'translateY(0)';
                       }}
                                               onClick={() => { 
                          navigator.clipboard.writeText(inviteLink); 
                          showNotification('הקישור הועתק ללוח!', 'success');
                        }}
                     >
                       <Copy_24 style={{ width: '16px', height: '16px', marginLeft: '8px' }} /> העתק
                     </button>
                   </div>
                 )}
               </div>
             </div>
            
             {/* Add Participant Section */}
             <div style={{ marginBottom: '20px' }}>
               <h4 style={{ margin: '0 0 15px 0', color: '#1d5a78', fontSize: '16px' }}>הוסף שותף חדש</h4>
               <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                 <select
                   value={selectedParticipantId}
                   onChange={(e) => setSelectedParticipantId(e.target.value)}
                   style={{ 
                     flex: 1, 
                     padding: '12px', 
                     border: '1px solid #d1d5db', 
                     borderRadius: '8px',
                     fontSize: '14px',
                     background: 'white'
                   }}
                 >
                   <option value="">בחר שותף להוספה</option>
                   {allUsers
                     .filter((u) => !wedding.participants.some((p) => p.id === u.id))
                     .map((u) => (
                       <option key={u.id} value={u.id}>
                         {u.name}
                       </option>
                     ))}
                 </select>
                 <button
                   type="button"
                   onClick={handleAddParticipant}
                   disabled={!selectedParticipantId}
                   style={{ 
                     padding: '12px 20px', 
                     background: selectedParticipantId ? '#10b981' : '#e5e7eb',
                     color: selectedParticipantId ? 'white' : '#9ca3af',
                     border: 'none',
                     borderRadius: '8px',
                     cursor: selectedParticipantId ? 'pointer' : 'not-allowed',
                     fontSize: '14px',
                     fontWeight: '600',
                     transition: 'all 0.2s ease'
                   }}
                   onMouseEnter={(e) => {
                     if (selectedParticipantId) {
                       e.currentTarget.style.background = '#059669';
                       e.currentTarget.style.transform = 'translateY(-1px)';
                     }
                   }}
                   onMouseLeave={(e) => {
                     if (selectedParticipantId) {
                       e.currentTarget.style.background = '#10b981';
                       e.currentTarget.style.transform = 'translateY(0)';
                     }
                   }}
                 >
                   <><Plus_24 style={{ width: '16px', height: '16px', marginLeft: '8px' }} /> הוסף שותף</>
                 </button>
               </div>
             </div>

             {/* Participants List */}
             <div>
               <h4 style={{ margin: '0 0 15px 0', color: '#1d5a78', fontSize: '16px' }}>
                 שותפים נוכחיים ({wedding.participants.length})
               </h4>
               {wedding.participants.length > 0 ? (
                 <div style={{ display: 'grid', gap: '12px' }}>
                   {wedding.participants.map((p) => (
                     <div
                       key={p.id}
                       style={{
                         display: 'flex',
                         justifyContent: 'space-between',
                         alignItems: 'center',
                         padding: '16px 20px',
                         background: '#f8fafc',
                         border: '1px solid #e2e8f0',
                         borderRadius: '12px',
                         boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                         transition: 'all 0.2s ease'
                       }}
                       onMouseEnter={(e) => {
                         e.currentTarget.style.transform = 'translateY(-2px)';
                         e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                       }}
                       onMouseLeave={(e) => {
                         e.currentTarget.style.transform = 'translateY(0)';
                         e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                       }}
                     >
                       <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                         <div style={{
                           width: '40px',
                           height: '40px',
                           borderRadius: '50%',
                           background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                           color: 'white',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           fontSize: '16px',
                           fontWeight: 'bold'
                         }}>
                           {p.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                         </div>
                         <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '16px' }}>{p.name}</span>
                       </div>
                       <button
                         type="button"
                         onClick={() => handleRemoveParticipant(p.id)}
                         className="remove-btn"
                       >
                         <Trash_24 style={{ width: '16px', height: '16px', marginLeft: '8px' }} /> הסר
                       </button>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div style={{ 
                   textAlign: 'center', 
                   color: '#6b7280', 
                   fontStyle: 'italic',
                   padding: '40px 20px',
                   background: '#f9fafb',
                   borderRadius: '8px',
                   border: '1px dashed #d1d5db'
                 }}>
                   אין שותפים לאירוע עדיין
                 </div>
               )}
             </div>
           </div>

          <div style={{ 
            marginTop: '30px', 
            padding: '20px',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            display: 'flex', 
            gap: '15px', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              type="submit"
              disabled={saving}
              className="save-btn"
            >
              {saving ? (
                <>
                  <span style={{ animation: 'spin 1s linear infinite' }}>⟳</span>
                  שומר...
                </>
              ) : (
                <>
                  <Success_24 style={{ width: '16px', height: '16px', marginLeft: '8px' }} /> שמור אירוע
                </>
              )}
            </button>
            
            {wedding._id && (
              <button
                type="button"
                onClick={deleteWedding}
                className="remove-btn"
              >
                <Trash_24 style={{ width: '16px', height: '16px', marginLeft: '8px' }} /> מחק אירוע
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Meal Pricing Section */}
      <div style={{
        background: '#FFFFFF',
        padding: '25px',
        borderRadius: '12px',
        border: '1px solid #CBD5E1',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '15px'
          }}>
                          <Budget_24 style={{ width: '24px', height: '24px' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0', color: '#1d5a78' }}>מחירי מנות - חישוב עלויות האירוע</h3>
            <p style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '14px' }}>
              הגדרת מחירי מנות וחישוב עלויות האירוע
            </p>
          </div>
        </div>
        
        <div style={{ 
          background: '#f8fafc',
          padding: '20px', 
          borderRadius: '12px', 
          marginBottom: '20px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h4 style={{ margin: '0', color: '#1d5a78', fontSize: '18px', fontWeight: '600' }}>הגדרות מחירים</h4>
            <button
              type="button"
              onClick={() => setIsEditingMealPricing(!isEditingMealPricing)}
              className={isEditingMealPricing ? "remove-btn" : "save-btn"}
            >
              {isEditingMealPricing ? '❌ ביטול עריכה' : '✏️ ערוך הגדרות'}
            </button>
          </div>
          
          {/* Auto-saving indicator */}
          {autoSaving && (
            <div style={{ 
              marginBottom: '20px', 
              padding: '12px 16px', 
              background: '#f0f9ff', 
              borderRadius: '8px', 
              border: '1px solid #0ea5e9',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                borderRadius: '50%', 
                border: '2px solid #0ea5e9', 
                borderTop: '2px solid transparent',
                animation: 'spin 1s linear infinite'
              }}></div>
              <span style={{ color: '#0c4a6e', fontSize: '14px', fontWeight: '600' }}>
                <Success_24 style={{ width: '16px', height: '16px', marginLeft: '8px' }} /> שומר שינויים אוטומטית...
              </span>
            </div>
          )}
          
          <div style={{ 
            marginBottom: '20px', 
            padding: '12px 16px', 
          
            borderRadius: '8px', 
         
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
       
            <button
              type="button"
              onClick={() => {
                setAutoSaving(true);
                saveWeddingData().finally(() => {
                  setAutoSaving(false);
                });
              }}
              disabled={saving}
              className="save-btn"
            >
              {saving ? 'שומר...' : <><Success_24 style={{ width: '16px', height: '16px', marginLeft: '8px' }} /> שמור עכשיו</>}
            </button>
          </div>
          
          {!isEditingMealPricing && (
            <div style={{
              padding: '15px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '14px', color: '#1d5a78', fontWeight: '600', marginBottom: '5px' }}>
                השדות נעולים לעריכה
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                לחץ על "ערוך הגדרות" כדי לאפשר עריכה
              </div>
            </div>
          )}
          
          <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                מחיר מנה (₪)
              </label>
              <input
                type="number"
                min="0"
                value={wedding.mealPricing?.basePrice || 0}
                onChange={(e) => handleMealPricingChange('basePrice', Number(e.target.value))}
                placeholder="הזינו מחיר מנה"
                disabled={!isEditingMealPricing}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: isEditingMealPricing ? 'white' : '#f9fafb',
                  cursor: isEditingMealPricing ? 'text' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  if (isEditingMealPricing) {
                    e.target.style.borderColor = '#1d5a78';
                    e.target.style.boxShadow = '0 0 0 3px rgba(29, 90, 120, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                מספר התחייבות למחיר מנה
              </label>
              <input
                type="number"
                min="0"
                value={wedding.mealPricing?.bulkThreshold || 0}
                onChange={(e) => handleMealPricingChange('bulkThreshold', Number(e.target.value))}
               
                disabled={!isEditingMealPricing}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  backgroundColor: isEditingMealPricing ? 'white' : '#f5f5f5',
                  cursor: isEditingMealPricing ? 'text' : 'not-allowed'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                מחיר מנה מעל להתחייבות (₪)
              </label>
              <input
                type="number"
                min="0"
                value={wedding.mealPricing?.bulkPrice || 0}
                onChange={(e) => handleMealPricingChange('bulkPrice', Number(e.target.value))}
              
                disabled={!isEditingMealPricing}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  backgroundColor: isEditingMealPricing ? 'white' : '#f5f5f5',
                  cursor: isEditingMealPricing ? 'text' : 'not-allowed'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                עד איזה מספר מתאפשרת ההנחה
              </label>
              <input
                type="number"
                min="0"
                value={wedding.mealPricing?.bulkMaxGuests || 0}
                onChange={(e) => handleMealPricingChange('bulkMaxGuests', Number(e.target.value))}
           
                disabled={!isEditingMealPricing}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  backgroundColor: isEditingMealPricing ? 'white' : '#f5f5f5',
                  cursor: isEditingMealPricing ? 'text' : 'not-allowed'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                מחיר מנה ברזרבה (₪)
              </label>
              <input
                type="number"
                min="0"
                value={wedding.mealPricing?.reservePrice || 0}
                onChange={(e) => handleMealPricingChange('reservePrice', Number(e.target.value))}
             
                disabled={!isEditingMealPricing}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  backgroundColor: isEditingMealPricing ? 'white' : '#f5f5f5',
                  cursor: isEditingMealPricing ? 'text' : 'not-allowed'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                סף כמות רזרבה
              </label>
              <input
                type="number"
                min="0"
                value={wedding.mealPricing?.reserveThreshold || 0}
                onChange={(e) => handleMealPricingChange('reserveThreshold', Number(e.target.value))}
            
                disabled={!isEditingMealPricing}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  backgroundColor: isEditingMealPricing ? 'white' : '#f5f5f5',
                  cursor: isEditingMealPricing ? 'text' : 'not-allowed'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                עד איזה מספר מתאפשרת הרזרבה
              </label>
              <input
                type="number"
                min="0"
                value={wedding.mealPricing?.reserveMaxGuests || 0}
                onChange={(e) => handleMealPricingChange('reserveMaxGuests', Number(e.target.value))}
              
                disabled={!isEditingMealPricing}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  backgroundColor: isEditingMealPricing ? 'white' : '#f5f5f5',
                  cursor: isEditingMealPricing ? 'text' : 'not-allowed'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                הנחה לילדים (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={wedding.mealPricing?.childDiscount || 0}
                onChange={(e) => handleMealPricingChange('childDiscount', Number(e.target.value))}
             
                disabled={!isEditingMealPricing}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  backgroundColor: isEditingMealPricing ? 'white' : '#f5f5f5',
                  cursor: isEditingMealPricing ? 'text' : 'not-allowed'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                גיל מקסימלי לילד
              </label>
              <input
                type="number"
                min="0"
                value={wedding.mealPricing?.childAgeLimit || 0}
                onChange={(e) => handleMealPricingChange('childAgeLimit', Number(e.target.value))}
              
                disabled={!isEditingMealPricing}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  backgroundColor: isEditingMealPricing ? 'white' : '#f5f5f5',
                  cursor: isEditingMealPricing ? 'text' : 'not-allowed'
                }}
              />
            </div>
          </div>
        </div>



        {/* Guest Status Based Pricing */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h4 style={{ margin: '0', color: '#1d5a78' }}>מחירי מנות לפי סטטוס מוזמנים</h4>
            <button
              type="button"
              onClick={async () => {
                const token = localStorage.getItem("token");
                if (!token) return;

                try {
                  const res = await fetch("/api/guests", {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  });

                  if (res.ok) {
                    const guests = await res.json();
                    const counts = {
                      confirmed: guests.filter((g: any) => g.status === 'Confirmed').length,
                      maybe: guests.filter((g: any) => g.status === 'Maybe').length,
                      pending: guests.filter((g: any) => g.status === 'Pending').length,
                      total: guests.length
                    };
                    setGuestCounts(counts);
                  }
                } catch (error) {
                  console.error('Error refreshing guest counts:', error);
                }
              }}
            className='button'
            >
              <Clock_24 style={{ width: '16px', height: '16px', marginLeft: '8px' }} /> רענן ספירת מוזמנים
            </button>
          </div>
          
          <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            {/* Confirmed Guests */}
            <div className="card" style={{ padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: '#3b82f6', 
                  marginRight: '6px' 
                }}></div>
                <h6 style={{ margin: '0', color: '#1d5a78', fontWeight: 'bold', fontSize: '14px' }}>מאשרי הגעה</h6>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333', marginBottom: '3px' }}>
                {guestCounts.confirmed}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>מוזמנים</div>
              {calculateMealCostByStatus().confirmed?.totalCost && typeof calculateMealCostByStatus().confirmed?.totalCost === 'number' && (
                <>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1d5a78' }}>
                    {calculateMealCostByStatus().confirmed?.totalCost?.toLocaleString?.() ?? 0} ₪
                  </div>
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    {(calculateMealCostByStatus().confirmed?.costPerPerson ?? 0).toFixed(0)} ₪ לאיש
                  </div>
                </>
              )}
            </div>

            {/* Maybe Guests */}
            <div className="card" style={{ padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: '#3b82f6', 
                  marginRight: '6px' 
                }}></div>
                <h6 style={{ margin: '0', color: '#1d5a78', fontWeight: 'bold', fontSize: '14px' }}>מתלבטים</h6>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333', marginBottom: '3px' }}>
                {guestCounts.maybe}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>מוזמנים</div>
              {calculateMealCostByStatus().maybe?.totalCost && typeof calculateMealCostByStatus().maybe?.totalCost === 'number' && (
                <>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1d5a78' }}>
                    {calculateMealCostByStatus().maybe?.totalCost?.toLocaleString?.() ?? 0} ₪
                  </div>
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    {(calculateMealCostByStatus().maybe?.costPerPerson ?? 0).toFixed(0)} ₪ לאיש
                  </div>
                </>
              )}
            </div>

            {/* Pending Guests */}
            <div className="card" style={{ padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: '#9e9e9e', 
                  marginRight: '6px' 
                }}></div>
                <h6 style={{ margin: '0', color: '#9e9e9e', fontWeight: 'bold', fontSize: '14px' }}>ממתינים לתשובה</h6>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333', marginBottom: '3px' }}>
                {guestCounts.pending}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>מוזמנים</div>
              {calculateMealCostByStatus().pending?.totalCost && typeof calculateMealCostByStatus().pending?.totalCost === 'number' && (
                <>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#9e9e9e' }}>
                    {calculateMealCostByStatus().pending?.totalCost?.toLocaleString?.() ?? 0} ₪
                  </div>
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    {(calculateMealCostByStatus().pending?.costPerPerson ?? 0).toFixed(0)} ₪ לאיש
                  </div>
                </>
              )}
            </div>

            {/* Total */}
            <div className="card" style={{ padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: '#2196F3', 
                  marginRight: '6px' 
                }}></div>
                <h6 style={{ margin: '0', color: '#2196F3', fontWeight: 'bold', fontSize: '14px' }}>סה"כ</h6>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333', marginBottom: '3px' }}>
                {guestCounts.total}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>מוזמנים</div>
              {calculateMealCostByStatus().total?.totalCost && typeof calculateMealCostByStatus().total?.totalCost === 'number' && (
                <>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#2196F3' }}>
                    {calculateMealCostByStatus().total?.totalCost?.toLocaleString?.() ?? 0} ₪
                  </div>
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    {(calculateMealCostByStatus().total?.costPerPerson ?? 0).toFixed(0)} ₪ לאיש
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Total Meal Cost Summary */}
          {calculateMealCostByStatus().total?.totalCost && typeof calculateMealCostByStatus().total?.totalCost === 'number' && (
            <div style={{ 
              
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: 'black', fontSize: '18px' }}>
                סה"כ עלות מנות לכל המוזמנים
              </h4>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'black', marginBottom: '5px' }}>
                {calculateMealCostByStatus().total?.totalCost?.toLocaleString?.() ?? 0} ₪
              </div>
              <div style={{ fontSize: '14px', color: 'black' }}>
                ממוצע: {(calculateMealCostByStatus().total?.costPerPerson ?? 0).toFixed(0)} ₪ לאיש
              </div>
            </div>
          )}

        
        </div>

        {/* Save Meal Pricing Button */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => {
              saveWeddingData();
            }}
            disabled={saving}
            className="save-btn"
          >
            {saving ? 'שומר...' : <><Success_24 style={{ width: '16px', height: '16px', marginLeft: '8px' }} /> שמור הגדרות מחירי מנות</>}
          </button>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
            שמירת הגדרות מחירי המנות יחד עם פרטי האירוע
          </div>
        </div>
      </div>

      {/* Manual Calculation - Custom Estimation */}
      <div className="card">
        <h3 style={{ margin: '0 0 20px 0', color: '#1d5a78' }}>
          חישוב ידני - אומדן מותאם אישית - מחירי מנות
        </h3>
        
        <div className="card">
          <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>הכנס מספרי אורחים לבדיקה</h4>
          
          <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
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
              
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                מספר ילדים (עד גיל {wedding.mealPricing?.childAgeLimit || 0})
              </label>
              <input
                type="number"
                min="0"
                value={manualCalculation.childGuests}
                onChange={(e) => setManualCalculation(prev => ({
                  ...prev,
                  childGuests: Number(e.target.value)
                }))}
            
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          </div>
        </div>

        {/* Manual Calculation Results */}
        {manualCalculation.adultGuests > 0 || manualCalculation.childGuests > 0 ? (
          <div className="card">
            <h4 style={{ margin: '0 0 15px 0', color: '#1d5a78' }}>תוצאות החישוב</h4>
            
            <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>סה"כ אורחים</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                  {calculateManualMealCost().totalGuests}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>מבוגרים</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                  {calculateManualMealCost().adultGuests}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>ילדים</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                  {calculateManualMealCost().childGuests}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>עלות ממוצעת לאיש</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                  {calculateManualMealCost().costPerPerson.toFixed(0)} ₪
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>סה"כ עלות מנות</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1d5a78' }}>
                  {calculateManualMealCost().totalCost.toLocaleString()} ₪
                </div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            {calculateManualMealCost().totalGuests > 0 && (
              <div style={{ marginTop: '15px', padding: '15px', background: 'white', borderRadius: '4px', border: '1px solid black' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
                  פירוט החישוב:
                </div>
                <div style={{ fontSize: '12px', lineHeight: '1.4', color: '#666' }}>
                  <div>• מבוגרים: {calculateManualMealCost().adultGuests} × {wedding.mealPricing?.basePrice || 0} ₪ = {(calculateManualMealCost().adultGuests * (wedding.mealPricing?.basePrice || 0)).toLocaleString()} ₪</div>
                  <div>• ילדים: {calculateManualMealCost().childGuests} × {((wedding.mealPricing?.basePrice || 0) * (1 - (wedding.mealPricing?.childDiscount || 0) / 100)).toFixed(0)} ₪ = {(calculateManualMealCost().childGuests * ((wedding.mealPricing?.basePrice || 0) * (1 - (wedding.mealPricing?.childDiscount || 0) / 100))).toLocaleString()} ₪</div>
                  {wedding.mealPricing && calculateManualMealCost().totalGuests >= (wedding.mealPricing?.bulkThreshold || 0) && (wedding.mealPricing?.bulkPrice || 0) > 0 && (
                    <div style={{ color: '#4caf50', fontWeight: 'bold' }}>
                      ✓ מחיר התחייבות מיושם (מעל {wedding.mealPricing?.bulkThreshold || 0} אורחים)
                    </div>
                  )}
                  {wedding.mealPricing && calculateManualMealCost().totalGuests >= (wedding.mealPricing?.reserveThreshold || 0) && (wedding.mealPricing?.reservePrice || 0) > 0 && (
                    <div style={{ color: '#4caf50', fontWeight: 'bold' }}>
                      ✓ מחיר רזרבה מיושם (מעל {wedding.mealPricing?.reserveThreshold || 0} אורחים)
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
            הכנס מספרי אורחים כדי לראות את החישוב
          </div>
        )}
      </div>

      {/* Wedding Summary */}
      {wedding.weddingName && (
        <div className="card">
          <h3 style={{ margin: '0 0 20px 0', color: '#1d5a78', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            סיכום האירוע
          </h3>
          
          <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div>
              <strong style={{ color: '#666' }}>שם האירוע:</strong>
              <div style={{ marginTop: '5px', fontSize: '16px' }}>{wedding.weddingName}</div>
            </div>
            
            <div>
              <strong style={{ color: '#666' }}>תאריך האירוע:</strong>
              <div style={{ marginTop: '5px', fontSize: '16px' }}>
                {wedding.weddingDate ? new Date(wedding.weddingDate).toLocaleDateString('he-IL') : '-'}
              </div>
            </div>
            
            <div>
              <strong style={{ color: '#666' }}>שעת התחלה:</strong>
              <div style={{ marginTop: '5px', fontSize: '16px' }}>{wedding.startTime || '-'}</div>
            </div>
            
            <div>
              <strong style={{ color: '#666' }}>מיקום:</strong>
              <div style={{ marginTop: '5px', fontSize: '16px' }}>{wedding.location || '-'}</div>
            </div>
            
            <div>
              <strong style={{ color: '#666' }}>תקציב:</strong>
              <div style={{ marginTop: '5px', fontSize: '16px' }}>
                {wedding.budget ? `${wedding.budget.toLocaleString()} ₪` : '-'}
              </div>
            </div>
            
            <div>
              <strong style={{ color: '#666' }}>סטטוס:</strong>
              <div style={{ marginTop: '5px' }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: getStatusColor(wedding.status),
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {getStatusText(wedding.status)}
                </span>
              </div>
            </div>
          </div>
          
          {wedding.addressDetails && (
            <div style={{ marginTop: '15px' }}>
              <strong style={{ color: '#666' }}>פרטים נוספים לכתובת:</strong>
              <div style={{ marginTop: '5px', fontSize: '16px' }}>{wedding.addressDetails}</div>
            </div>
          )}
          
          {wedding.notes && (
            <div style={{ marginTop: '15px' }}>
              <strong style={{ color: '#666' }}>הערות:</strong>
              <div style={{ marginTop: '5px', fontSize: '16px' }}>{wedding.notes}</div>
            </div>
          )}
          
          <div style={{ marginTop: '15px' }}>
            <strong style={{ color: '#1d5a78' }}>שותפים לאירוע:</strong>
            <div style={{ marginTop: '5px' }}>
              {wedding.participants.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {wedding.participants.map((p) => (
                    <span
                      key={p.id}
                      style={{
                        padding: '4px 8px',
                        background: '#e3f2fd',
                        borderRadius: '4px',
                        fontSize: '14px',
             
                      }}
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#666', fontStyle: 'italic' }}>אין שותפים לאירוע</div>
              )}
            </div>
          </div>

          {/* Meal Pricing Summary */}
          {wedding.mealPricing && (
            <div style={{ marginTop: '20px', padding: '15px', background: '#', borderRadius: '4px'}}>
              <h4 style={{ margin: '0 0 15px 0', color: '#1d5a78' }}>עלויות מנות</h4>
              
              {/* Basic Pricing */}
              <div style={{ marginBottom: '15px' }}>
                <h5 style={{ margin: '0 0 10px 0', color: '#1d5a78', fontSize: '14px' }}>מחירים בסיסיים</h5>
                <div style={{ display: 'grid', gap: '8px', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
                  <div>
                    <strong style={{ color: '#666', fontSize: '12px' }}>מחיר מנה</strong>
                    <div style={{ marginTop: '2px', fontSize: '14px' }}>{wedding.mealPricing.basePrice.toLocaleString()} ₪</div>
                  </div>
                  <div>
                    <strong style={{ color: '#666', fontSize: '12px' }}>הנחה לילדים</strong>
                    <div style={{ marginTop: '2px', fontSize: '14px' }}>{wedding.mealPricing.childDiscount}%</div>
                  </div>
                  <div>
                    <strong style={{ color: '#666', fontSize: '12px' }}>גיל מקסימלי לילד</strong>
                    <div style={{ marginTop: '2px', fontSize: '14px' }}>{wedding.mealPricing.childAgeLimit}</div>
                  </div>
                </div>
              </div>

              {/* Bulk Pricing */}
              {wedding.mealPricing.bulkPrice > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <h5 style={{ margin: '0 0 10px 0', color: '#1d5a78', fontSize: '14px' }}>מחירי התחייבות</h5>
                  <div style={{ display: 'grid', gap: '8px', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
                    <div>
                      <strong style={{ color: '#666', fontSize: '12px' }}>מספר התחייבות</strong>
                      <div style={{ marginTop: '2px', fontSize: '14px' }}>{wedding.mealPricing.bulkThreshold}</div>
                    </div>
                    <div>
                      <strong style={{ color: '#666', fontSize: '12px' }}>מחיר מנה מעל התחייבות</strong>
                      <div style={{ marginTop: '2px', fontSize: '14px' }}>{wedding.mealPricing.bulkPrice.toLocaleString()} ₪</div>
                    </div>
                    <div>
                      <strong style={{ color: '#666', fontSize: '12px' }}>עד איזה מספר</strong>
                      <div style={{ marginTop: '2px', fontSize: '14px' }}>{wedding.mealPricing.bulkMaxGuests}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reserve Pricing */}
              {wedding.mealPricing.reservePrice > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <h5 style={{ margin: '0 0 10px 0', color: '#1d5a78', fontSize: '14px' }}>מחירי רזרבה</h5>
                  <div style={{ display: 'grid', gap: '8px', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
                    <div>
                      <strong style={{ color: '#666', fontSize: '12px' }}>סף כמות רזרבה</strong>
                      <div style={{ marginTop: '2px', fontSize: '14px' }}>{wedding.mealPricing.reserveThreshold}</div>
                    </div>
                    <div>
                      <strong style={{ color: '#666', fontSize: '12px' }}>מחיר מנה ברזרבה</strong>
                      <div style={{ marginTop: '2px', fontSize: '14px' }}>{wedding.mealPricing.reservePrice.toLocaleString()} ₪</div>
                    </div>
                    <div>
                      <strong style={{ color: '#666', fontSize: '12px' }}>עד איזה מספר</strong>
                      <div style={{ marginTop: '2px', fontSize: '14px' }}>{wedding.mealPricing.reserveMaxGuests}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Calculation Results */}
              {mealCalculation.totalCost > 0 && (
                <div style={{ marginTop: '15px', padding: '10px', background: '#eff6ff', borderRadius: '4px', border: '1px solid #3b82f6' }}>
                  <h5 style={{ margin: '0 0 10px 0', color: '#1d5a78', fontSize: '14px' }}>תוצאות החישוב</h5>
                  <div style={{ display: 'grid', gap: '8px', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
                    <div>
                      <strong style={{ color: '#666', fontSize: '12px' }}>סה"כ אורחים</strong>
                      <div style={{ marginTop: '2px', fontSize: '14px' }}>{mealCalculation.totalGuests}</div>
                    </div>
                    <div>
                      <strong style={{ color: '#666', fontSize: '12px' }}>אורחים בוגרים</strong>
                      <div style={{ marginTop: '2px', fontSize: '14px' }}>{mealCalculation.adultGuests}</div>
                    </div>
                    <div>
                      <strong style={{ color: '#666', fontSize: '12px' }}>ילדים</strong>
                      <div style={{ marginTop: '2px', fontSize: '14px' }}>{mealCalculation.childGuests}</div>
                    </div>
                    <div>
                      <strong style={{ color: '#666', fontSize: '12px' }}>מחיר מנה אפקטיבי</strong>
                      <div style={{ marginTop: '2px', fontSize: '14px' }}>{mealCalculation.costPerPerson.toFixed(0)} ₪</div>
                    </div>
                    <div>
                      <strong style={{ color: '#666', fontSize: '12px' }}>סה"כ עלות מנות</strong>
                      <div style={{ marginTop: '2px', fontSize: '14px', fontWeight: 'bold', color: '#1d5a78' }}>
                        {mealCalculation.totalCost.toLocaleString()} ₪
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

