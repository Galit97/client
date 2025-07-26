import React, { useState, useEffect } from "react";
import Menu from "../components/Menu/Menu";
import GuestListPage from "./GuestListPage";
import VendorsListPage from "./VendorPage";
import WeddingPage from "./WeedingPage";
import CheckListPage from "./CheckListPage";

export default function Dashboard() {
  const [selectedSection, setSelectedSection] = useState<string>("guestList");
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);

  useEffect(() => {
    const currentUserRaw = localStorage.getItem("currentUser");
    if (currentUserRaw) {
      try {
        const currentUser = JSON.parse(currentUserRaw);
        // נניח שהשם מלא מאוחד בשדות firstName + lastName
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
      default:
        return <h2>בחר סעיף</h2>;
    }
  };

  return (
    <div>
      <header style={{ marginBottom: 20 }}>
        {currentUserName && <p>שלום, {currentUserName}</p>}
        <Menu onSelect={setSelectedSection} />
      </header>

      <main>{renderSection()}</main>
    </div>
  );
}
