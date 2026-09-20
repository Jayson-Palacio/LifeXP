"use client";

import React from 'react';
import Link from 'next/link';
import { playClick } from '../lib/sounds';
import QuestsTopBar from './QuestsTopBar';

export default function AppShell({
  role, // 'kid' | 'parent'
  activeTab,
  onTabChange,
  children,
  notifications = {},
  onSupport,
}) {
  const kidTabs = [
    { id: 'hall',     label: 'Hall',     icon: '🏅' },
    { id: 'missions', label: 'Missions', icon: '🎯' },
    { id: 'shop',     label: 'Shop',     icon: '🛒' }
  ];

  const parentTabs = [
    { id: 'overview', label: 'Today',    badge: notifications.approvals },
    { id: 'manage',   label: 'Missions' },
    { id: 'settings', label: 'Settings' }
  ];

  const tabs = role === 'parent' ? parentTabs : kidTabs;

  return (
    <div className={`quests-app app-shell app-shell-${role}`} style={{ position: 'relative' }}>
      <div className="kaeluma-bg" style={{ opacity: 1, position: 'fixed', zIndex: 0 }} />
      {role === 'parent' && (
        <QuestsTopBar
          right={
            <>
              {onSupport && (
                <button type="button" className="quests-top-link" onClick={onSupport}>
                  Support
                </button>
              )}
              <Link href="/apps" className="quests-top-link">Apps</Link>
            </>
          }
        />
      )}
      <div className="app-shell-content" style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>

      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                if (activeTab !== tab.id && playClick) playClick();
                onTabChange(tab.id);
              }}
            >
              {tab.icon && (
                <div className="nav-tab-icon-wrapper">
                  <span className="nav-tab-icon">{tab.icon}</span>
                  {tab.badge > 0 && <span className="nav-badge">{tab.badge}</span>}
                </div>
              )}
              {!tab.icon && tab.badge > 0 && (
                <span className="nav-badge">{tab.badge}</span>
              )}
              <span className="nav-tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
