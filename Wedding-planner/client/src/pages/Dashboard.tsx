import React, { useState, useEffect } from "react";

type Task = {
  _id: string;
  task: string;
  notes?: string;
  done: boolean;
  dueDate?: string;
  relatedVendorId?: string;
  relatedRoleId?: string;
  createdAt?: string;
  updatedAt?: string;
};

type Vendor = {
  _id: string;
  vendorName: string;
  type: string;
  status: string;
  price: number;
};

type Guest = {
  _id: string;
  firstName: string;
  lastName: string;
  status: 'Invited' | 'Confirmed' | 'Declined' | 'Arrived';
  seatsReserved: number;
  companions?: number;
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
  weddingDate: string;
  budget: number;
  totalGuests: number;
  mealPricing?: MealPricing;
};

type Activity = {
  id: string;
  type: 'guest_added' | 'task_completed' | 'vendor_added' | 'vendor_updated' | 'task_added';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
};

const Dashboard: React.FC = () => {
  const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
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
        }

        // Fetch tasks
        const tasksRes = await fetch("/api/checklists", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(tasksData);
        }

        // Fetch vendors
        const vendorsRes = await fetch("/api/vendors", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (vendorsRes.ok) {
          const vendorsData = await vendorsRes.json();
          setVendors(vendorsData);
        }

        // Fetch guests
        const guestsRes = await fetch("/api/guests", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (guestsRes.ok) {
          const guestsData = await guestsRes.json();
          setGuests(guestsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Countdown timer - only days
  useEffect(() => {
    if (!weddingData?.weddingDate) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const weddingDate = new Date(weddingData.weddingDate).getTime();
      const difference = weddingDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        setTimeLeft({ days, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [weddingData?.weddingDate]);

  // Calculate progress percentages
  const completedTasks = tasks.filter(task => task.done).length;
  const totalTasks = tasks.length;
  
  const confirmedVendors = vendors.filter(vendor => vendor.status === 'Confirmed').length;
  const totalVendors = vendors.length;
  const vendorProgress = totalVendors > 0 ? (confirmedVendors / totalVendors) * 100 : 0;

  // Calculate total guests including all people they're bringing
  const totalReservedPlaces = guests.reduce((sum, guest) => {
    return sum + guest.seatsReserved; // seatsReserved includes the guest + their companions
  }, 0);
  
  const confirmedGuests = guests.reduce((sum, g) => g.status === 'Confirmed' ? sum + (g.seatsReserved || 1) : sum, 0);
  const totalGuests = guests.reduce((sum, g) => sum + (g.seatsReserved || 1), 0);
  const guestProgress = totalGuests > 0 ? (confirmedGuests / totalGuests) * 100 : 0;
  
  // Calculate overall progress including checklist, vendors, guests, and recent registrations
  const totalItems = totalTasks + totalVendors + totalGuests;
  const completedItems = completedTasks + confirmedVendors + confirmedGuests;
  const taskProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  // Upcoming tasks from checklist (not completed)
  const upcomingTasks = tasks
    .filter(task => !task.done)
    .sort((a, b) => {
      // Sort by due date first
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      // Then by creation date
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      
      return 0;
    })
    .slice(0, 5);

  // Recent activities (simulated - in real app this would come from activity log)
  const recentActivities: Activity[] = [
    // These would normally come from a database of activities
    // For now, we'll show some sample activities based on current data
         ...guests.slice(-2).map((guest, index) => ({
       id: `guest_${guest._id}`,
       type: 'guest_added' as const,
       title: 'אורח נוסף',
       description: `${guest.firstName} ${guest.lastName} נוסף לרשימת המוזמנים`,
       timestamp: new Date(Date.now() - (index + 1) * 3600000).toISOString(), // 1 hour ago, 2 hours ago
       icon: '👤'
     })),
         ...tasks.filter(task => task.done).slice(-2).map((task, index) => ({
       id: `task_${task._id}`,
       type: 'task_completed' as const,
       title: 'משימה הושלמה',
       description: `${task.task} הושלמה בהצלחה`,
       timestamp: new Date(Date.now() - (index + 3) * 3600000).toISOString(), // 3 hours ago, 4 hours ago
       icon: '✅'
     })),
    ...vendors.slice(-1).map((vendor, index) => ({
      id: `vendor_${vendor._id}`,
      type: 'vendor_added' as const,
      title: 'ספק נוסף',
      description: `${vendor.vendorName} נוסף לרשימת הספקים`,
      timestamp: new Date(Date.now() - (index + 5) * 3600000).toISOString(), // 5 hours ago
      icon: '🏢'
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

  // High priority tasks (tasks with due date soon)
  const highPriorityTasks = tasks.filter(task => !task.done && task.dueDate && new Date(task.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

  // Event total cost calculation (vendors + meal cost for confirmed guests)
  const totalVendorExpenses = vendors.reduce((sum, v) => sum + (v.price || 0), 0);
  const calculateMealCostForCount = (count: number) => {
    if (!weddingData?.mealPricing) return 0;
    const { basePrice, bulkThreshold, bulkPrice, bulkMaxGuests, reservePrice } = weddingData.mealPricing;
    let totalCost = 0;
    let remainingGuests = count;
    const baseGuests = Math.min(remainingGuests, bulkThreshold);
    if (baseGuests > 0) {
      totalCost += baseGuests * basePrice;
      remainingGuests -= baseGuests;
    }
    if (remainingGuests > 0 && bulkPrice > 0) {
      const bulkGuests = Math.min(remainingGuests, Math.max(0, bulkMaxGuests - bulkThreshold));
      if (bulkGuests > 0) {
        totalCost += bulkGuests * bulkPrice;
        remainingGuests -= bulkGuests;
      }
    }
    if (remainingGuests > 0 && reservePrice > 0) {
      totalCost += remainingGuests * reservePrice;
    }
    return totalCost;
  };
  const confirmedMealCost = calculateMealCostForCount(confirmedGuests);
  const eventTotalCost = totalVendorExpenses + confirmedMealCost;
  const costPerPerson = confirmedGuests > 0 ? Math.round(eventTotalCost / confirmedGuests) : 0;
  
  // Calculate cost per person for all invited guests
  const totalInvitedMealCost = calculateMealCostForCount(totalGuests);
  const totalInvitedEventCost = totalVendorExpenses + totalInvitedMealCost;
  const costPerPersonInvited = totalGuests > 0 ? Math.round(totalInvitedEventCost / totalGuests) : 0;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>טוען...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
   

      {/* Countdown Timer */}
      <div className="card text-center mb-xl" style={{ 
        background: 'linear-gradient(135deg, #c8e6d1 0%, #d4f0d4 25%, #f8d7da 50%, #e0c8e0 75%, #c8e6d1 100%)',
        color: '#333',
        border: '1px solid #e9ecef',
        boxShadow: '0 4px 15px rgba(200, 230, 209, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '28px' }}>
          {timeLeft.days > 0 ? '⏰ ספירה לאחור לחתונה' : '🎉 היום החתונה!'}
        </h2>
        
        {timeLeft.days > 0 ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '72px', fontWeight: 'bold', lineHeight: '1', marginBottom: '10px' }}>
              {timeLeft.days}
            </div>
            <div style={{ fontSize: '24px', opacity: 0.9, marginBottom: '15px' }}>ימים לחתונה</div>
            <div style={{ fontSize: '18px', opacity: 0.8 }}>
              תאריך האירוע: {weddingData?.weddingDate ? new Date(weddingData.weddingDate).toLocaleDateString('he-IL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              }) : 'לא מוגדר'}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
            מזל טוב! 🎊
          </div>
        )}
      </div>

      {/* Progress Cards */}
      <div className="grid grid-2 mb-xl">
                 {/* Tasks Progress */}
         <div className="card">
           <div className="flex-between mb-lg">
             <div style={{ 
               width: '50px', 
               height: '50px', 
               borderRadius: '50%', 
               background: 'linear-gradient(135deg, #c8e6d1, #d4f0d4)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               marginLeft: '15px'
             }}>
               <span style={{ fontSize: '24px' }}>✓</span>
             </div>
             <div>
               <h3 style={{ margin: '0', color: '#333' }}>משימות כולל</h3>
               <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                 צ'קליסט, ספקים, מוזמנים
               </p>
               <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '12px' }}>
                 {completedItems} מתוך {totalItems} הושלמו
               </p>
             </div>
           </div>
          
           <div style={{ 
             width: '100%', 
             height: '8px', 
             background: '#f0f0f0', 
             borderRadius: '4px',
             overflow: 'hidden'
           }}>
             <div style={{ 
               width: `${taskProgress}%`, 
               height: '100%', 
               background: 'linear-gradient(135deg, #c8e6d1, #d4f0d4)',
               transition: 'width 0.3s ease'
             }}></div>
           </div>
           
           <div style={{ 
             marginTop: '15px', 
             fontSize: '28px', 
             fontWeight: 'bold', 
             color: '#c8e6d1' 
           }}>
             {taskProgress.toFixed(0)}%
           </div>
        </div>

                 {/* Vendors Progress */}
         <div className="card">
           <div className="flex-between mb-lg">
                          <div style={{ 
                width: '25px', 
                height: '25px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #f8d7da, #e0c8e0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '8px'
              }}>
               <span style={{ fontSize: '12px' }}>🏢</span>
             </div>
             <div>
               <h3 style={{ margin: '0', color: '#333', fontSize: '16px' }}>ספקים</h3>
               <p style={{ margin: '2px 0 0 0', color: '#666', fontSize: '12px' }}>
                 {confirmedVendors} מתוך {totalVendors} אושרו
               </p>
             </div>
           </div>
          
                     <div style={{ 
             width: '100%', 
             height: '8px', 
             background: '#f0f0f0', 
             borderRadius: '4px',
             overflow: 'hidden'
           }}>
             <div style={{ 
               width: `${vendorProgress}%`, 
               height: '100%', 
               background: 'linear-gradient(90deg, #f8d7da, #e0c8e0)',
               transition: 'width 0.3s ease'
             }}></div>
           </div>
          
                     <div style={{ 
             marginTop: '10px', 
             fontSize: '24px', 
             fontWeight: 'bold', 
             color: '#f8d7da' 
           }}>
             {vendorProgress.toFixed(0)}%
           </div>
        </div>

        {/* Guests Progress */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                         <div style={{ 
               width: '50px', 
               height: '50px', 
               borderRadius: '50%', 
               background: 'linear-gradient(135deg, #c8e6d1, #f8d7da)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               marginLeft: '15px'
             }}>
              <span style={{ fontSize: '24px' }}>👥</span>
            </div>
                         <div>
               <h3 style={{ margin: '0', color: '#333' }}>מוזמנים</h3>
               <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                 {confirmedGuests} מתוך {totalGuests} אישרו הגעה
               </p>
               <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '12px' }}>
                 סה"כ מוזמנים: {totalReservedPlaces}
               </p>
             </div>
          </div>
          
                     <div style={{ 
             width: '100%', 
             height: '8px', 
             background: '#f0f0f0', 
             borderRadius: '4px',
             overflow: 'hidden'
           }}>
             <div style={{ 
               width: `${guestProgress}%`, 
               height: '100%', 
               background: 'linear-gradient(90deg, #c8e6d1, #f8d7da)',
               transition: 'width 0.3s ease'
             }}></div>
           </div>
          
                     <div style={{ 
             marginTop: '10px', 
             fontSize: '24px', 
             fontWeight: 'bold', 
             color: '#c8e6d1' 
           }}>
             {guestProgress.toFixed(0)}%
           </div>
        </div>
        {/* Event Cost Summary */}
        <div style={{ 
          background: 'white', 
          padding: '25px', 
          borderRadius: '12px',
  
         
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                         <div style={{ 
               width: '50px', 
               height: '50px', 
               borderRadius: '50%', 
               background: 'linear-gradient(135deg, #d4f0d4, #e0c8e0)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               marginLeft: '15px'
             }}>
              <span style={{ fontSize: '24px' }}>💰</span>
            </div>
            <div>
              <h3 style={{ margin: '0', color: '#333' }}>חישוב עלויות האירוע</h3>
              <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                עלות לאיש (מאשרים): {costPerPerson.toLocaleString()} ₪
              </p>
              <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                עלות לאיש (מוזמנים): {costPerPersonInvited.toLocaleString()} ₪
              </p>
            </div>
          </div>
          <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>סה"כ ספקים</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#c62828' }}>{totalVendorExpenses.toLocaleString()} ₪</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>עלות מנות (מאשרים)</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2e7d32' }}>{confirmedMealCost.toLocaleString()} ₪</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>עלות מנות (מוזמנים)</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4caf50' }}>{totalInvitedMealCost.toLocaleString()} ₪</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>סה"כ עלות אירוע</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f57f17' }}>{eventTotalCost.toLocaleString()} ₪</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks and Activities */}
      <div style={{ 
        display: 'grid', 
        gap: '20px', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        marginBottom: '30px'
      }}>
        {/* Recent Activities */}
        <div style={{ 
          background: 'white', 
          padding: '25px', 
          borderRadius: '12px',
     
      
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            color: '#333',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ marginLeft: '10px' }}>📝</span>
            פעולות אחרונות
          </h3>
          
          {recentActivities.length > 0 ? (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {recentActivities.map((activity) => (
                <div key={activity.id} style={{ 
                  padding: '15px', 
                 
                  borderRadius: '8px', 
                  marginBottom: '10px',
                  background: '#f8fbff'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                    <span style={{ fontSize: '20px', marginLeft: '10px' }}>{activity.icon}</span>
                    <div style={{ fontWeight: 'bold', color: '#1976D2' }}>
                      {activity.title}
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                    {activity.description}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {new Date(activity.timestamp).toLocaleString('he-IL', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', padding: '20px' }}>
              אין פעולות אחרונות
            </div>
          )}
        </div>

        {/* Upcoming Tasks from Checklist */}
        <div style={{ 
          background: 'white', 
          padding: '25px', 
          borderRadius: '12px',
      
       
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            color: '#333',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ marginLeft: '10px' }}>📋</span>
            משימות לביצוע
          </h3>
          
          {upcomingTasks.length > 0 ? (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {upcomingTasks.map((task) => (
                                 <div key={task._id} style={{ 
                   padding: '15px', 
                                       border: '1px solid #f2ebe2', 
                   borderRadius: '8px', 
                   marginBottom: '10px',
                                       background: task.dueDate && new Date(task.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? '#f2ebe2' : '#fafafa'
                 }}>
                   <div style={{ 
                     fontWeight: 'bold', 
                     color: task.dueDate && new Date(task.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? '#e65100' : '#333',
                     marginBottom: '5px',
                     display: 'flex',
                     alignItems: 'center'
                   }}>
                     {task.dueDate && new Date(task.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && <span style={{ marginLeft: '5px' }}>🔥</span>}
                     {task.task}
                   </div>
                   <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                     {task.notes || 'אין הערות'}
                   </div>
                   <div style={{ fontSize: '12px', color: '#999' }}>
                     {task.dueDate && (
                       <span style={{ marginRight: '10px' }}>
                         תאריך יעד: {new Date(task.dueDate).toLocaleDateString('he-IL')}
                       </span>
                     )}
                   </div>
                 </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', padding: '20px' }}>
              אין משימות לביצוע
            </div>
          )}
        </div>
      </div>

      {/* High Priority Tasks */}
      {highPriorityTasks.length > 0 && (
                 <div style={{ 
           background: '#ffffff', 
           padding: '25px', 
           borderRadius: '12px',
           marginBottom: '30px',
          
         }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            color: '#666',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ marginLeft: '10px' }}>🚨</span>
            משימות בעדיפות גבוהה ({highPriorityTasks.length})
          </h3>
          
          <div style={{ display: 'grid', gap: '15px',backgroundColor: 'ffffe6', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {highPriorityTasks.map((task) => (
              <div key={task._id} style={{ 
                padding: '15px', 
                background: 'white', 
                borderRadius: '8px', 
             
              }}>
                                 <div style={{ fontWeight: 'bold', color: '#e65100', marginBottom: '5px' }}>
                   {task.task}
                 </div>
                 <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                   {task.notes || 'אין הערות'}
                 </div>
                {task.dueDate && (
                                     <div style={{ fontSize: '12px', color: '#ff9800', fontWeight: 'bold' }}>
                    תאריך יעד: {new Date(task.dueDate).toLocaleDateString('he-IL')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '12px',
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>📊 סטטיסטיקות מהירות</h3>
        
        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50' }}>
              {totalItems}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>סה"כ פריטים</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196F3' }}>
              {totalVendors}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>סה"כ ספקים</div>
          </div>
          
                     <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff9800' }}>
               {totalReservedPlaces}
             </div>
             <div style={{ fontSize: '14px', color: '#666' }}>סה"כ מוזמנים</div>
           </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#9C27B0' }}>
              {highPriorityTasks.length}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>משימות דחופות</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
