import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTeamStore } from '../stores/teamStore';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const userTeam = useTeamStore(state => state.getUserTeam());

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/news', label: 'News', icon: '📰' },
    { path: '/forum', label: 'Forum', icon: '💬' },
    { path: '/schedule', label: 'Schedule', icon: '📅' },
    { path: '/games', label: 'Games', icon: '🏈' },
    { path: '/players', label: 'Players', icon: '👥' },
    { path: '/coaches', label: 'Coaches', icon: '🎯' },
    { path: '/teams', label: 'Teams', icon: '🏟️' },
    { path: '/recruits', label: 'Recruits', icon: '⭐' },
    { path: '/timeline', label: 'Timeline', icon: '📖' },
  ];

  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col">
      {/* Header */}
      <header className={`${userTeam ? 'bg-gradient-to-r from-[var(--team-primary)] to-[var(--team-secondary)]' : 'bg-white'} border-b border-secondary-200 sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className={`text-2xl font-bold ${userTeam ? 'text-white drop-shadow-md' : 'text-primary-800'}`}>
                {userTeam ? `${userTeam.name} Dynasty Tracker` : 'CFB Dynasty Tracker'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`text-sm ${userTeam ? 'text-white/90' : 'text-secondary-600'}`}>Season 2024</span>
              <Link 
                to="/ai-settings" 
                className={`btn btn-sm ${userTeam ? 'bg-white/20 text-white hover:bg-white/30 border-white/30' : 'btn-secondary'} flex items-center space-x-2`}
              >
                <span>🤖</span>
                <span>AI Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white border-r border-secondary-200 min-h-[calc(100vh-4rem)]">
          <div className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${
                        isActive
                          ? userTeam 
                            ? 'bg-[var(--team-primary)]/10 text-[var(--team-primary)] font-medium'
                            : 'bg-primary-100 text-primary-800'
                          : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};