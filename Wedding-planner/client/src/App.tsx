import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotificationProvider } from "./components/Notification/NotificationContext";
import FirstPage from "./pages/FirstPage";
import MainDashboard from "./pages/MainDashboard";
import InviteAcceptPage from "./pages/invite/InviteAcceptPage";

export default function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<FirstPage />} />
          <Route path="/dashboard" element={<MainDashboard />} />
          <Route path="/invite/:token" element={<InviteAcceptPage />} />
          
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
}
