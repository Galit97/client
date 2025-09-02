import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotificationProvider } from "./components/Notification/NotificationContext";
import FirstPage from "./pages/FirstPage";
import MainDashboard from "./pages/MainDashboard";
import InviteAcceptPage from "./pages/invite/InviteAcceptPage";
import VendorPage from "./pages/VendorPage";
import BudgetPage from "./pages/BudgetPage";
import BudgetOverview from "./pages/BudgetOverview";
import GuestListPage from "./pages/GuestListPage";
import CheckListPage from "./pages/CheckListPage";
import VendorComparisonPage from "./pages/VendorComparisonPage";
import VenueComparisonPage from "./pages/VenueComparisonPage";
import ImportantThingsPage from "./pages/ImportantThingsPage";
import WeddingDayPage from "./pages/WeddingDayPage";
import MyWeddings from "./pages/MyWeddings";
import WeedingPage from "./pages/WeedingPage";
import AccountSettings from "./pages/account/AccountSettings";

export default function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<FirstPage />} />
          <Route path="/dashboard" element={<MainDashboard />} />
          <Route path="/invite/:token" element={<InviteAcceptPage />} />
          
          {/* Vendor Management */}
          <Route path="/vendors" element={<VendorPage />} />
          
          {/* Budget Management */}
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/budget-overview" element={<BudgetOverview />} />
          
          {/* Guest Management */}
          <Route path="/guests" element={<GuestListPage />} />
          
          {/* Checklist Management */}
          <Route path="/checklist" element={<CheckListPage />} />
          
          {/* Comparison Pages */}
          <Route path="/vendor-comparison" element={<VendorComparisonPage />} />
          <Route path="/venue-comparison" element={<VenueComparisonPage />} />
          
          {/* Special Lists */}
          <Route path="/important-things" element={<ImportantThingsPage />} />
          <Route path="/wedding-day" element={<WeddingDayPage />} />
          
          {/* Wedding Management */}
          <Route path="/my-weddings" element={<MyWeddings />} />
          <Route path="/wedding" element={<WeedingPage />} />
          
          {/* Account Settings */}
          <Route path="/account" element={<AccountSettings />} />
          
          {/* Catch-all route for SPA */}
          <Route path="*" element={<MainDashboard />} />
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
}
