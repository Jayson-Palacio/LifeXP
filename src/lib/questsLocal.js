const stores = new Map();

export function saveQuestsLocal(key, value) {
  stores.set(key, { at: Date.now(), value });
}

export function readQuestsLocal(key, maxAge = 4000) {
  const row = stores.get(key);
  if (!row || Date.now() - row.at > maxAge) return null;
  return { ...row.value, at: row.at };
}
