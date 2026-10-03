export const MAX_HEIGHT = 8;
export const MAX_RADIUS = 16;

export const BLOCKS = [
  { id: 'grass', name: 'Grass', top: '#7dce4a', side: '#4f9a30' },
  { id: 'dirt', name: 'Dirt', top: '#d39a58', side: '#a56a34' },
  { id: 'sand', name: 'Sand', top: '#f3d78a', side: '#e0bc62' },
  { id: 'stone', name: 'Stone', top: '#d5d8de', side: '#9aa1ab' },
  { id: 'wood', name: 'Wood', top: '#e0a05a', side: '#8d5a2b' },
  { id: 'leaf', name: 'Leaf', top: '#46c46a', side: '#2f8f48' },
  { id: 'water', name: 'Water', top: '#7ec8f8', side: '#3d92d6' },
  { id: 'brick', name: 'Brick', top: '#e8745a', side: '#c2503c' },
  { id: 'snow', name: 'Snow', top: '#f7f8fa', side: '#d5dae2' },
  { id: 'gold', name: 'Gold', top: '#ffd60a', side: '#e0a800' },
];

export function blockById(id) {
  return BLOCKS.find((block) => block.id === id) || BLOCKS[0];
}

export function cellKey(x, z) {
  return `${x},${z}`;
}

export function columnHeight(column) {
  return column ? column.length : 0;
}

export function seedPlanet() {
  const cells = {};
  for (let z = -4; z <= 4; z += 1) {
    for (let x = -4; x <= 4; x += 1) {
      const dist = x * x + z * z;
      if (dist > 16) continue;
      if (dist > 9) cells[cellKey(x, z)] = ['sand'];
      else cells[cellKey(x, z)] = ['grass'];
    }
  }
  cells[cellKey(1, -1)] = ['grass', 'wood', 'leaf'];
  cells[cellKey(-2, 1)] = ['grass', 'leaf'];
  return cells;
}

export function countBlocks(cells) {
  return Object.values(cells).reduce((sum, column) => sum + column.length, 0);
}

export function canStep(cells, x, z, dx, dz) {
  const here = columnHeight(cells[cellKey(x, z)]);
  const there = columnHeight(cells[cellKey(x + dx, z + dz)]);
  if (there === 0) return false;
  if (there > here + 1) return false;
  return true;
}

export function placeBlock(cells, x, z, faceX, faceZ, block) {
  const fx = x + faceX;
  const fz = z + faceZ;
  if (fx * fx + fz * fz > MAX_RADIUS * MAX_RADIUS) return cells;
  const here = columnHeight(cells[cellKey(x, z)]);
  const current = cells[cellKey(fx, fz)];
  const column = current ? current.slice() : [];
  let next;
  if (column.length === 0) next = Array(Math.max(1, here)).fill(block);
  else if (column.length < here) {
    next = column;
    while (next.length < here) next.push(block);
  } else if (column.length >= MAX_HEIGHT) return cells;
  else next = column.concat(block);
  return { ...cells, [cellKey(fx, fz)]: next };
}

export function takeBlock(cells, x, z, faceX, faceZ) {
  const fx = x + faceX;
  const fz = z + faceZ;
  const current = cells[cellKey(fx, fz)];
  if (!current || current.length === 0) return cells;
  const next = current.slice(0, -1);
  const copy = { ...cells };
  if (next.length === 0) delete copy[cellKey(fx, fz)];
  else copy[cellKey(fx, fz)] = next;
  return copy;
}
