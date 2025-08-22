import React, { useEffect, useState } from 'react';

type ChecklistItem = {
  _id: string;
  weddingID: string;
  task: string;
  done: boolean;
  notes?: string;
  dueDate?: string;
  relatedVendorId?: string;
  relatedRoleId?: string;
};

type Vendor = {
  _id: string;
  vendorName: string;
};

type User = {
  _id: string;
  firstName: string;
  lastName: string;
};

type FilterOptions = {
  vendor: string;
  role: string;
  status: 'all' | 'done' | 'pending';
  sortBy: 'dueDate' | 'createdAt' | 'task';
  sortOrder: 'asc' | 'desc';
};

export default function CheckListPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [weddingId, setWeddingId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);

  const [newTask, setNewTask] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newRelatedVendorId, setNewRelatedVendorId] = useState('');
  const [newRelatedRoleId, setNewRelatedRoleId] = useState('');

  const [filters, setFilters] = useState<FilterOptions>({
    vendor: '',
    role: '',
    status: 'all',
    sortBy: 'dueDate',
    sortOrder: 'asc'
  });

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        setLoading(false);
        return;
      }

      try {
        console.log("Starting to fetch checklist data...");
        
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
        console.log("Found wedding ID:", weddingData._id);

        // Fetch checklist items for this wedding
        console.log("Fetching checklist for wedding:", weddingData._id);
        const checklistRes = await fetch('/api/checklists', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Checklist response status:", checklistRes.status);
        console.log("Checklist response headers:", checklistRes.headers);

        if (checklistRes.ok) {
          const checklistData = await checklistRes.json();
          setItems(checklistData);
          console.log("Fetched checklist:", checklistData);
        } else {
          const errorText = await checklistRes.text();
          console.log("Error response:", errorText);
          console.log("No checklist found or error fetching");
          setItems([]);
        }

        // Fetch vendors
        const vendorsRes = await fetch('/api/vendors', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (vendorsRes.ok) {
          const vendorsData = await vendorsRes.json();
          setVendors(vendorsData);
          console.log("Fetched vendors:", vendorsData);
        }

        // Fetch users (wedding participants)
        const usersRes = await fetch('/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData);
          console.log("Fetched users:", usersData);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter and sort items
  const filteredAndSortedItems = items
    .filter(item => {
      if (filters.vendor && item.relatedVendorId !== filters.vendor) return false;
      if (filters.role && item.relatedRoleId !== filters.role) return false;
      if (filters.status === 'done' && !item.done) return false;
      if (filters.status === 'pending' && item.done) return false;
      return true;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'dueDate':
          aValue = a.dueDate || '9999-12-31';
          bValue = b.dueDate || '9999-12-31';
          break;
        case 'createdAt':
          aValue = a._id; // Using _id as proxy for creation time
          bValue = b._id;
          break;
        case 'task':
          aValue = a.task.toLowerCase();
          bValue = b.task.toLowerCase();
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

  async function toggleDone(id: string) {
    const token = localStorage.getItem("token");
    if (!token) return;

    const item = items.find(i => i._id === id);
    if (!item) return;

    try {
    const res = await fetch(`/api/checklists/${id}`, {
      method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      body: JSON.stringify({ done: !item.done }),
    });

      if (res.ok) {
        setItems(items.map(i => i._id === id ? { ...i, done: !i.done } : i));
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return alert('יש להזין משימה');
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
      const taskData = {
        weddingID: weddingId,
        task: newTask,
        notes: newNotes,
        dueDate: newDueDate || undefined,
        relatedVendorId: newRelatedVendorId || undefined,
        relatedRoleId: newRelatedRoleId || undefined,
      };

      const res = await fetch('/api/checklists', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error("Error creating task:", errorText);
      alert('שגיאה ביצירת המשימה');
      return;
    }

    const created = await res.json();
    setItems([...items, created]);

    setNewTask('');
    setNewNotes('');
    setNewDueDate('');
    setNewRelatedVendorId('');
    setNewRelatedRoleId('');
    } catch (error) {
      console.error("Error creating task:", error);
      alert('שגיאה ביצירת המשימה');
    }
  }

  async function updateTask(updatedItem: ChecklistItem) {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/checklists/${updatedItem._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedItem),
      });

      if (res.ok) {
        const updated = await res.json();
        setItems(items.map(i => i._id === updatedItem._id ? updated : i));
        setEditingItem(null);
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }

  async function deleteTask(id: string) {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!confirm("האם אתה בטוח שברצונך למחוק משימה זו?")) return;

    try {
      const res = await fetch(`/api/checklists/${id}`, { 
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setItems(items.filter(i => i._id !== id));
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }

  function startEditing(item: ChecklistItem) {
    setEditingItem(item);
  }

  function cancelEditing() {
    setEditingItem(null);
  }

  function getStatusColor(done: boolean) {
    return done ? '#dcfce7' : '#fef3c7';
  }

  function getStatusText(done: boolean) {
    return done ? 'הושלם' : 'ממתין';
  }

  function getStatusTextColor(done: boolean) {
    return done ? '#166534' : '#92400e';
  }

  function formatDate(dateString: string) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('he-IL');
  }

  function isOverdue(dueDate: string, done: boolean) {
    if (!dueDate || done) return false;
    return new Date(dueDate) < new Date();
  }

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
        <p>אנא צור אירוע קודם כדי להוסיף משימות לצ'קליסט</p>
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
        borderBottom: '2px solid #E5E7EB',
        paddingBottom: '10px'
      }}>
     משימות
      </h1>



      {/* Add Task Form */}
      <div style={{
        background: '#ffffff',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid black'
     
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>הוסף משימה חדשה</h3>
        <form onSubmit={addTask} style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
    <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              תיאור המשימה *
            </label>
        <input
             
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              הערות
            </label>
        <input
              placeholder="פרטים נוספים על המשימה"
          value={newNotes}
          onChange={e => setNewNotes(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              תאריך יעד
            </label>
        <input
          type="date"
          value={newDueDate}
          onChange={e => setNewDueDate(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              תפקיד אחראי
            </label>
            <select
              value={newRelatedRoleId}
              onChange={e => setNewRelatedRoleId(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">בחר תפקיד אחראי</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>
                  {u.firstName} {u.lastName}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              ספק קשור
            </label>
        <select
          value={newRelatedVendorId}
          onChange={e => setNewRelatedVendorId(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
              <option value="">בחר ספק (אופציונלי)</option>
          {vendors.map(v => (
            <option key={v._id} value={v._id}>
              {v.vendorName}
            </option>
          ))}
        </select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <button 
              type="submit"
             className='button'
            >
              הוסף משימה
            </button>
          </div>
        </form>
      </div>

      {/* Filters */}
      <div style={{
        background: '#ffffff',
        padding: '15px',
      
       
      }}>
        <h4 style={{ margin: '0 0 15px 0' }}>סינון ומיון</h4>
        <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>ספק:</label>
            <select
              value={filters.vendor}
              onChange={e => setFilters({...filters, vendor: e.target.value})}
              style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">כל הספקים</option>
              {vendors.map(v => (
                <option key={v._id} value={v._id}>{v.vendorName}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>תפקיד:</label>
        <select
              value={filters.role}
              onChange={e => setFilters({...filters, role: e.target.value})}
              style={{ width: '100%', padding: '6px',  borderRadius: '4px' }}
        >
              <option value="">כל התפקידים</option>
          {users.map(u => (
                <option key={u._id} value={u._id}>{u.firstName} {u.lastName}</option>
          ))}
        </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>סטטוס:</label>
            <select
              value={filters.status}
              onChange={e => setFilters({...filters, status: e.target.value as any})}
              style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="all">כל המשימות</option>
              <option value="pending">ממתינות</option>
              <option value="done">הושלמו</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>מיון לפי:</label>
            <select
              value={filters.sortBy}
              onChange={e => setFilters({...filters, sortBy: e.target.value as any})}
              style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="dueDate">תאריך יעד</option>
              <option value="createdAt">תאריך יצירה</option>
              <option value="task">שם המשימה</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>סדר:</label>
            <select
              value={filters.sortOrder}
              onChange={e => setFilters({...filters, sortOrder: e.target.value as any})}
              style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="asc">עולה</option>
              <option value="desc">יורד</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid black' }}>
        <div style={{ 
          background: '#f5f5f5', 
          padding: '15px 20px', 
          borderBottom: '1px solid #E5E7EB',
          fontWeight: 'bold'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '30px 2fr 1fr 1fr 1fr 1fr 1fr', gap: '10px' }}>
            <div>✓</div>
            <div>תיאור המשימה</div>
            <div>תפקיד אחראי</div>
            <div>ספק קשור</div>
            <div>תאריך יעד</div>
            <div>סטטוס</div>
            <div>פעולות</div>
          </div>
        </div>

        {filteredAndSortedItems.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            אין משימות לצ'קליסט. הוסף משימה ראשונה!
          </div>
        ) : (
          filteredAndSortedItems.map(item => (
            <div key={item._id} style={{ 
              padding: '15px 20px', 
              borderBottom: '1px solid #eee',
              display: 'grid',
              gridTemplateColumns: '30px 2fr 1fr 1fr 1fr 1fr 1fr',
              gap: '10px',
              alignItems: 'center',
              backgroundColor: isOverdue(item.dueDate || '', item.done) ? '#dbeafe' : 'white'
            }}>
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => toggleDone(item._id)}
                style={{ transform: 'scale(1.2)' }}
              />
              
              <div style={{ 
                textDecoration: item.done ? 'line-through' : 'none',
                color: item.done ? '#666' : '#333',
                fontWeight: 'bold'
              }}>
                {editingItem && editingItem._id === item._id ? (
                  <input
                    value={editingItem.task}
                    onChange={e => setEditingItem({...editingItem, task: e.target.value})}
                    style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '2px' }}
                  />
                ) : (
                  <div>
                    {item.task}
                    {item.notes && (
                      <div style={{ fontSize: '12px', color: '#666', fontWeight: 'normal', marginTop: '2px' }}>
                        {item.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                {editingItem && editingItem._id === item._id ? (
                  <select
                    value={editingItem.relatedRoleId || ''}
                    onChange={e => setEditingItem({...editingItem, relatedRoleId: e.target.value})}
                    style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '2px' }}
                  >
                    <option value="">בחר תפקיד</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>{u.firstName} {u.lastName}</option>
                    ))}
                  </select>
                ) : (
                  users.find(u => u._id === item.relatedRoleId) ? 
                    `${users.find(u => u._id === item.relatedRoleId)?.firstName} ${users.find(u => u._id === item.relatedRoleId)?.lastName}` : 
                    '-'
                )}
              </div>
              
              <div>
                {editingItem && editingItem._id === item._id ? (
                  <select
                    value={editingItem.relatedVendorId || ''}
                    onChange={e => setEditingItem({...editingItem, relatedVendorId: e.target.value})}
                    style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '2px' }}
                  >
                    <option value="">בחר ספק</option>
                    {vendors.map(v => (
                      <option key={v._id} value={v._id}>{v.vendorName}</option>
                    ))}
                  </select>
                ) : (
                  vendors.find(v => v._id === item.relatedVendorId)?.vendorName || '-'
                )}
              </div>
              
              <div>
                {editingItem && editingItem._id === item._id ? (
                  <input
                    type="date"
                    value={editingItem.dueDate || ''}
                    onChange={e => setEditingItem({...editingItem, dueDate: e.target.value})}
                    style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '2px' }}
                  />
                ) : (
                  <div style={{ 
                    color: isOverdue(item.dueDate || '', item.done) ? '#d32f2f' : 'inherit',
                    fontWeight: isOverdue(item.dueDate || '', item.done) ? 'bold' : 'normal'
                  }}>
                    {formatDate(item.dueDate || '')}
                  </div>
                )}
              </div>
              
              <div>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  backgroundColor: getStatusColor(item.done),
                  color: getStatusTextColor(item.done),
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  {getStatusText(item.done)}
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '5px' }}>
                {editingItem && editingItem._id === item._id ? (
                  <>
                    <button 
                      onClick={() => updateTask(editingItem)}
                      style={{ padding: '4px 8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
                    >
                      שמור
                    </button>
                    <button 
                      onClick={cancelEditing}
                      style={{ padding: '4px 8px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
                    >
                      ביטול
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => startEditing(item)}
                      style={{ padding: '4px 8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
                    >
                      ערוך
                    </button>
                    <button 
                      onClick={() => deleteTask(item._id)}
                      style={{ padding: '4px 8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
                    >
                      מחק
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
        border: 'solid black 1px',
          borderRadius: '8px',
        
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}> סיכום משימות</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
            <div><strong>סה"כ משימות:</strong> {items.length}</div>
            <div><strong>הושלמו:</strong> {items.filter(i => i.done).length}</div>
            <div><strong>ממתינות:</strong> {items.filter(i => !i.done).length}</div>
            <div><strong>איחור:</strong> {items.filter(i => isOverdue(i.dueDate || '', i.done)).length}</div>
            <div><strong>אחוז השלמה:</strong> {Math.round((items.filter(i => i.done).length / items.length) * 100)}%</div>
          </div>
        </div>
      )}
    </div>
  );
}
