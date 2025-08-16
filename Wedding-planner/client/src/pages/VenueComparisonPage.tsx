import React, { useState, useEffect, useRef } from 'react';

type Venue = {
  id: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  notes: string;
  whatWeLiked: string;
  whatWeDidntLike: string;
  lightingAndSound: string;
  extras: string;
  basePrice: number;
  childDiscount: number;
  childAgeLimit: number;
  bulkThreshold: number;
  bulkPrice: number;
  bulkMaxGuests: number;
  reservePrice: number;
  reserveThreshold: number;
  reserveMaxGuests: number;
  lightingAndSoundPrice: number;
  extrasPrice: number;
  pricingDates: string;
  pricingDays: string;
  totalPrice: number;
  costPerPerson: number;
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

export default function VenueComparisonPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [weddingData, setWeddingData] = useState<{ mealPricing?: MealPricing }>({});
  const [guestCount, setGuestCount] = useState(100);
  const [adultGuests, setAdultGuests] = useState(80);
  const [childGuests, setChildGuests] = useState(20);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [userId, setUserId] = useState<string>('');
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Get current user info for personalized storage
        const currentUserRaw = localStorage.getItem("currentUser");
        let currentUserId = 'default';
        if (currentUserRaw) {
          const currentUser = JSON.parse(currentUserRaw);
          currentUserId = currentUser._id || currentUser.id || 'default';
          setUserId(currentUserId);
        }

        // Fetch wedding data for meal pricing settings
        const weddingRes = await fetch("/api/weddings/owner", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (weddingRes.ok) {
          const wedding = await weddingRes.json();
          setWeddingData(wedding);
        }

        // Load saved venues from localStorage with user-specific key
        const storageKey = `venueComparisons_${currentUserId}`;
        const savedVenues = localStorage.getItem(storageKey);
        if (savedVenues) {
          try {
            const parsedVenues = JSON.parse(savedVenues);
            setVenues(parsedVenues);
          } catch (parseError) {
            console.error("Error parsing saved venues:", parseError);
            // If parsing fails, try the old key as fallback
            const oldSavedVenues = localStorage.getItem('venueComparisons');
            if (oldSavedVenues) {
              try {
                const parsedOldVenues = JSON.parse(oldSavedVenues);
                setVenues(parsedOldVenues);
              } catch (oldParseError) {
                console.error("Error parsing old saved venues:", oldParseError);
              }
            }
          }
        }

        // Load guest counts
        const savedGuestCounts = localStorage.getItem(`${storageKey}_guestCounts`);
        if (savedGuestCounts) {
          try {
            const { guestCount: savedGuestCount, adultGuests: savedAdultGuests, childGuests: savedChildGuests } = JSON.parse(savedGuestCounts);
            setGuestCount(savedGuestCount || 100);
            setAdultGuests(savedAdultGuests || 80);
            setChildGuests(savedChildGuests || 20);
          } catch (error) {
            console.error("Error loading saved guest counts:", error);
          }
        }
        
        // Check if there are saved venues and show success message
        if (savedVenues) {
          try {
            const parsedVenues = JSON.parse(savedVenues);
            if (parsedVenues.length > 0) {
              setSaveStatus('saved');
              setTimeout(() => {
                setSaveStatus('idle');
              }, 3000);
            }
          } catch (error) {
            console.error("Error checking saved venues:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        isInitialLoadRef.current = false;
      }
    }

    fetchData();
  }, []); // Remove userId dependency

  // Save venues to localStorage whenever they change
  useEffect(() => {
    if (userId && venues.length > 0 && !isInitialLoadRef.current) {
      const storageKey = `venueComparisons_${userId}`;
      try {
        localStorage.setItem(storageKey, JSON.stringify(venues));
        // Also save guest counts
        localStorage.setItem(`${storageKey}_guestCounts`, JSON.stringify({
          guestCount,
          adultGuests,
          childGuests
        }));
        
        // Show auto-save feedback briefly
        if (saveStatus === 'idle') {
          setSaveStatus('saved');
          // Clear any existing timeout
          if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
          }
          autoSaveTimeoutRef.current = setTimeout(() => {
            setSaveStatus('idle');
          }, 1500);
        }
      } catch (error) {
        console.error("Error saving venues:", error);
        setSaveStatus('error');
      }
    }
  }, [venues, userId, guestCount, adultGuests, childGuests]); // Remove saveStatus dependency

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Manual save function
  const handleSave = async () => {
    if (!userId) {
      setSaveStatus('error');
      return;
    }

    setSaveStatus('saving');
    
    try {
      const storageKey = `venueComparisons_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(venues));
      localStorage.setItem(`${storageKey}_guestCounts`, JSON.stringify({
        guestCount,
        adultGuests,
        childGuests
      }));
      
      setSaveStatus('saved');
      
      // Reset save status after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error("Error saving venues:", error);
      setSaveStatus('error');
      
      // Reset error status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  };

  // Calculate meal cost for a venue
  const calculateMealCost = (venue: Venue, guestCount: number, adultCount: number, childCount: number) => {
    const { basePrice = 0, childDiscount = 0, reservePrice = 0, reserveThreshold = 100, lightingAndSoundPrice = 0, extrasPrice = 0 } = venue;
    
    let totalCost = 0;

    // Calculate meal costs based on guest count
    if (guestCount <= reserveThreshold) {
      // Use base price for all guests up to reserve threshold
      totalCost = guestCount * basePrice;
    } else {
      // Use base price for guests up to reserve threshold, then reserve price for additional guests
      totalCost = (reserveThreshold * basePrice) + ((guestCount - reserveThreshold) * reservePrice);
    }

    // Apply child discount
    const childCost = childCount * (basePrice * (1 - childDiscount / 100));
    totalCost += childCost;

    // Add lighting and sound price (one-time cost)
    totalCost += lightingAndSoundPrice;

    // Add extras price (one-time cost)
    totalCost += extrasPrice;

    const costPerPerson = guestCount > 0 ? totalCost / guestCount : 0;
    
    return { totalCost, costPerPerson };
  };

  const addVenue = () => {
    const newVenue: Venue = {
      id: `venue-${Date.now()}`,
      name: '',
      address: '',
      phone: '',
      website: '',
      notes: '',
      whatWeLiked: '',
      whatWeDidntLike: '',
      lightingAndSound: '',
      extras: '',
      basePrice: 0,
      childDiscount: 0,
      childAgeLimit: 12,
      bulkThreshold: 50,
      bulkPrice: 0,
      bulkMaxGuests: 100,
      reservePrice: 0,
      reserveThreshold: 100,
      reserveMaxGuests: 200,
      lightingAndSoundPrice: 0,
      extrasPrice: 0,
      pricingDates: '',
      pricingDays: '',
      totalPrice: 0,
      costPerPerson: 0
    };
    setVenues(prev => [...prev, newVenue]);
  };

  const updateVenue = (id: string, updates: Partial<Venue>) => {
    setVenues(prev => prev.map(venue => {
      if (venue.id === id) {
        const updated = { ...venue, ...updates };
        // Recalculate costs
        const { totalCost, costPerPerson } = calculateMealCost(updated, guestCount, adultGuests, childGuests);
        return { ...updated, totalPrice: totalCost, costPerPerson };
      }
      return venue;
    }));
  };

  const removeVenue = (id: string) => {
    setVenues(prev => prev.filter(venue => venue.id !== id));
  };

  const updateGuestCounts = (total: number, adults: number, children: number) => {
    setGuestCount(total);
    setAdultGuests(adults);
    setChildGuests(children);
    
    // Recalculate all venues
    setVenues(prev => prev.map(venue => {
      if (venue) {
        const { totalCost, costPerPerson } = calculateMealCost(venue, total, adults, children);
        return { ...venue, totalPrice: totalCost, costPerPerson };
      }
      return venue;
    }));
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
        🏰 השוואת מחירי אולמות וגני אירועים
      </h1>

      {/* Guest Count Settings */}
      <div style={{ 
        background: '#f1f8e9', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid #a5d6a7'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#33691e' }}>👥 הגדרת מספר אורחים לחישוב</h2>
        
        <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              סה"כ אורחים
            </label>
            <input
              type="number"
              min="0"
              value={guestCount}
              onChange={(e) => {
                const total = Number(e.target.value);
                const adults = Math.min(adultGuests, total);
                const children = total - adults;
                updateGuestCounts(total, adults, children);
              }}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              מבוגרים
            </label>
            <input
              type="number"
              min="0"
              max={guestCount}
              value={adultGuests}
              onChange={(e) => {
                const adults = Number(e.target.value);
                const children = guestCount - adults;
                updateGuestCounts(guestCount, adults, children);
              }}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              ילדים (עד גיל 12)
            </label>
            <input
              type="number"
              min="0"
              max={guestCount}
              value={childGuests}
              onChange={(e) => {
                const children = Number(e.target.value);
                const adults = guestCount - children;
                updateGuestCounts(guestCount, adults, children);
              }}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
        </div>
      </div>

             {/* Add Venue Button and Save Status */}
       <div style={{ textAlign: 'center', marginBottom: '30px' }}>
         <button
           onClick={addVenue}
           style={{
             background: '#4caf50',
             color: 'white',
             border: 'none',
             padding: '12px 24px',
             borderRadius: '6px',
             fontSize: '16px',
             cursor: 'pointer',
             fontWeight: 'bold',
             marginBottom: '15px'
           }}
         >
           ➕ הוסף אולם/גן אירועים להשוואה
         </button>
         
         {/* Auto-save status */}
         <div style={{ 
           fontSize: '14px', 
           color: saveStatus === 'saved' ? '#4caf50' : '#666', 
           marginBottom: '15px',
           padding: '8px 16px',
           background: saveStatus === 'saved' ? '#e8f5e8' : '#f5f5f5',
           borderRadius: '4px',
           display: 'inline-block',
           transition: 'all 0.3s ease'
         }}>
           {saveStatus === 'saved' ? '✅ נשמר אוטומטית!' : '💾 שמירה אוטומטית פעילה - השינויים נשמרים אוטומטית'}
         </div>
         
         {/* Manual Save Button */}
         {userId && venues.length > 0 && (
           <div>
             <button
               onClick={handleSave}
               style={{
                 background: saveStatus === 'saving' ? '#4caf50' : saveStatus === 'saved' ? '#66bb6a' : '#2196F3',
                 color: 'white',
                 border: 'none',
                 padding: '10px 20px',
                 borderRadius: '6px',
                 fontSize: '14px',
                 cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
                 fontWeight: 'bold',
                 opacity: saveStatus === 'saving' ? 0.7 : 1,
                 transition: 'all 0.3s ease'
               }}
               disabled={saveStatus === 'saving'}
             >
               {saveStatus === 'saving' ? '🔄 שומר...' : saveStatus === 'saved' ? '✅ נשמר!' : '💾 שמור '}
             </button>
             {saveStatus === 'error' && (
               <div style={{ color: '#f44336', marginTop: '8px', fontSize: '12px' }}>
                 ❌ שמירת השינויים נכשלה. אנא נסה שוב.
               </div>
             )}
           </div>
         )}
       </div>

      {/* Venues Comparison */}
      <div style={{ display: 'grid', gap: '30px' }}>
        {venues.map((venue, index) => (
          <div key={venue.id} style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '8px',
          
            border: '1px solid #ddd'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#333' }}>אולם/גן אירועים #{index + 1}</h3>
              <button
                onClick={() => removeVenue(venue.id)}
                style={{
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                🗑️ הסר
              </button>
            </div>

            {/* Basic Information */}
            <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  שם האולם/גן אירועים *
                </label>
                <input
                  type="text"
                  value={venue.name}
                  onChange={(e) => updateVenue(venue.id, { name: e.target.value })}
                  placeholder="שם האולם"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  כתובת
                </label>
                <input
                  type="text"
                  value={venue.address}
                  onChange={(e) => updateVenue(venue.id, { address: e.target.value })}
                  placeholder="כתובת האולם"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  טלפון
                </label>
                <input
                  type="tel"
                  value={venue.phone}
                  onChange={(e) => updateVenue(venue.id, { phone: e.target.value })}
                  placeholder="מספר טלפון"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  לינק לאתר
                </label>
                <input
                  type="url"
                  value={venue.website}
                  onChange={(e) => updateVenue(venue.id, { website: e.target.value })}
                  placeholder="https://example.com"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>

            {/* Meal Pricing */}
            <div style={{ 
              background: '#fffef7', 
              padding: '20px', 
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #fff59d'
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#f9a825' }}>🍽️ מחירי מנות</h4>
              
              {/* Pricing Explanation */}
              <div style={{ 
                background: '#f2ebe2', 
                padding: '12px', 
                borderRadius: '6px',
                marginBottom: '15px',
                border: '1px solid #ffcc80',
                fontSize: '14px',
                color: '#e65100'
              }}>
                <strong>💡 איך עובד מחיר הרזרבה:</strong><br/>
                • עד <strong>סף מחיר רזרבה</strong> - כל אורח משלם <strong>מחיר מנה בסיסי</strong><br/>
                • מעל <strong>סף מחיר רזרבה</strong> - אורחים נוספים משלמים <strong>מחיר רזרבה</strong> (בדרך כלל נמוך יותר)
              </div>
              
              <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                    מחיר מנה בסיסי (₪)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={venue.basePrice}
                    onChange={(e) => updateVenue(venue.id, { basePrice: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                    הנחת ילדים (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={venue.childDiscount}
                    onChange={(e) => updateVenue(venue.id, { childDiscount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                    סף מחיר רזרבה (אורחים)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={venue.reserveThreshold}
                    onChange={(e) => updateVenue(venue.id, { reserveThreshold: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                    מחיר רזרבה (₪)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={venue.reservePrice}
                    onChange={(e) => updateVenue(venue.id, { reservePrice: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                    מחיר תאורה והגברה (₪)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={venue.lightingAndSoundPrice}
                    onChange={(e) => updateVenue(venue.id, { lightingAndSoundPrice: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                    מחיר תוספות (₪)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={venue.extrasPrice}
                    onChange={(e) => updateVenue(venue.id, { extrasPrice: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>

              {/* Pricing Dates and Days */}
              <div style={{ 
                marginTop: '15px',
                padding: '15px',
                background: '#f8f9fa',
                borderRadius: '6px',
                border: '1px solid #e9ecef'
              }}>
                <h5 style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '14px' }}>📅 תאריכים וימים למחיר</h5>
                <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333', fontSize: '12px' }}>
                      תאריכים למחיר
                    </label>
                    <input
                      type="text"
                      value={venue.pricingDates}
                      onChange={(e) => updateVenue(venue.id, { pricingDates: e.target.value })}
                      placeholder="למשל: יוני-אוגוסט 2024"
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333', fontSize: '12px' }}>
                      ימים למחיר
                    </label>
                    <input
                      type="text"
                      value={venue.pricingDays}
                      onChange={(e) => updateVenue(venue.id, { pricingDays: e.target.value })}
                      placeholder="למשל: ראשון-חמישי"
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}
                    />
                  </div>
                </div>
              </div>

               {/* Cost Summary */}
               <div style={{ 
                 marginTop: '15px',
                 padding: '15px',
                 background: 'white',
                 borderRadius: '6px',
                 border: '1px solid #eee'
               }}>
                 <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                   <div style={{ textAlign: 'center' }}>
                     <div style={{ fontSize: '12px', color: '#666' }}>סה"כ עלות מנות</div>
                     <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#A8D5BA' }}>
                       {((venue.totalPrice || 0) - (venue.lightingAndSoundPrice || 0) - (venue.extrasPrice || 0)).toLocaleString()} ₪
                     </div>
                   </div>
                   <div style={{ textAlign: 'center' }}>
                     <div style={{ fontSize: '12px', color: '#666' }}>תאורה והגברה</div>
                     <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#FFB74D' }}>
                       {(venue.lightingAndSoundPrice || 0).toLocaleString()} ₪
                     </div>
                   </div>
                   <div style={{ textAlign: 'center' }}>
                     <div style={{ fontSize: '12px', color: '#666' }}>תוספות</div>
                     <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#FF8A65' }}>
                       {(venue.extrasPrice || 0).toLocaleString()} ₪
                     </div>
                   </div>
                   <div style={{ textAlign: 'center' }}>
                     <div style={{ fontSize: '12px', color: '#666' }}>סה"כ עלות כוללת</div>
                     <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4CAF50' }}>
                       {(venue.totalPrice || 0).toLocaleString()} ₪
                     </div>
                   </div>
                   <div style={{ textAlign: 'center' }}>
                     <div style={{ fontSize: '12px', color: '#666' }}>עלות לאיש</div>
                     <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#D4A574' }}>
                       {(venue.costPerPerson || 0).toFixed(0)} ₪
                     </div>
                   </div>
                 </div>
               </div>
            </div>

            {/* Additional Services */}
            <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  תאורה והגברה
                </label>
                <textarea
                  value={venue.lightingAndSound}
                  onChange={(e) => updateVenue(venue.id, { lightingAndSound: e.target.value })}
                  placeholder="פרטים על תאורה והגברה"
                  rows={3}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  תוספות
                </label>
                <textarea
                  value={venue.extras}
                  onChange={(e) => updateVenue(venue.id, { extras: e.target.value })}
                  placeholder="תוספות ושירותים נוספים"
                  rows={3}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Opinions */}
            <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  מה אהבנו
                </label>
                <textarea
                  value={venue.whatWeLiked}
                  onChange={(e) => updateVenue(venue.id, { whatWeLiked: e.target.value })}
                  placeholder="מה אהבנו באולם/גן"
                  rows={3}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  מה לא אהבנו
                </label>
                <textarea
                  value={venue.whatWeDidntLike}
                  onChange={(e) => updateVenue(venue.id, { whatWeDidntLike: e.target.value })}
                  placeholder="מה לא אהבנו באולם/גן"
                  rows={3}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                הערות
              </label>
              <textarea
                value={venue.notes}
                onChange={(e) => updateVenue(venue.id, { notes: e.target.value })}
                placeholder="הערות נוספות"
                rows={3}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Summary */}
      {venues.length > 1 && (
        <div style={{ 
          background: '#e1f5fe', 
          padding: '20px', 
          borderRadius: '8px',
          marginTop: '30px',
          border: '1px solid #81d4fa'
        }}>
          <h2 style={{ margin: '0 0 20px 0', color: '#0277bd' }}>📊 סיכום השוואה</h2>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right' }}>שם האולם</th>
                  <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right' }}>מחיר מנה בסיסי</th>
                  <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right' }}>תאורה והגברה</th>
                  <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right' }}>תוספות</th>
                  <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right' }}>סה"כ עלות</th>
                  <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right' }}>עלות לאיש</th>
                  <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right' }}>תאריכים</th>
                  <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right' }}>טלפון</th>
                  <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right' }}>אתר</th>
                </tr>
              </thead>
              <tbody>
                {venues
                  .filter(venue => venue.name.trim())
                  .sort((a, b) => a.totalPrice - b.totalPrice)
                  .map((venue, index) => (
                    <tr key={venue.id} style={{ backgroundColor: index === 0 ? '#e8f5e8' : 'white' }}>
                      <td style={{ border: '1px solid #ddd', padding: '12px', fontWeight: 'bold' }}>
                        {venue.name}
                        {index === 0 && <span style={{ color: '#4caf50', marginRight: '8px' }}>🥇</span>}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                        {(venue.basePrice || 0).toLocaleString()} ₪
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                        {(venue.lightingAndSoundPrice || 0).toLocaleString()} ₪
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                        {(venue.extrasPrice || 0).toLocaleString()} ₪
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '12px', fontWeight: 'bold' }}>
                        {(venue.totalPrice || 0).toLocaleString()} ₪
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                        {(venue.costPerPerson || 0).toFixed(0)} ₪
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '12px', fontSize: '12px' }}>
                        <div>{venue.pricingDates || '-'}</div>
                        <div style={{ color: '#666' }}>{venue.pricingDays || '-'}</div>
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                        {venue.phone || '-'}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                        {venue.website ? (
                          <a href={venue.website} target="_blank" rel="noopener noreferrer" style={{ color: '#2196F3' }}>
                            קישור
                          </a>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {venues.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '50px', 
          color: '#666',
          background: '#f9f9f9',
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>אין אולמות להשוואה</div>
          <div>לחץ על "הוסף אולם/גן אירועים להשוואה" כדי להתחיל</div>
        </div>
      )}

      
    </div>
  );
} 