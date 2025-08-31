import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Menu from "../components/Menu/Menu";
import BottomNav from "../components/BottomNav/BottomNav";
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
import wediLogo from "../assets/images/wedi-app-logo.png";
import "../styles/Dashboard.css";

export default function MainDashboard() {
  const [searchParams] = useSearchParams();
  const sectionParam = searchParams.get('section');
  const [selectedSection, setSelectedSection] = useState<string>(sectionParam || "dashboard");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    window.location.href = "/";
  };

  // Handle navigation from dashboard to event settings (keep for share icon)
  useEffect(() => {
    const handleNavigateToEventSettings = () => {
      setSelectedSection("eventSettings");
    };

    window.addEventListener('navigateToEventSettings', handleNavigateToEventSettings);
    
    return () => {
      window.removeEventListener('navigateToEventSettings', handleNavigateToEventSettings);
    };
  }, []);

  const renderSection = () => {
    switch (selectedSection) {
      case "dashboard":
        return <Dashboard onNavigate={setSelectedSection} />;
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
        <div style={{
          flex: 1,
          display: "flex",
          justifyContent: "flex-start"
        }}>
          <Menu 
            onSelect={setSelectedSection} 
            onLogout={handleLogout}
          />
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <img 
            src={wediLogo} 
            alt="Wedi App Logo" 
            style={{
              width: '80px',
              height: 'auto',
              maxHeight: '80px'
            }}
          />
        </div>
        <div style={{
          flex: 1
        }}></div>
      </header>

      <main style={{ padding: "0 20px", paddingBottom: "80px" }}>{renderSection()}</main>

      {/* Bottom Navigation */}
      <BottomNav onSelect={setSelectedSection} currentSection={selectedSection} />

      <style>{`
        @media (max-width: 768px) {
          .dashboard-header {
            padding: 10px 15px !important;
            flex-direction: row !important;
            justify-content: space-between !important;
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