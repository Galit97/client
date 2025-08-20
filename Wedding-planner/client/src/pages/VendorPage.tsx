import React, { useEffect, useState, useMemo, useRef } from "react";

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
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [weddingId, setWeddingId] = useState<string>('');
  const [weddingData, setWeddingData] = useState<WeddingData>({ budget: 0 });
  const [loading, setLoading] = useState(true);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

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
        setWeddingData(weddingData);
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
          
          // If no vendors exist, create default ones
          if (vendorsData.length === 0) {
            console.log("No vendors found, creating default vendors...");
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
                console.log(`Created default vendor: ${defaultVendor.vendorName}`);
              }
            }
            defaultVendorsCreatedRef.current = true;
          }
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

  const totalPrice = useMemo(() => {
    return filteredAndSortedVendors.reduce((sum, v) => sum + v.price, 0);
  }, [filteredAndSortedVendors]);

  const totalDeposits = useMemo(() => {
    return filteredAndSortedVendors.reduce((sum, v) => sum + (v.depositAmount || 0), 0);
  }, [filteredAndSortedVendors]);

  const remainingToPay = useMemo(() => {
    return totalPrice - totalDeposits;
  }, [totalPrice, totalDeposits]);

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
        depositPaid: false,
        depositAmount: 0,
        notes: "",
        contractFile: "",
        fileURL: "",
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

  async function createDefaultVendorsIfNeeded() {
    if (!weddingId || defaultVendorsCreatedRef.current) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      console.log("Creating default vendors...");
      console.log("Current vendors:", vendors.map(v => v.vendorName));
      
      // Check which default vendors are missing
      const existingVendorNames = vendors.map(v => v.vendorName);
      const missingVendors = defaultVendors.filter(dv => !existingVendorNames.includes(dv.vendorName));

      console.log("Missing vendors:", missingVendors.map(v => v.vendorName));

      if (missingVendors.length === 0) {
        console.log("All default vendors already exist");
        defaultVendorsCreatedRef.current = true;
        return; // All default vendors already exist
      }

      console.log(`Creating ${missingVendors.length} default vendors...`);

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
          console.log(`Created vendor: ${defaultVendor.vendorName}`);
        } else {
          const errorText = await res.text();
          console.error(`Failed to create vendor: ${defaultVendor.vendorName}`, errorText);
          console.error('Vendor data that failed:', vendorData);
        }
      }
      console.log("Finished creating default vendors");
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

  function downloadFile(filename: string, originalName?: string) {
    const url = `http://localhost:5000/uploads/${encodeURIComponent(filename)}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = originalName || filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function viewFile(filename: string) {
    const url = `http://localhost:5000/uploads/${encodeURIComponent(filename)}`;
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

  // Calculate vendor distribution by type
  const vendorDistribution = useMemo(() => {
    const map = new Map<string, number>();
    vendors.forEach(({ type, price }) => {
      map.set(type, (map.get(type) || 0) + price);
    });
    
    return Array.from(map.entries()).map(([name, value]) => ({ 
      name: getTypeText(name as VendorType), 
      value 
    }));
  }, [vendors]);

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
    <div className="page-container ">
      <h1 className="text-center mb-xl">
        ניהול ספקים
      </h1>

      {/* Help Section */}
      <div className="card"> 
        <h4 className="mb-md ">💡 איך לנהל ספקים:</h4>
        <div className="text-secondary">
          <div><strong>סטטוס:</strong> ממתין → אושר → שולם</div>
          <div><strong>סוג ספק:</strong> בחר את סוג השירות שהספק מספק</div>
          <div><strong>קישורים:</strong> הוסף קישורים לחוזים והצעות</div>
          <div><strong>סינון ומיון:</strong> השתמש בפילטרים כדי למצוא ספקים ספציפיים</div>
        </div>   
      </div>

      {/* Manual Calculation Section */}
      <div className="alert warning mb-xl">
        <h2 className="mb-xl">🧮 חישוב ידני - אומדן מותאם אישית</h2>
        
        <div className="card mb-xl">
            <h3 className="mb-lg">הכנס מספרי אורחים לבדיקה (עלות מנות + ספקים)</h3>
          
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">
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
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
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
                className="form-input"
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
          <div className="text-center text-secondary" style={{ fontStyle: 'italic' }}>
            הכנס מספרי אורחים כדי לראות את החישוב
          </div>
        )}
      </div>

      {/* Add Vendor Form */}
      <div style={{
        background: '#ffffff',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
       
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
              style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '4px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#0F172A' }}>
              מחיר (₪) *
            </label>
            <input
              type="number"
              min={0}
            
              value={newVendor.price}
              onChange={(e) => setNewVendor({ ...newVendor, price: Number(e.target.value) })}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '4px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              שולם מקדמה
            </label>
            <input
              type="checkbox"
              checked={newVendor.depositPaid}
              onChange={(e) => setNewVendor({ ...newVendor, depositPaid: e.target.checked })}
              style={{ marginLeft: '8px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              סכום מקדמה (₪)
            </label>
            <input
              type="number"
              min={0}
              max={newVendor.price}
              placeholder="0"
              value={newVendor.depositAmount}
              onChange={(e) => setNewVendor({ ...newVendor, depositAmount: Number(e.target.value) })}
              disabled={!newVendor.depositPaid}
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                backgroundColor: !newVendor.depositPaid ? '#f5f5f5' : 'white'
              }}
            />
            {newVendor.depositPaid && newVendor.depositAmount > 0 && (
              <small style={{ color: '#666', fontSize: '12px' }}>
                נותר לשלם: {(newVendor.price - newVendor.depositAmount).toLocaleString()} ₪
              </small>
            )}
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#0F172A' }}>
              סוג ספק *
            </label>
            <select
              value={newVendor.type}
              onChange={(e) => setNewVendor({ ...newVendor, type: e.target.value as VendorType })}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '4px' }}
            >
              <option value="music">מוזיקה</option>
              <option value="food">אוכל</option>
              <option value="photography">צילום</option>
              <option value="decor">קישוט</option>
              <option value="clothes">בגדים</option>
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
              <option value="internet_orders">הזמנות מקוונות</option>
              <option value="other">אחר</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#0F172A' }}>
              סטטוס
            </label>
            <select
              value={newVendor.status}
              onChange={(e) => setNewVendor({ ...newVendor, status: e.target.value as VendorStatus })}
              style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '4px' }}
            >
              <option value="Pending">ממתין</option>
              <option value="Confirmed">אושר</option>
              <option value="Paid">שולם</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#0F172A' }}>
              הערות
            </label>
            <input
              placeholder="פרטים נוספים על הספק"
              value={newVendor.notes}
              onChange={(e) => setNewVendor({ ...newVendor, notes: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '4px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#0F172A' }}>
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
                    alert('שגיאה בהעלאת הקובץ');
                  }
                }
              }}
              style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '4px' }}
            />
            {newVendor.contractFile && (
              <small style={{ color: '#475569', fontSize: '12px' }}>
                קובץ נבחר: {newVendor.contractFile}
              </small>
            )}
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
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
                    alert('שגיאה בהעלאת הקובץ');
                  }
                }
              }}
              style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '4px' }}
            />
            {newVendor.fileURL && (
              <small style={{ color: '#475569', fontSize: '12px' }}>
                קובץ נבחר: {newVendor.fileURL}
              </small>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <button 
              type="submit"
            className='button'
            >
              הוסף ספק
            </button>
          </div>
        </form>
      </div>

      {/* Filters */}
      <div className="toolbar">
        <h4 style={{ margin: '0 0 12px 0' }}>סינון ומיון</h4>
        {filteredAndSortedVendors.length > 0 && (
          <div style={{
            background: '#EDF8F4',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '12px',
       
            fontSize: '14px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
              <div><strong>סה"כ מחיר:</strong> {totalPrice.toLocaleString()} ₪</div>
              <div><strong>סה"כ מקדמות:</strong> {totalDeposits.toLocaleString()} ₪</div>
              <div><strong>נותר לשלם:</strong> {remainingToPay.toLocaleString()} ₪</div>
              <div><strong>ספקים מוצגים:</strong> {filteredAndSortedVendors.length}</div>
            </div>
          </div>
        )}
        <div className="toolbar-grid">
          <div className="field">
            <label>חיפוש</label>
            <input
              className="input"
              type="text"
              placeholder="חפש לפי שם ספק"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="field">
            <label>סוג ספק</label>
            <select
              className="select"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">כל הסוגים</option>
              <option value="music">מוזיקה</option>
              <option value="food">אוכל</option>
              <option value="photography">צילום</option>
              <option value="decor">קישוט</option>
              <option value="clothes">בגדים</option>
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
              <option value="internet_orders">הזמנות מקוונות</option>
              <option value="other">אחר</option>
            </select>
          </div>
          <div className="field">
            <label>סטטוס</label>
            <select
              className="select"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">כל הסטטוסים</option>
              <option value="Pending">ממתין</option>
              <option value="Confirmed">אושר</option>
              <option value="Paid">שולם</option>
            </select>
          </div>
          <div className="field">
            <label>מיון לפי</label>
            <select
              className="select"
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
            >
              <option value="vendorName">שם ספק</option>
              <option value="price">מחיר</option>
              <option value="type">סוג ספק</option>
            </select>
          </div>
          <div className="field">
            <label>סדר</label>
            <select
              className="select"
              value={filters.sortOrder}
              onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as any })}
            >
              <option value="asc">עולה</option>
              <option value="desc">יורד</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vendors List as Cards */}
      {filteredAndSortedVendors.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          אין ספקים ברשימה. הוסף ספק ראשון!
        </div>
      ) : (
        <div className="card-grid">
          {filteredAndSortedVendors.map(vendor => (
            <div key={vendor._id} className="card">
              {editingVendor && editingVendor._id === vendor._id ? (
                <>
                  <div className="card-header">
                    <input
                      className="input"
                      value={editingVendor.vendorName}
                      onChange={e => setEditingVendor({ ...editingVendor, vendorName: e.target.value })}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-icon" title="שמור" onClick={() => updateVendor(editingVendor)}>💾</button>
                      <button className="btn-icon" title="בטל" onClick={cancelEditing}>✖️</button>
                    </div>
                  </div>
                  <div className="card-row">
                    <div className="field">
                      <label>מחיר (₪)</label>
                      <input className="input" type="number" value={editingVendor.price} onChange={e => setEditingVendor({ ...editingVendor, price: Number(e.target.value) })} />
                    </div>
                    <div className="field">
                      <label>מקדמה</label>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input type="checkbox" checked={editingVendor.depositPaid || false} onChange={e => setEditingVendor({ ...editingVendor, depositPaid: e.target.checked })} />
                        <input className="input" type="number" min={0} max={editingVendor.price} placeholder="0" value={editingVendor.depositAmount || 0} onChange={e => setEditingVendor({ ...editingVendor, depositAmount: Number(e.target.value) })} disabled={!editingVendor.depositPaid} />
                      </div>
                    </div>
                  </div>
                  <div className="card-row">
                    <div className="field">
                      <label>סוג ספק</label>
                      <select className="select" value={editingVendor.type} onChange={e => setEditingVendor({ ...editingVendor, type: e.target.value as VendorType })}>
                        <option value="music">מוזיקה</option>
                        <option value="food">אוכל</option>
                        <option value="photography">צילום</option>
                        <option value="decor">קישוט</option>
                        <option value="clothes">בגדים</option>
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
                        <option value="internet_orders">הזמנות מקוונות</option>
                        <option value="other">אחר</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>סטטוס</label>
                      <select className="select" value={editingVendor.status} onChange={e => setEditingVendor({ ...editingVendor, status: e.target.value as VendorStatus })}>
                        <option value="Pending">ממתין</option>
                        <option value="Confirmed">אושר</option>
                        <option value="Paid">שולם</option>
                      </select>
                    </div>
                  </div>
                  <div className="field" style={{ marginBottom: 10 }}>
                    <label>הערות</label>
                    <input className="input" value={editingVendor.notes || ''} onChange={e => setEditingVendor({ ...editingVendor, notes: e.target.value })} />
                  </div>
                  <div className="card-row">
                    <div className="field">
                      <label>חוזה</label>
                      <input className="file" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt" onChange={async e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const filename = await uploadFile(file);
                          if (filename) setEditingVendor({ ...editingVendor, contractFile: filename });
                        }
                      }} />
                    </div>
                    <div className="field">
                      <label>מסמך נוסף</label>
                      <input className="file" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt" onChange={async e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const filename = await uploadFile(file);
                          if (filename) setEditingVendor({ ...editingVendor, fileURL: filename });
                        }
                      }} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="card-header">
                    <div className="card-title">{vendor.vendorName}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-icon" title="ערוך" onClick={() => startEditing(vendor)}>✏️</button>
                      <button className="btn-icon" title="מחק" onClick={() => deleteVendor(vendor._id)}>🗑️</button>
                    </div>
                  </div>
                  <div className="card-row">
                    <div>
                      <div className="muted">מחיר</div>
                      <div>{vendor.price.toLocaleString()} ₪</div>
                    </div>
                    <div>
                      <div className="muted">נותר לשלם</div>
                      <div>{(vendor.price - (vendor.depositAmount || 0)).toLocaleString()} ₪</div>
                    </div>
                  </div>
                  <div className="card-row">
                    <div>
                      <div className="muted">מקדמה</div>
                      <div>{vendor.depositPaid ? `💵 ${vendor.depositAmount?.toLocaleString()} ₪` : '❌ לא שולם'}</div>
                    </div>
                    <div>
                      <div className="muted">סוג ספק</div>
                      <div>{getTypeText(vendor.type)}</div>
                    </div>
                  </div>
                  <div className="card-row">
                    <div>
                      <div className="muted">סטטוס</div>
                      <div>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: vendor.status === 'Confirmed' ? '#A8D5BA' : 
                                         vendor.status === 'Pending' ? '#F7E7CE' : '#F4C2C2',
                          color: '#333',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {vendor.status === 'Pending' ? '⏳ ממתין' : vendor.status === 'Confirmed' ? '✅ אושר' : '💸 שולם'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="muted">הערות</div>
                      <div>{vendor.notes || '-'}</div>
                    </div>
                  </div>
                  <div className="card-row">
                    <div>
                      <div className="muted">חוזה</div>
                      <div>
                        {vendor.contractFile ? (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn-icon" title="צפה" onClick={() => viewFile(vendor.contractFile!)}>📄</button>
                            <button className="btn-icon" title="הורד" onClick={() => downloadFile(vendor.contractFile!, vendor.contractFile!)}>⬇️</button>
                          </div>
                        ) : (
                          <span className="muted">אין</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="muted">מסמך נוסף</div>
                      <div>
                        {vendor.fileURL ? (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn-icon" title="צפה" onClick={() => viewFile(vendor.fileURL!)}>📄</button>
                            <button className="btn-icon" title="הורד" onClick={() => downloadFile(vendor.fileURL!, vendor.fileURL!)}>⬇️</button>
                          </div>
                        ) : (
                          <span className="muted">אין</span>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {vendors.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#e8f5e8',
          borderRadius: '8px',
         
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>📊 סיכום ספקים</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
            <div><strong>סה"כ ספקים:</strong> {vendors.length}</div>
            <div><strong>סה"כ עלות:</strong> {vendors.reduce((sum, v) => sum + v.price, 0).toLocaleString()} ₪</div>
            <div><strong>סה"כ מקדמות:</strong> {vendors.reduce((sum, v) => sum + (v.depositAmount || 0), 0).toLocaleString()} ₪</div>
            <div><strong>נותר לשלם:</strong> {vendors.reduce((sum, v) => sum + (v.price - (v.depositAmount || 0)), 0).toLocaleString()} ₪</div>
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
