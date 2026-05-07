// ─── STREAK HELPERS ──────────────────────────────────────────────────────────
// Shared streak icon and style logic used by both the parent dashboard
// and the analytics tab.

export const getStreakIcon = (streak) => {
  if (streak >= 100) return '🌌';
  if (streak >= 30) return '💎';
  if (streak >= 7) return '⚡';
  return '🔥';
};

export const getStreakColor = (streak) => {
  if (streak >= 100) return '#d946ef';
  if (streak >= 30) return '#06b6d4';
  if (streak >= 7) return '#3b82f6';
  return '#fb923c';
};

export const getStreakStyles = (streak) => {
  if (streak >= 100) return { color: '#d946ef', border: '1px solid #d946ef', background: 'rgba(217, 70, 239, 0.12)', boxShadow: '0 0 10px rgba(217, 70, 239, 0.5)' };
  if (streak >= 30) return { color: '#06b6d4', border: '1px solid #06b6d4', background: 'rgba(6, 182, 212, 0.12)', boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)' };
  if (streak >= 7) return { color: '#3b82f6', border: '1px solid #3b82f6', background: 'rgba(59, 130, 246, 0.12)', boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)' };
  return { color: '#fb923c', border: '1px solid rgba(251,146,60,0.25)', background: 'rgba(251,146,60,0.12)' };
};
