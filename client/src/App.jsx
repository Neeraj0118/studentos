import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import AttendancePage from './pages/AttendancePage';
import PlacementPage from './pages/PlacementPage';
import AIStudyPlanner from './pages/AIStudyPlanner';
import AIResumeAnalyzer from './pages/AIResumeAnalyzer';

function MainLayout() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-dark)',
        color: 'var(--text-muted)'
      }}>
        <div>Loading StudentOS Platform...</div>
      </div>
    );
  }

  if (!user) {
    return authView === 'login' ? (
      <Login onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'tasks' && <TasksPage />}
        {activeTab === 'attendance' && <AttendancePage />}
        {activeTab === 'placement' && <PlacementPage />}
        {activeTab === 'ai-planner' && <AIStudyPlanner />}
        {activeTab === 'ai-resume' && <AIResumeAnalyzer />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
