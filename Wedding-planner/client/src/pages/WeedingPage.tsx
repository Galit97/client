import React, { useState, useEffect } from "react";

type Participant = {
  id: string;
  name: string;
};

type WeddingStatus =
  | "Planning"
  | "Confirmed"
  | "Cancelled"
  | "Finished"
  | "Postponed";

type WeddingData = {
  _id?: string;
  weddingName: string;
  weddingDate: string;
  startTime?: string;
  location?: string;
  addressDetails?: string;
  budget?: number;
  notes?: string;
  status: WeddingStatus;
  participants: Participant[];
};

const initialWedding: WeddingData = {
  weddingName: "",
  weddingDate: "",
  startTime: "",
  location: "",
  addressDetails: "",
  budget: 0,
  notes: "",
  status: "Planning",
  participants: [],
};

export default function WeddingPage() {
  const [wedding, setWedding] = useState<WeddingData>(initialWedding);
  const [allUsers, setAllUsers] = useState<Participant[]>([]);
  const [selectedParticipantId, setSelectedParticipantId] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error(res.statusText);
        const users = await res.json();
        setAllUsers(
          users.map((u: any) => ({
            id: u._id,
            name: `${u.firstName} ${u.lastName}`,
          }))
        );
      } catch (error) {
        console.error("שגיאה בשליפת משתמשים", error);
      }
    }

    async function fetchWedding() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("/api/weddings/owner", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 404) {
          setWedding(initialWedding);
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch wedding");

        const data = await res.json();

        const participants = (data.participants || []).map((p: any) =>
          typeof p === "string"
            ? { id: p, name: "" }
            : { id: p._id || p.id, name: p.name || "" }
        );

        setWedding({ ...data, participants });
      } catch (error) {
        console.error("שגיאה בשליפת אירוע", error);
      }
    }

    fetchUsers();
    fetchWedding();
  }, []);

  function handleInputChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;
    setWedding((prev) => ({
      ...prev,
      [name]: name === "budget" ? Number(value) : value,
    }));
  }

  function handleAddParticipant() {
    if (!selectedParticipantId) return;
    if (wedding.participants.some((p) => p.id === selectedParticipantId)) return;

    const participant = allUsers.find((u) => u.id === selectedParticipantId);
    if (!participant) return;

    setWedding((prev) => ({
      ...prev,
      participants: [...prev.participants, participant],
    }));
    setSelectedParticipantId("");
  }

  function handleRemoveParticipant(id: string) {
    setWedding((prev) => ({
      ...prev,
      participants: prev.participants.filter((p) => p.id !== id),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const currentUserRaw = localStorage.getItem("currentUser");
    const token = localStorage.getItem("token");
    const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;

    if (!currentUser || !currentUser._id) {
      alert("לא מזוהה משתמש מחובר");
      return;
    }

    const participantIds = wedding.participants.map((p) => p.id);
    if (!participantIds.includes(currentUser._id)) participantIds.push(currentUser._id);

    const weddingToSave = {
      weddingName: wedding.weddingName,
      weddingDate: wedding.weddingDate,
      startTime: wedding.startTime,
      location: wedding.location,
      addressDetails: wedding.addressDetails,
      budget: wedding.budget,
      notes: wedding.notes,
      status: wedding.status,
      ownerID: currentUser._id,
      participants: participantIds,
    };

    try {
      let res;
      if (wedding._id) {
        res = await fetch(`/api/weddings/${wedding._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(weddingToSave),
        });
      } else {
        res = await fetch("/api/weddings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(weddingToSave),
        });
      }

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ שגיאה בשמירת אירוע:", text);
        return;
      }

      const saved = await res.json();
      console.log("✅ אירוע נשמר בהצלחה:", saved);
      setWedding(saved);
    } catch (error) {
      console.error("❌ שגיאה בשמירת אירוע:", error);
    }
  }

  return (
    <div
      dir="rtl"
      style={{ textAlign: "right", fontFamily: "Arial, sans-serif", color: "#000" }}
    >
      <h1 style={{ borderBottom: "1px solid black", paddingBottom: 10 }}>האירוע שלנו</h1>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "flex",
            gap: 15,
            flexWrap: "wrap",
            alignItems: "flex-start",
            marginBottom: 20,
          }}
        >
          <label style={{ flex: "1 1 200px" }}>
            שם האירוע:
            <input
              name="weddingName"
              value={wedding.weddingName}
              onChange={handleInputChange}
              placeholder="הכנס שם אירוע"
              required
              style={{ width: "100%", marginTop: 4, padding: 6, border: "1px solid black" }}
            />
          </label>

          <label style={{ flex: "1 1 140px" }}>
            תאריך האירוע:
            <input
              name="weddingDate"
              type="date"
              value={wedding.weddingDate}
              onChange={handleInputChange}
              required
              style={{ width: "100%", marginTop: 4, padding: 6, border: "1px solid black" }}
            />
          </label>

          <label style={{ flex: "1 1 120px" }}>
            שעה התחלה:
            <input
              name="startTime"
              type="time"
              value={wedding.startTime}
              onChange={handleInputChange}
              style={{ width: "100%", marginTop: 4, padding: 6, border: "1px solid black" }}
            />
          </label>

          <label style={{ flex: "1 1 180px" }}>
            מיקום:
            <input
              name="location"
              value={wedding.location}
              onChange={handleInputChange}
              placeholder="הכנס מיקום"
              style={{ width: "100%", marginTop: 4, padding: 6, border: "1px solid black" }}
            />
          </label>

          <label style={{ flex: "1 1 250px" }}>
            פרטים נוספים לכתובת:
            <textarea
              name="addressDetails"
              value={wedding.addressDetails}
              onChange={handleInputChange}
              placeholder="פרטים נוספים לכתובת"
              rows={1}
              style={{ width: "100%", marginTop: 4, padding: 6, border: "1px solid black" }}
            />
          </label>

          <label style={{ flex: "1 1 120px" }}>
            תקציב:
            <input
              name="budget"
              type="number"
              min={0}
              value={wedding.budget}
              onChange={handleInputChange}
              placeholder="הכנס תקציב"
              style={{ width: "100%", marginTop: 4, padding: 6, border: "1px solid black" }}
            />
          </label>

          <label style={{ flex: "1 1 180px" }}>
            סטטוס:
            <select
              name="status"
              value={wedding.status}
              onChange={handleInputChange}
              style={{ width: "100%", marginTop: 4, padding: 6, border: "1px solid black" }}
            >
              <option value="" disabled>
                בחר סטטוס
              </option>
              <option value="Planning">מתכננים</option>
              <option value="Confirmed">מאושר</option>
              <option value="Cancelled">מבוטל</option>
              <option value="Finished">הושלם</option>
              <option value="Postponed">נדחה</option>
            </select>
          </label>

          <label style={{ flex: "1 1 200px" }}>
            הערות:
            <textarea
              name="notes"
              value={wedding.notes}
              onChange={handleInputChange}
              placeholder="הכנס הערות"
              rows={1}
              style={{ width: "100%", marginTop: 4, padding: 6, border: "1px solid black" }}
            />
          </label>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <select
            value={selectedParticipantId}
            onChange={(e) => setSelectedParticipantId(e.target.value)}
            style={{ padding: 6, border: "1px solid black", flexGrow: 1 }}
          >
            <option value="">בחר שותף להוספה</option>
            {allUsers
              .filter((u) => !wedding.participants.some((p) => p.id === u.id))
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
          </select>
          <button
            type="button"
            onClick={handleAddParticipant}
            style={{ padding: "6px 12px", border: "1px solid black", background: "white", cursor: "pointer" }}
          >
            הוסף שותף
          </button>
        </div>

        <ul style={{ marginBottom: 20, paddingInlineStart: 0 }}>
          {wedding.participants.map((p) => (
            <li
              key={p.id}
              style={{
                listStyle: "none",
                marginBottom: 6,
                display: "flex",
                justifyContent: "space-between",
                borderBottom: "1px solid #ddd",
                paddingBottom: 4,
              }}
            >
              <span>{p.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveParticipant(p.id)}
                style={{ padding: "2px 8px", border: "1px solid black", background: "white", cursor: "pointer" }}
              >
                הסר
              </button>
            </li>
          ))}
        </ul>

        <button
          type="submit"
          style={{
            padding: "8px 16px",
            border: "1px solid black",
            background: "white",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          שמור אירוע
        </button>
      </form>

      <hr style={{ margin: "30px 0", borderColor: "black" }} />

      <section>
        <h2 style={{ marginBottom: 10 }}>פרטי האירוע</h2>
        <div style={{ lineHeight: 1.6 }}>
          <div>
            <strong>שם האירוע:</strong> {wedding.weddingName || "-"}
          </div>
          <div>
            <strong>תאריך האירוע:</strong> {wedding.weddingDate || "-"}
          </div>
          <div>
            <strong>שעת התחלה:</strong> {wedding.startTime || "-"}
          </div>
          <div>
            <strong>מיקום:</strong> {wedding.location || "-"}
          </div>
          <div>
            <strong>פרטים נוספים לכתובת:</strong> {wedding.addressDetails || "-"}
          </div>
          <div>
            <strong>תקציב:</strong> {wedding.budget ? wedding.budget + " ₪" : "-"}
          </div>
          <div>
            <strong>סטטוס:</strong> {wedding.status}
          </div>
          <div>
            <strong>הערות:</strong> {wedding.notes || "-"}
          </div>
          <div>
            <strong>שותפים לאירוע:</strong>{" "}
            {wedding.participants.length > 0
              ? wedding.participants.map((p) => p.name).join(", ")
              : "-"}
          </div>
        </div>
      </section>
    </div>
  );
}
