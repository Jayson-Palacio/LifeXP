// ============================================
// ID GENERATION
// ============================================

let counter = 0;

/**
 * Generates a unique ID with a prefix.
 * e.g., generateId('m') → "m_1712234567890_1"
 */
export function generateId(prefix = 'id') {
  counter++;
  return `${prefix}_${Date.now()}_${counter}`;
}
