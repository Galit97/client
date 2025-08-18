import { useState, useEffect } from 'react';

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

// Removed unused MealPricing type

export default function VenueComparisonPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  // Removed unused weddingData state
  const [weddingId, setWeddingId] = useState<string>('');
  const [guestCount, setGuestCount] = useState(100);
  const [adultGuests, setAdultGuests] = useState(80);
  const [childGuests, setChildGuests] = useState(20);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [noWeddingFound, setNoWeddingFound] = useState(false);
  // Removed auto-save refs

  useEffect(() => {
    async function init() {
      const token = localStorage.getItem('token');
      if (!token) { setLoading(false); return; }
      try {
        // Try to get wedding as owner first
        let weddingId = '';
        let wed = await fetch('/api/weddings/owner', { headers: { Authorization: `Bearer ${token}` } });
        
        if (wed.ok) {
          const w = await wed.json();
          weddingId = w._id;
        } else {
          // If not owner, try as participant
          const participantWed = await fetch('/api/weddings/by-participant', { headers: { Authorization: `Bearer ${token}` } });
          if (participantWed.ok) {
            const participantWeddings = await participantWed.json();
            if (participantWeddings.length > 0) {
              weddingId = participantWeddings[0]._id; // Use the first wedding they're participating in
            }
          }
        }
        
        if (weddingId) {
          setWeddingId(weddingId);
          
          // Load comparisons from server
          console.log('Loading venue comparisons for wedding:', weddingId);
          const comparisonsRes = await fetch(`/api/comparisons/venue/${weddingId}`, { 
            headers: { Authorization: `Bearer ${token}` } 
          });
          
          console.log('Venue comparisons response status:', comparisonsRes.status);
          if (comparisonsRes.ok) {
            const serverData = await comparisonsRes.json();
            console.log('Loaded venue comparisons:', serverData);
            console.log('Number of venues loaded:', serverData.venues?.length || 0);
            console.log('Guest counts loaded:', serverData.guestCounts);
            
            setVenues(serverData.venues || []);
            setGuestCount(serverData.guestCounts?.guestCount || 100);
            setAdultGuests(serverData.guestCounts?.adultGuests || 80);
            setChildGuests(serverData.guestCounts?.childGuests || 20);
          } else {
            const errorText = await comparisonsRes.text();
            console.log('Failed to load venue comparisons:', errorText);
            console.log('Response status:', comparisonsRes.status);
          }
        } else {
          console.log('No wedding found for user');
          setNoWeddingFound(true);
        }
      } catch (error) {
        console.error("Error loading venue comparisons:", error);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Removed auto-save on change

  // Manual save function
  const handleSave = async () => {
    if (!weddingId) {
      console.error('No wedding ID available for saving');
      setSaveStatus('error');
      return;
    }

    setSaveStatus('saving');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token available for saving');
        setSaveStatus('error');
        return;
      }
      
      const saveData = {
        weddingID: weddingId,
        venues,
        guestCounts: {
          guestCount,
          adultGuests,
          childGuests
        }
      };
      
      console.log('Saving venue data:', saveData);
      console.log('Number of venues to save:', venues.length);
      
      const response = await fetch('/api/comparisons/venue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(saveData),
      });
      
      console.log('Save response status:', response.status);
      console.log('Save response headers:', response.headers);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Save successful:', result);
        setSaveStatus('saved');
      } else {
        const errorText = await response.text();
        console.error('Failed to save venue comparisons:', errorText);
        console.error('Response status:', response.status);
        setSaveStatus('error');
      }
      
      // Reset save status after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error("Error saving venues to server:", error);
      setSaveStatus('error');
      
      // Reset error status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  };

  // Removed debounced auto-save effect

  // Calculate meal cost for a venue
  const calculateMealCost = (venue: Venue, guestCount: number, childCount: number) => {
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
    setVenues(prev => [newVenue, ...prev]);
  };

  const updateVenue = (id: string, updates: Partial<Venue>) => {
    setVenues(prev => prev.map(venue => {
      if (venue.id === id) {
        const updated = { ...venue, ...updates };
        // Recalculate costs
        const { totalCost, costPerPerson } = calculateMealCost(updated, guestCount, childGuests);
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
        const { totalCost, costPerPerson } = calculateMealCost(venue, total, children);
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

  if (noWeddingFound) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '18px', marginBottom: '20px', color: '#666' }}>
          לא נמצא חתונה עבורך
        </div>
        <div style={{ color: '#999' }}>
          עליך להיות בעל חתונה או משתתף בחתונה כדי לגשת להשוואת אולמות
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="text-center mb-xl">
        🏰 השוואת מחירי אולמות וגני אירועים
      </h1>

      {/* Guest Count Settings */}
      <div className="card">
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
        
        {/* Save Guest Counts Button */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={handleSave}
            style={{
              background: saveStatus === 'saving' ? '#ff9800' : saveStatus === 'saved' ? '#4caf50' : saveStatus === 'error' ? '#f44336' : '#2196F3',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? '🔄 שומר...' : saveStatus === 'saved' ? '✅ נשמר!' : saveStatus === 'error' ? '❌ שגיאה' : '💾 שמור הגדרות אורחים'}
          </button>
        </div>
      </div>

      {/* Add Venue Button */}
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
      </div>

      {/* Venues Comparison */}
      <div style={{ display: 'grid', gap: '30px' }}>
                 {venues.map((venue, index) => (
           <div key={venue.id} className="card">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
               <h3 style={{ margin: 0, color: '#333' }}>אולם/גן אירועים #{venues.length - index}</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleSave}
                  style={{
                    background: saveStatus === 'saving' ? '#ff9800' : saveStatus === 'saved' ? '#4caf50' : saveStatus === 'error' ? '#f44336' : '#2196F3',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}
                  disabled={saveStatus === 'saving'}
                >
                  {saveStatus === 'saving' ? '🔄 שומר...' : saveStatus === 'saved' ? '✅ נשמר!' : saveStatus === 'error' ? '❌ שגיאה' : '💾 שמור'}
                </button>
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
              background: '#ffffff', 
              padding: '20px', 
              borderRadius: '8px',
              marginBottom: '20px',
          
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#f9a825' }}>🍽️ מחירי מנות</h4>
              
              {/* Pricing Explanation */}
              <div style={{ 
               
                padding: '12px', 
                borderRadius: '6px',
                marginBottom: '15px',
             
                fontSize: '14px',
                color: '#e65100'
              }}>
                <strong>💡 איך עובד מחיר הרזרבה:</strong><br/>
                • עד <strong>סף מחיר רזרבה</strong> - כל אורח משלם <strong>מחיר מנה בסיסי</strong><br/>
                • מעל <strong>סף מחיר רזרבה</strong> - אורחים נוספים משלמים <strong>מחיר רזרבה</strong> 
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
                    style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
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
              
                borderRadius: '6px',
            
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
               <div className="card">
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
        <div className="card">
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
                  .map((venue, index) => (
                    <tr key={venue.id} style={{ backgroundColor: 'white' }}>
                      <td style={{ border: '1px solid #ddd', padding: '12px', fontWeight: 'bold' }}>
                        {venue.name}
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