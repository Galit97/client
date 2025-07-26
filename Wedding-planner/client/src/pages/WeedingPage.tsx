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
        const response = await fetch("/api/users");
        if (!response.ok) {
          console.error("שגיאה בשליפת משתמשים", response.statusText);
          return;
        }
        const users = await response.json();
        setAllUsers(
          users.map((u: any) => ({
            id: u._id,
            name: `${u.firstName} ${u.lastName}`,
          }))
        );
      } catch (err) {
        console.error("שגיאה בבקשת המשתמשים", err);
      }
    }
    fetchUsers();
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
    if (wedding.participants.some((p) => p.id === selectedParticipantId))
      return;

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
    if (!participantIds.includes(currentUser._id)) {
      participantIds.push(currentUser._id);
    }

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

    const res = await fetch("/api/weddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(weddingToSave),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ שגיאה בשמירת אירוע:", text);
      return;
    }

    const saved = await res.json();
    console.log("✅ אירוע נשמר בהצלחה:", saved);
  }

  return (
    <div>
      <h1>האירוע שלנו</h1>
      <form onSubmit={handleSubmit}>
        <label>
          שם האירוע:
          <input
            name="weddingName"
            value={wedding.weddingName}
            onChange={handleInputChange}
            placeholder="הכנס שם אירוע"
            required
          />
        </label>

        <label>
          תאריך האירוע:
          <input
            name="weddingDate"
            type="date"
            value={wedding.weddingDate}
            onChange={handleInputChange}
            placeholder="בחר תאריך"
            required
          />
        </label>

        <label>
          שעה התחלה:
          <input
            name="startTime"
            type="time"
            value={wedding.startTime}
            onChange={handleInputChange}
            placeholder="בחר שעה"
          />
        </label>

        <label>
          מיקום:
          <input
            name="location"
            value={wedding.location}
            onChange={handleInputChange}
            placeholder="הכנס מיקום"
          />
        </label>

        <label>
          פרטים נוספים לכתובת:
          <textarea
            name="addressDetails"
            value={wedding.addressDetails}
            onChange={handleInputChange}
            placeholder="פרטים נוספים לכתובת"
          />
        </label>

        <label>
          תקציב:
          <input
            name="budget"
            type="number"
            min={0}
            value={wedding.budget}
            onChange={handleInputChange}
            placeholder="הכנס תקציב"
          />
        </label>

        <label>
          סטטוס:
          <select
            name="status"
            value={wedding.status}
            onChange={handleInputChange}
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

        <label>
          הערות:
          <textarea
            name="notes"
            value={wedding.notes}
            onChange={handleInputChange}
            placeholder="הכנס הערות"
          />
        </label>

        <hr />
        <h2>שותפים לאירוע</h2>
        <select
          value={selectedParticipantId}
          onChange={(e) => setSelectedParticipantId(e.target.value)}
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
        <button type="button" onClick={handleAddParticipant}>
          הוסף שותף
        </button>

        <ul>
          {wedding.participants.map((p) => (
            <li key={p.id}>
              {p.name}{" "}
              <button
                type="button"
                onClick={() => handleRemoveParticipant(p.id)}
              >
                הסר
              </button>
            </li>
          ))}
        </ul>

        <button type="submit">שמור אירוע</button>
      </form>
    </div>
  );
}
