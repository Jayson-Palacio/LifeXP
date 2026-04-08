// ============================================
// DATE HELPERS
// ============================================

/**
 * Returns today's date as YYYY-MM-DD string in local timezone.
 */
export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Returns yesterday's date as YYYY-MM-DD string.
 */
export function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Checks if two date strings are the same day.
 */
export function isSameDay(d1, d2) {
  return d1 === d2;
}
