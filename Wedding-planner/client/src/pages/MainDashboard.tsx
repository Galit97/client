import { useState, useEffect } from "react";
import Menu from "../components/Menu/Menu";
import GuestListPage from "./GuestListPage";
import VendorPage from "./VendorPage";
import WeedingPage from "./WeedingPage";
import CheckListPage from "./CheckListPage";
import BudgetPage from "./BudgetPage";
import Dashboard from "./Dashboard";
import VendorComparisonPage from "./VendorComparisonPage";
import VenueComparisonPage from "./VenueComparisonPage";
import AccountSettings from "./account/AccountSettings";
import MyWeddings from "./weddings/MyWeddings";
import ImportantThingsPage from "./ImportantThingsPage";
import WeddingDayPage from "./WeddingDayPage";

export default function MainDashboard() {
  const [selectedSection, setSelectedSection] = useState<string>("dashboard");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    window.location.href = "/";
  };

  const renderSection = () => {
    switch (selectedSection) {
      case "dashboard":
        return <Dashboard />;
      case "eventSettings":
        return <WeedingPage />;
      case "guestList":
        return <GuestListPage />;
      case "vendors":
        return <VendorPage />;
      case "budget":
        return <BudgetPage />;
      case "vendorCompare":
        return <VendorComparisonPage />;
      case "venueCompare":
        return <VenueComparisonPage />;
      case "checklist":
        return <CheckListPage />;
      case "importantThings":
        return <ImportantThingsPage />;
      case "weddingDay":
        return <WeddingDayPage />;
      case "accountSettings":
        return <AccountSettings />;
      case "myWeddings":
        return <MyWeddings onOpenWedding={() => setSelectedSection('dashboard')} />;
      default:
        return <Dashboard />;
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
          flexWrap: "wrap",
          gap: "10px",
        }}
        className="dashboard-header"
      >
        <Menu 
          onSelect={setSelectedSection} 
          onLogout={handleLogout}
        />

        <button
          onClick={handleLogout}
          style={{
            background: "none",
            border: "none",
            padding: "8px 12px",
            fontSize: "16px",
            cursor: "pointer",
            color: "black",
            borderRadius: "4px",
            transition: "background-color 0.2s ease",
          }}
          className="logout-button desktop-logout"
        >
          התנתקות
        </button>
      </header>

      <main style={{ padding: "0 20px" }}>{renderSection()}</main>

      <style>{`
        @media (max-width: 768px) {
          .dashboard-header {
            padding: 10px 15px !important;
            flex-direction: row !important;
            justify-content: space-between !important;
          }
          .desktop-logout {
            display: none !important;
          }
        }
        @media (max-width: 480px) {
          .dashboard-header {
            padding: 8px 10px !important;
          }
        }
      `}</style>
    </div>
  );
} 