/**
 * Returns the start of the current day (midnight) in the given timezone offset.
 * @param {number} tzOffsetHours - e.g. -5 for EST, 0 for UTC, -7 for MST
 * @returns {Date} A Date object representing midnight in the specified timezone
 */
export function getStartOfDay(tzOffsetHours = null) {
  // If no offset stored, fall back to the browser's own local timezone
  if (tzOffsetHours === null || tzOffsetHours === undefined) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }
  // Convert "now" to the target timezone, find its midnight, convert back to UTC
  const now = new Date();
  const nowUtcMs = now.getTime() + now.getTimezoneOffset() * 60000; // shift to UTC ms
  const tzMs = tzOffsetHours * 3600000;
  const nowInTz = new Date(nowUtcMs + tzMs);
  const midnightInTz = new Date(nowInTz);
  midnightInTz.setHours(0, 0, 0, 0);
  // Shift back from tz-local to a real UTC Date
  return new Date(midnightInTz.getTime() - tzMs + now.getTimezoneOffset() * -60000);
}

/**
 * Returns the start of the current week (Sunday midnight) in the given timezone offset.
 */
export function getStartOfWeek(tzOffsetHours = null) {
  const sod = getStartOfDay(tzOffsetHours);
  const day = sod.getDay();
  sod.setDate(sod.getDate() - day);
  return sod;
}

/**
 * Returns the start of the current month in the given timezone offset.
 */
export function getStartOfMonth(tzOffsetHours = null) {
  const sod = getStartOfDay(tzOffsetHours);
  sod.setDate(1);
  return sod;
}

/**
 * Reads the stored timezone offset from localStorage (set by SettingsTab).
 * Returns a number (hours) or null if not set.
 */
export function getStoredTzOffset() {
  if (typeof localStorage === 'undefined') return null;
  const v = localStorage.getItem('kaeluma_tz_offset');
  if (v === null || v === '') return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

/** Local calendar YYYY-MM-DD (not UTC). */
export function localYmd(date = new Date()) {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${mo}-${d}`;
}

/** ISO timestamp for “recent enough” Quests queries (covers monthly missions). */
export function daysAgoIso(days = 40) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}
