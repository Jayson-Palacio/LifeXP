import crypto from 'crypto';

/**
 * Hashes a parent PIN using PBKDF2 with a random salt.
 * Stored format: salt:hash
 * 
 * @param {string} pin - The plain-text PIN to hash
 * @returns {string} The formatted salt:hash string
 */
export function hashPin(pin) {
  if (!pin) return '';
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(pin, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies if an entered PIN matches the stored hash or plain-text fallback.
 * Falls back to plain text if the stored value is not salted/hashed.
 * 
 * @param {string} pin - The entered PIN
 * @param {string} storedValue - The stored PIN/hash from the database
 * @returns {boolean} True if the PIN matches, false otherwise
 */
export function verifyPin(pin, storedValue) {
  if (!storedValue || !pin) return false;

  // Fallback check: If the stored value doesn't contain a salt separator (:),
  // treat it as plain text to support existing users without forcing a reset.
  if (!storedValue.includes(':')) {
    return storedValue === pin;
  }

  const [salt, hash] = storedValue.split(':');
  const verifyHash = crypto.pbkdf2Sync(pin, salt, 1000, 64, 'sha512').toString('hex');

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
  } catch (e) {
    return false;
  }
}
