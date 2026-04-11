"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export default function AppShell({ 
  role, // 'kid' | 'parent'
  activeTab, 
  onTabChange, 
  children,
  notifications = {} // e.g., { approvals: 2 }
}) {
  const router = useRouter();

  const kidTabs = [
    { id: 'hall',     label: 'Hall',     icon: '🏅' },
    { id: 'missions', label: 'Missions', icon: '🎯' },
    { id: 'shop',     label: 'Shop',     icon: '🛒' }
  ];

  const parentTabs = [
    { id: 'family',    label: 'Family',    icon: '👨‍👩‍👧' },
    { id: 'approvals', label: 'Approvals', icon: '✅', badge: notifications.approvals },
    { id: 'missions',  label: 'Missions',  icon: '🎯' },
    { id: 'rewards',   label: 'Rewards',   icon: '🎁' },
    { id: 'settings',  label: 'Settings',  icon: '⚙️' }
  ];

  const tabs = role === 'parent' ? parentTabs : kidTabs;

  return (
    <div className="app-shell">
      <div className="app-shell-content">
        {children}
      </div>

      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <div className="nav-tab-icon-wrapper">
                <span className="nav-tab-icon">{tab.icon}</span>
                {tab.badge > 0 && <span className="nav-badge">{tab.badge}</span>}
              </div>
              <span className="nav-tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
