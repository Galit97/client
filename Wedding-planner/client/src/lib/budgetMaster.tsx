"use client";

import { useState, useEffect } from "react";
import { useNotification } from "../components/Notification/NotificationContext";

interface BudgetMasterProps {
  onClose?: () => void;
}

export default function BudgetMaster({ onClose }: BudgetMasterProps) {
  console.log("BudgetMaster component loaded");
  const { showNotification } = useNotification();
  const [guestsMin, setGuestsMin] = useState(50);
  const [guestsMax, setGuestsMax] = useState(150);
  const [guestsExact, setGuestsExact] = useState<number | undefined>(undefined);
  const [gift, setGift] = useState(200);
  const [target, setTarget] = useState("balanced");
  const [personalBudget, setPersonalBudget] = useState(50000);
  const [loading, setLoading] = useState(false);

  // Load existing budget data on component mount
  useEffect(() => {
    const loadExistingBudget = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found");
          return;
        }

        console.log("Loading existing budget data...");
        const response = await fetch("/api/budgets/owner", {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Load response status:", response.status);

        if (response.ok) {
          const budget = await response.json();
          console.log("Loaded budget data:", budget);
          
          // Map existing data to component state
          if (budget.guestsMin) {
            console.log("Setting guestsMin:", budget.guestsMin);
            setGuestsMin(budget.guestsMin);
          }
          if (budget.guestsMax) {
            console.log("Setting guestsMax:", budget.guestsMax);
            setGuestsMax(budget.guestsMax);
          }
          if (budget.guestsExact) {
            console.log("Setting guestsExact:", budget.guestsExact);
            setGuestsExact(budget.guestsExact);
          }
          if (budget.giftAvg) {
            console.log("Setting giftAvg:", budget.giftAvg);
            setGift(budget.giftAvg);
          }
          if (budget.budgetMode) {
            console.log("Setting budgetMode:", budget.budgetMode);
            // Map budget mode to component values
            const modeMap: { [key: string]: string } = {
              'ניצמד': 'balanced',
              'כיס אישי': 'flexible',
              'נרוויח': 'tight'
            };
            const mappedMode = modeMap[budget.budgetMode] || 'balanced';
            console.log("Mapped budget mode:", budget.budgetMode, "->", mappedMode);
            setTarget(mappedMode);
          }
          if (budget.personalPocket) {
            console.log("Setting personalPocket:", budget.personalPocket);
            setPersonalBudget(budget.personalPocket);
          }
        } else {
          const errorText = await response.text();
          console.error("Failed to load budget data:", response.status, response.statusText, errorText);
        }
      } catch (error) {
        console.error("Error loading budget data:", error);
      }
    };

    loadExistingBudget();
  }, []);

  // Update slider backgrounds when values change
  useEffect(() => {
    // Update guests slider background
    const guestsSlider = document.querySelector('input[type="range"][min="100"][max="600"]') as HTMLInputElement;
    if (guestsSlider) {
      const percentage = (guestsMax - 100) / (600 - 100) * 100;
      guestsSlider.style.background = `linear-gradient(to right, #1d5a78 0%, #1d5a78 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`;
    }

    // Update gift slider background
    const giftSlider = document.querySelector('input[type="range"][min="100"][max="600"]:nth-of-type(2)') as HTMLInputElement;
    if (giftSlider) {
      const percentage = (gift - 100) / (600 - 100) * 100;
      giftSlider.style.background = `linear-gradient(to right, #1d5a78 0%, #1d5a78 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`;
    }

    // Update personal budget slider background
    const personalBudgetSlider = document.querySelector('input[type="range"][min="10000"][max="200000"]') as HTMLInputElement;
    if (personalBudgetSlider) {
      const percentage = (personalBudget - 10000) / (200000 - 10000) * 100;
      personalBudgetSlider.style.background = `linear-gradient(to right, #1d5a78 0%, #1d5a78 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`;
    }
  }, [guestsMax, gift, personalBudget]);

  // Update slider backgrounds after component mounts
  useEffect(() => {
    const updateSliderBackgrounds = () => {
      setTimeout(() => {
        // Update guests slider background
        const guestsSlider = document.querySelector('input[type="range"][min="100"][max="600"]') as HTMLInputElement;
        if (guestsSlider) {
          const percentage = (guestsMax - 100) / (600 - 100) * 100;
          guestsSlider.style.background = `linear-gradient(to right, #1d5a78 0%, #1d5a78 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`;
        }

        // Update gift slider background
        const giftSlider = document.querySelector('input[type="range"][min="100"][max="600"]:nth-of-type(2)') as HTMLInputElement;
        if (giftSlider) {
          const percentage = (gift - 100) / (600 - 100) * 100;
          giftSlider.style.background = `linear-gradient(to right, #1d5a78 0%, #1d5a78 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`;
        }

        // Update personal budget slider background
        const personalBudgetSlider = document.querySelector('input[type="range"][min="10000"][max="200000"]') as HTMLInputElement;
        if (personalBudgetSlider) {
          const percentage = (personalBudget - 10000) / (200000 - 10000) * 100;
          personalBudgetSlider.style.background = `linear-gradient(to right, #1d5a78 0%, #1d5a78 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`;
        }
      }, 100);
    };

    updateSliderBackgrounds();
  }, []);

  const handleSaveBudget = async () => {
    console.log("Save button clicked!");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showNotification("אין הרשאת גישה", "error");
        return;
      }

      console.log("Token found:", token.substring(0, 20) + "...");

      // Map component values to API format
      const modeMap: { [key: string]: string } = {
        'balanced': 'ניצמד',
        'flexible': 'כיס אישי',
        'tight': 'נרוויח'
      };

      // Calculate budget based on guests and gift
      const exactGuests = guestsExact || guestsMax;
      let calculatedBudget = exactGuests * gift;
      
      // If personal budget is selected, add it to the calculated budget
      if (target === 'flexible') {
        calculatedBudget += personalBudget;
      }
      
      console.log("Current state values:", {
        guestsMin,
        guestsMax,
        guestsExact,
        gift,
        target,
        personalBudget,
        exactGuests,
        calculatedBudget
      });
      
      // Try with minimal data first
      const budgetData: any = {
        guestsMin: Number(guestsMin),
        guestsMax: Number(guestsMax),
        giftAvg: Number(gift),
        budget: Number(calculatedBudget),
        guestCountExpected: Number(exactGuests)
      };

      // Add optional fields only if they have values
      if (guestsExact) {
        budgetData.guestsExact = Number(guestsExact);
      }
      if (modeMap[target]) {
        budgetData.budgetMode = modeMap[target];
      }
      if (target === 'flexible' || target === 'tight') {
        budgetData.savePercent = target === 'flexible' ? 15 : 10;
      }

      console.log("Saving budget data:", budgetData);
      console.log("Calculated budget:", calculatedBudget, "for", exactGuests, "guests at", gift, "per guest");
      if (target === 'flexible') {
        console.log("Personal budget added:", personalBudget);
      }
      console.log("Request body:", JSON.stringify(budgetData, null, 2));

             // Get wedding ID for the budget
       const getWeddingResponse = await fetch("/api/weddings/owner", {
         headers: { Authorization: `Bearer ${token}` }
       });

       if (!getWeddingResponse.ok) {
         console.error("Failed to get wedding data:", getWeddingResponse.status);
         showNotification("שגיאה בקבלת נתוני החתונה", "error");
         return;
       }

       const weddingData = await getWeddingResponse.json();
       console.log("Current wedding data:", weddingData);

       // Prepare budget data for the API
       const budgetApiData = {
         weddingID: weddingData._id,
         guestsMin: Number(guestsMin),
         guestsMax: Number(guestsMax),
         guestsExact: guestsExact ? Number(guestsExact) : undefined,
         giftAvg: Number(gift),
         savePercent: target === 'flexible' ? 15 : target === 'tight' ? 10 : undefined,
         budgetMode: modeMap[target],
         personalPocket: target === 'flexible' ? Number(personalBudget) : undefined
       };

       console.log("Saving budget data to API:", budgetApiData);

       // Save budget settings using the dedicated budget API
       const response = await fetch("/api/budgets/settings", {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify(budgetApiData),
       });

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        let responseData;
        try {
          responseData = await response.json();
        } catch (e) {
          responseData = { message: "Success but no JSON response" };
        }
        
                 console.log("Budget saved successfully! Response:", responseData);
         console.log("Saved budget data:", responseData.budget);
        
                 // Verify the data was saved by fetching it from the budget API
         setTimeout(async () => {
           try {
             const verifyResponse = await fetch("/api/budgets/owner", {
               headers: { Authorization: `Bearer ${token}` }
             });
             if (verifyResponse.ok) {
               const savedData = await verifyResponse.json();
               console.log("Verification - saved budget data:", {
                 guestsMin: savedData.guestsMin,
                 guestsMax: savedData.guestsMax,
                 guestsExact: savedData.guestsExact,
                 giftAvg: savedData.giftAvg,
                 totalBudget: savedData.totalBudget,
                 budgetMode: savedData.budgetMode,
                 personalPocket: savedData.personalPocket
               });
             }
           } catch (error: any) {
             console.error("Error verifying saved data:", error);
           }
         }, 500);
        
                 let alertMessage = `התקציב נשמר בהצלחה!\n\nתקציב חדש: ₪${responseData.calculatedBudget?.toLocaleString() || calculatedBudget.toLocaleString()}\nמספר אורחים: ${responseData.exactGuests || exactGuests}\nמתנה ממוצעת: ₪${gift}`;
         if (target === 'flexible') {
           alertMessage += `\nכיס אישי: ₪${personalBudget.toLocaleString()}`;
         }
         showNotification(alertMessage, "success");
        
        // Always close popup and refresh
        if (onClose) {
          console.log("Closing popup and refreshing...");
          onClose();
          setTimeout(() => {
            console.log("Reloading page...");
            window.location.reload();
          }, 1000);
        }
      } else {
        let errorText;
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = "Could not read error response";
        }
        console.error("Failed to save budget:", response.status, response.statusText, errorText);
        console.error("Error details:", {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });
        showNotification(`שגיאה בשמירת התקציב: ${response.status} ${response.statusText}\n\nנסה שוב או פנה לתמיכה.`, "error");
      }
    } catch (error) {
      console.error("Error saving budget:", error);
      const errorObj = error as Error;
      console.error("Error details:", {
        name: errorObj.name,
        message: errorObj.message,
        stack: errorObj.stack
      });
      showNotification(`שגיאה בשמירת התקציב: ${errorObj.message || 'שגיאה לא ידועה'}\n\nנסה שוב או פנה לתמיכה.`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '24px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      direction: 'rtl'
    }}>
      {/* מספר מוזמנים */}
      <section style={{ marginBottom: '32px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1d5a78', margin: 0 }}>אורחים</h2>
        </div>

        <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#374151' }}>
          מספר מוזמנים (טווח ראשוני)
        </label>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <input
            type="number"
            value={guestsMin}
            onChange={(e) => setGuestsMin(+e.target.value)}
            placeholder="מינימום"
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          <input
            type="number"
            value={guestsMax}
            onChange={(e) => setGuestsMax(+e.target.value)}
            placeholder="מקסימום"
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>

        {/* Slider for guests max */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="range"
            min="100"
            max="600"
            step="50"
            value={guestsMax}
            onChange={(e) => {
              const value = +e.target.value;
              setGuestsMax(value);
            }}
            onInput={(e) => {
              const target = e.target as HTMLInputElement;
              const value = +target.value;
              const percentage = (value - 100) / (600 - 100) * 100;
              target.style.background = `linear-gradient(to right, #1d5a78 0%, #1d5a78 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`;
            }}
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '4px',
              background: `linear-gradient(to right, #1d5a78 0%, #1d5a78 ${(guestsMax - 100) / (600 - 100) * 100}%, #e5e7eb ${(guestsMax - 100) / (600 - 100) * 100}%, #e5e7eb 100%)`,
              outline: 'none',
              cursor: 'pointer',
              WebkitAppearance: 'none',
              appearance: 'none'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
            <span>100</span>
            <span style={{ fontWeight: 'bold', color: '#1d5a78' }}>{guestsMax}</span>
            <span>600</span>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
          טווח התחלתי. בהמשך נעדכן מספר מדויק.
        </p>

        <div style={{ marginTop: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#374151' }}>
            מספר מוזמנים מדויק (אופציונלי)
          </label>
          <input
            type="number"
            value={guestsExact || ''}
            onChange={(e) => setGuestsExact(e.target.value ? +e.target.value : undefined)}
            placeholder="אופציונלי - מספר מדויק"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            אפשר לדלג ולחזור לזה לקראת אישורי הגעה.
          </p>
        </div>
      </section>

      {/* מתנה צפויה */}
      <section style={{ marginBottom: '32px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1d5a78', margin: 0 }}>מתנה צפויה</h2>
        </div>

        <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#374151' }}>
          מתנה ממוצעת לאורח (₪)
        </label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {[200, 300, 400].map((val) => (
            <button
              key={val}
              onClick={() => setGift(val)}
              style={{
                padding: '8px 16px',
                border: gift === val ? '2px solid #1d5a78' : '1px solid #d1d5db',
                borderRadius: '6px',
                background: gift === val ? '#1d5a78' : 'white',
                color: gift === val ? 'white' : '#374151',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: gift === val ? 'bold' : 'normal'
              }}
            >
              ₪{val}
            </button>
          ))}
        </div>

        <input
          type="number"
          value={gift}
          onChange={(e) => setGift(+e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '16px'
          }}
        />

        {/* Slider for gift */}
        <div style={{ marginBottom: '8px' }}>
          <input
            type="range"
            min="100"
            max="600"
            step="50"
            value={gift}
            onChange={(e) => {
              const value = +e.target.value;
              setGift(value);
            }}
            onInput={(e) => {
              const target = e.target as HTMLInputElement;
              const value = +target.value;
              const percentage = (value - 100) / (600 - 100) * 100;
              target.style.background = `linear-gradient(to right, #1d5a78 0%, #1d5a78 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`;
            }}
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '4px',
              background: `linear-gradient(to right, #1d5a78 0%, #1d5a78 ${(gift - 100) / (600 - 100) * 100}%, #e5e7eb ${(gift - 100) / (600 - 100) * 100}%, #e5e7eb 100%)`,
              outline: 'none',
              cursor: 'pointer',
              WebkitAppearance: 'none',
              appearance: 'none'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
            <span>₪100</span>
            <span style={{ fontWeight: 'bold', color: '#1d5a78' }}>₪{gift}</span>
            <span>₪600</span>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: '#6b7280' }}>
          זה רק עוגן לתכנון – תמיד תוכלו לשנות.
        </p>
      </section>

      {/* יעד */}
      <section style={{ marginBottom: '32px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1d5a78', margin: 0 }}>יעד</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
            <input
              type="radio"
              value="balanced"
              checked={target === "balanced"}
              onChange={(e) => setTarget(e.target.value)}
              style={{ margin: 0 }}
            />
            <label style={{ fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
         ניצמד - מתכננים סביב יעד מוגדר.
            </label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
            <input
              type="radio"
              value="flexible"
              checked={target === "flexible"}
              onChange={(e) => setTarget(e.target.value)}
              style={{ margin: 0 }}
            />
            <label style={{ fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
             כיס אישי - 
             מוסיפים סכום שישלים את הצורך.
            </label>
          </div>
          {target === "flexible" && (
            <div style={{ marginTop: '8px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#374151' }}>
                סכום כיס אישי (₪)
              </label>
              <input
                type="number"
                value={personalBudget}
                onChange={(e) => setPersonalBudget(+e.target.value)}
                placeholder="הזן סכום"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <div style={{ marginTop: '8px' }}>
                <input
                  type="range"
                  min="10000"
                  max="200000"
                  step="5000"
                  value={personalBudget}
                  onChange={(e) => {
                    const value = +e.target.value;
                    setPersonalBudget(value);
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    const value = +target.value;
                    const percentage = (value - 10000) / (200000 - 10000) * 100;
                    target.style.background = `linear-gradient(to right, #1d5a78 0%, #1d5a78 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`;
                  }}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    background: `linear-gradient(to right, #1d5a78 0%, #1d5a78 ${(personalBudget - 10000) / (200000 - 10000) * 100}%, #e5e7eb ${(personalBudget - 10000) / (200000 - 10000) * 100}%, #e5e7eb 100%)`,
                    outline: 'none',
                    cursor: 'pointer',
                    WebkitAppearance: 'none',
                    appearance: 'none'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                  <span>₪10,000</span>
                  <span style={{ fontWeight: 'bold', color: '#1d5a78' }}>₪{personalBudget.toLocaleString()}</span>
                  <span>₪200,000</span>
                </div>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
            <input
              type="radio"
              value="tight"
              checked={target === "tight"}
              onChange={(e) => setTarget(e.target.value)}
              style={{ margin: 0 }}
            />
            <label style={{ fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
             נרוויח - 
             מגדירים יעד נמוך כדי להישאר ביתרה.
            </label>
          </div>
        </div>
      </section>

      {/* כפתורים */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
        <button
          onClick={handleSaveBudget}
          disabled={loading}
          style={{
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            background: loading ? '#9ca3af' : '#1d5a78',
            color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'שומר...' : 'שמירה וצפייה בתקציב'}
        </button>
      </div>
    </div>
  );
} 