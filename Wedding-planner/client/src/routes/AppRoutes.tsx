import { BrowserRouter, Routes, Route } from "react-router-dom";
import FirstPage from "../pages/FirstPage";

import Dashboard from "../pages/dashboard";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FirstPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
