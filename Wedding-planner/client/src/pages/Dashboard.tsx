import React, { useState, useEffect } from "react";
import Menu from "../components/Menu/Menu";
import GuestListPage from "./GuestListPage";
import VendorsListPage from "./VendorPage";
import WeddingPage from "./WeedingPage";
import CheckListPage from "./CheckListPage";
import BudgetPage from "./BudgetPage";

export default function Dashboard() {
  // 🔥 כאן שיניתי את ה-state הראשוני ל-"wedding"
  const [selectedSection, setSelectedSection] = useState<string>("wedding");
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);

  useEffect(() => {
    const currentUserRaw = localStorage.getItem("currentUser");
    if (currentUserRaw) {
      try {
        const currentUser = JSON.parse(currentUserRaw);
        const name =
          currentUser.firstName && currentUser.lastName
            ? `${currentUser.firstName} ${currentUser.lastName}`
            : currentUser.name || null;
        setCurrentUserName(name);
      } catch {
        setCurrentUserName(null);
      }
    }
  }, []);

  const renderSection = () => {
    switch (selectedSection) {
      case "guestList":
        return <GuestListPage />;
      case "vendorsList":
        return <VendorsListPage />;
      case "wedding":
        return <WeddingPage />;
      case "checklist":
        return <CheckListPage />;
      case "budget":
        return <BudgetPage />;
      default:
        return <BudgetPage />;
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: "#000" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
          borderBottom: "1px solid black",
          marginBottom: 20,
          direction: "rtl",
        }}
      >
        <Menu onSelect={setSelectedSection} currentUserName={currentUserName} />

        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("currentUser");
            window.location.href = "/";
          }}
          style={{
            background: "none",
            border: "none",
            padding: "0 10px",
            fontSize: "16px",
            cursor: "pointer",
            color: "black",
          }}
        >
          התנתקות
        </button>
      </header>

      <main style={{ padding: "0 20px" }}>{renderSection()}</main>
    </div>
  );
}
