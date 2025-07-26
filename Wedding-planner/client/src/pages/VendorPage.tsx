import React, { useEffect, useState } from 'react';

type VendorStatus = 'Pending' | 'Confirmed' | 'Paid';
type VendorType = 'music' | 'food' | 'photography' | 'decor' | 'other';

type Vendor = {
  _id: string;
  weddingID: string;
  vendorName: string;
  price: number;
  notes?: string;
  contractURL?: string;
  proposalURL?: string;
  status: VendorStatus;
  type: VendorType;
};

export default function VendorsListPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [newVendor, setNewVendor] = useState({
    vendorName: '',
    price: 0,
    notes: '',
    contractURL: '',
    proposalURL: '',
    status: 'Pending' as VendorStatus,
    type: 'music' as VendorType,
  });

  useEffect(() => {
    async function fetchVendors() {
      const res = await fetch('/api/vendors');
      const data = await res.json();
      setVendors(data);
    }
    fetchVendors();
  }, []);

  async function addVendor(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newVendor),
    });
    const created = await res.json();
    setVendors([...vendors, created]);
    setNewVendor({
      vendorName: '',
      price: 0,
      notes: '',
      contractURL: '',
      proposalURL: '',
      status: 'Pending',
      type: 'music',
    });
  }

  async function updateStatus(id: string, status: VendorStatus) {
    await fetch(`/api/vendors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setVendors(vendors.map(v => (v._id === id ? { ...v, status } : v)));
  }

  async function deleteVendor(id: string) {
    await fetch(`/api/vendors/${id}`, { method: 'DELETE' });
    setVendors(vendors.filter(v => v._id !== id));
  }

  return (
    <div>
      <h1>ניהול ספקים</h1>

      <form onSubmit={addVendor}>
        <input
          placeholder="שם ספק"
          value={newVendor.vendorName}
          onChange={e => setNewVendor({ ...newVendor, vendorName: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="מחיר"
          value={newVendor.price}
          onChange={e => setNewVendor({ ...newVendor, price: Number(e.target.value) })}
          required
        />
        <input
          placeholder="הערות"
          value={newVendor.notes}
          onChange={e => setNewVendor({ ...newVendor, notes: e.target.value })}
        />
        <input
          placeholder="קישור חוזה"
          value={newVendor.contractURL}
          onChange={e => setNewVendor({ ...newVendor, contractURL: e.target.value })}
        />
        <input
          placeholder="קישור הצעה"
          value={newVendor.proposalURL}
          onChange={e => setNewVendor({ ...newVendor, proposalURL: e.target.value })}
        />
        <select
          value={newVendor.status}
          onChange={e => setNewVendor({ ...newVendor, status: e.target.value as VendorStatus })}
        >
          <option value="Pending">ממתין</option>
          <option value="Confirmed">אושר</option>
          <option value="Paid">שולם</option>
        </select>
        <select
          value={newVendor.type}
          onChange={e => setNewVendor({ ...newVendor, type: e.target.value as VendorType })}
          required
        >
          <option value="music">מוזיקה</option>
          <option value="food">אוכל</option>
          <option value="photography">צילום</option>
          <option value="decor">קישוט</option>
          <option value="other">אחר</option>
        </select>
        <button type="submit">הוסף ספק</button>
      </form>

      <ul>
        {vendors.map(vendor => (
          <li key={vendor._id}>
            {vendor.vendorName} - {vendor.type} - {vendor.price} ש"ח
            <select
              value={vendor.status}
              onChange={e => updateStatus(vendor._id, e.target.value as VendorStatus)}
            >
              <option value="Pending">ממתין</option>
              <option value="Confirmed">אושר</option>
              <option value="Paid">שולם</option>
            </select>
            <button onClick={() => deleteVendor(vendor._id)}>מחק</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
