import React from 'react';
import type { ForumPost } from '../utils/AIContentGenerator';
import type { Team } from '../types/index';

interface ThreadRowProps {
  thread: ForumPost;
  onClick: () => void;
  userTeam?: Team | null;
}

export const ThreadRow: React.FC<ThreadRowProps> = ({ thread, onClick, userTeam }) => {
  return (
    <div
      className="border-b border-secondary-200 p-4 cursor-pointer transition-colors"
      onClick={onClick}
      onMouseEnter={(e) => {
        if (userTeam) {
          e.currentTarget.style.backgroundColor = `rgba(var(--team-primary-rgb), 0.05)`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            {thread.isPinned && (
              <span className="text-[var(--team-primary)]" title="Pinned">📌</span>
            )}
            <h3 className="font-semibold truncate" style={{ color: userTeam ? 'var(--team-primary)' : '#1f2937' }}>
              {thread.title}
            </h3>
          </div>
          <div className="flex items-center text-xs text-secondary-500 space-x-4">
            <span className="font-medium">{thread.author}</span>
            <span>•</span>
            <span>{thread.replies} replies</span>
            <span>•</span>
            <span>{thread.views.toLocaleString()} views</span>
            <span>•</span>
            <span>Last: {thread.lastActivity}</span>
          </div>
        </div>
        <div className="ml-4 flex-shrink-0">
          <span className={`badge text-xs ${
            userTeam ? 'badge-team-primary' : (
              thread.category === 'game-thread' ? 'badge-primary' :
              thread.category === 'recruiting' ? 'badge-success' :
              thread.category === 'coaching' ? 'badge-warning' :
              thread.category === 'off-topic' ? 'badge-accent' :
              'badge-secondary'
            )
          }`}>
            {thread.category === 'game-thread' ? 'Game' :
             thread.category === 'off-topic' ? 'OT' :
             thread.category.charAt(0).toUpperCase() + thread.category.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
};