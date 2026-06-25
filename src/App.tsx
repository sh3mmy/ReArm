// src/App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Navigation from "./components/Navigation";
import ScrollToTop from "./components/ScrollToTop";

// Pages
import LandingPage from "./pages/LandingPage";
import TheFuturePage from "./pages/TheFuturePage";
import EngineeringPage from "./pages/EngineeringPage";
import YourArmPage from "./pages/YourArmPage";
import PrivateDemoPage from "./pages/PrivateDemoPage";
import ProfilePage from "./pages/ProfilePage";

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-white">
      {/* Ambient background glow */}
      <div className="ambient-glow" />

      {/* Reset scroll position on route change */}
      <ScrollToTop />

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
