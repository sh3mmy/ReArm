// src/App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Navigation from "./components/Navigation";

// Pages
import LandingPage from "./pages/LandingPage";
import TheFuturePage from "./pages/TheFuturePage";
import EngineeringPage from "./pages/EngineeringPage";
import YourArmPage from "./pages/YourArmPage";
import PrivateDemoPage from "./pages/PrivateDemoPage";
import ProfilePage from "./pages/ProfilePage";

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Top navigation */}
      <Navigation />

      {/* Main page content */}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/the-future" element={<TheFuturePage />} />
          <Route path="/engineering" element={<EngineeringPage />} />
          <Route path="/your-arm" element={<YourArmPage />} />
          <Route path="/private-demo" element={<PrivateDemoPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
