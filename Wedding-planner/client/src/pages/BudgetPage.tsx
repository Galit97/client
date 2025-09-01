import React, { useState, useEffect } from "react";
import BudgetMaster from "../lib/budgetMaster";
import { apiUrl } from "../utils/api";
import { Budget_24 } from "../components/Icons/WeddingIconsLibrary";

// מערכת תקציב מתקדמת
import {
  calcBudget,
  committedOnly,
  formatILS,
  formatNumber,
} from '../lib/budgetTypes';
import type { BudgetSettings, Supplier } from '../lib/budgetTypes';

// Using the new Budget_24 icon from the icon library

type Vendor = {
  _id: string;
  vendorName: string;
  price: number;
  type: string;
  status: string;
  depositAmount?: number;
  depositPaid?: boolean;
};

type VendorType = 'music' | 'food' | 'photography' | 'decor' | 'clothes' | 'makeup_hair' | 'internet_orders' | 'lighting_sound' | 'guest_gifts' | 'venue_deposit' | 'bride_dress' | 'groom_suit' | 'shoes' | 'jewelry' | 'rsvp' | 'design_tables' | 'bride_bouquet' | 'chuppah' | 'flowers' | 'other';

// Function to convert vendor type to Hebrew display name
function getTypeText(type: VendorType | string) {
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
  guestsMin?: number;
  guestsMax?: number;
  guestsExact?: number;
  giftAvg?: number;
  savePercent?: number;
  budgetMode?: string;
};

const BudgetPage: React.FC = () => {
  const [budget, setBudget] = useState<BudgetSettings | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [weddingData, setWeddingData] = useState<WeddingData>({ budget: 0 });
  
  // Add state for manual calculation
  const [manualCalculation, setManualCalculation] = useState({
    adultGuests: 0,
    childGuests: 0
  });

  // Add state for budget edit popup
  const [showBudgetEdit, setShowBudgetEdit] = useState(false);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Fetch wedding data
              const weddingRes = await fetch(apiUrl("/api/weddings/owner"), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (weddingRes.ok) {
        const wedding = await weddingRes.json();
        setWeddingData(wedding);
      
      }

      // Fetch budget data from the new API
  
      try {
      
        const budgetRes = await fetch(apiUrl("/api/budgets/owner"), { 
          headers: { Authorization: `Bearer ${token}` } 
        });
       
        
        if (budgetRes.ok) {
          const budgetData = await budgetRes.json();
         
          // Check if this is an empty budget (no totalBudget or totalBudget is 0)
          if (!budgetData.totalBudget || budgetData.totalBudget === 0) {
       
            setBudget(null);
          } else {
          
            // Convert budget data to BudgetSettings format
            const budgetSettings: BudgetSettings = {
              guestsMin: budgetData.guestsMin || 50,
              guestsMax: budgetData.guestsMax || 150,
              guestsExact: budgetData.guestsExact,
              giftAvg: budgetData.giftAvg || 500,
              savePercent: budgetData.savePercent || 10,
              mode: (budgetData.budgetMode as any) || 'ניצמד',
              personalPocket: budgetData.personalPocket
            };
            setBudget(budgetSettings);
          }
          
          // Update weddingData with budget information
          setWeddingData(prev => ({
            ...prev,
            budget: budgetData.totalBudget || 0,
            guestsMin: budgetData.guestsMin,
            guestsMax: budgetData.guestsMax,
            guestsExact: budgetData.guestsExact,
            giftAvg: budgetData.giftAvg,
            savePercent: budgetData.savePercent,
            budgetMode: budgetData.budgetMode,
            personalPocket: budgetData.personalPocket
          }));
        
        } else {
      
          setBudget(null);
        }
      } catch (error) {
      
        setBudget(null);
      }

      // Fetch vendors and convert to suppliers format
              const vendorsRes = await fetch(apiUrl("/api/vendors"), {
        headers: { Authorization: `Bearer ${token}` }
      });
              if (vendorsRes.ok) {
          const vendorsData = await vendorsRes.json();
  
        
        // Translate vendor types to Hebrew
        const translateVendorType = (type: string): string => {
          const translations: { [key: string]: string } = {
            'photographer': 'צלם',
            'videographer': 'צלם וידאו',
            'catering': 'קייטרינג',
            'venue': 'אולם/גן אירועים',
            'music': 'מוזיקה',
            'decorations': 'קישוטים',
            'transportation': 'הסעות',
            'makeup': 'איפור',
            'dress': 'שמלה',
            'suit': 'חליפה',
            'rings': 'טבעות',
            'flowers': 'פרחים',
            'cake': 'עוגה',
            'invitations': 'הזמנות',
            'wedding_planner': 'מפיק אירועים',
            'photography': 'צילום',
            'video': 'וידאו',
            'caterer': 'קייטרינג',
            'dj': 'די.ג\'יי',
            'band': 'להקה',
            'decorator': 'מעצב',
            'driver': 'נהג',
            'makeup_artist': 'מאפרת',
            'designer': 'מעצב',
            'jeweler': 'צורף',
            'florist': 'פרחים',
            'baker': 'אופה',
            'stationery': 'הזמנות'
          };
          return translations[type.toLowerCase()] || type;
        };

        const suppliersData: Supplier[] = vendorsData.map((vendor: Vendor) => {
       
          return {
            id: vendor._id,
            name: vendor.vendorName,
            category: translateVendorType(vendor.type),
            status: vendor.status === 'Confirmed' ? 'התחייב' : 
                   vendor.status === 'Pending' ? 'הצעה' : 'פתוח',
            finalAmount: vendor.price || 0,
            deposit: vendor.depositAmount || 0
          };
        });
        setSuppliers(suppliersData);
    
        
        // Log total deposits
        // const totalDeposits = suppliersData.reduce((sum, supplier) => sum + (supplier.deposit || 0), 0);
    
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      
      // Trigger dashboard refresh after data is loaded
      if ((window as any).notifyDashboardUpdate) {
        (window as any).notifyDashboardUpdate('budget-data-loaded');
      } else if ((window as any).triggerDashboardRefresh) {
        (window as any).triggerDashboardRefresh('budget-data-loaded');
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add interval to refresh data every 30 seconds to catch deposit updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Refresh data when page becomes visible (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleEditBudget = () => {
    // Open budget edit popup
    setShowBudgetEdit(true);
  };

  const handleCloseBudgetEdit = () => {
    setShowBudgetEdit(false);
    // Refresh data after closing popup with a delay to ensure data is saved
    setTimeout(() => {
      fetchData();
      
      // Trigger dashboard refresh
      if ((window as any).notifyDashboardUpdate) {
        (window as any).notifyDashboardUpdate('budget-updated');
      } else if ((window as any).triggerDashboardRefresh) {
        (window as any).triggerDashboardRefresh('budget-updated');
      }
    }, 2000); // Increased delay to ensure data is fully saved
  };



  const handleGoToSuppliers = () => {
    // Navigate to suppliers - you can replace this with your routing logic
    window.location.href = '/vendors';
  };

  // Calculate meal + vendors cost for manual input
  const calculateManualMealCost = () => {
    if (!weddingData.mealPricing) {
      const { adultGuests, childGuests } = manualCalculation;
      const totalGuests = adultGuests + childGuests;
      const eventTotalCost = 0; // only vendors if no meal pricing
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
    
    // Add vendors cost to total
    const vendorsTotalCost = suppliers
      .filter(s => s.status === 'התחייב')
      .reduce((sum, supplier) => sum + (supplier.finalAmount || 0), 0);
    
    const eventTotalCost = totalCost + vendorsTotalCost;
    const eventCostPerPerson = totalGuests > 0 ? eventTotalCost / totalGuests : 0;
    


    return { totalCost, costPerPerson, adultGuests, childGuests, totalGuests, eventTotalCost, eventCostPerPerson };
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>טוען נתוני תקציב...</div>
      </div>
    );
  }

  // ראש עמוד: כותרת + כפתור עריכה
  const Header = (
    <header
      className="section-header budget"
      style={{ 
        padding: '20px', 
        background: '#f8fafc', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}
    >
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1 className="section-title" style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#1d5a78' }}>
            תקציב
          </h1>
          <p className="section-sub" style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
            רק ספקים בסטטוס 'התחייב' נכנסים לחישוב.
          </p>
        </div>
        <button
          className="btn ghost"
          onClick={handleEditBudget}
          aria-label="עריכת התקציב"
          style={{
            padding: '10px 20px',
            background: 'transparent',
            border: '2px solid #1d5a78',
            borderRadius: '6px',
            color: '#1d5a78',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#1d5a78';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#1d5a78';
          }}
        >
          עריכת התקציב
        </button>
      </div>
    </header>
  );

  // מצב ללא הגדרות תקציב כלל
  if (!budget) {
    return (
      <div className="stack" style={{ padding: '20px' }}>
        {Header}
        <section className="card" style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <p className="section-sub" style={{ color: '#6b7280', fontSize: '16px', marginBottom: '20px' }}>
            עדיין אין הגדרות תקציב.
          </p>
          <button 
            className="btn primary" 
            onClick={handleEditBudget}
            style={{
              padding: '12px 24px',
              background: '#1d5a78',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#164e63';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1d5a78';
            }}
          >
            התחלה מהירה
          </button>
        </section>
      </div>
    );
  }

  // Calculate meal costs based on expected guests
  const calculateMealCosts = (guestCount: number) => {
    if (!weddingData.mealPricing || !guestCount) return 0;
    
    const { basePrice, childDiscount } = weddingData.mealPricing;
    // Assume 20% are children for calculation
    const childGuests = Math.round(guestCount * 0.2);
    const adultGuests = guestCount - childGuests;
    
    const adultCost = adultGuests * basePrice;
    const childCost = childGuests * (basePrice * (1 - childDiscount / 100));
    
    return adultCost + childCost;
  };

  // Get expected guest count from budget settings


  // חישוב תמצית התקציב (יעדים) ונתוני התחייבויות
  const summary = calcBudget(budget, suppliers);
  const committed = committedOnly(suppliers);
  
  // Calculate meal costs for different scenarios
  const minGuests = budget?.guestsMin || 50;
  const maxGuests = budget?.guestsMax || 150;
  const likelyGuests = budget?.guestsExact || budget?.guestsMax || 150;
  

  
  const minMealCosts = calculateMealCosts(minGuests);
  const maxMealCosts = calculateMealCosts(maxGuests);
  const likelyMealCosts = calculateMealCosts(likelyGuests);
  
  // Calculate budget targets based on guests and gift average
  const giftAvg = budget?.giftAvg || 400;
  const personalBudget = budget?.mode === 'כיס אישי' ? 50000 : 0; // Add personal budget if flexible mode
  
  const targetMin = (minGuests * giftAvg) + personalBudget;
  const targetMax = (maxGuests * giftAvg) + personalBudget;
  const targetLikely = Math.round((targetMin + targetMax) / 2); // ממוצע בין יעד מינימום ליעד מקסימום
  
  // Override summary with calculated budget targets
  const actualSummary = {
    ...summary,
    targetLikely: targetLikely,
    targetMin: targetMin,
    targetMax: targetMax
  };

  
  // Calculate deposits manually to verify
  const manualDeposits = suppliers.filter(s => s.status === 'התחייב').reduce((sum, s) => sum + (s.deposit || 0), 0);
  
  // Calculate total expected costs (suppliers + meals)
  const totalExpectedCosts = actualSummary.committedTotal + likelyMealCosts;

  return (
    <div className="stack" style={{ padding: '20px' }}>
      {Header}

      {/* Budget Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '25px'
      }}>
        {/* Budget Target Card */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '25px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: '#e8f5e8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '20px', color: '#22c55e' }}>₪</span>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>
              יעד התקציב
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1d5a78' }}>
              {formatILS(actualSummary?.targetLikely || 0)}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
              טווח: {formatILS(actualSummary?.targetMin || 0)}-{formatILS(actualSummary?.targetMax || 0)}
            </div>
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
              ({minGuests}-{maxGuests} אורחים)
            </div>
          </div>
        </div>

                 {/* Currently Expected - Vendors Only Card */}
         <div style={{
           background: 'white',
           borderRadius: '12px',
           padding: '25px',
           boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
           display: 'flex',
           alignItems: 'center',
           gap: '15px'
         }}>
           <div style={{
             width: '50px',
             height: '50px',
             borderRadius: '50%',
             background: '#e0f2fe',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center'
           }}>
             <span style={{ fontSize: '20px', color: '#0284c7' }}>₪</span>
           </div>
           <div>
             <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>
               צפוי כרגע - ספקים
             </div>
             <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1d5a78' }}>
               {formatILS(actualSummary.committedTotal)}
             </div>
             <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
               התחייבויות ספקים
             </div>
             <div style={{ fontSize: '10px', color: '#059669', marginTop: '2px' }}>
               מקדמות: {formatILS(manualDeposits)}
             </div>
           </div>
         </div>

         {/* Currently Expected - Total Costs Card */}
         <div style={{
           background: 'white',
           borderRadius: '12px',
           padding: '25px',
           boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
           display: 'flex',
           alignItems: 'center',
           gap: '15px'
         }}>
           <div style={{
             width: '50px',
             height: '50px',
             borderRadius: '50%',
             background: '#f0f9ff',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center'
           }}>
             <span style={{ fontSize: '20px', color: '#0369a1' }}>₪</span>
           </div>
           <div>
             <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>
               צפוי כרגע - סה"כ
             </div>
             <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1d5a78' }}>
               {formatILS(totalExpectedCosts)}
             </div>
             <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
               ספקים + מנות
             </div>
             <div style={{ fontSize: '10px', color: '#059669', marginTop: '2px' }}>
               מקדמות: {formatILS(manualDeposits)}
             </div>
           </div>
         </div>

        {/* Currently Expected - Meals Card */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '25px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: '#fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Budget_24 style={{ width: '20px', height: '20px', color: '#d97706' }} />
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>
              צפוי כרגע - מנות
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1d5a78' }}>
              {formatILS(likelyMealCosts)}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
              טווח: {formatILS(minMealCosts)}-{formatILS(maxMealCosts)}
            </div>
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
              ({minGuests}-{maxGuests} אורחים)
            </div>
          </div>
        </div>

        {/* Percentage of Target Card */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '25px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: '#fdf2f8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '20px', color: '#ec4899' }}>%</span>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>
              אחוז מתוך היעד
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1d5a78' }}>
                              {actualSummary?.targetLikely ? Math.round((totalExpectedCosts / actualSummary.targetLikely) * 100) : 0}%
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
              {actualSummary?.status || 'לא זמין'}
            </div>
          </div>
        </div>
      </div>

      {/* Approved Suppliers Section */}
      {(() => {
        const approvedSuppliers = suppliers.filter(s => s.status === 'התחייב');
        
        if (approvedSuppliers.length === 0) return null;
        
        return (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '25px',
            marginBottom: '25px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              color: '#1d5a78',
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              פירוט קטגוריות
            </h3>
            
            <div style={{
              display: 'grid',
              gap: '15px'
            }}>
              {approvedSuppliers.map((supplier) => (
                <div key={supplier.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1d5a78' }}>
                      {supplier.name}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '2px' }}>
                      {getTypeText(supplier.category)}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'left', minWidth: '120px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1d5a78' }}>
                      {formatILS(supplier.finalAmount || 0)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                      מקדמה: {formatILS(supplier.deposit || 0)} יתרה: {formatILS((supplier.finalAmount || 0) - (supplier.deposit || 0))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Payment Progress Circle */}
      {summary && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '25px',
          marginBottom: '25px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{
            margin: '0 0 20px 0',
            color: '#1d5a78',
            fontSize: '20px',
            fontWeight: 'bold',
            textAlign: 'right'
          }}>
            התקדמות תשלומים
          </h3>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <div style={{
              position: 'relative',
              width: '150px',
              height: '150px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {/* Progress Circle Background */}
              <svg
                width="150"
                height="150"
                viewBox="0 0 150 150"
                style={{ position: 'absolute' }}
              >
                {/* Background Circle */}
                <circle
                  cx="75"
                  cy="75"
                  r="65"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                />
                {/* Progress Circle */}
                <circle
                  cx="75"
                  cy="75"
                  r="65"
                  fill="none"
                  stroke="#1d5a78"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 65}`}
                  strokeDashoffset={`${2 * Math.PI * 65 * (1 - Math.min((totalExpectedCosts / actualSummary.targetLikely), 1))}`}
                  transform="rotate(-90 75 75)"
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
              
              {/* Center Content */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#1d5a78',
                  lineHeight: 1
                }}>
                  {actualSummary.targetLikely > 0 ? Math.round((totalExpectedCosts / actualSummary.targetLikely) * 100) : 0}%
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  marginTop: '5px'
                }}>
                  מהיעד
                </div>
              </div>
            </div>
          </div>
          
          <div style={{
            fontSize: '16px',
            color: '#374151',
            fontWeight: '500'
          }}>
            {formatILS(totalExpectedCosts)} מתוך {formatILS(actualSummary.targetLikely)}
          </div>
          
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            marginTop: '8px'
          }}>
                        {totalExpectedCosts > actualSummary.targetLikely ?
              `עברת את היעד ב-${formatILS(totalExpectedCosts - actualSummary.targetLikely)}` :
              `נותר ${formatILS(actualSummary.targetLikely - totalExpectedCosts)} ליעד`
            }
          </div>
        </div>
      )}

      {/* תמצית יעד */}
      <section className="card stack" aria-labelledby="budget-targets" style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <div className="row" style={{ alignItems: 'center', gap: 12, marginBottom: '20px' }}>
          <Budget_24 style={{ width: '22px', height: '22px', color: '#1d5a78' }} />
          <strong id="budget-targets" style={{ fontSize: '18px', color: '#1d5a78' }}>סיכום תקציב</strong>
        </div>

        <div className="grid cols-3" role="list" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div className="card" role="listitem" aria-label="יעד מינימום" style={{ 
            background: '#f8fafc', 
            padding: '20px', 
            borderRadius: '6px',
            textAlign: 'center'
          }}>
            <div className="label" style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>יעד מינימום</div>
            <div style={{ fontWeight: 600, fontSize: '18px', color: '#1d5a78' }}>{formatILS(actualSummary.targetMin)}</div>
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
              ({minGuests} אורחים)
            </div>
          </div>
          <div className="card" role="listitem" aria-label="יעד סביר" style={{ 
            background: '#e0f2fe', 
            padding: '20px', 
            borderRadius: '6px',
            textAlign: 'center',
            border: '2px solid #1d5a78'
          }}>
            <div className="label" style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>יעד סביר</div>
            <div style={{ fontWeight: 700, fontSize: '20px', color: '#1d5a78' }}>{formatILS(actualSummary.targetLikely)}</div>
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
              ({likelyGuests} אורחים)
            </div>
          </div>
          <div className="card" role="listitem" aria-label="יעד מקסימום" style={{ 
            background: '#f8fafc', 
            padding: '20px', 
            borderRadius: '6px',
            textAlign: 'center'
          }}>
            <div className="label" style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>יעד מקסימום</div>
            <div style={{ fontWeight: 600, fontSize: '18px', color: '#1d5a78' }}>{formatILS(actualSummary.targetMax)}</div>
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
              ({maxGuests} אורחים)
            </div>
          </div>
        </div>

        <div className="row" style={{ 
          display: 'flex', 
          justifyContent: 'center',
          gap: '20px',
          color: '#6b7280',
          fontSize: '14px'
        }}>
          <span>אורחים לחישוב: {formatNumber(likelyGuests)}</span>
          <span aria-hidden="true">•</span>
          <span>סה״כ מתנות צפוי: {formatILS(actualSummary.giftTotalLikely)} + מנות: {formatILS(likelyMealCosts)} (טווח: {formatILS(minMealCosts)}-{formatILS(maxMealCosts)})</span>
        </div>
      </section>

      {/* התחייבויות בפועל */}
      <section className="card stack" aria-labelledby="budget-commits" style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <strong id="budget-commits" style={{ fontSize: '18px', color: '#1d5a78' }}>
            התחייבויות בפועל
          </strong>
          <div style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
            הנתונים מתעדכנים אוטומטית כל 30 שניות
          </div>
        </div>

        {committed.length === 0 ? (
          <div className="stack" style={{ gap: 8, textAlign: 'center', padding: '20px' }}>
            <div className="label" style={{ color: '#6b7280', fontSize: '16px', marginBottom: '10px' }}>
              עדיין אין התחייבויות בתקציב.
            </div>
            <p className="section-sub" style={{ margin: '0 0 20px 0', color: '#6b7280', fontSize: '14px' }}>
              רק ספקים בסטטוס 'התחייב' יכנסו לחישוב.
            </p>
            <div>
              <button 
                className="btn secondary" 
                onClick={handleGoToSuppliers}
                style={{
                  padding: '10px 20px',
                  background: '#6b7280',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#4b5563';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#6b7280';
                }}
              >
                הוספת ספק ראשון
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid cols-3" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '15px',
              marginBottom: '20px'
            }}>
                             <div className="card" style={{ 
                 background: '#f8fafc', 
                 padding: '20px', 
                 borderRadius: '6px',
                 textAlign: 'center'
               }}>
                 <div className="label" style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>סה״כ התחייבויות</div>
                 <div style={{ fontWeight: 600, fontSize: '18px', color: '#1d5a78' }}>{formatILS(totalExpectedCosts)}</div>
                 <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
                   ספקים: {formatILS(actualSummary.committedTotal)} + מנות: {formatILS(likelyMealCosts)}
                 </div>
               </div>
              <div className="card" style={{ 
                background: '#f8fafc', 
                padding: '20px', 
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                <div className="label" style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>שולם (מקדמות)</div>
                <div style={{ fontWeight: 600, fontSize: '18px', color: '#059669' }}>
                  {formatILS(manualDeposits)}
                </div>
              </div>
              <div className="card" style={{ 
                background: '#f8fafc', 
                padding: '20px', 
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                <div className="label" style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>יתרה לתשלום</div>
                <div style={{ fontWeight: 600, fontSize: '18px', color: '#dc2626' }}>{formatILS(totalExpectedCosts - manualDeposits)}</div>
              </div>
            </div>

            {/* אינדיקטור פער מול יעד סביר */}
            <div
              className="row"
              aria-live="polite"
                             style={{ 
                 display: 'flex', 
                 alignItems: 'center', 
                 justifyContent: 'center',
                 gap: '10px', 
                 color: '#6b7280',
                 fontSize: '14px',
                 padding: '15px',
                 background: '#f9fafb',
                 borderRadius: '6px'
               }}
            >
              <span>סטטוס מול יעד:</span>
              <strong
                style={{
                  color:
                                    actualSummary.status === 'מעל היעד'
                  ? '#dc2626'
                  : actualSummary.status === 'מתחת ליעד'
                  ? '#059669'
                  : '#1d5a78',
                }}
              >
                {actualSummary.status}
              </strong>
              <span aria-hidden="true">•</span>
              <span>
                פער מול יעד סביר:{' '}
                {actualSummary.varianceToLikely >= 0
                  ? `+${formatILS(actualSummary.varianceToLikely)}`
                  : formatILS(actualSummary.varianceToLikely)}
              </span>
            </div>
          </>
        )}
      </section>

      {/* Manual Calculation - Custom Estimation */}
      <section style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
                 <h3 style={{ margin: '0 0 20px 0', color: '#1d5a78' }}>חישוב ידני - אומדן מותאם אישית</h3>
        
        <div style={{ 
          background: '#f8fafc', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
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
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '4px',
                  border: '1px solid #d1d5db'
                }}
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
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '4px',
                  border: '1px solid #d1d5db'
                }}
              />
            </div>
          </div>
        </div>

        {/* Manual Calculation Results */}
        {manualCalculation.adultGuests > 0 || manualCalculation.childGuests > 0 ? (
          <div style={{ 
            background: '#eff6ff', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #bfdbfe'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#1d5a78' }}>תוצאות החישוב</h3>
            
            <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>סה"כ אורחים</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1d5a78' }}>
                  {calculateManualMealCost().totalGuests}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>מבוגרים</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1d5a78' }}>
                  {calculateManualMealCost().adultGuests}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>ילדים</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1d5a78' }}>
                  {calculateManualMealCost().childGuests}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>עלות ממוצעת למנה</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1d5a78' }}>
                  {calculateManualMealCost().costPerPerson.toFixed(0)} ₪
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>סה"כ עלות מנות</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
                  {calculateManualMealCost().totalCost.toLocaleString()} ₪
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>עלות ספקים מאושרים</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
                  {suppliers.filter(s => s.status === 'התחייב').reduce((sum, s) => sum + (s.finalAmount || 0), 0).toLocaleString()} ₪
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                  (מקדמות: {suppliers.filter(s => s.status === 'התחייב').reduce((sum, s) => sum + (s.deposit || 0), 0).toLocaleString()} ₪)
                </div>
                <div style={{ fontSize: '10px', color: '#059669', marginTop: '2px' }}>
                  + מנות: {calculateManualMealCost().totalCost.toLocaleString()} ₪
                </div>
                <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
                  טווח: {calculateMealCosts(minGuests).toLocaleString()}-{calculateMealCosts(maxGuests).toLocaleString()} ₪
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>סה"כ עלות האירוע</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1d5a78' }}>
                  {calculateManualMealCost().eventTotalCost.toLocaleString()} ₪
                </div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            {(() => {
              const mealCost = calculateManualMealCost();
              return mealCost && mealCost.totalGuests && mealCost.totalGuests > 0 ? (
                <div style={{ marginTop: '15px', padding: '15px', background: 'white', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', color: '#1d5a78' }}>
                    פירוט החישוב:
                  </div>
                  <div style={{ fontSize: '12px', lineHeight: '1.4', color: '#6b7280' }}>
                    <div>• מבוגרים: {mealCost.adultGuests || 0} × {weddingData.mealPricing?.basePrice || 0} ₪ = {((mealCost.adultGuests || 0) * (weddingData.mealPricing?.basePrice || 0)).toLocaleString()} ₪</div>
                    <div>• ילדים: {mealCost.childGuests || 0} × {((weddingData.mealPricing?.basePrice || 0) * (1 - (weddingData.mealPricing?.childDiscount || 0) / 100)).toFixed(0)} ₪ = {((mealCost.childGuests || 0) * ((weddingData.mealPricing?.basePrice || 0) * (1 - (weddingData.mealPricing?.childDiscount || 0) / 100))).toLocaleString()} ₪</div>
                    {weddingData.mealPricing && (mealCost.totalGuests || 0) >= (weddingData.mealPricing?.bulkThreshold || 0) && (weddingData.mealPricing?.bulkPrice || 0) > 0 && (
                      <div style={{ color: '#059669', fontWeight: 'bold' }}>
                        ✓ מחיר התחייבות מיושם (מעל {weddingData.mealPricing?.bulkThreshold || 0} אורחים)
                      </div>
                    )}
                    {weddingData.mealPricing && (mealCost.totalGuests || 0) >= (weddingData.mealPricing?.reserveThreshold || 0) && (weddingData.mealPricing?.reservePrice || 0) > 0 && (
                      <div style={{ color: '#059669', fontWeight: 'bold' }}>
                        ✓ מחיר רזרבה מיושם (מעל {weddingData.mealPricing?.reserveThreshold || 0} אורחים)
                      </div>
                    )}
                    <div style={{ marginTop: '8px', fontWeight: 'bold' }}>• סה"כ עלות מנות: {(mealCost.totalCost).toLocaleString()} ₪</div>
                    <div>• עלות לאיש: {(((mealCost.totalCost) / (mealCost.totalGuests || 1)) || 0).toFixed(0)} ₪</div>
                    
                    {/* Vendors Breakdown */}
                    {suppliers.filter(s => s.status === 'התחייב').length > 0 && (
                      <>
                        <div style={{ marginTop: '15px', padding: '10px', background: '#fef2f2', borderRadius: '4px', border: '1px solid #fecaca' }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#dc2626' }}>ספקים מאושרים:</div>
                          {suppliers.filter(s => s.status === 'התחייב').map((supplier) => (
                            <div key={supplier.id} style={{ fontSize: '12px', marginBottom: '4px' }}>
                              • {supplier.name} ({supplier.category}): {(supplier.finalAmount || 0).toLocaleString()} ₪
                              {(supplier.deposit || 0) > 0 && (
                                <span style={{ color: '#059669', marginRight: '8px' }}>
                                  (מקדמה: {(supplier.deposit || 0).toLocaleString()} ₪)
                                </span>
                              )}
                            </div>
                          ))}
                          <div style={{ fontWeight: 'bold', marginTop: '8px', color: '#dc2626' }}>
                            סה"כ ספקים: {suppliers.filter(s => s.status === 'התחייב').reduce((sum, s) => sum + (s.finalAmount || 0), 0).toLocaleString()} ₪
                          </div>
                          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                            (מקדמות: {suppliers.filter(s => s.status === 'התחייב').reduce((sum, s) => sum + (s.deposit || 0), 0).toLocaleString()} ₪)
                          </div>
                        </div>
                        <div style={{ marginTop: '8px', fontWeight: 'bold', color: '#1d5a78' }}>
                          • סה"כ עלות האירוע: {(mealCost.eventTotalCost).toLocaleString()} ₪
                        </div>
                        <div style={{ fontWeight: 'bold', color: '#1d5a78' }}>
                          • עלות כוללת לאיש: {(((mealCost.eventTotalCost) / (mealCost.totalGuests || 1)) || 0).toFixed(0)} ₪
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#6b7280', fontStyle: 'italic' }}>
            הכנס מספרי אורחים כדי לראות את החישוב
          </div>
        )}
      </section>

 
       

      {/* Budget Edit Popup */}
      {showBudgetEdit && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '95%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '0'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h2 style={{ margin: 0, color: '#1d5a78', fontSize: '24px', fontWeight: 'bold' }}>
                עריכת הגדרות תקציב
              </h2>
              <button
                onClick={() => setShowBudgetEdit(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ padding: '24px' }}>
                              <BudgetMaster onClose={handleCloseBudgetEdit} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetPage;

