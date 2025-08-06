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
  ReferenceLine,
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

type GuestStatus = 'Confirmed' | 'Maybe' | 'Pending';

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

const COLORS = [
  "#0088FE",
  "#00C49F", 
  "#FFBB28",
  "#FF8042",
  "#A28EFF",
  "#FF6666",
  "#33CC99",
  "#FF9933",
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
  const [saving, setSaving] = useState(false);

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
            confirmed: guests.filter((g: any) => g.status === 'Confirmed').length,
            maybe: guests.filter((g: any) => g.status === 'Maybe').length,
            pending: guests.filter((g: any) => g.status === 'Pending').length,
            total: guests.length
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

  const totalIncome = useMemo(() => {
    if (!weddingData.mealPricing) return 0;
    
    const { basePrice, childDiscount, bulkThreshold, bulkPrice, bulkMaxGuests, reservePrice, reserveThreshold, reserveMaxGuests } = weddingData.mealPricing;
    
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

      return totalCost;
    };

    return calculateForCount(guestCounts.total);
  }, [weddingData.mealPricing, guestCounts.total]);

  const profit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;

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

  // Bar chart data for income vs expenses - separate positive values
  const incomeExpenseData = [
    { name: "הכנסות", value: totalIncome, color: "#4CAF50" },
    { name: "הוצאות", value: totalExpenses, color: "#f44336" },
  ];

  // Separate profit/loss data
  const profitLossData = [
    { 
      name: profit >= 0 ? "רווח" : "הפסד", 
      value: Math.abs(profit), 
      color: profit >= 0 ? "#2196F3" : "#ff9800",
      isProfit: profit >= 0
    }
  ];

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

    const { basePrice, childDiscount, bulkThreshold, bulkPrice, bulkMaxGuests, reservePrice, reserveThreshold, reserveMaxGuests } = weddingData.mealPricing;

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

  // Calculate meal cost for manual input
  const calculateManualMealCost = () => {
    if (!weddingData.mealPricing) return { totalCost: 0, costPerPerson: 0 };

    const { basePrice, childDiscount, childAgeLimit, bulkThreshold, bulkPrice, bulkMaxGuests, reservePrice, reserveThreshold, reserveMaxGuests } = weddingData.mealPricing;
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
        📊 ניהול תקציב האירוע
      </h1>

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gap: '20px', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        marginBottom: '30px'
      }}>
        <div style={{ 
          background: '#e8f5e8', 
          padding: '20px', 
          borderRadius: '8px',
          border: '2px solid #4caf50',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>תקציב כולל</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32' }}>
            {budget.toLocaleString()} ₪
          </div>
        </div>

        <div style={{ 
          background: '#fff3e0', 
          padding: '20px', 
          borderRadius: '8px',
          border: '2px solid #ff9800',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#e65100' }}>הכנסות צפויות</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e65100' }}>
            {totalIncome.toLocaleString()} ₪
          </div>
        </div>

        <div style={{ 
          background: '#ffebee', 
          padding: '20px', 
          borderRadius: '8px',
          border: '2px solid #f44336',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#c62828' }}>הוצאות בפועל</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c62828' }}>
            {totalExpenses.toLocaleString()} ₪
          </div>
        </div>

        <div style={{ 
          background: profit >= 0 ? '#e3f2fd' : '#fff3e0', 
          padding: '20px', 
          borderRadius: '8px',
          border: `2px solid ${profit >= 0 ? '#2196F3' : '#ff9800'}`,
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: profit >= 0 ? '#1976d2' : '#e65100' }}>
            {profit >= 0 ? 'רווח' : 'הפסד'}
          </h3>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: profit >= 0 ? '#1976d2' : '#e65100' 
          }}>
            {profit.toLocaleString()} ₪
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
            {profitMargin.toFixed(1)}% מההכנסות
          </div>
        </div>
      </div>

      {/* Income vs Expenses Chart */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #ddd'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>📈 הכנסות מול הוצאות</h2>
        
        {/* Main Income vs Expenses */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={incomeExpenseData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 14, fill: '#333' }}
              axisLine={{ stroke: '#ddd' }}
              tickLine={{ stroke: '#ddd' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#666' }}
              axisLine={{ stroke: '#ddd' }}
              tickLine={{ stroke: '#ddd' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip 
              formatter={(value: number) => [`₪${value.toLocaleString()}`, '']}
              labelStyle={{ color: '#333' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #ddd',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}
            />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]}
              barSize={80}
            >
              {incomeExpenseData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Profit/Loss Summary */}
        <div style={{ 
          marginTop: '20px',
          padding: '20px',
          background: profit >= 0 ? '#e8f5e8' : '#fff3e0',
          borderRadius: '8px',
          border: `2px solid ${profit >= 0 ? '#4caf50' : '#ff9800'}`
        }}>
          <h3 style={{ 
            margin: '0 0 15px 0', 
            color: profit >= 0 ? '#2e7d32' : '#e65100',
            textAlign: 'center'
          }}>
            {profit >= 0 ? '📈 רווח' : '📉 הפסד'}
          </h3>
          <div style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            textAlign: 'center',
            color: profit >= 0 ? '#2e7d32' : '#e65100'
          }}>
            {profit >= 0 ? '+' : '-'}₪{Math.abs(profit).toLocaleString()}
          </div>
          <div style={{ 
            fontSize: '16px', 
            textAlign: 'center',
            color: '#666',
            marginTop: '8px'
          }}>
            {profitMargin.toFixed(1)}% מההכנסות
          </div>
        </div>
        
        {/* Chart Summary */}
        <div style={{ 
          display: 'grid', 
          gap: '15px', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          marginTop: '20px',
          padding: '15px',
          background: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>הכנסות צפויות</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4CAF50' }}>
              {totalIncome.toLocaleString()} ₪
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>הוצאות בפועל</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f44336' }}>
              {totalExpenses.toLocaleString()} ₪
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
              {profit >= 0 ? 'רווח' : 'הפסד'}
            </div>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: profit >= 0 ? '#2196F3' : '#ff9800' 
            }}>
              {profit >= 0 ? '+' : '-'}₪{Math.abs(profit).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Budget Tracking Line Chart */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #ddd'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>📊 מעקב תקציב לאורך זמן</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={budgetTrackingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value: number) => `₪${value.toLocaleString()}`} />
            <Legend />
            <Line type="monotone" dataKey="budget" stroke="#4CAF50" name="תקציב מתוכנן" />
            <Line type="monotone" dataKey="actual" stroke="#f44336" name="הוצאות בפועל" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Meal Pricing by Guest Status */}
      <div style={{ 
        background: '#e3f2fd', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid #2196F3'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#1976d2' }}>🍽️ מחירי מנות לפי סטטוס מוזמנים</h2>
        
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
            {calculateMealCostByStatus().confirmed?.totalCost && (
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
            {calculateMealCostByStatus().maybe?.totalCost && (
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
            {calculateMealCostByStatus().pending?.totalCost && (
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
            {calculateMealCostByStatus().total?.totalCost && (
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
      </div>

      {/* Real Calculation Results - Based on Confirmed Guests */}
      <div style={{ 
        background: '#e8f5e8', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid #4caf50'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#2e7d32' }}>📊 תוצאות חישוב אמיתיות - לפי מאשרי הגעה</h2>
        
        {calculateMealCostByStatus().confirmed?.totalCost ? (
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}>
            <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>מספר מאשרי הגעה</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>
                  {guestCounts.confirmed}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>מחיר מנה בסיסי</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                  {weddingData.mealPricing?.basePrice || 0} ₪
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>עלות ממוצעת לאיש</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                  {(calculateMealCostByStatus().confirmed?.costPerPerson ?? 0).toFixed(0)} ₪
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>סה"כ עלות מנות</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32' }}>
                  {calculateMealCostByStatus().confirmed?.totalCost?.toLocaleString?.() ?? 0} ₪
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
            אין מאשרי הגעה או הגדרות מחירי מנות
          </div>
        )}
      </div>

      {/* Manual Calculation - Custom Estimation */}
      <div style={{ 
        background: '#fff3e0', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid #ff9800'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#e65100' }}>🧮 חישוב ידני - אומדן מותאם אישית</h2>
        
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #ddd',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>הכנס מספרי אורחים לבדיקה</h3>
          
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
            <h3 style={{ margin: '0 0 15px 0', color: '#2e7d32' }}>תוצאות החישוב</h3>
            
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
            {(() => {
              const mealCost = calculateManualMealCost();
              return mealCost && mealCost.totalGuests && mealCost.totalGuests > 0 ? (
                <div style={{ marginTop: '15px', padding: '15px', background: 'white', borderRadius: '4px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
                    פירוט החישוב:
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
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
            הכנס מספרי אורחים כדי לראות את החישוב
          </div>
        )}
      </div>

      {/* Expense Distribution Pie Chart */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #ddd'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>🥧 התפלגות הוצאות לפי נושאים</h2>
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
              {expensePieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `₪${value.toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Vendors Table */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #ddd'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>📋 רשימת ספקים והוצאות</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
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
                  <td style={{ border: '1px solid #ddd', padding: '12px' }}>{type}</td>
                  <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: status === 'Confirmed' ? '#4caf50' : 
                                     status === 'Pending' ? '#ff9800' : '#9e9e9e',
                      color: 'white',
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
