import React, { useEffect, useState, useMemo } from "react";

type VendorStatus = "Pending" | "Confirmed" | "Paid";
type VendorType = "music" | "food" | "photography" | "decor" | "other";

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

type SortKey = "vendorName" | "price";
type SortOrder = "asc" | "desc";

export default function VendorsListPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [newVendor, setNewVendor] = useState({
    vendorName: "",
    price: 0,
    notes: "",
    contractURL: "",
    proposalURL: "",
    status: "Pending" as VendorStatus,
    type: "music" as VendorType,
  });

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("vendorName");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // לשמור מי בעריכה כרגע, לפי id של הספק
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  // סטייט לעריכת השדות של ספק בעריכה
  const [editingVendorData, setEditingVendorData] = useState<Partial<Vendor>>(
    {}
  );

  useEffect(() => {
    async function fetchVendors() {
      try {
        const res = await fetch("/api/vendors");
        if (!res.ok) throw new Error("Failed to fetch vendors");
        const data = await res.json();
        setVendors(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchVendors();
  }, []);

  async function addVendor(e: React.FormEvent) {
    e.preventDefault();
    if (!newVendor.vendorName.trim()) return alert("אנא הכנס שם ספק");

    try {
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVendor),
      });
      if (!res.ok) throw new Error("Failed to add vendor");
      const created = await res.json();
      setVendors((prev) => [...prev, created]);
      setNewVendor({
        vendorName: "",
        price: 0,
        notes: "",
        contractURL: "",
        proposalURL: "",
        status: "Pending",
        type: "music",
      });
    } catch (err) {
      console.error(err);
      alert("אירעה שגיאה בהוספת הספק");
    }
  }

  async function updateStatus(id: string, status: VendorStatus) {
    try {
      const res = await fetch(`/api/vendors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setVendors((prev) =>
        prev.map((v) => (v._id === id ? { ...v, status } : v))
      );
    } catch (err) {
      console.error(err);
      alert("אירעה שגיאה בעדכון הסטטוס");
    }
  }

  async function deleteVendor(id: string) {
    try {
      const res = await fetch(`/api/vendors/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete vendor");
      setVendors((prev) => prev.filter((v) => v._id !== id));
    } catch (err) {
      console.error(err);
      alert("אירעה שגיאה במחיקת הספק");
    }
  }

  // שמירת עריכה
  async function saveEdit(id: string) {
    try {
      const res = await fetch(`/api/vendors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingVendorData),
      });
      if (!res.ok) throw new Error("Failed to save edits");
      const updated = await res.json();
      setVendors((prev) => prev.map((v) => (v._id === id ? updated : v)));
      setEditingVendorId(null);
      setEditingVendorData({});
    } catch (err) {
      console.error(err);
      alert("אירעה שגיאה בשמירת העריכה");
    }
  }

  const filteredSortedVendors = useMemo(() => {
    let filtered = vendors.filter((v) =>
      v.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    filtered.sort((a, b) => {
      let valA: string | number = a[sortKey];
      let valB: string | number = b[sortKey];
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [vendors, searchTerm, sortKey, sortOrder]);

  const totalPrice = useMemo(() => {
    return filteredSortedVendors.reduce((sum, v) => sum + v.price, 0);
  }, [filteredSortedVendors]);

  return (
    <div
      style={{ maxWidth: 900, margin: "auto", fontFamily: "Arial, sans-serif" }}
    >
      <h1>ניהול ספקים</h1>

      <form
        onSubmit={addVendor}
        style={{ marginBottom: 20, display: "flex", flexWrap: "wrap", gap: 8 }}
      >
        <input
          placeholder="שם ספק"
          value={newVendor.vendorName}
          onChange={(e) =>
            setNewVendor({ ...newVendor, vendorName: e.target.value })
          }
          required
          style={{ flex: "1 1 200px", padding: 6 }}
        />
        <input
          type="number"
          placeholder="מחיר"
          value={newVendor.price}
          onChange={(e) =>
            setNewVendor({ ...newVendor, price: Number(e.target.value) })
          }
          required
          style={{ width: 100, padding: 6 }}
          min={0}
        />
        <input
          placeholder="הערות"
          value={newVendor.notes}
          onChange={(e) =>
            setNewVendor({ ...newVendor, notes: e.target.value })
          }
          style={{ flex: "1 1 200px", padding: 6 }}
        />
        <input
          placeholder="קישור חוזה"
          value={newVendor.contractURL}
          onChange={(e) =>
            setNewVendor({ ...newVendor, contractURL: e.target.value })
          }
          style={{ flex: "1 1 200px", padding: 6 }}
        />
        <input
          placeholder="קישור הצעה"
          value={newVendor.proposalURL}
          onChange={(e) =>
            setNewVendor({ ...newVendor, proposalURL: e.target.value })
          }
          style={{ flex: "1 1 200px", padding: 6 }}
        />
        <select
          value={newVendor.status}
          onChange={(e) =>
            setNewVendor({
              ...newVendor,
              status: e.target.value as VendorStatus,
            })
          }
          style={{ padding: 6 }}
        >
          <option value="Pending">ממתין</option>
          <option value="Confirmed">אושר</option>
          <option value="Paid">שולם</option>
        </select>
        <select
          value={newVendor.type}
          onChange={(e) =>
            setNewVendor({ ...newVendor, type: e.target.value as VendorType })
          }
          required
          style={{ padding: 6 }}
        >
          <option value="music">מוזיקה</option>
          <option value="food">אוכל</option>
          <option value="photography">צילום</option>
          <option value="decor">קישוט</option>
          <option value="other">אחר</option>
        </select>
        <button type="submit" style={{ padding: "6px 12px" }}>
          הוסף ספק
        </button>
      </form>

      <div
        style={{
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <input
          type="text"
          placeholder="חפש לפי שם ספק"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, padding: 6 }}
        />
        <label>
          מיין לפי:&nbsp;
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
          >
            <option value="vendorName">שם ספק</option>
            <option value="price">מחיר</option>
          </select>
        </label>
        <label>
          סדר:&nbsp;
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
          >
            <option value="asc">עולה</option>
            <option value="desc">יורד</option>
          </select>
        </label>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>שם ספק</th>
            <th style={{ border: "1px solid #ddd", padding: 8, width: 120 }}>
              מחיר (₪)
            </th>
            <th style={{ border: "1px solid #ddd", padding: 8, width: 120 }}>
              סוג ספק
            </th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>הערות</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>קישור חוזה</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>קישור הצעה</th>
            <th style={{ border: "1px solid #ddd", padding: 8, width: 120 }}>
              סטטוס
            </th>
            <th style={{ border: "1px solid #ddd", padding: 8, width: 80 }}>
              פעולות
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredSortedVendors.map((vendor) => {
            const isEditing = editingVendorId === vendor._id;
            return (
              <tr key={vendor._id}>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>
                  {isEditing ? (
                    <input
                      value={editingVendorData.vendorName ?? vendor.vendorName}
                      onChange={(e) =>
                        setEditingVendorData((prev) => ({
                          ...prev,
                          vendorName: e.target.value,
                        }))
                      }
                      style={{ width: "100%" }}
                    />
                  ) : (
                    vendor.vendorName
                  )}
                </td>
                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: 8,
                    textAlign: "right",
                  }}
                >
                  {isEditing ? (
                    <input
                      type="number"
                      min={0}
                      value={editingVendorData.price ?? vendor.price}
                      onChange={(e) =>
                        setEditingVendorData((prev) => ({
                          ...prev,
                          price: Number(e.target.value),
                        }))
                      }
                      style={{ width: "100px" }}
                    />
                  ) : (
                    vendor.price.toLocaleString()
                  )}
                </td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>
                  {isEditing ? (
                    <select
                      value={editingVendorData.type ?? vendor.type}
                      onChange={(e) =>
                        setEditingVendorData((prev) => ({
                          ...prev,
                          type: e.target.value as VendorType,
                        }))
                      }
                    >
                      <option value="music">מוזיקה</option>
                      <option value="food">אוכל</option>
                      <option value="photography">צילום</option>
                      <option value="decor">קישוט</option>
                      <option value="other">אחר</option>
                    </select>
                  ) : (
                    vendor.type
                  )}
                </td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>
                  {isEditing ? (
                    <input
                      value={editingVendorData.notes ?? vendor.notes ?? ""}
                      onChange={(e) =>
                        setEditingVendorData((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      style={{ width: "100%" }}
                    />
                  ) : (
                    vendor.notes || "-"
                  )}
                </td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>
                  {isEditing ? (
                    <input
                      value={
                        editingVendorData.contractURL ??
                        vendor.contractURL ??
                        ""
                      }
                      onChange={(e) =>
                        setEditingVendorData((prev) => ({
                          ...prev,
                          contractURL: e.target.value,
                        }))
                      }
                      style={{ width: "100%" }}
                    />
                  ) : vendor.contractURL ? (
                    <a
                      href={vendor.contractURL}
                      target="_blank"
                      rel="noreferrer"
                    >
                      קישור
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>
                  {isEditing ? (
                    <input
                      value={
                        editingVendorData.proposalURL ??
                        vendor.proposalURL ??
                        ""
                      }
                      onChange={(e) =>
                        setEditingVendorData((prev) => ({
                          ...prev,
                          proposalURL: e.target.value,
                        }))
                      }
                      style={{ width: "100%" }}
                    />
                  ) : vendor.proposalURL ? (
                    <a
                      href={vendor.proposalURL}
                      target="_blank"
                      rel="noreferrer"
                    >
                      קישור
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td style={{ border: "1px solid #ddd", padding: 8 }}>
                  {isEditing ? (
                    <select
                      value={editingVendorData.status ?? vendor.status}
                      onChange={(e) =>
                        setEditingVendorData((prev) => ({
                          ...prev,
                          status: e.target.value as VendorStatus,
                        }))
                      }
                    >
                      <option value="Pending">ממתין</option>
                      <option value="Confirmed">אושר</option>
                      <option value="Paid">שולם</option>
                    </select>
                  ) : (
                    vendor.status
                  )}
                </td>
                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: 8,
                    textAlign: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => {
                          if (
                            !editingVendorData.vendorName ||
                            editingVendorData.vendorName.trim() === ""
                          ) {
                            alert("שם הספק הוא שדה חובה");
                            return;
                          }
                          saveEdit(vendor._id);
                        }}
                        style={{ marginRight: 6 }}
                      >
                        שמור
                      </button>
                      <button
                        onClick={() => {
                          setEditingVendorId(null);
                          setEditingVendorData({});
                        }}
                      >
                        ביטול
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingVendorId(vendor._id);
                          setEditingVendorData(vendor);
                        }}
                        style={{ marginRight: 6 }}
                      >
                        ערוך
                      </button>
                      <button onClick={() => deleteVendor(vendor._id)}>
                        מחק
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
          {filteredSortedVendors.length === 0 && (
            <tr>
              <td colSpan={8} style={{ textAlign: "center", padding: 12 }}>
                לא נמצאו ספקים
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ marginTop: 20, fontWeight: "bold", fontSize: 18 }}>
        סכום כולל של הספקים בטבלה: ₪{totalPrice.toLocaleString()}
      </div>
    </div>
  );
}
