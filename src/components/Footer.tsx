import React from 'react';
import { useTeamStore } from '../stores/teamStore';

export const Footer: React.FC = () => {
  const userTeam = useTeamStore(state => state.getUserTeam());
  
  return (
    <footer className={`${userTeam ? 'bg-gradient-to-r from-[var(--team-primary)] to-[var(--team-secondary)]' : 'bg-secondary-800'} text-white mt-auto`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About Dynasty Tracker</h3>
            <p className="text-sm text-white/80">
              The ultimate companion app for tracking your College Football 25 dynasty mode progress.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="text-white/80 hover:text-white transition-colors">Dashboard</a></li>
              <li><a href="/schedule" className="text-white/80 hover:text-white transition-colors">Schedule</a></li>
              <li><a href="/recruits" className="text-white/80 hover:text-white transition-colors">Recruiting</a></li>
              <li><a href="/teams" className="text-white/80 hover:text-white transition-colors">Teams</a></li>
            </ul>
          </div>
          
          {/* Community */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Community</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/news" className="text-white/80 hover:text-white transition-colors">News Hub</a></li>
              <li><a href="/forum" className="text-white/80 hover:text-white transition-colors">Fan Forum</a></li>
              <li><a href="/timeline" className="text-white/80 hover:text-white transition-colors">Dynasty Timeline</a></li>
            </ul>
          </div>
          
          {/* Team Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {userTeam ? `${userTeam.name} Dynasty` : 'Your Dynasty'}
            </h3>
            <p className="text-sm text-white/80">
              {userTeam ? (
                <>
                  Currently tracking the {userTeam.mascot}<br />
                  Conference: {userTeam.conference}<br />
                  Stadium: {userTeam.stadium}
                </>
              ) : (
                'Select a team to start tracking your dynasty'
              )}
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/20 text-center">
          <p className="text-sm text-white/60">
            © 2024 CFB Dynasty Tracker. Not affiliated with EA Sports or College Football 25.
          </p>
          <p className="text-xs text-white/40 mt-2">
            Made with ❤️ for dynasty mode enthusiasts
          </p>
        </div>
      </div>
    </footer>
  );
};