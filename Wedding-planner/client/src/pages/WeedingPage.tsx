import React, { useState, useEffect, useRef } from "react";

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
  const [wedding, setWedding] = useState<WeddingData>(initialWedding);
  const [allUsers, setAllUsers] = useState<Participant[]>([]);
  const [selectedParticipantId, setSelectedParticipantId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  // Add state for auto-saving indicator
  const [autoSaving, setAutoSaving] = useState(false);

  // Add ref for debounce timeout
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error(res.statusText);
        const users = await res.json();
        console.log("Fetched users:", users);
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
        console.log("No token found, skipping wedding fetch");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching wedding with token:", token.substring(0, 20) + "...");
        const res = await fetch("/api/weddings/owner", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Wedding fetch response status:", res.status);

        if (res.status === 404) {
          console.log("No wedding found for user, setting initial state");
          setWedding(initialWedding);
          setLoading(false);
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch wedding");

        const data = await res.json();
        console.log("Fetched wedding data:", JSON.stringify(data, null, 2));
        console.log("Meal pricing from server:", JSON.stringify(data.mealPricing, null, 2));

        // Convert date to string format for the input field
        const formattedDate = data.weddingDate 
          ? new Date(data.weddingDate).toISOString().split('T')[0]
          : "";
        
        console.log("Original weddingDate:", data.weddingDate);
        console.log("Formatted weddingDate:", formattedDate);

        // Handle participants - they come as ObjectIds from server
        const participants = (data.participants || []).map((p: any) => {
          console.log("Processing participant:", p);
          if (typeof p === "string") {
            // If it's just an ID string, find the user name
            const user = users.find((u: any) => u._id === p);
            console.log("Found user for string participant:", user);
            return { id: p, name: user ? `${user.firstName} ${user.lastName}` : "Unknown User" };
          } else if (p._id) {
            // If it's an object with _id
            const user = users.find((u: any) => u._id === p._id);
            console.log("Found user for object participant:", user);
            return { id: p._id, name: user ? `${user.firstName} ${user.lastName}` : p.name || "Unknown User" };
          }
          return { id: p.id || p, name: p.name || "Unknown User" };
        });

        console.log("Processed participants:", participants);

        const weddingData = { 
          ...data, 
          weddingDate: formattedDate,
          participants,
          mealPricing: data.mealPricing || initialWedding.mealPricing
        };
        
        console.log("Setting wedding data:", JSON.stringify(weddingData, null, 2));
        console.log("🍽️ Meal pricing from server:", JSON.stringify(data.mealPricing, null, 2));
        console.log("🍽️ Meal pricing after processing:", JSON.stringify(weddingData.mealPricing, null, 2));
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

  // Fetch guest counts from guest list
  useEffect(() => {
    async function fetchGuestCounts() {
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
          console.log('👥 Guest counts:', counts);
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

    console.log("Submitting wedding form with current user:", currentUser);

    if (!currentUser || !currentUser._id) {
      alert("לא מזוהה משתמש מחובר");
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

    console.log("Saving wedding data:", JSON.stringify(weddingToSave, null, 2));
    console.log("Meal pricing data:", JSON.stringify(wedding.mealPricing, null, 2));
    console.log("Wedding ID for update:", wedding._id);
    console.log("🔍 Wedding state before save:", JSON.stringify(wedding, null, 2));

    try {
      let res;
      if (wedding._id) {
        console.log("Updating existing wedding with ID:", wedding._id);
        res = await fetch(`/api/weddings/${wedding._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(weddingToSave),
        });
      } else {
        console.log("Creating new wedding");
        res = await fetch("/api/weddings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(weddingToSave),
        });
      }

      console.log("Response status:", res.status);
      console.log("Response headers:", Object.fromEntries(res.headers.entries()));

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ שגיאה בשמירת אירוע:", text);
        alert("שגיאה בשמירת האירוע");
        return;
      }

      const saved = await res.json();
      console.log("✅ אירוע נשמר בהצלחה:", JSON.stringify(saved, null, 2));
      console.log("🍽️ Meal pricing in response:", JSON.stringify(saved.mealPricing, null, 2));
      setWedding({ ...wedding, _id: saved._id });
      
      // Only show alert for manual saves, not auto-saves
      if (!autoSaving) {
        alert("האירוע נשמר בהצלחה!");
      }
    } catch (error) {
      console.error("❌ שגיאה בשמירת אירוע:", error);
      if (!autoSaving) {
        alert("שגיאה בשמירת האירוע");
      }
    } finally {
      setSaving(false);
    }
  }

  function getStatusColor(status: WeddingStatus) {
    switch (status) {
      case 'Planning': return '#ff9800';
      case 'Confirmed': return '#4CAF50';
      case 'Cancelled': return '#f44336';
      case 'Finished': return '#2196F3';
      case 'Postponed': return '#9C27B0';
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
    console.log(`🔄 Changing meal pricing ${field} to:`, value);
    console.log('🍽️ Current mealPricing before change:', JSON.stringify(wedding.mealPricing, null, 2));
    
    setWedding(prev => {
      const newWedding = {
        ...prev,
        mealPricing: {
          ...prev.mealPricing!,
          [field]: value
        }
      };
      console.log('🍽️ New wedding state after meal pricing change:', JSON.stringify(newWedding.mealPricing, null, 2));
      return newWedding;
    });

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      console.log('💾 Auto-saving meal pricing changes...');
      console.log('🍽️ Final mealPricing to save:', JSON.stringify(wedding.mealPricing, null, 2));
      setAutoSaving(true);
      saveWeddingData().finally(() => {
        setAutoSaving(false);
      });
    }, 2000); // 2 seconds delay
  }

  function calculateMealCost() {
    if (!wedding.mealPricing) return;

    const { basePrice, childDiscount, childAgeLimit, bulkThreshold, bulkPrice, bulkMaxGuests, reservePrice, reserveThreshold, reserveMaxGuests } = wedding.mealPricing;
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

  function handleGuestCountChange(type: 'adult' | 'child', value: number) {
    setMealCalculation(prev => ({
      ...prev,
      [type === 'adult' ? 'adultGuests' : 'childGuests']: value
    }));
  }

  // Recalculate when meal pricing or guest counts change
  useEffect(() => {
    calculateMealCost();
  }, [wedding.mealPricing, mealCalculation.adultGuests, mealCalculation.childGuests]);

  // Calculate meal costs by guest status
  function calculateMealCostByStatus() {
    if (!wedding.mealPricing) return {};

    const { basePrice, childDiscount, childAgeLimit, bulkThreshold, bulkPrice, bulkMaxGuests, reservePrice, reserveThreshold, reserveMaxGuests } = wedding.mealPricing;

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
    if (!wedding.mealPricing) return { totalCost: 0, costPerPerson: 0, adultGuests: 0, childGuests: 0, totalGuests: 0 };

    const { basePrice, childDiscount, childAgeLimit, bulkThreshold, bulkPrice, bulkMaxGuests, reservePrice, reserveThreshold, reserveMaxGuests } = wedding.mealPricing;
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

    return { totalCost, costPerPerson, adultGuests, childGuests, totalGuests };
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
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      
      <h1 style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        color: '#333',
        borderBottom: '2px solid #ddd',
        paddingBottom: '10px'
      }}>
        האירוע שלנו
      </h1>

      {/* Help Section */}
      <div style={{
        background: '#e3f2fd',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #2196F3'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>💡 איך לנהל את האירוע:</h4>
        <div style={{ fontSize: '14px', lineHeight: '1.5', color: '#333' }}>
          <div><strong>פרטי האירוע:</strong> מלא את כל הפרטים החשובים על האירוע</div>
          <div><strong>שותפים:</strong> הוסף שותפים לאירוע שיוכלו לנהל יחד איתך</div>
          <div><strong>סטטוס:</strong> עדכן את הסטטוס לפי התקדמות התכנון</div>
          <div><strong>תקציב:</strong> הגדר תקציב לאירוע לניהול הוצאות</div>
        </div>
      </div>

      {/* Wedding Form */}
      <div style={{
        background: '#f9f9f9',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid #ddd'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>פרטי האירוע</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                שם האירוע *
              </label>
              <input
                name="weddingName"
                value={wedding.weddingName}
                onChange={handleInputChange}
              
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                תאריך האירוע *
              </label>
              <input
                name="weddingDate"
                type="date"
                value={wedding.weddingDate}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                שעת התחלה
              </label>
              <input
                name="startTime"
                type="time"
                value={wedding.startTime}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                מיקום
              </label>
              <input
                name="location"
                value={wedding.location}
                onChange={handleInputChange}
               
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                תקציב (₪)
              </label>
              <input
                name="budget"
                type="number"
                min={0}
                value={wedding.budget}
                onChange={handleInputChange}
               
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                סטטוס
              </label>
              <select
                name="status"
                value={wedding.status}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="Planning">מתכננים</option>
                <option value="Confirmed">מאושר</option>
                <option value="Cancelled">מבוטל</option>
                <option value="Finished">הושלם</option>
                <option value="Postponed">נדחה</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              פרטים נוספים לכתובת
            </label>
            <textarea
              name="addressDetails"
              value={wedding.addressDetails}
              onChange={handleInputChange}
              placeholder="פרטים נוספים לכתובת האירוע"
              rows={2}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              הערות
            </label>
            <textarea
              name="notes"
              value={wedding.notes}
              onChange={handleInputChange}
              placeholder="הערות נוספות על האירוע"
              rows={3}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          {/* Participants Section */}
          <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 15px 0' }}>שותפים לאירוע</h4>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
              <select
                value={selectedParticipantId}
                onChange={(e) => setSelectedParticipantId(e.target.value)}
                style={{ 
                  flex: 1, 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px' 
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
                  padding: '8px 16px', 
                  border: '1px solid #2196F3', 
                  background: selectedParticipantId ? '#2196F3' : '#ccc',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: selectedParticipantId ? 'pointer' : 'not-allowed'
                }}
              >
                הוסף שותף
              </button>
            </div>

            {wedding.participants.length > 0 ? (
              <div style={{ display: 'grid', gap: '8px' }}>
                {wedding.participants.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: 'white',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}
                  >
                    <span style={{ fontWeight: 'bold' }}>{p.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(p.id)}
                      style={{ 
                        padding: '4px 8px', 
                        border: '1px solid #f44336', 
                        background: '#f44336',
                        color: 'white',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      הסר
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                אין שותפים לאירוע עדיין
              </div>
            )}
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '12px 24px',
                backgroundColor: saving ? '#ccc' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {saving ? 'שומר...' : 'שמור אירוע'}
            </button>
          </div>
        </form>
      </div>

      {/* Meal Pricing Section */}
      <div style={{
        background: '#fff3e0',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid #ff9800'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#e65100' }}>
          🍽️ מחירי מנות - חישוב עלויות האירוע
        </h3>
        
        <div style={{ 
          background: '#fff', 
          padding: '15px', 
          borderRadius: '4px', 
          marginBottom: '20px',
          border: '1px solid #ddd'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h4 style={{ margin: '0', color: '#333' }}>הגדרות מחירים</h4>
            <button
              type="button"
              onClick={() => setIsEditingMealPricing(!isEditingMealPricing)}
              style={{
                padding: '8px 16px',
                backgroundColor: isEditingMealPricing ? '#f44336' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {isEditingMealPricing ? '❌ ביטול עריכה' : '✏️ ערוך הגדרות'}
            </button>
          </div>
          
          {/* Auto-saving indicator */}
          {autoSaving && (
            <div style={{ 
              marginBottom: '15px', 
              padding: '8px 12px', 
              background: '#e3f2fd', 
              borderRadius: '4px', 
              border: '1px solid #2196F3',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                border: '2px solid #2196F3', 
                borderTop: '2px solid transparent',
                animation: 'spin 1s linear infinite'
              }}></div>
              <span style={{ color: '#1976d2', fontSize: '14px', fontWeight: 'bold' }}>
                💾 שומר שינויים אוטומטית...
              </span>
            </div>
          )}
          
          <div style={{ 
            marginBottom: '15px', 
            padding: '8px 12px', 
            background: '#fff3e0', 
            borderRadius: '4px', 
            border: '1px solid #ff9800',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '12px', color: '#e65100' }}>
              <strong>💡 טיפ:</strong> השינויים נשמרים אוטומטית תוך 2 שניות מהשינוי האחרון
            </div>
            <button
              type="button"
              onClick={() => {
                console.log('🚀 Immediate save clicked');
                setAutoSaving(true);
                saveWeddingData().finally(() => {
                  setAutoSaving(false);
                });
              }}
              disabled={saving}
              style={{
                padding: '6px 12px',
                backgroundColor: saving ? '#ccc' : '#ff9800',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              {saving ? 'שומר...' : '💾 שמור עכשיו'}
            </button>
          </div>
          
          {!isEditingMealPricing && (
            <div style={{ 
              marginBottom: '15px', 
              padding: '10px 15px', 
              background: '#e8f5e8', 
              borderRadius: '4px', 
              border: '1px solid #4caf50',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', color: '#2e7d32', fontWeight: 'bold' }}>
                🔒 השדות נעולים לעריכה
              </div>
              <div style={{ fontSize: '12px', color: '#2e7d32', marginTop: '5px' }}>
                לחץ על "✏️ ערוך הגדרות" כדי לאפשר עריכה
              </div>
            </div>
          )}
          
          <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                מחיר מנה (₪)
              </label>
              <input
                type="number"
                min="0"
                value={wedding.mealPricing?.basePrice || 0}
                onChange={(e) => handleMealPricingChange('basePrice', Number(e.target.value))}
               
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
        <div style={{ 
          background: '#e3f2fd', 
          padding: '15px', 
          borderRadius: '4px',
          marginTop: '20px',
          border: '1px solid #2196F3'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h4 style={{ margin: '0', color: '#1976d2' }}>👥 מחירי מנות לפי סטטוס מוזמנים</h4>
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
                    console.log('🔄 Refreshed guest counts:', counts);
                  }
                } catch (error) {
                  console.error('Error refreshing guest counts:', error);
                }
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              🔄 רענן ספירת מוזמנים
            </button>
          </div>
          
          <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            {/* Confirmed Guests */}
            <div style={{ 
              background: 'white', 
              padding: '15px', 
              borderRadius: '4px',
              border: '2px solid #4caf50'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  backgroundColor: '#4caf50', 
                  marginRight: '8px' 
                }}></div>
                <h5 style={{ margin: '0', color: '#4caf50', fontWeight: 'bold' }}>מאשרי הגעה</h5>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
                {guestCounts.confirmed}
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>מוזמנים</div>
              {calculateMealCostByStatus().confirmed?.totalCost && typeof calculateMealCostByStatus().confirmed?.totalCost === 'number' && (
                <>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#4caf50' }}>
                    {calculateMealCostByStatus().confirmed?.totalCost?.toLocaleString?.() ?? 0} ₪
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {(calculateMealCostByStatus().confirmed?.costPerPerson ?? 0).toFixed(0)} ₪ לאיש
                  </div>
                </>
              )}
            </div>

            {/* Maybe Guests */}
            <div style={{ 
              background: 'white', 
              padding: '15px', 
              borderRadius: '4px',
              border: '2px solid #ff9800'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  backgroundColor: '#ff9800', 
                  marginRight: '8px' 
                }}></div>
                <h5 style={{ margin: '0', color: '#ff9800', fontWeight: 'bold' }}>מתלבטים</h5>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
                {guestCounts.maybe}
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>מוזמנים</div>
              {calculateMealCostByStatus().maybe?.totalCost && typeof calculateMealCostByStatus().maybe?.totalCost === 'number' && (
                <>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ff9800' }}>
                    {calculateMealCostByStatus().maybe?.totalCost?.toLocaleString?.() ?? 0} ₪
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {(calculateMealCostByStatus().maybe?.costPerPerson ?? 0).toFixed(0)} ₪ לאיש
                  </div>
                </>
              )}
            </div>

            {/* Pending Guests */}
            <div style={{ 
              background: 'white', 
              padding: '15px', 
              borderRadius: '4px',
              border: '2px solid #9e9e9e'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  backgroundColor: '#9e9e9e', 
                  marginRight: '8px' 
                }}></div>
                <h5 style={{ margin: '0', color: '#9e9e9e', fontWeight: 'bold' }}>ממתינים לתשובה</h5>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
                {guestCounts.pending}
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>מוזמנים</div>
              {calculateMealCostByStatus().pending?.totalCost && typeof calculateMealCostByStatus().pending?.totalCost === 'number' && (
                <>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#9e9e9e' }}>
                    {calculateMealCostByStatus().pending?.totalCost?.toLocaleString?.() ?? 0} ₪
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {(calculateMealCostByStatus().pending?.costPerPerson ?? 0).toFixed(0)} ₪ לאיש
                  </div>
                </>
              )}
            </div>

            {/* Total */}
            <div style={{ 
              background: 'white', 
              padding: '15px', 
              borderRadius: '4px',
              border: '2px solid #2196F3'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  backgroundColor: '#2196F3', 
                  marginRight: '8px' 
                }}></div>
                <h5 style={{ margin: '0', color: '#2196F3', fontWeight: 'bold' }}>סה"כ</h5>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
                {guestCounts.total}
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>מוזמנים</div>
              {calculateMealCostByStatus().total?.totalCost && typeof calculateMealCostByStatus().total?.totalCost === 'number' && (
                <>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2196F3' }}>
                    {calculateMealCostByStatus().total?.totalCost?.toLocaleString?.() ?? 0} ₪
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {(calculateMealCostByStatus().total?.costPerPerson ?? 0).toFixed(0)} ₪ לאיש
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Total Meal Cost Summary */}
          {calculateMealCostByStatus().total?.totalCost && typeof calculateMealCostByStatus().total?.totalCost === 'number' && (
            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              background: '#4caf50', 
              borderRadius: '8px',
              border: '2px solid #2e7d32',
              textAlign: 'center'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: 'white', fontSize: '18px' }}>
                💰 סה"כ עלות מנות לכל המוזמנים
              </h4>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '5px' }}>
                {calculateMealCostByStatus().total?.totalCost?.toLocaleString?.() ?? 0} ₪
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>
                ממוצע: {(calculateMealCostByStatus().total?.costPerPerson ?? 0).toFixed(0)} ₪ לאיש
              </div>
            </div>
          )}

          <div style={{ marginTop: '15px', padding: '10px', background: 'white', borderRadius: '4px', fontSize: '12px', color: '#666' }}>
            <strong>הערה:</strong> המחירים מחושבים אוטומטית לפי מספר המוזמנים בכל סטטוס ויובאו מרשימת המוזמנים
          </div>
        </div>

        {/* Save Meal Pricing Button */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => {
              console.log('💾 Save button clicked');
              console.log('🍽️ Current meal pricing before save:', JSON.stringify(wedding.mealPricing, null, 2));
              saveWeddingData();
            }}
            disabled={saving}
            style={{
              padding: '12px 24px',
              backgroundColor: saving ? '#ccc' : '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {saving ? 'שומר...' : '💾 שמור הגדרות מחירי מנות'}
          </button>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
            שמירת הגדרות מחירי המנות יחד עם פרטי האירוע
          </div>
        </div>
      </div>

      {/* Manual Calculation - Custom Estimation */}
      <div style={{ 
        background: '#fff3e0', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid #ff9800'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#e65100' }}>
          🧮 חישוב ידני - אומדן מותאם אישית
        </h3>
        
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #ddd',
          marginBottom: '20px'
        }}>
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
          <div style={{ 
            background: '#e8f5e8', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #4caf50'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#2e7d32' }}>תוצאות החישוב</h4>
            
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
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32' }}>
                  {calculateManualMealCost().totalCost.toLocaleString()} ₪
                </div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            {calculateManualMealCost().totalGuests > 0 && (
              <div style={{ marginTop: '15px', padding: '15px', background: 'white', borderRadius: '4px' }}>
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
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #ddd'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            📋 סיכום האירוע
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
            <strong style={{ color: '#666' }}>שותפים לאירוע:</strong>
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
                        border: '1px solid #2196F3'
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
            <div style={{ marginTop: '20px', padding: '15px', background: '#fff3e0', borderRadius: '4px', border: '1px solid #ff9800' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#e65100' }}>🍽️ עלויות מנות</h4>
              
              {/* Basic Pricing */}
              <div style={{ marginBottom: '15px' }}>
                <h5 style={{ margin: '0 0 10px 0', color: '#e65100', fontSize: '14px' }}>מחירים בסיסיים</h5>
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
                  <h5 style={{ margin: '0 0 10px 0', color: '#e65100', fontSize: '14px' }}>מחירי התחייבות</h5>
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
                  <h5 style={{ margin: '0 0 10px 0', color: '#e65100', fontSize: '14px' }}>מחירי רזרבה</h5>
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
                <div style={{ marginTop: '15px', padding: '10px', background: '#e8f5e8', borderRadius: '4px', border: '1px solid #4caf50' }}>
                  <h5 style={{ margin: '0 0 10px 0', color: '#2e7d32', fontSize: '14px' }}>תוצאות החישוב</h5>
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
                      <div style={{ marginTop: '2px', fontSize: '14px', fontWeight: 'bold', color: '#2e7d32' }}>
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

