export function barcodeVariants(code) {
  const digits = String(code || '').replace(/\D/g, '');
  if (!digits) return [];
  const out = new Set([digits]);
  for (const len of [8, 12, 13, 14]) {
    if (digits.length <= len) out.add(digits.padStart(len, '0'));
  }
  const stripped = digits.replace(/^0+/, '');
  if (stripped) out.add(stripped);
  return [...out];
}

export function foodFromProduct(row) {
  if (!row) return null;
  return {
    name: row.name,
    calories: Number(row.calories),
    protein_g: Number(row.protein_g),
    carbs_g: Number(row.carbs_g),
    fat_g: Number(row.fat_g),
    fiber_g: Number(row.fiber_g || 0),
    barcode: row.barcode,
    serving: row.serving || 'serving',
    source: 'store',
    brand: row.brand || '',
    store: row.store || '',
  };
}

export function ilikeSafe(query) {
  return String(query || '')
    .replace(/[%_,.()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}
