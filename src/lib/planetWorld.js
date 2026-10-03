export const SIZE = 72;
export const MAX_HEIGHT = 8;

export const BLOCKS = [
  { id: 'wood', name: 'Wood', top: '#e0a05a', side: '#8d5a2b' },
  { id: 'stone', name: 'Stone', top: '#d5d8de', side: '#8d93a0' },
  { id: 'gold', name: 'Crystal', top: '#ffd60a', side: '#c9a000' },
  { id: 'leaf', name: 'Leaf', top: '#46c46a', side: '#2f8f48' },
];

export const GROUND = {
  grass: '#6fbf45',
  sand: '#e4c56e',
  stone: '#8e95a3',
  snow: '#e7eef6',
  water: '#3c93d8',
};

export const NODES = {
  tree: { item: 'wood', name: 'tree', time: 0.85 },
  rock: { item: 'stone', name: 'rock', time: 1.05 },
  crystal: { item: 'gold', name: 'crystal', time: 1.2 },
  bush: { item: 'leaf', name: 'bush', time: 0.7 },
};

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export function blockById(id) {
  return BLOCKS.find((block) => block.id === id) || BLOCKS[0];
}

export function cellKey(x, z) {
  return `${x},${z}`;
}

function rand(n) {
  let x = (n | 0) + 0x9e3779b9;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

function noise(x, z, seed) {
  const x0 = Math.floor(x);
  const z0 = Math.floor(z);
  const fx = x - x0;
  const fz = z - z0;
  const v = (ix, iz) => rand(seed * 10007 + ix * 374761 + iz * 668265);
  const a = v(x0, z0);
  const b = v(x0 + 1, z0);
  const c = v(x0, z0 + 1);
  const d = v(x0 + 1, z0 + 1);
  const ux = fx * fx * (3 - 2 * fx);
  const uz = fz * fz * (3 - 2 * fz);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}

function field(x, z, seed) {
  return noise(x * 0.07, z * 0.07, seed) * 0.62 + noise(x * 0.16, z * 0.16, seed + 9) * 0.38;
}

export function inBounds(x, z) {
  return x >= 0 && z >= 0 && x < SIZE && z < SIZE;
}

export function makeWorld(seed = 7) {
  const ground = new Array(SIZE * SIZE);
  const nodes = {};
  const cx = Math.floor(SIZE / 2);
  const cz = cx;
  for (let z = 0; z < SIZE; z += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const dist = Math.hypot(x - cx, z - cz);
      const n = field(x, z, seed);
      const biome = noise(x * 0.035, z * 0.035, seed + 4);
      let h = 1;
      let groundId = 'grass';
      if (dist > 14 && biome < 0.32) groundId = 'sand';
      if (dist > 16 && biome > 0.74) {
        groundId = 'stone';
        h = 2 + (n > 0.6 ? 1 : 0);
      }
      if (dist > 22 && n > 0.82) {
        groundId = 'snow';
        h = 4;
      }
      if (dist > 12 && biome < 0.2 && n < 0.45) {
        groundId = 'water';
        h = 1;
      }
      const flower = groundId === 'grass' && dist > 2.2 && dist < 9 && rand(x * 19 + z * 23 + seed) > 0.72;
      ground[z * SIZE + x] = { h, id: groundId, flower };
      if (groundId === 'water' || dist < 5) continue;
      const roll = rand(seed * 17 + x * 13 + z * 29);
      const grove = Math.hypot(x - (cx + 6), z - (cz + 8));
      const quarry = Math.hypot(x - (cx - 11), z - (cz + 14));
      let kind = null;
      if (grove < 4.2 && groundId === 'grass') kind = 'tree';
      else if (quarry < 3.2 && dist > 6) kind = 'rock';
      else if (groundId === 'grass' && h <= 3 && roll > 0.955) kind = 'tree';
      else if ((groundId === 'stone' || groundId === 'snow') && roll > 0.9) kind = roll > 0.97 ? 'crystal' : 'rock';
      else if (groundId === 'grass' && roll > 0.93 && roll <= 0.955) kind = 'bush';
      if (kind) {
        nodes[cellKey(x, z)] = {
          kind,
          left: 4 + Math.floor(rand(x * 3 + z) * 3),
          scale: 0.85 + rand(x * 11 + z * 7) * 0.5,
        };
      }
    }
  }
  for (let z = 1; z < SIZE - 1; z += 1) {
    for (let x = 1; x < SIZE - 1; x += 1) {
      const tile = ground[z * SIZE + x];
      if (tile.id !== 'grass') continue;
      const shore = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => ground[(z + dz) * SIZE + (x + dx)].id === 'water');
      if (shore) tile.id = 'sand';
    }
  }
  const bx = cx + 22;
  const bz = cz - 16;
  for (let dz = -2; dz <= 2; dz += 1) {
    for (let dx = -2; dx <= 2; dx += 1) {
      const x = bx + dx;
      const z = bz + dz;
      if (!inBounds(x, z)) continue;
      const tile = ground[z * SIZE + x];
      tile.h = Math.max(tile.h, 5 - Math.abs(dx) - Math.abs(dz));
      tile.id = 'snow';
      if (Math.abs(dx) + Math.abs(dz) <= 1) {
        nodes[cellKey(x, z)] = { kind: 'crystal', left: 5 };
      }
    }
  }
  return { seed, ground, nodes, built: {} };
}

export function tileAt(world, x, z) {
  if (!inBounds(x, z)) return null;
  return world.ground[z * SIZE + x];
}

export function surfaceHeight(world, x, z) {
  const tile = tileAt(world, x, z);
  if (!tile) return null;
  const extra = world.built[cellKey(x, z)];
  return tile.h + (extra ? extra.length : 0);
}

export function nodeAt(world, x, z) {
  return world.nodes[cellKey(x, z)] || null;
}

export function canStep(world, x, z, dx, dz) {
  const h0 = surfaceHeight(world, x, z);
  const h1 = surfaceHeight(world, x + dx, z + dz);
  if (h0 == null || h1 == null) return false;
  if (Math.abs(h1 - h0) > 1) return false;
  const node = nodeAt(world, x + dx, z + dz);
  if (node && node.left > 0) return false;
  return true;
}

export function findPath(world, x0, z0, x1, z1) {
  if (!inBounds(x1, z1) || (x0 === x1 && z0 === z1)) return [];
  const start = cellKey(x0, z0);
  const goal = cellKey(x1, z1);
  const queue = [[x0, z0]];
  const prev = new Map([[start, null]]);
  let head = 0;
  let found = null;
  while (head < queue.length && prev.size < 1800) {
    const [x, z] = queue[head];
    head += 1;
    if (x === x1 && z === z1) {
      found = goal;
      break;
    }
    for (let i = 0; i < DIRS.length; i += 1) {
      const nx = x + DIRS[i][0];
      const nz = z + DIRS[i][1];
      const key = cellKey(nx, nz);
      if (prev.has(key)) continue;
      if (!canStep(world, x, z, DIRS[i][0], DIRS[i][1])) continue;
      prev.set(key, cellKey(x, z));
      queue.push([nx, nz]);
    }
  }
  if (!found) return [];
  const path = [];
  let cursor = found;
  while (cursor && cursor !== start) {
    const [x, z] = cursor.split(',').map(Number);
    path.push({ x, z });
    cursor = prev.get(cursor);
  }
  path.reverse();
  return path;
}

export function nearestStand(world, x, z, fromX, fromZ) {
  let best = null;
  let bestDist = Infinity;
  for (let i = 0; i < DIRS.length; i += 1) {
    const sx = x + DIRS[i][0];
    const sz = z + DIRS[i][1];
    if (surfaceHeight(world, sx, sz) == null) continue;
    if (nodeAt(world, sx, sz)?.left > 0) continue;
    const dist = Math.abs(sx - fromX) + Math.abs(sz - fromZ);
    if (dist < bestDist) {
      bestDist = dist;
      best = { x: sx, z: sz };
    }
  }
  return best;
}

export function gatherNode(world, x, z) {
  const node = nodeAt(world, x, z);
  if (!node || node.left <= 0) return null;
  node.left -= 1;
  return NODES[node.kind].item;
}

export function placeBuilt(world, x, z, block, bag) {
  if (!inBounds(x, z) || (bag[block] || 0) < 1) return false;
  if (nodeAt(world, x, z)?.left > 0) return false;
  if (surfaceHeight(world, x, z) >= MAX_HEIGHT) return false;
  const key = cellKey(x, z);
  const column = world.built[key] ? world.built[key].slice() : [];
  column.push(block);
  world.built[key] = column;
  bag[block] -= 1;
  return true;
}

export function takeBuilt(world, x, z, bag) {
  const key = cellKey(x, z);
  const column = world.built[key];
  if (!column?.length) return false;
  const item = column[column.length - 1];
  const next = column.slice(0, -1);
  if (next.length) world.built[key] = next;
  else delete world.built[key];
  bag[item] = (bag[item] || 0) + 1;
  return true;
}

export function spawn() {
  const c = Math.floor(SIZE / 2);
  return { x: c, z: c };
}
