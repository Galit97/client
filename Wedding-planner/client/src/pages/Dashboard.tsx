import React, { useState, useEffect } from "react";
import shareIcon from "../assets/images/share.svg";
import BudgetMaster from "../lib/budgetMaster";
import { apiUrl } from "../utils/api";
import "../styles/Dashboard.css";

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
  _id?: string;
  weddingDate: string;
  budget: number;
  totalGuests: number;
  coupleName?: string;
  weddingName?: string;
  mealPricing?: MealPricing;
  participants?: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    role?: string;
  } | string>; // Can be either populated object or just ID string
};

type Activity = {
  id: string;
  type: 'guest_added' | 'task_completed' | 'vendor_added' | 'vendor_updated' | 'task_added';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
};

interface DashboardProps {
  onNavigate?: (section: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showBudgetEdit, setShowBudgetEdit] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [coupleName, setCoupleName] = useState('');
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to fetch all data
  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setIsRefreshing(true);
      
      // Fetch wedding data
      const weddingRes = await fetch(apiUrl("/api/weddings/owner"), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (weddingRes.ok) {
        const wedding = await weddingRes.json();
        console.log('Wedding data from server:', wedding);
        console.log('Participants from server:', wedding.participants);
        
        // If participants are just IDs, fetch user details
        if (wedding.participants && wedding.participants.length > 0) {
          const firstParticipant = wedding.participants[0];
          if (typeof firstParticipant === 'string' || !firstParticipant.firstName) {
            console.log('Participants are IDs, fetching user details...');
            // Fetch all users to get names
            const usersRes = await fetch(apiUrl("/api/users"), {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (usersRes.ok) {
              const users = await usersRes.json();
              console.log('All users:', users);
              
              // Map participant IDs to user objects
              const populatedParticipants = wedding.participants.map((participantId: string | any) => {
                const id = typeof participantId === 'string' ? participantId : participantId._id;
                const user = users.find((u: any) => u._id === id);
                if (user) {
                  return {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role || 'Member'
                  };
                }
                return {
                  _id: id,
                  firstName: 'Unknown',
                  lastName: 'User',
                  role: 'Member'
                };
              });
              
              wedding.participants = populatedParticipants;
              console.log('Populated participants:', populatedParticipants);
            }
          }
        }
        
        setWeddingData(wedding);
      }

      // Fetch tasks
              const tasksRes = await fetch(apiUrl("/api/checklists"), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
      }

      // Fetch vendors
              const vendorsRes = await fetch(apiUrl("/api/vendors"), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (vendorsRes.ok) {
        const vendorsData = await vendorsRes.json();
        setVendors(vendorsData);
      }

      // Fetch guests
              const guestsRes = await fetch(apiUrl("/api/guests"), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (guestsRes.ok) {
        const guestsData = await guestsRes.json();
        setGuests(guestsData);
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
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

  // Enhanced cost breakdown for better display
  const costBreakdown = {
    vendors: totalVendorExpenses,
    mealsConfirmed: confirmedMealCost,
    mealsTotal: totalInvitedMealCost,
    totalConfirmed: eventTotalCost,
    totalInvited: totalInvitedEventCost,
    costPerPersonConfirmed: costPerPerson,
    costPerPersonInvited: costPerPersonInvited,
    hasMealPricing: !!weddingData?.mealPricing
  };

  // Function to get initials from name
  const getInitials = (firstName: string, lastName: string) => {
    if (!firstName && !lastName) return '?';
    
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    const result = firstInitial + lastInitial;
    console.log(`getInitials("${firstName}", "${lastName}") = "${result}"`);
    
    // If we got Hebrew "Unknown User" text, show different initials
    if (firstName === 'משתמש' && lastName === 'לא ידוע') {
      return 'מל';
    }
    
    return result || '?';
  };

  // Function to get role display in Hebrew
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'Bride': return 'כלה';
      case 'Groom': return 'חתן';
      case 'MotherOfBride': return 'אם הכלה';
      case 'MotherOfGroom': return 'אם החתן';
      case 'FatherOfBride': return 'אב הכלה';
      case 'FatherOfGroom': return 'אב החתן';
      case 'Planner': return 'מפיק';
      case 'Member': return 'חבר';
      case 'חבר': return 'חבר'; // Hebrew input
      case 'Other': return 'אחר';
      default: return 'חבר';
    }
  };

  // Function to handle navigation to event settings
  const handleNavigateToEventSettings = () => {
    // Open share popup instead of navigating
    setShowSharePopup(true);
  };

  // Function to translate vendor types to Hebrew
  const translateVendorType = (type: string): string => {
    const typeTranslations: { [key: string]: string } = {
      'venue': 'אולם/גן אירועים',
      'catering': 'קייטרינג',
      'photography': 'צילום',
      'music': 'מוזיקה',
      'decoration': 'עיצוב וקישוט',
      'transportation': 'הסעות',
      'beauty': 'איפור וטיפוח',
      'jewelry': 'תכשיטים',
      'dress': 'שמלות',
      'suit': 'חליפות',
      'cake': 'עוגת חתונה',
      'invitations': 'הזמנות',
      'flowers': 'פרחים',
      'lighting': 'תאורה',
      'video': 'וידאו',
      'dj': 'די ג\'יי',
      'band': 'להקה',
      'officiant': 'רב/פקיד',
      'insurance': 'ביטוח',
      'other': 'אחר'
    };
    
    return typeTranslations[type.toLowerCase()] || type;
  };

  // Function to translate participant roles to Hebrew
  const translateParticipantRole = (role: string): string => {
    const roleTranslations: { [key: string]: string } = {
      'bride': 'כלה',
      'groom': 'חתן',
      'producer': 'מפיק',
      'planner': 'מתכנן',
      'coordinator': 'מתאם',
      'assistant': 'עוזר',
      'family': 'משפחה',
      'friend': 'חבר',
      'other': 'אחר'
    };
    
    return roleTranslations[role.toLowerCase()] || role;
  };

  // Function to save wedding date
  const handleSaveWeddingDate = async () => {
    if (!selectedDate || !coupleName) {
      alert('אנא מלאו את כל השדות הנדרשים');
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(apiUrl("/api/weddings"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          weddingDate: selectedDate,
          weddingName: coupleName
        })
      });

      if (response.ok) {
        const newWedding = await response.json();
        setWeddingData(prev => prev ? {
          ...prev,
          weddingDate: selectedDate,
          weddingName: coupleName
        } : {
          weddingDate: selectedDate,
          weddingName: coupleName,
          budget: 0,
          totalGuests: 0
        });
        setShowDatePicker(false);
        setSelectedDate('');
        setCoupleName('');
        alert('תאריך החתונה נשמר בהצלחה!');
      } else {
        alert('שגיאה בשמירת תאריך החתונה');
      }
    } catch (error) {
      console.error("Error saving wedding date:", error);
      alert('שגיאה בשמירת תאריך החתונה');
    }
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
      
      
      {/* Active Partners Section - Small Corner */}
      <div className="partners-section" style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {/* Debug info */}
        {(() => {
          console.log('weddingData:', weddingData);
          console.log('participants:', weddingData?.participants);
          return null;
        })()}
        
        {weddingData?.participants && weddingData.participants.length > 0 ? (
          <>
            {weddingData.participants.map((participant, index) => {
              const colors = [
                        'linear-gradient(135deg, #3b82f6, #1d4ed8)', // כחול
        'linear-gradient(135deg, #0ea5e9, #0284c7)', // כחול בהיר
        'linear-gradient(135deg, #06b6d4, #0891b2)', // כחול טורקיז
        'linear-gradient(135deg, #8b5cf6, #7c3aed)'  // סגול
              ];
              const color = colors[index % colors.length];
              
              // Debug logging
              console.log('Participant:', participant);
              console.log('Type of participant:', typeof participant);
              
              // Handle case where participant might be just an ID string
              let firstName = '';
              let lastName = '';
              let role = 'Member';
              let participantId = '';
              
              if (typeof participant === 'string') {
                // If participant is just an ID string
                participantId = participant;
                firstName = 'משתמש';
                lastName = 'לא ידוע';
                role = 'חבר';
              } else if (participant && typeof participant === 'object') {
                // If participant is an object
                participantId = participant._id || '';
                firstName = participant.firstName || 'משתמש';
                lastName = participant.lastName || 'לא ידוע';
                role = participant.role || 'Member';
              }
              
              console.log('Processed participant:', { participantId, firstName, lastName, role });
              console.log('Initials:', getInitials(firstName, lastName));
              
              return (
                <div 
                  key={participantId || index}
                  style={{
                    position: 'relative',
                    display: 'inline-block'
                  }}
                >
                  <div 
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      border: '2px solid rgba(255,255,255,0.8)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                      // Show tooltip
                      const tooltip = e.currentTarget.nextElementSibling as HTMLElement;
                      if (tooltip) {
                        tooltip.style.opacity = '1';
                        tooltip.style.visibility = 'visible';
                        tooltip.style.transform = 'translateX(-50%) scale(1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                      // Hide tooltip
                      const tooltip = e.currentTarget.nextElementSibling as HTMLElement;
                      if (tooltip) {
                        tooltip.style.opacity = '0';
                        tooltip.style.visibility = 'hidden';
                        tooltip.style.transform = 'translateX(-50%) scale(0.95)';
                      }
                    }}
                  >
                    {getInitials(firstName, lastName)}
                  </div>
                  
                  {/* Custom Tooltip */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '40px',
                      left: '50%',
                      transform: 'translateX(-50%) scale(0.95)',
                      backgroundColor: '#1e3a8a',
                      color: 'white',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      whiteSpace: 'nowrap',
                      zIndex: 1000,
                      opacity: 0,
                      visibility: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      minWidth: '120px',
                      maxWidth: '200px'
                    }}
                  >
                    <div style={{ textAlign: 'center', lineHeight: '1.4' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                        {firstName} {lastName}
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.9 }}>
                        {getRoleDisplay(role)}
                      </div>
                    </div>
                    
                    {/* Tooltip arrow */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderBottom: '6px solid #1e3a8a'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div 
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #cccccc, #999999)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              border: '2px solid rgba(255,255,255,0.8)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
            title="אין שותפים עדיין"
          >
            ?
          </div>
        )}
        
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button
            onClick={handleNavigateToEventSettings}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6C7B7F, #4A5568)',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.8)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
              // Show tooltip
              const tooltip = e.currentTarget.nextElementSibling as HTMLElement;
              if (tooltip) {
                tooltip.style.opacity = '1';
                tooltip.style.visibility = 'visible';
                tooltip.style.transform = 'translateX(-50%) scale(1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
              // Hide tooltip
              const tooltip = e.currentTarget.nextElementSibling as HTMLElement;
              if (tooltip) {
                tooltip.style.opacity = '0';
                tooltip.style.visibility = 'hidden';
                tooltip.style.transform = 'translateX(-50%) scale(0.95)';
              }
            }}
          >
            <img 
              src={shareIcon} 
              alt="Share" 
              style={{ width: '16px', height: '16px', filter: 'brightness(0) invert(1)' }}
            />
          </button>
          
          {/* Share Button Tooltip */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              left: '50%',
              transform: 'translateX(-50%) scale(0.95)',
              backgroundColor: '#1e3a8a',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              zIndex: 1000,
              opacity: 0,
              visibility: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              minWidth: '120px',
              maxWidth: '200px'
            }}
          >
            <div style={{ textAlign: 'center', lineHeight: '1.4' }}>
              <div style={{ fontWeight: 'bold' }}>
                הוסף שותפים לאירוע
              </div>
            </div>
            
            {/* Tooltip arrow */}
            <div
              style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: '6px solid #1e3a8a'
              }}
            />
          </div>
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="card text-center mb-xl countdown-card" style={{ 
        background: 'linear-gradient(135deg, #65859e 0%, #1f4f66 100%)',
        color: 'white',
        border: '1px solid #CBD5E1',
        boxShadow: '0 4px 15px rgba(101, 133, 158, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {weddingData?.weddingDate ? (
          <>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '28px', color: 'white'}}>
              {timeLeft.days > 0 ? `ספירה לאחור לחתונה של ${weddingData?.weddingName || 'הזוג'}` : '🎉 היום החתונה!'}
        </h2>
            {/* Debug info */}
            {(() => {
              console.log('weddingName from weddingData:', weddingData?.weddingName);
              console.log('full weddingData:', weddingData);
              return null;
            })()}
        
        {timeLeft.days > 0 ? (
          <div style={{ textAlign: 'center' }}>
            <div className="countdown-days" style={{ fontSize: '72px', fontWeight: 'bold', lineHeight: '1', marginBottom: '10px' }}>
              {timeLeft.days}
            </div>
            <div className="countdown-label" style={{ fontSize: '24px', opacity: 0.9, marginBottom: '15px' }}>ימים לחתונה</div>
            <div className="countdown-date" style={{ fontSize: '18px', opacity: 0.8 }}>
                  תאריך האירוע: {new Date(weddingData.weddingDate).toLocaleDateString('he-IL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
                  })}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
            מזל טוב! 🎊
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '28px', color: 'white' }}>
              ברוכים הבאים!
            </h2>
            <p style={{ fontSize: '18px', marginBottom: '30px', opacity: 0.9 }}>
              בואו נתחיל לתכנן את החתונה שלכם
            </p>
            <button
              onClick={() => setShowDatePicker(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              בחרו תאריך לחתונה
            </button>
          </div>
        )}
      </div>

      {/* Main Cards - 3 Cards */}
      <div className="main-cards-grid" style={{ 
        display: 'grid', 
        gap: '20px', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        marginBottom: '30px'
      }}>
        {/* Event Cost Summary */}
        <div className="card main-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
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
              <span style={{ fontSize: '24px' }}>💰</span>
             </div>
                         <div style={{ flex: 1 }}>
                                <h3 style={{ margin: '0', color: '#0F172A' }}>חישוב עלויות האירוע</h3>
                               <p style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '14px' }}>
                  עלות כוללת: {(costBreakdown.vendors + costBreakdown.mealsTotal).toLocaleString()} ₪
                </p>
               <p style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '12px' }}>
                 עלות לאיש (מאשרי הגעה): {costBreakdown.costPerPersonConfirmed.toLocaleString()} ₪
               </p>
               <p style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '12px' }}>
                 עלות למוזמן (מוזמנים): {costBreakdown.costPerPersonInvited.toLocaleString()} ₪
               </p>
               {costBreakdown.hasMealPricing && (
                 <p style={{ margin: '5px 0 0 0', color: '#0ea5e9', fontSize: '11px', fontWeight: 'bold' }}>
                   🍽️ כולל חישוב עלויות מנות
                 </p>
               )}
             </div>
           </div>
          
          <div style={{ display: 'grid', gap: '8px', gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '15px' }}>
            <div style={{ textAlign: 'center', padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1d5a78' }}>{costBreakdown.vendors.toLocaleString()} ₪</div>
              <div style={{ fontSize: '11px', color: '#475569' }}>ספקים</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1d5a78' }}>{costBreakdown.mealsConfirmed.toLocaleString()} ₪</div>
              <div style={{ fontSize: '11px', color: '#475569' }}>מנות (מאשרים)</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1d5a78' }}>{costBreakdown.mealsTotal.toLocaleString()} ₪</div>
              <div style={{ fontSize: '11px', color: '#475569' }}>מנות (כל המוזמנים)</div>
            </div>
          </div>
          
          {costBreakdown.hasMealPricing && (
            <div style={{ 
              marginBottom: '15px', 
              padding: '10px', 
              background: '#f0f9ff', 
              borderRadius: '6px', 
              border: '1px solid #0ea5e9',
              fontSize: '12px',
              color: '#0c4a6e'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🍽️ חישוב עלויות מנות:</div>
              <div>• מאשרי הגעה ({confirmedGuests} אנשים): {costBreakdown.mealsConfirmed.toLocaleString()} ₪</div>
              <div>• כל המוזמנים ({totalGuests} אנשים): {costBreakdown.mealsTotal.toLocaleString()} ₪</div>
              {weddingData?.mealPricing && (
                <div style={{ marginTop: '4px', fontSize: '11px', opacity: '0.8' }}>
                  מחיר מנה: {weddingData.mealPricing.basePrice.toLocaleString()} ₪ | 
                  הנחה לילדים: {weddingData.mealPricing.childDiscount}% | 
                  מחיר התחייבות: {weddingData.mealPricing.bulkPrice > 0 ? `${weddingData.mealPricing.bulkPrice.toLocaleString()} ₪` : 'לא מוגדר'}
                </div>
              )}
            </div>
          )}
           
          <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
            <button
              onClick={() => setShowBudgetEdit(true)}
              className="main-card-button"
              style={{
                flex: 1,
                padding: '12px 20px',
                background: '#f8fafc',
                color: '#1f2937',
                border: '2px solid #e5e7eb',
                borderRadius: '25px',
                fontSize: '14px',
                fontWeight: 'bold', 
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              <span>ניהול תקציב</span>
              <span style={{ 
                fontSize: '16px',
                transform: 'rotate(180deg)',
                marginLeft: '8px'
              }}>→</span>
            </button>
            <button
                              onClick={() => setShowBudgetEdit(true)}
              className="main-card-button"
              style={{
                padding: '12px 16px',
                background: '#1d5a78',
                color: 'white',
                border: '2px solid #1d5a78',
                borderRadius: '25px',
                fontSize: '12px',
                fontWeight: 'bold', 
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(29, 90, 120, 0.3)';
                e.currentTarget.style.background = '#164e63';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = '#1d5a78';
              }}
            >
              <span>מאסטר</span>
            </button>
          </div>
        </div>



        {/* Guests */}
        <div className="card main-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
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
              <span style={{ fontSize: '24px' }}>👥</span>
             </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0', color: '#0F172A' }}>מוזמנים</h3>
              <p style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '14px' }}>
                {confirmedGuests} מתוך {totalGuests} אישרו הגעה
              </p>
              <p style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '12px' }}>
                סה"כ מוזמנים: {totalReservedPlaces}
               </p>
             </div>
           </div>
          
                     <div style={{ 
             width: '100%', 
             height: '8px', 
             background: '#FAFAFA', 
             borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '15px'
           }}>
             <div style={{ 
              width: `${guestProgress}%`, 
               height: '100%', 
              background: 'linear-gradient(90deg, #EDF8F4, #FCF3F7)',
               transition: 'width 0.3s ease'
             }}></div>
           </div>
          
          <button
                            onClick={() => onNavigate?.('guestList')}
            className="main-card-button"
            style={{
              width: '100%',
              padding: '12px 20px',
              background: '#f8fafc',
              color: '#1f2937',
              border: '2px solid #e5e7eb',
              borderRadius: '25px',
              fontSize: '14px',
             fontWeight: 'bold', 
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              marginTop: 'auto'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            <span>ניהול מוזמנים</span>
            <span style={{ 
              fontSize: '16px',
              transform: 'rotate(180deg)',
              marginLeft: '8px'
            }}>→</span>
          </button>
        </div>

        {/* Today's Tasks */}
        <div className="card main-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                         <div style={{ 
               width: '50px', 
               height: '50px', 
               borderRadius: '50%', 
              background: 'linear-gradient(135deg, #EDF8F4, #EFF5FB)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               marginLeft: '15px'
             }}>
              <span style={{ fontSize: '24px' }}>📋</span>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0', color: '#0F172A' }}>משימות</h3>
               <p style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '14px' }}>
                {highPriorityTasks.length} משימות דחופות
               </p>
               <p style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '12px' }}>
                {completedTasks} מתוך {totalTasks} הושלמו
               </p>
             </div>
          </div>
          
                     <div style={{ 
             width: '100%', 
             height: '8px', 
             background: '#FAFAFA', 
             borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '15px'
           }}>
             <div style={{ 
              width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`, 
               height: '100%', 
              background: 'linear-gradient(135deg, #EDF8F4, #EFF5FB)',
               transition: 'width 0.3s ease'
             }}></div>
           </div>
          
                     <button
                             onClick={() => onNavigate?.('checklist')}
             className="main-card-button"
             style={{
               width: '100%',
               padding: '12px 20px',
               background: '#f8fafc',
               color: '#1f2937',
               border: '2px solid #e5e7eb',
               borderRadius: '25px',
               fontSize: '14px',
             fontWeight: 'bold', 
               cursor: 'pointer',
               transition: 'all 0.2s ease',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'space-between',
               position: 'relative',
               marginTop: 'auto'
             }}
             onMouseEnter={(e) => {
               e.currentTarget.style.transform = 'translateY(-1px)';
               e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
               e.currentTarget.style.borderColor = '#d1d5db';
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.transform = 'translateY(0)';
               e.currentTarget.style.boxShadow = 'none';
               e.currentTarget.style.borderColor = '#e5e7eb';
             }}
           >
             <span>משימות</span>
             <span style={{ 
               fontSize: '16px',
               transform: 'rotate(180deg)',
               marginLeft: '8px'
             }}>→</span>
           </button>
        </div>
      </div>

      {/* Bottom Section - Recent Activities and Vendors */}
      <div className="bottom-section" style={{ 
        display: 'grid', 
        gap: '20px', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        marginBottom: '30px'
      }}>
                 {/* Recent Activities */}
         <div className="section-card" style={{ 
           background: '#FFFFFF', 
           padding: '25px', 
           borderRadius: '12px',
           border: '1px solid #CBD5E1'
         }}>
                       <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ 
                margin: '0', 
                color: '#0F172A',
                display: 'flex',
                alignItems: 'center'
              }}>
                פעולות אחרונות
              </h3>
              <div style={{ 
                fontSize: '11px', 
                color: '#6b7280',
                whiteSpace: 'nowrap'
              }}>
                עודכן: {lastRefresh.toLocaleTimeString('he-IL', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          
          {recentActivities.length > 0 ? (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {recentActivities.map((activity) => (
                <div key={activity.id} style={{ 
                  padding: '15px', 
                  borderRadius: '8px', 
                  marginBottom: '10px',
                  background: '#EFF5FB'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                    <span style={{ fontSize: '20px', marginLeft: '10px' }}>{activity.icon}</span>
                    <div style={{ fontWeight: 'bold', color: '#1E5A78' }}>
                      {activity.title}
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#475569', marginBottom: '5px' }}>
                    {activity.description}
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>
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
            <div style={{ textAlign: 'center', color: '#475569', fontStyle: 'italic', padding: '20px' }}>
              אין פעולות אחרונות
            </div>
          )}
        </div>

        {/* Vendors Section */}
        <div className="section-card" style={{ 
          background: '#FFFFFF', 
          padding: '25px', 
          borderRadius: '12px',
          border: '1px solid #CBD5E1'
        }}>
                               <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{ 
              margin: '0', 
              color: '#0F172A',
              display: 'flex',
              alignItems: 'center'
            }}>
              ספקים
            </h3>
            <button
              onClick={() => onNavigate?.('vendors')}
              style={{
                padding: '8px 16px',
                background: '#f8fafc',
                color: '#1f2937',
                border: '2px solid #e5e7eb',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              <span>הוסף ספק</span>
              <span style={{ 
                fontSize: '14px',
                transform: 'rotate(180deg)'
              }}>→</span>
            </button>
          </div>
          
          {vendors.length > 0 ? (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {vendors.slice(-5).reverse().map((vendor) => (
                <div key={vendor._id} style={{ 
                   padding: '15px', 
                   borderRadius: '8px', 
                   marginBottom: '10px',
                  background: vendor.status === 'Confirmed' ? '#f0f9ff' : '#fafafa',
                  border: vendor.status === 'Confirmed' ? '1px solid #0ea5e9' : '1px solid #e5e7eb'
                 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 'bold', color: '#0F172A' }}>
                      {vendor.vendorName}
                    </div>
                   <div style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '11px', 
                     fontWeight: 'bold', 
                      background: vendor.status === 'Confirmed' ? '#dcfce7' : vendor.status === 'Pending' ? '#fef3c7' : '#fee2e2',
                      color: vendor.status === 'Confirmed' ? '#166534' : vendor.status === 'Pending' ? '#92400e' : '#991b1b'
                    }}>
                      {vendor.status === 'Confirmed' ? 'מאושר' : vendor.status === 'Pending' ? 'ממתין' : 'לא מאושר'}
                    </div>
                   </div>
                   <div style={{ fontSize: '14px', color: '#475569', marginBottom: '5px' }}>
                    סוג: {translateVendorType(vendor.type)}
                   </div>
                  <div className="quick-summary-label" style={{ fontSize: '14px', color: '#475569' }}>
                    מחיר: {vendor.price.toLocaleString()} ₪
                   </div>
                 </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#475569', fontStyle: 'italic', padding: '20px' }}>
              טרם נוספו ספקים
            </div>
          )}
        </div>
      </div>

      {/* Quick Summary */}
      <div style={{ 
        background: '#FFFFFF', 
        padding: '25px', 
        borderRadius: '12px',
        border: '1px solid #CBD5E1',
        marginBottom: '30px'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#0F172A' }}> סיכום מהיר</h3>
        
        <div className="quick-summary-grid" style={{ 
          display: 'grid', 
          gap: '20px', 
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)'
        }}>
          <div className="quick-summary-item" style={{ 
            textAlign: 'center',
            padding: '20px',
            background: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #cbd5e1'
          }}>
            <div className="quick-summary-number" style={{ fontSize: '32px', fontWeight: 'bold', color: '#65859e', marginBottom: '8px' }}>
              {totalReservedPlaces}
            </div>
            <div className="quick-summary-label" style={{ fontSize: '14px', color: '#475569' }}>מוזמנים</div>
          </div>
          
          <div className="quick-summary-item" style={{ 
            textAlign: 'center',
            padding: '20px',
            background: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #cbd5e1'
          }}>
            <div className="quick-summary-number" style={{ fontSize: '32px', fontWeight: 'bold', color: '#65859e', marginBottom: '8px' }}>
              {confirmedVendors}
            </div>
            <div className="quick-summary-label" style={{ fontSize: '14px', color: '#475569' }}>ספקים נבחרו</div>
          </div>
          
          <div className="quick-summary-item" style={{ 
            textAlign: 'center',
            padding: '20px',
            background: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            position: 'relative'
          }}>
                         <div className="quick-summary-number" style={{ fontSize: '32px', fontWeight: 'bold', color: '#65859e', marginBottom: '8px' }}>
               {(costBreakdown.vendors + costBreakdown.mealsTotal).toLocaleString()}₪
             </div>
            <div className="quick-summary-label" style={{ fontSize: '14px', color: '#475569', marginBottom: '4px' }}>תחזית תקציב</div>
                         <div style={{ fontSize: '11px', color: '#64748b' }}>
               ספקים: {costBreakdown.vendors.toLocaleString()}₪ | מנות: {costBreakdown.mealsTotal.toLocaleString()}₪
             </div>
            
          </div>
          
          <div className="quick-summary-item" style={{ 
            textAlign: 'center',
            padding: '20px',
            background: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #cbd5e1'
          }}>
            <div className="quick-summary-number" style={{ fontSize: '32px', fontWeight: 'bold', color: '#65859e', marginBottom: '8px' }}>
              {totalTasks - completedTasks}
            </div>
            <div className="quick-summary-label" style={{ fontSize: '14px', color: '#475569' }}>משימות שנותרו</div>
          </div>
        </div>
      </div>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <span style={{ fontSize: '24px', marginLeft: '10px' }}>📅</span>
              <h2 style={{ margin: 0, color: '#0F172A' }}>בחירת תאריך החתונה</h2>
            </div>
            
            <p style={{ color: '#475569', marginBottom: '25px' }}>
              בחרו את התאריך המתוכנן לחתונה שלכם
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 'bold', 
                color: '#0F172A' 
              }}>
                שם הזוג
              </label>
              <input
                type="text"
                value={coupleName}
                onChange={(e) => setCoupleName(e.target.value)}
                placeholder="הזינו את שם הזוג"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 'bold', 
                color: '#0F172A' 
              }}>
                תאריך האירוע
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  background: 'white'
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowDatePicker(false);
                  setSelectedDate('');
                  setCoupleName('');
                }}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#475569',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ביטול
              </button>
              <button
                onClick={handleSaveWeddingDate}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #65859e 0%, #1f4f66 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                שמרו תאריך
              </button>
            </div>

            <p style={{ 
              color: '#6B7280', 
              fontSize: '12px', 
              marginTop: '15px', 
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              ניתן תמיד לשנות את התאריך מההגדרות
            </p>
          </div>
        </div>
      )}

             {/* Responsive Styles */}
       <style>{`
         /* Refresh Animation */
         @keyframes spin {
           from { transform: rotate(0deg); }
           to { transform: rotate(360deg); }
         }
         
         /* Mobile Styles */
        @media (max-width: 768px) {
          .page-container {
            padding: 10px !important;
          }
          
          /* Partners Section - Mobile */
          .partners-section {
            position: static !important;
            top: auto !important;
            left: auto !important;
            margin-bottom: 15px !important;
            justify-content: center !important;
          }
          
          /* Countdown Timer - Mobile */
          .countdown-card {
            margin-bottom: 20px !important;
            padding: 20px 15px !important;
          }
          
          .countdown-card h2 {
            font-size: 20px !important;
            margin-bottom: 15px !important;
          }
          
          .countdown-days {
            font-size: 48px !important;
          }
          
          .countdown-label {
            font-size: 18px !important;
          }
          
          .countdown-date {
            font-size: 14px !important;
          }
          
          /* Main Cards - Mobile (Stack vertically) */
          .main-cards-grid {
            grid-template-columns: 1fr !important;
            gap: 15px !important;
          }
          
          .main-card {
            padding: 15px !important;
          }
          
          .main-card h4 {
            font-size: 16px !important;
            margin-bottom: 10px !important;
          }
          
          .main-card-stats {
            font-size: 12px !important;
            margin-bottom: 8px !important;
          }
          
          .main-card-button {
            padding: 10px 16px !important;
            font-size: 14px !important;
          }
          
          /* Quick Summary - Mobile (2x2 grid with smaller items) */
          .quick-summary-grid {
            gap: 10px !important;
          }
          
          .quick-summary-item {
            padding: 15px !important;
          }
          
          .quick-summary-number {
            font-size: 24px !important;
          }
          
          .quick-summary-label {
            font-size: 12px !important;
          }
          
          /* Recent Activities & Vendors - Mobile */
          .bottom-section {
            grid-template-columns: 1fr !important;
            gap: 15px !important;
          }
          
          .section-card {
            padding: 15px !important;
          }
          
          .section-card h3 {
            font-size: 16px !important;
            margin-bottom: 12px !important;
          }
          
          .activity-item, .vendor-item {
            padding: 10px !important;
            margin-bottom: 8px !important;
          }
          
          .activity-title, .vendor-name {
            font-size: 14px !important;
          }
          
          .activity-description, .vendor-details {
            font-size: 12px !important;
          }
        }
        
        /* Tablet Styles */
        @media (min-width: 769px) and (max-width: 1024px) {
          .page-container {
            padding: 15px !important;
          }
          
          /* Main Cards - Tablet (2 columns) */
          .main-cards-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 20px !important;
          }
          
          .main-card:nth-child(3) {
            grid-column: 1 / -1 !important;
            max-width: 50% !important;
            margin: 0 auto !important;
          }
          
          /* Quick Summary - Tablet */
          .quick-summary-grid {
            gap: 15px !important;
          }
          
          .quick-summary-item {
            padding: 18px !important;
          }
          
          /* Bottom Section - Tablet */
          .bottom-section {
            gap: 20px !important;
          }
        }
        
        /* Small Mobile Styles */
        @media (max-width: 480px) {
          .page-container {
            padding: 8px !important;
          }
          
          /* Partners circles smaller */
          .partner-circle {
            width: 28px !important;
            height: 28px !important;
            font-size: 11px !important;
          }
          
          .share-icon {
            width: 16px !important;
            height: 16px !important;
          }
          
          /* Countdown even smaller */
          .countdown-card h2 {
            font-size: 18px !important;
          }
          
          .countdown-days {
            font-size: 36px !important;
          }
          
          .countdown-label {
            font-size: 16px !important;
          }
          
          /* Main cards more compact */
          .main-card {
            padding: 12px !important;
          }
          
          .main-card h4 {
            font-size: 14px !important;
          }
          
          .main-card-button {
            padding: 8px 12px !important;
            font-size: 12px !important;
          }
          
          /* Quick summary smaller */
          .quick-summary-item {
            padding: 12px !important;
          }
          
          .quick-summary-number {
            font-size: 20px !important;
          }
          
          .quick-summary-label {
            font-size: 11px !important;
          }
        }
      `}</style>

      {/* Share Popup */}
      {showSharePopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setShowSharePopup(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '20px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#666';
              }}
            >
              ×
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <h2 style={{ 
                margin: '0 0 10px 0', 
                color: '#1f2937',
                fontSize: '24px',
                fontWeight: 'bold'
              }}>
                שתף את האירוע
              </h2>
              <p style={{ 
                margin: 0, 
                color: '#6b7280',
                fontSize: '14px'
              }}>
                צור לינק לשיתוף עם שותפים נוספים
              </p>
            </div>

            {/* Current Partners Section */}
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ 
                margin: '0 0 15px 0', 
                color: '#374151',
                fontSize: '18px',
                fontWeight: '600'
              }}>
                שותפים נוכחיים ({weddingData?.participants?.length || 0})
              </h3>
              
              {weddingData?.participants && weddingData.participants.length > 0 ? (
                <div style={{ 
                  display: 'grid', 
                  gap: '12px',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
                }}>
                  {weddingData.participants.map((participant, index) => {
                    const colors = [
                      'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      'linear-gradient(135deg, #0ea5e9, #0284c7)',
                      'linear-gradient(135deg, #06b6d4, #0891b2)',
                      'linear-gradient(135deg, #8b5cf6, #7c3aed)'
                    ];
                    const color = colors[index % colors.length];
                    
                    // Handle case where participant might be just an ID string
                    let firstName = '';
                    let lastName = '';
                    let role = '';
                    
                    if (typeof participant === 'object' && participant !== null) {
                      firstName = participant.firstName || '';
                      lastName = participant.lastName || '';
                      role = participant.role || '';
                    }
                    
                    const getInitials = (first: string, last: string) => {
                      const firstInitial = first.charAt(0) || '';
                      const lastInitial = last.charAt(0) || '';
                      return (firstInitial + lastInitial).toUpperCase();
                    };
                    
                    return (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        background: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '14px'
                        }}>
                          {getInitials(firstName, lastName)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            fontWeight: '600', 
                            color: '#1f2937',
                            fontSize: '14px'
                          }}>
                            {firstName} {lastName}
                          </div>
                          {role && (
                            <div style={{ 
                              color: '#6b7280',
                              fontSize: '12px'
                            }}>
                              {translateParticipantRole(role)}
                            </div>
                          )}
                        </div>
                        {/* Remove Partner Button */}
                        <button
                          onClick={async () => {
                            if (confirm(`האם אתה בטוח שברצונך להסיר את ${firstName} ${lastName} מהאירוע?`)) {
                              try {
                                const token = localStorage.getItem("token");
                                if (!token) return;
                                
                                const participantId = typeof participant === 'object' ? participant._id : participant;
                                const response = await fetch(`/api/weddings/${weddingData?._id}/participants/${participantId}`, {
                                  method: 'DELETE',
                                  headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                  }
                                });
                                
                                if (response.ok) {
                                  // Refresh wedding data by refetching
                                  const refreshRes = await fetch(apiUrl("/api/weddings/owner"), {
                                    headers: { Authorization: `Bearer ${token}` }
                                  });
                                  if (refreshRes.ok) {
                                    const refreshedWedding = await refreshRes.json();
                                    setWeddingData(refreshedWedding);
                                  }
                                  alert(`${firstName} ${lastName} הוסר מהאירוע בהצלחה`);
                                } else {
                                  const errorData = await response.json();
                                  alert(`שגיאה בהסרת השותף: ${errorData.message || 'שגיאה לא ידועה'}`);
                                }
                              } catch (error) {
                                console.error('Error removing participant:', error);
                                alert('שגיאה בהסרת השותף');
                              }
                            }
                          }}
                          style={{
                            padding: '6px 10px',
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            minWidth: '60px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#b91c1c';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#dc2626';
                          }}
                          title="הסר שותף"
                        >
                          הסר
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  color: '#6b7280'
                }}>
                  אין שותפים לאירוע עדיין
                </div>
              )}
            </div>

            {/* Share Link Section */}
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ 
                margin: '0 0 15px 0', 
                color: '#374151',
                fontSize: '18px',
                fontWeight: '600'
              }}>
                לינק לשיתוף
              </h3>
              
              <div style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center'
              }}>
                <input
                  type="text"
                  value={`${window.location.origin}/invite/${weddingData?._id || 'wedding-id'}`}
                  readOnly
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#f9fafb',
                    color: '#374151'
                  }}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/invite/${weddingData?._id || 'wedding-id'}`);
                    alert('הלינק הועתק ללוח!');
                  }}
                  style={{
                    padding: '12px 16px',
                    background: '#1d5a78',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#164e63';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#1d5a78';
                  }}
                >
                  העתק
                </button>
              </div>
              
              <p style={{
                margin: '10px 0 0 0',
                fontSize: '12px',
                color: '#6b7280',
                lineHeight: '1.4'
              }}>
                שלח את הלינק הזה לחברים ובני משפחה כדי שיוכלו להצטרף לאירוע
              </p>
            </div>

            {/* Add Partner Button */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => {
                  setShowSharePopup(false);
                  onNavigate && onNavigate('eventSettings');
                }}
                style={{
                  padding: '14px 24px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                ➕ הוסף שותפים נוספים
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Budget Edit Modal */}
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
                              <BudgetMaster onClose={() => {
          setShowBudgetEdit(false);
          // Refresh the page to update budget data
          window.location.reload();
        }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
