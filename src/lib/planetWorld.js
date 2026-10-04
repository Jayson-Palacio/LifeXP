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
  tree: { item: 'wood', name: 'tree', time: 0.48 },
  rock: { item: 'stone', name: 'rock', time: 0.58 },
  crystal: { item: 'gold', name: 'crystal', time: 0.72 },
  bush: { item: 'leaf', name: 'bush', time: 0.4 },
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

export function regions() {
  const c = Math.floor(SIZE / 2);
  return {
    mountain: { x: c - 2, z: c - 17, r: 11 },
    lake: { x: c + 15, z: c + 2, r: 5.5 },
    forest: { x: c - 16, z: c + 5, r: 9 },
    birch: { x: c + 9, z: c + 17, r: 6 },
    magic: { x: c - 10, z: c + 19, r: 4.5 },
  };
}

function reach(x, z, region) {
  return Math.hypot(x - region.x, z - region.z) / region.r;
}

function carve(ground, x0, z0, tx, tz, seed, stop) {
  const points = [];
  let x = x0;
  let z = z0;
  for (let step = 0; step < 60; step += 1) {
    if (!inBounds(x, z)) break;
    const tile = ground[z * SIZE + x];
    if (tile.id === 'water' || (stop && stop(tile, x, z))) break;
    points.push([x, z]);
    const dx = tx - x;
    const dz = tz - z;
    if (!dx && !dz) break;
    let alongX = Math.abs(dx) >= Math.abs(dz);
    if (rand(seed + step * 31 + x * 7 + z * 3) < 0.22 && (alongX ? dz : dx)) alongX = !alongX;
    if (alongX && !dx) alongX = false;
    if (!alongX && !dz) alongX = true;
    if (alongX) x += Math.sign(dx);
    else z += Math.sign(dz);
  }
  for (let i = 0; i < points.length; i += 1) {
    const [x, z] = points[i];
    const tile = ground[z * SIZE + x];
    tile.path = true;
    if (i % 6 === 4) {
      const next = points[i + 1] || points[i - 1];
      tile.lamp = next && next[0] !== x ? 'n' : 'w';
    }
  }
  return points;
}

export function makeWorld(seed = 7) {
  const ground = new Array(SIZE * SIZE);
  const nodes = {};
  const c = Math.floor(SIZE / 2);
  const R = regions();
  for (let z = 0; z < SIZE; z += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const dist = Math.hypot(x - c, z - c);
      const coast = 27 + noise(x * 0.09, z * 0.09, seed + 2) * 6;
      const n = field(x, z, seed);
      let h = 2;
      let id = 'grass';
      let zone = 'meadow';
      if (dist > coast) {
        id = 'water';
        h = 1;
        zone = 'sea';
      } else {
        const peak = reach(x, z, R.mountain);
        const pond = reach(x, z, R.lake) + (noise(x * 0.2, z * 0.2, seed + 5) - 0.5) * 0.35;
        if (peak < 1) {
          zone = 'mountain';
          h = Math.max(2, Math.min(MAX_HEIGHT, Math.round(2 + (1 - peak) * 5.6 + (n - 0.5) * 1.4)));
          if (h >= 7) id = 'snow';
          else if (h >= 4) id = 'stone';
        }
        if (pond < 1) {
          id = 'water';
          h = 1;
          zone = 'lake';
        } else if (zone === 'meadow') {
          if (reach(x, z, R.forest) < 1) zone = 'forest';
          else if (reach(x, z, R.birch) < 1) zone = 'birch';
          else if (reach(x, z, R.magic) < 1) zone = 'magic';
          else if (n > 0.76 && dist > 9) h = 3;
        }
        if (zone !== 'mountain' && zone !== 'lake' && dist > coast - 2.2) {
          id = 'sand';
          h = 2;
          zone = 'beach';
        }
      }
      ground[z * SIZE + x] = { h, id, zone };
    }
  }

  for (let z = 1; z < SIZE - 1; z += 1) {
    for (let x = 1; x < SIZE - 1; x += 1) {
      const tile = ground[z * SIZE + x];
      if (tile.id !== 'grass') continue;
      const wet = DIRS.map(([dx, dz]) => ground[(z + dz) * SIZE + (x + dx)]).filter((next) => next.id === 'water');
      if (!wet.length) continue;
      tile.id = 'sand';
      tile.reed = wet.some((next) => next.zone === 'lake') && rand(x * 7 + z * 13 + seed) > 0.4;
    }
  }

  carve(ground, c, c - 1, R.mountain.x, R.mountain.z, seed + 1, (tile) => tile.h >= 4);
  carve(ground, c + 1, c + 1, R.lake.x, R.lake.z, seed + 2);
  carve(ground, c - 1, c + 1, R.forest.x, R.forest.z, seed + 3, (tile, x, z) => reach(x, z, R.forest) < 0.45);
  const south = carve(ground, c, c + 2, R.birch.x, R.birch.z, seed + 4, (tile, x, z) => reach(x, z, R.birch) < 0.4);
  const fork = south[Math.min(5, south.length - 1)];
  if (fork) carve(ground, fork[0] - 1, fork[1], R.magic.x, R.magic.z, seed + 5, (tile, x, z) => reach(x, z, R.magic) < 0.95);

  const place = (x, z, kind, variant) => {
    const tile = ground[z * SIZE + x];
    if (!tile || tile.path || tile.id === 'water' || nodes[cellKey(x, z)]) return;
    nodes[cellKey(x, z)] = {
      kind,
      left: 4 + Math.floor(rand(x * 3 + z) * 3),
      scale: 0.85 + rand(x * 11 + z * 7) * 0.45,
      variant: variant || null,
    };
  };

  for (let z = 0; z < SIZE; z += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const tile = ground[z * SIZE + x];
      const dist = Math.hypot(x - c, z - c);
      const roll = rand(seed * 17 + x * 13 + z * 29);
      const deco = rand(x * 19 + z * 23 + seed);
      if (tile.zone === 'lake' && deco > 0.8) tile.lily = true;
      if (tile.path || tile.id === 'water' || tile.id === 'sand' || dist < 5) continue;
      if (tile.zone === 'forest') {
        const edge = reach(x, z, R.forest);
        if (roll < 0.34) place(x, z, 'tree', 'oak');
        else if (edge > 0.72 && roll < 0.42) place(x, z, 'bush');
        else if (deco > 0.86) tile.mushroom = 'red';
        else if (deco < 0.03) tile.flower = true;
      } else if (tile.zone === 'mountain') {
        if (tile.id === 'grass' && roll < 0.2) place(x, z, 'tree', 'pine');
        else if (tile.id === 'stone' && roll < 0.14) place(x, z, 'rock');
        else if (tile.id === 'snow' && reach(x, z, R.mountain) < 0.4 && roll < 0.4) place(x, z, 'crystal');
      } else if (tile.zone === 'birch') {
        if (roll < 0.26) place(x, z, 'tree', 'birch');
        else if (roll < 0.3) place(x, z, 'bush');
        else if (deco > 0.45) tile.flower = true;
      } else if (tile.zone === 'magic') {
        const ring = reach(x, z, R.magic);
        if (ring > 0.5 && roll < 0.38) place(x, z, 'tree', 'glow');
        else if (deco > 0.55) tile.bloom = true;
        else if (deco < 0.14) tile.mushroom = 'magic';
      } else if (tile.zone === 'meadow') {
        if (dist > 7 && roll < 0.016) place(x, z, 'tree', 'oak');
        else if (dist > 7 && roll < 0.026) place(x, z, 'bush');
        else if (deco > 0.87) tile.flower = true;
      }
    }
  }

  for (const [dx, dz, kind] of [[5, -4, 'tree'], [-5, -3, 'tree'], [4, 5, 'tree'], [-3, -7, 'rock'], [3, -8, 'rock']]) {
    place(c + dx, c + dz, kind, kind === 'tree' ? 'oak' : null);
  }

  for (let i = 0; i < 8; i += 1) {
    const angle = (i / 8) * Math.PI * 2;
    const x = Math.round(R.magic.x + Math.cos(angle) * (R.magic.r + 0.6));
    const z = Math.round(R.magic.z + Math.sin(angle) * (R.magic.r + 0.6));
    const tile = inBounds(x, z) ? ground[z * SIZE + x] : null;
    if (tile && tile.id === 'grass' && !tile.path && !nodes[cellKey(x, z)]) tile.pillar = true;
  }
  return { seed, ground, nodes, built: {}, camp: { x: c, z: c + 1 } };
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
  if (tileAt(world, x + dx, z + dz).id === 'water' && !world.built[cellKey(x + dx, z + dz)]) return false;
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

const square = (n) => Array.from({ length: n * n }, (_, i) => [i % n, Math.floor(i / n)]);

export const PLANS = [
  { id: 'wall', name: 'Garden wall', block: 'wood', need: 1, cells: [[0, 0], [1, 0], [2, 0], [3, 0]], clear: [[0, 0], [1, 0], [2, 0], [3, 0]] },
  { id: 'tower', name: 'Lookout tower', block: 'stone', need: 4, cells: [[0, 0]], clear: [[0, 0]] },
  {
    id: 'house',
    name: 'Little house',
    block: 'wood',
    need: 2,
    cells: [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
    clear: square(3),
  },
];

export function reachable(world, x0, z0) {
  const seen = new Set([cellKey(x0, z0)]);
  const queue = [[x0, z0]];
  for (let head = 0; head < queue.length; head += 1) {
    const [x, z] = queue[head];
    for (const [dx, dz] of DIRS) {
      const key = cellKey(x + dx, z + dz);
      if (seen.has(key) || !canStep(world, x, z, dx, dz)) continue;
      seen.add(key);
      queue.push([x + dx, z + dz]);
    }
  }
  return seen;
}

function openTile(world, x, z) {
  const tile = tileAt(world, x, z);
  return Boolean(tile && tile.h === 2 && (tile.id === 'grass' || tile.id === 'sand')
    && !tile.path && !tile.lamp && !tile.pillar && !tile.reed && !nodeAt(world, x, z));
}

export function makeQuests(world) {
  const home = spawn();
  const seen = reachable(world, home.x, home.z);
  const taken = new Set();
  const camp = world.camp;
  for (let dx = -2; dx <= 4; dx += 1) {
    for (let dz = -4; dz <= 2; dz += 1) taken.add(cellKey(camp.x + dx, camp.z + dz));
  }
  const plans = [];
  for (const plan of PLANS) {
    let site = null;
    for (let r = 3; r <= 14 && !site; r += 1) {
      for (let dz = -r; dz <= r && !site; dz += 1) {
        for (let dx = -r; dx <= r && !site; dx += 1) {
          if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
          const ax = home.x + dx;
          const az = home.z + dz;
          const fits = plan.clear.every(([cx, cz]) => {
            const key = cellKey(ax + cx, az + cz);
            return seen.has(key) && !taken.has(key) && openTile(world, ax + cx, az + cz);
          });
          if (fits) site = { ax, az };
        }
      }
    }
    if (!site) continue;
    for (const [cx, cz] of plan.clear) {
      for (let mx = -1; mx <= 1; mx += 1) {
        for (let mz = -1; mz <= 1; mz += 1) taken.add(cellKey(site.ax + cx + mx, site.az + cz + mz));
      }
    }
    plans.push({
      id: plan.id,
      name: plan.name,
      block: plan.block,
      cells: plan.cells.map(([cx, cz]) => ({ x: site.ax + cx, z: site.az + cz, need: plan.need })),
    });
  }

  const R = regions();
  const goals = [
    { id: 'peak', at: R.mountain, score: (tile, d) => d - tile.h * 4 },
    { id: 'forest', at: R.forest },
    { id: 'birch', at: R.birch },
    { id: 'magic', at: R.magic },
    { id: 'lake', at: R.lake },
  ];
  const chests = [];
  for (const goal of goals) {
    let best = null;
    let bestScore = Infinity;
    for (const key of seen) {
      if (taken.has(key)) continue;
      const [x, z] = key.split(',').map(Number);
      const tile = tileAt(world, x, z);
      if (!tile || tile.id === 'water' || tile.path || tile.lamp || tile.pillar) continue;
      const d = Math.hypot(x - goal.at.x, z - goal.at.z);
      const score = goal.score ? goal.score(tile, d) : d;
      if (score < bestScore) {
        bestScore = score;
        best = { x, z };
      }
    }
    if (!best) continue;
    taken.add(cellKey(best.x, best.z));
    const tile = tileAt(world, best.x, best.z);
    tile.flower = false;
    tile.mushroom = null;
    tile.bloom = false;
    tile.reed = false;
    chests.push({ id: goal.id, x: best.x, z: best.z });
  }
  return { plans, chests };
}

export function planProgress(world, plan) {
  let have = 0;
  let need = 0;
  for (const cell of plan.cells) {
    need += cell.need;
    have += Math.min(cell.need, world.built[cellKey(cell.x, cell.z)]?.length || 0);
  }
  return { have, need, done: have >= need };
}
