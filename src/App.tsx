import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { PredictPage } from './pages/PredictPage';
import { ExplorePage } from './pages/ExplorePage';
import { ModelsPage } from './pages/ModelsPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  const [activeRoute, setActiveRoute] = useState<string>('home');

  const renderContent = () => {
    switch (activeRoute) {
      case 'home':
        return <LandingPage setActiveRoute={setActiveRoute} />;
      case 'predict':
        return <PredictPage setActiveRoute={setActiveRoute} />;
      case 'explore':
        return <ExplorePage />;
      case 'models':
        return <ModelsPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <LandingPage setActiveRoute={setActiveRoute} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1329] text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500/30 selection:text-white">
      <Navbar activeRoute={activeRoute} setActiveRoute={setActiveRoute} />
      <main className="flex-1 bg-[#0b1329]">{renderContent()}</main>
      <Footer />
    </div>
  );
}
