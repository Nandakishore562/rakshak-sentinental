import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import PotholeDetection from './components/PotholeDetection';
import AccidentHeatmap from './components/AccidentHeatmap';
import CivicLetterEditor from './components/CivicLetterEditor';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import ChittiChatbot from './components/ChittiChatbot';
import UserProfile from './components/UserProfile';

function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'login' | 'dashboard' | 'profile'
  const [user, setUser] = useState(null);

  const handleEnter = () => setView('login');
  const handleLogin = (userData) => {
    setUser(userData);
    setView('dashboard');
  };

  const handleProfileClick = () => setView('profile');
  const handleBackToDashboard = () => setView('dashboard');

  if (view === 'landing') {
    return <LandingPage onEnter={handleEnter} />;
  }

  if (view === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  if (view === 'profile') {
    return (
      <div className="flex flex-col min-h-screen">
        <Header user={user} onProfileClick={handleProfileClick} />
        <main className="flex-1 p-6">
          <UserProfile user={user} onBack={handleBackToDashboard} />
        </main>
        <Footer />
        <ChittiChatbot />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} onProfileClick={handleProfileClick} />
      <main className="app-grid">
        <PotholeDetection />
        <AccidentHeatmap />
        <CivicLetterEditor />
      </main>
      <Footer />
      <ChittiChatbot />
    </div>
  );
}

export default App;
