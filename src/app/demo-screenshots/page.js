'use client';

/**
 * Demo Screenshot Page — /demo-screenshots
 * 
 * Renders the Kid and Parent dashboards with realistic mock data
 * for automated App Store screenshot capture. No authentication required.
 * 
 * IMPORTANT: This page should NOT be deployed to production.
 * Add to .env or middleware to block in production if needed.
 */

import dynamic from 'next/dynamic';
import { useState } from 'react';

// Lazy-load dashboard components — they're large
const ChildDashboardClient = dynamic(
  () => import('../../components/ChildDashboardClient'),
  { ssr: false }
);
const ParentDashboardClient = dynamic(
  () => import('../../components/ParentDashboardClient'),
  { ssr: false }
);

// ─── Mock Data ──────────────────────────────────────────────────
const MOCK_CHILD = {
  id: 'demo-child-1',
  name: 'Avery',
  avatar: '🦊',
  coins: 185,
  xp: 2750,
  level: 12,
  theme: 'ocean',
  streak: 7,
};

const MOCK_CHILD_2 = {
  id: 'demo-child-2',
  name: 'Leo',
  avatar: '🐉',
  coins: 95,
  xp: 1200,
  level: 6,
  theme: 'seedling',
  streak: 3,
};

const MOCK_MISSIONS = [
  { id: 'm1', name: 'Brush Teeth', emoji: '🪥', coin_reward: 5, xp_reward: 20, is_active: true, assigned_to: [] },
  { id: 'm2', name: 'Make Bed', emoji: '🛏️', coin_reward: 5, xp_reward: 15, is_active: true, assigned_to: [] },
  { id: 'm3', name: 'Read for 20 Minutes', emoji: '📖', coin_reward: 10, xp_reward: 30, is_active: true, assigned_to: [] },
  { id: 'm4', name: 'Pack School Bag', emoji: '🎒', coin_reward: 5, xp_reward: 15, is_active: true, assigned_to: [] },
  { id: 'm5', name: 'Clean Room', emoji: '🧹', coin_reward: 15, xp_reward: 40, is_active: true, assigned_to: [] },
  { id: 'm6', name: 'Practice Piano', emoji: '🎹', coin_reward: 10, xp_reward: 25, is_active: true, assigned_to: ['demo-child-1'] },
  { id: 'm7', name: 'Walk the Dog', emoji: '🐕', coin_reward: 10, xp_reward: 25, is_active: true, assigned_to: [] },
  { id: 'm8', name: 'Homework', emoji: '📝', coin_reward: 15, xp_reward: 35, is_active: true, assigned_to: [] },
];

const MOCK_REWARDS = [
  { id: 'r1', name: '30 Min Screen Time', emoji: '📱', cost: 25, is_active: true },
  { id: 'r2', name: 'Choose Dinner', emoji: '🍕', cost: 40, is_active: true },
  { id: 'r3', name: 'Movie Night Pick', emoji: '🎬', cost: 50, is_active: true },
  { id: 'r4', name: 'Stay Up 30 Min Late', emoji: '🌙', cost: 35, is_active: true },
  { id: 'r5', name: 'Friend Sleepover', emoji: '🏠', cost: 100, is_active: true },
];

const MOCK_COMPLETIONS = [
  { id: 'c1', mission_id: 'm1', child_id: 'demo-child-1', status: 'approved', submitted_at: new Date().toISOString(), coins_earned: 5, xp_earned: 20 },
  { id: 'c2', mission_id: 'm2', child_id: 'demo-child-1', status: 'approved', submitted_at: new Date().toISOString(), coins_earned: 5, xp_earned: 15 },
  { id: 'c3', mission_id: 'm3', child_id: 'demo-child-1', status: 'pending', submitted_at: new Date().toISOString(), coins_earned: 10, xp_earned: 30 },
];

const MOCK_REDEMPTIONS = [
  { id: 'rd1', reward_id: 'r1', child_id: 'demo-child-1', status: 'approved', redeemed_at: new Date(Date.now() - 86400000).toISOString(), coins_spent: 25 },
];

const MOCK_PENDING_COMPLETIONS = [
  { id: 'pc1', mission_id: 'm3', child_id: 'demo-child-1', status: 'pending', submitted_at: new Date().toISOString() },
  { id: 'pc2', mission_id: 'm5', child_id: 'demo-child-2', status: 'pending', submitted_at: new Date().toISOString() },
];

const MOCK_PENDING_REDEMPTIONS = [
  { id: 'pr1', reward_id: 'r2', child_id: 'demo-child-1', status: 'pending', redeemed_at: new Date().toISOString() },
];

const MOCK_SETTINGS = {
  setup_complete: true,
  require_approval: true,
  family_name: 'Palacio Family',
};

// ─── Page Component ─────────────────────────────────────────────
export default function DemoScreenshotPage() {
  const [view, setView] = useState('kid');

  const views = [
    { key: 'kid', label: 'Kid Dashboard' },
    { key: 'parent', label: 'Parent Sanctuary' },
  ];

  return (
    <div>
      {/* View Selector — hidden during screenshots via data attribute */}
      <div
        data-screenshot-hide="true"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          display: 'flex', gap: 8, padding: '8px 16px',
          background: 'rgba(0,0,0,0.9)', borderBottom: '1px solid #333',
        }}
      >
        <span style={{ color: '#facc15', fontWeight: 700, fontSize: 14, marginRight: 12, lineHeight: '32px' }}>
          📸 Screenshot Preview
        </span>
        {views.map(v => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            style={{
              padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
              background: view === v.key ? '#6366f1' : '#1e1e2e',
              color: view === v.key ? '#fff' : '#94a3b8',
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Dashboard Render */}
      <div style={{ paddingTop: 0 }}>
        {view === 'kid' && (
          <ChildDashboardClient
            initialChild={MOCK_CHILD}
            missions={MOCK_MISSIONS}
            initialCompletions={MOCK_COMPLETIONS}
            rewards={MOCK_REWARDS}
            initialRedemptions={MOCK_REDEMPTIONS}
            requireApproval={true}
            familyName="Palacio Family"
          />
        )}
        {view === 'parent' && (
          <ParentDashboardClient
            initialChildren={[MOCK_CHILD, MOCK_CHILD_2]}
            initialMissions={MOCK_MISSIONS}
            initialRewards={MOCK_REWARDS}
            initialPending={MOCK_PENDING_COMPLETIONS}
            initialPendingRedemptions={MOCK_PENDING_REDEMPTIONS}
            initialSettings={MOCK_SETTINGS}
            parentEmail="jayson@kaeluma.com"
          />
        )}
      </div>
    </div>
  );
}
