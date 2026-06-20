import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import YourArmPage from './pages/YourArmPage';
import EngineeringPage from './pages/EngineeringPage';
import TheFuturePage from './pages/TheFuturePage';
import PrivateDemoPage from './pages/PrivateDemoPage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-neutral-950 text-white">
          <div className="ambient-glow" />
          <Navigation />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/your-arm" element={<YourArmPage />} />
              <Route path="/engineering" element={<EngineeringPage />} />
              <Route path="/the-future" element={<TheFuturePage />} />
              <Route path="/private-demo" element={<PrivateDemoPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
