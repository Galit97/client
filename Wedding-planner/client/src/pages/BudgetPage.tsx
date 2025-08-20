import React, { useState, useEffect, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
  
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

type Vendor = {
  _id: string;
  vendorName: string;
  price: number;
  type: string;
  status: string;
};

// Removed unused GuestStatus type

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

// Map vendor types to Hebrew labels (aligned with server model)
const VENDOR_TYPE_HE: { [key: string]: string } = {
  music: 'מוזיקה',
  food: 'אוכל',
  photography: 'צילום',
  decor: 'קישוט',
  clothes: 'בגדים',
  makeup_hair: 'איפור ושיער',
  internet_orders: 'הזמנות מקוונות',
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
  other: 'אחר'
};

const COLORS = [
  "#D4A574", // חום פסטל
  "#A8D5BA", // ירוק פסטל
  "#F4C2C2", // ורוד פסטל
  "#F7E7CE", // צהוב פסטל
  "#C8A2C8", // לילך פסטל
  "#B8E6B8", // ירוק בהיר פסטל
  "#FFB6C1", // ורוד בהיר פסטל
  "#F0E68C", // צהוב בהיר פסטל
];

const BudgetPage: React.FC = () => {
  const [budget, setBudget] = useState<number>(0);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [guestCounts, setGuestCounts] = useState({
    confirmed: 0,
    maybe: 0,
    pending: 0,
    total: 0
  });
  const [weddingData, setWeddingData] = useState<WeddingData>({ budget: 0 });
  const [loading, setLoading] = useState(true);
  // removed unused saving state

  // Add state for manual calculation
  const [manualCalculation, setManualCalculation] = useState({
    adultGuests: 0,
    childGuests: 0
  });

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        // Fetch wedding data
        const weddingRes = await fetch("/api/weddings/owner", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (weddingRes.ok) {
          const wedding = await weddingRes.json();
          setWeddingData(wedding);
          setBudget(wedding.budget || 0);
        }

        // Fetch vendors
        const vendorsRes = await fetch("/api/vendors", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (vendorsRes.ok) {
          const vendors = await vendorsRes.json();
          setVendors(vendors);
        }

        // Fetch guest counts
        const guestsRes = await fetch("/api/guests", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (guestsRes.ok) {
          const guests = await guestsRes.json();
          const counts = {
            // Sum by number of seats reserved per guest
            confirmed: guests.reduce((sum: number, g: any) => g.status === 'Confirmed' ? sum + (g.seatsReserved || 1) : sum, 0),
            // Use 'Arrived' as the intermediate bucket for display
            maybe: guests.reduce((sum: number, g: any) => g.status === 'Arrived' ? sum + (g.seatsReserved || 1) : sum, 0),
            // Pending = Invited ("הוזמן")
            pending: guests.reduce((sum: number, g: any) => g.status === 'Invited' ? sum + (g.seatsReserved || 1) : sum, 0),
            total: guests.reduce((sum: number, g: any) => sum + (g.seatsReserved || 1), 0)
          };
          setGuestCounts(counts);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const totalExpenses = useMemo(
    () => vendors.reduce((sum, v) => sum + v.price, 0),
    [vendors]
  );



  // Pie chart data for expense distribution
  const expensePieData = useMemo(() => {
    const map = new Map<string, number>();
    vendors.forEach(({ type, price }) => {
      map.set(type, (map.get(type) || 0) + price);
    });
    
    // Translate vendor types to Hebrew
    const hebrewTypeMap: { [key: string]: string } = {
      'venue': 'אולם אירועים',
      'catering': 'קייטרינג',
      'photography': 'צילום',
      'music': 'מוזיקה',
      'decorations': 'עיצוב וקישוט',
      'decor': 'עיצוב וקישוט',
      'transportation': 'תחבורה',
      'clothes': 'בגדים',
      'makeup_hair': 'איפור ושיער',
      'internet_orders': 'הזמנות אינטרנט',
      'flowers': 'פרחים',
      'cake': 'עוגה',
      'jewelry': 'תכשיטים',
      'other': 'אחר'
    };
    
    return Array.from(map.entries()).map(([name, value]) => ({ 
      name: hebrewTypeMap[name] || name, 
      value 
    }));
  }, [vendors]);



  // Removed unused profitLossData

  // Line chart data for budget tracking
  const budgetTrackingData = [
    { month: "ינואר", budget: budget * 0.1, actual: totalExpenses * 0.1 },
    { month: "פברואר", budget: budget * 0.2, actual: totalExpenses * 0.2 },
    { month: "מרץ", budget: budget * 0.3, actual: totalExpenses * 0.3 },
    { month: "אפריל", budget: budget * 0.4, actual: totalExpenses * 0.4 },
    { month: "מאי", budget: budget * 0.5, actual: totalExpenses * 0.5 },
    { month: "יוני", budget: budget * 0.6, actual: totalExpenses * 0.6 },
    { month: "יולי", budget: budget * 0.7, actual: totalExpenses * 0.7 },
    { month: "אוגוסט", budget: budget * 0.8, actual: totalExpenses * 0.8 },
    { month: "ספטמבר", budget: budget * 0.9, actual: totalExpenses * 0.9 },
    { month: "אוקטובר", budget: budget, actual: totalExpenses },
  ];

  const calculateMealCostByStatus = () => {
    if (!weddingData.mealPricing) return {};

    const { basePrice, bulkThreshold, bulkPrice, bulkMaxGuests, reservePrice } = weddingData.mealPricing;

    const calculateForCount = (count: number) => {
      let totalCost = 0;
      let remainingGuests = count;

      // Base price tier
      const baseGuests = Math.min(remainingGuests, bulkThreshold);
      if (baseGuests > 0) {
        totalCost += baseGuests * basePrice;
        remainingGuests -= baseGuests;
      }

      // Bulk price tier
      if (remainingGuests > 0 && bulkPrice > 0) {
        const bulkGuests = Math.min(remainingGuests, bulkMaxGuests - bulkThreshold);
        if (bulkGuests > 0) {
          totalCost += bulkGuests * bulkPrice;
          remainingGuests -= bulkGuests;
        }
      }

      // Reserve price tier
      if (remainingGuests > 0 && reservePrice > 0) {
        totalCost += remainingGuests * reservePrice;
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
  };

  // Event total cost (vendors + meal pricing for confirmed guests)
  const confirmedMealCost = calculateMealCostByStatus().confirmed?.totalCost || 0;
  const eventTotalCost = totalExpenses + confirmedMealCost;
  const confirmedGuestsCount = guestCounts.confirmed || 0;
  const eventCostPerPerson = confirmedGuestsCount > 0 ? Math.round(eventTotalCost / confirmedGuestsCount) : 0;

  // Calculate meal + vendors cost for manual input
  const calculateManualMealCost = () => {
    if (!weddingData.mealPricing) {
      const { adultGuests, childGuests } = manualCalculation;
      const totalGuests = adultGuests + childGuests;
      const eventTotalCost = totalExpenses; // only vendors if no meal pricing
      const eventCostPerPerson = totalGuests > 0 ? eventTotalCost / totalGuests : 0;
      return { totalCost: 0, costPerPerson: 0, adultGuests, childGuests, totalGuests, eventTotalCost, eventCostPerPerson };
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
    const eventTotalCost = totalCost + totalExpenses; // add vendors
    const eventCostPerPerson = totalGuests > 0 ? eventTotalCost / totalGuests : 0;

    return { totalCost, costPerPerson, adultGuests, childGuests, totalGuests, eventTotalCost, eventCostPerPerson };
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>טוען...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="text-center mb-xl">
        📊 ניהול תקציב האירוע
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-4 mb-xl">
        <div className="card text-center">
          <h3 className="mb-md">תקציב כולל</h3>
          <div className="text-primary" style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {budget.toLocaleString()} ₪
          </div>
        </div>



        <div className="card text-center">
          <h3 className="mb-md">הוצאות בפועל</h3>
          <div className="text-primary" style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {totalExpenses.toLocaleString()} ₪
          </div>
        </div>


      </div>



      {/* Budget Tracking Line Chart */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid black'
       
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>📊 מעקב תקציב לאורך זמן</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={budgetTrackingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value: number) => `₪${value.toLocaleString()}`} />
            <Legend />
                         <Line type="monotone" dataKey="budget" stroke="#A8D5BA" name="תקציב מתוכנן" />
             <Line type="monotone" dataKey="actual" stroke="#F4C2C2" name="הוצאות בפועל" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Meal Pricing by Guest Status */}
      <div style={{ 
        background: '#ffffff', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px',
   
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#1E5A78' }}>🍽️ מחירי מנות לפי סטטוס מוזמנים</h2>
        
        <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                     {/* Confirmed Guests */}
           <div style={{ 
             background: 'white', 
             padding: '15px', 
             borderRadius: '4px',
             border: '1px solid #CBD5E1'
           }}>
             <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
               <div style={{ 
                 width: '12px', 
                 height: '12px', 
                 borderRadius: '50%', 
                 backgroundColor: '#EDF8F4', 
                 marginRight: '8px' 
               }}></div>
               <h5 style={{ margin: '0', color: '#1E5A78', fontWeight: 'bold' }}>מאשרי הגעה</h5>
             </div>
             <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0F172A', marginBottom: '5px' }}>
               {guestCounts.confirmed}
             </div>
             <div style={{ fontSize: '14px', color: '#475569', marginBottom: '10px' }}>מוזמנים</div>
             {calculateMealCostByStatus().confirmed?.totalCost && (
               <>
                 <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1E5A78' }}>
                   {calculateMealCostByStatus().confirmed?.totalCost?.toLocaleString?.() ?? 0} ₪
                 </div>
                 <div style={{ fontSize: '12px', color: '#475569' }}>
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
             border: '1px solid #CBD5E1'
           }}>
             <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
               <div style={{ 
                 width: '12px', 
                 height: '12px', 
                 borderRadius: '50%', 
                 backgroundColor: '#FCF3F7', 
                 marginRight: '8px' 
               }}></div>
               <h5 style={{ margin: '0', color: '#1E5A78', fontWeight: 'bold' }}>מתלבטים</h5>
             </div>
             <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0F172A', marginBottom: '5px' }}>
               {guestCounts.maybe}
             </div>
             <div style={{ fontSize: '14px', color: '#475569', marginBottom: '10px' }}>מוזמנים</div>
             {calculateMealCostByStatus().maybe?.totalCost && (
               <>
                 <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1E5A78' }}>
                   {calculateMealCostByStatus().maybe?.totalCost?.toLocaleString?.() ?? 0} ₪
                 </div>
                 <div style={{ fontSize: '12px', color: '#475569' }}>
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
             border: '1px solid #CBD5E1'
           }}>
             <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
               <div style={{ 
                 width: '12px', 
                 height: '12px', 
                 borderRadius: '50%', 
                 backgroundColor: '#475569', 
                 marginRight: '8px' 
               }}></div>
               <h5 style={{ margin: '0', color: '#475569', fontWeight: 'bold' }}>ממתינים לתשובה</h5>
             </div>
             <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0F172A', marginBottom: '5px' }}>
               {guestCounts.pending}
             </div>
             <div style={{ fontSize: '14px', color: '#475569', marginBottom: '10px' }}>מוזמנים</div>
             {calculateMealCostByStatus().pending?.totalCost && (
               <>
                 <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#475569' }}>
                   {calculateMealCostByStatus().pending?.totalCost?.toLocaleString?.() ?? 0} ₪
                 </div>
                 <div style={{ fontSize: '12px', color: '#475569' }}>
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
             border: '1px solid #CBD5E1'
           }}>
             <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
               <div style={{ 
                 width: '12px', 
                 height: '12px', 
                 borderRadius: '50%', 
                 backgroundColor: '#EFF5FB', 
                 marginRight: '8px' 
               }}></div>
               <h5 style={{ margin: '0', color: '#1E5A78', fontWeight: 'bold' }}>סה"כ</h5>
             </div>
             <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0F172A', marginBottom: '5px' }}>
               {guestCounts.total}
             </div>
             <div style={{ fontSize: '14px', color: '#475569', marginBottom: '10px' }}>מוזמנים</div>
             {calculateMealCostByStatus().total?.totalCost && (
               <>
                 <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1E5A78' }}>
                   {calculateMealCostByStatus().total?.totalCost?.toLocaleString?.() ?? 0} ₪
                 </div>
                 <div style={{ fontSize: '12px', color: '#475569' }}>
                   {(calculateMealCostByStatus().total?.costPerPerson ?? 0).toFixed(0)} ₪ לאיש
                 </div>
               </>
             )}
           </div>
        </div>
      </div>

      {/* Real Calculation Results - Based on Confirmed Guests */}
      <div style={{ 
        background: '#ffffff', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px',
     
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#1E5A78' }}>📊 תוצאות חישוב אמיתיות - לפי מאשרי הגעה</h2>
        
        {calculateMealCostByStatus().confirmed?.totalCost ? (
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #CBD5E1'
          }}>
            <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                             <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '14px', color: '#475569', marginBottom: '5px' }}>מספר מאשרי הגעה</div>
                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1E5A78' }}>
                   {guestCounts.confirmed}
                 </div>
               </div>
               <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '14px', color: '#475569', marginBottom: '5px' }}>מחיר מנה בסיסי</div>
                 <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0F172A' }}>
                   {weddingData.mealPricing?.basePrice || 0} ₪
                 </div>
               </div>
               <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '14px', color: '#475569', marginBottom: '5px' }}>עלות ממוצעת לאיש</div>
                 <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0F172A' }}>
                   {(calculateMealCostByStatus().confirmed?.costPerPerson ?? 0).toFixed(0)} ₪
                 </div>
               </div>
               <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '14px', color: '#475569', marginBottom: '5px' }}>סה"כ עלות מנות</div>
                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1E5A78' }}>
                   {calculateMealCostByStatus().confirmed?.totalCost?.toLocaleString?.() ?? 0} ₪
                 </div>
               </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#475569', fontStyle: 'italic' }}>
            אין מאשרי הגעה או הגדרות מחירי מנות
          </div>
        )}
      </div>

      {/* Event Total Cost (Vendors + Meal Cost for Confirmed Guests) */}
      <div style={{ 
        background: '#ffffff', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px',
     
      }}>
                 <h2 style={{ margin: '0 0 20px 0', color: '#1E5A78' }}>💰 מחירי מנות - חישוב עלויות האירוע</h2>
                 <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
           <div style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid black' }}>
             <div style={{ fontSize: '14px', color: '#666', marginBottom: '6px' }}>סה"כ הוצאות ספקים</div>
             <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#F4C2C2' }}>{totalExpenses.toLocaleString()} ₪</div>
           </div>
           <div style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid black' }}>
             <div style={{ fontSize: '14px', color: '#666', marginBottom: '6px' }}>עלות מנות (מאשרים)</div>
             <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#A8D5BA' }}>{confirmedMealCost.toLocaleString()} ₪</div>
           </div>
           <div style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid black' }}>
             <div style={{ fontSize: '14px', color: '#666', marginBottom: '6px' }}>סה"כ עלות אירוע</div>
             <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#D4A574' }}>{eventTotalCost.toLocaleString()} ₪</div>
           </div>
           <div style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid black' }}>
             <div style={{ fontSize: '14px', color: '#666', marginBottom: '6px' }}>עלות לאיש (מאשרים)</div>
             <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#C8A2C8' }}>{eventCostPerPerson.toLocaleString()} ₪</div>
           </div>
         </div>
      </div>

      {/* Manual Calculation - Custom Estimation */}
      <div style={{ 
        background: '#ffffff', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px',
      
      }}>
                 <h2 style={{ margin: '0 0 20px 0', color: '#ff9800' }}>🧮 חישוב ידני - אומדן מותאם אישית</h2>
        
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid black',
          marginBottom: '20px'
        }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>הכנס מספרי אורחים לבדיקה (עלות מנות + ספקים)</h3>
          
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
               
                style={{ width: '100%', padding: '8px',   borderRadius: '4px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                מספר ילדים (עד גיל {weddingData.mealPricing?.childAgeLimit || 0})
              </label>
              <input
                type="number"
                min="0"
                value={manualCalculation.childGuests}
                onChange={(e) => setManualCalculation(prev => ({
                  ...prev,
                  childGuests: Number(e.target.value)
                }))}
               
                style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
              />
            </div>
          </div>
        </div>

        {/* Manual Calculation Results (Meals + Vendors) */}
        {manualCalculation.adultGuests > 0 || manualCalculation.childGuests > 0 ? (
          <div style={{ 
            background: '#f1f8e9', 
            padding: '20px', 
            borderRadius: '8px',
           
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#33691e' }}>תוצאות החישוב</h3>
            
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
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>עלות ממוצעת למנה</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                  {calculateManualMealCost().costPerPerson.toFixed(0)} ₪
                </div>
              </div>
                             <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>סה"כ עלות מנות</div>
                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#A8D5BA' }}>
                   {calculateManualMealCost().totalCost.toLocaleString()} ₪
                 </div>
               </div>
               <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>סה"כ ספקים</div>
                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#F4C2C2' }}>
                   {totalExpenses.toLocaleString()} ₪
                 </div>
               </div>
               <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>סה"כ עלות אירוע</div>
                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#D4A574' }}>
                   {calculateManualMealCost().eventTotalCost?.toLocaleString?.() ?? (calculateManualMealCost().totalCost + totalExpenses).toLocaleString()} ₪
                 </div>
               </div>
               <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>עלות לאיש</div>
                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#C8A2C8' }}>
                   {(calculateManualMealCost().eventCostPerPerson ?? ((calculateManualMealCost().totalCost + totalExpenses) / (calculateManualMealCost().totalGuests || 1))).toFixed(0)} ₪
                 </div>
               </div>
            </div>

            {/* Detailed Breakdown */}
            {(() => {
              const mealCost = calculateManualMealCost();
              return mealCost && mealCost.totalGuests && mealCost.totalGuests > 0 ? (
                <div style={{ marginTop: '15px', padding: '15px', background: 'white', borderRadius: '4px', border: '1px solid black' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
                    פירוט החישוב (מנות + ספקים):
                  </div>
                  <div style={{ fontSize: '12px', lineHeight: '1.4', color: '#666' }}>
                    <div>• מבוגרים: {mealCost.adultGuests || 0} × {weddingData.mealPricing?.basePrice || 0} ₪ = {((mealCost.adultGuests || 0) * (weddingData.mealPricing?.basePrice || 0)).toLocaleString()} ₪</div>
                    <div>• ילדים: {mealCost.childGuests || 0} × {((weddingData.mealPricing?.basePrice || 0) * (1 - (weddingData.mealPricing?.childDiscount || 0) / 100)).toFixed(0)} ₪ = {((mealCost.childGuests || 0) * ((weddingData.mealPricing?.basePrice || 0) * (1 - (weddingData.mealPricing?.childDiscount || 0) / 100))).toLocaleString()} ₪</div>
                    {weddingData.mealPricing && (mealCost.totalGuests || 0) >= (weddingData.mealPricing?.bulkThreshold || 0) && (weddingData.mealPricing?.bulkPrice || 0) > 0 && (
                      <div style={{ color: '#4caf50', fontWeight: 'bold' }}>
                        ✓ מחיר התחייבות מיושם (מעל {weddingData.mealPricing?.bulkThreshold || 0} אורחים)
                      </div>
                    )}
                    {weddingData.mealPricing && (mealCost.totalGuests || 0) >= (weddingData.mealPricing?.reserveThreshold || 0) && (weddingData.mealPricing?.reservePrice || 0) > 0 && (
                      <div style={{ color: '#4caf50', fontWeight: 'bold' }}>
                        ✓ מחיר רזרבה מיושם (מעל {weddingData.mealPricing?.reserveThreshold || 0} אורחים)
                      </div>
                    )}
                    <div style={{ marginTop: '8px' }}>• הוצאות ספקים: {totalExpenses.toLocaleString()} ₪</div>
                    <div>• סה"כ אירוע: {(mealCost.totalCost + totalExpenses).toLocaleString()} ₪</div>
                    <div>• עלות לאיש: {(((mealCost.totalCost + totalExpenses) / (mealCost.totalGuests || 1)) || 0).toFixed(0)} ₪</div>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#475569', fontStyle: 'italic' }}>
            הכנס מספרי אורחים כדי לראות את החישוב
          </div>
        )}
      </div>

      {/* Expense Distribution Pie Chart */}
      <div style={{ 
        background: '#FFFFFF', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid #CBD5E1'
      
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#0F172A' }}>🥧 התפלגות הוצאות לפי נושאים</h2>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={expensePieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={({ name, value }) => `${name}: ₪${value?.toLocaleString()}`}
            >
              {expensePieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `₪${value.toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Vendors Table */}
      <div style={{ 
        background: '#FFFFFF', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #CBD5E1'
      
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#0F172A' }}>📋 רשימת ספקים והוצאות</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                              <tr style={{ backgroundColor: '#EFF5FB' }}>
                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right' }}>שם ספק</th>
                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right' }}>סוג ספק</th>
                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right' }}>סטטוס</th>
                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right' }}>סכום (₪)</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map(({ _id, vendorName, price, type, status }) => (
                <tr key={_id}>
                  <td style={{ border: '1px solid #ddd', padding: '12px' }}>{vendorName}</td>
                  <td style={{ border: '1px solid #ddd', padding: '12px' }}>{VENDOR_TYPE_HE[type] || type}</td>
                                     <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                     <span style={{
                       padding: '4px 8px',
                       borderRadius: '4px',
                       backgroundColor: status === 'Confirmed' ? '#A8D5BA' : 
                                      status === 'Pending' ? '#F7E7CE' : '#F4C2C2',
                       color: '#333',
                       fontSize: '12px'
                     }}>
                       {status === 'Confirmed' ? 'מאושר' : 
                        status === 'Pending' ? 'ממתין' : 'לא ידוע'}
                     </span>
                   </td>
                  <td style={{ border: '1px solid #ddd', padding: '12px', fontWeight: 'bold' }}>
                    {price.toLocaleString()} ₪
                  </td>
                </tr>
              ))}
              <tr style={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}>
                <td colSpan={3} style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                  סה"כ הוצאות
                </td>
                <td style={{ border: '1px solid #ddd', padding: '12px', fontWeight: 'bold', color: '#f44336' }}>
                  {totalExpenses.toLocaleString()} ₪
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BudgetPage;
