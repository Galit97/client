import { BrowserRouter, Routes, Route } from "react-router-dom";
import FirstPage from "./pages/FirstPage";
import MainDashboard from "./pages/MainDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FirstPage />} />
        <Route path="/dashboard" element={<MainDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
