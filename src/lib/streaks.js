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
  if (streak >= 100) return { color: '#c026d3', border: '1px solid rgba(192, 38, 211, 0.28)', background: 'rgba(217, 70, 239, 0.1)' };
  if (streak >= 30) return { color: '#0891b2', border: '1px solid rgba(8, 145, 178, 0.28)', background: 'rgba(6, 182, 212, 0.1)' };
  if (streak >= 7) return { color: '#2563eb', border: '1px solid rgba(37, 99, 235, 0.28)', background: 'rgba(59, 130, 246, 0.1)' };
  return { color: '#ea580c', border: '1px solid rgba(234, 88, 12, 0.22)', background: 'rgba(251, 146, 60, 0.12)' };
};
