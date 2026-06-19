import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import TheFuturePage from './pages/TheFuturePage';
import EngineeringPage from './pages/EngineeringPage';
import YourArmPage from './pages/YourArmPage';
import PrivateDemoPage from './pages/PrivateDemoPage';

function App() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/the-future" element={<TheFuturePage />} />
        <Route path="/engineering" element={<EngineeringPage />} />
        <Route path="/your-arm" element={<YourArmPage />} />
        <Route path="/private-demo" element={<PrivateDemoPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;