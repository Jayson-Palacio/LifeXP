export const COLS = 9;
export const SPAN = COLS + 7;
export const TRAIN_LEN = 7;
export const HOP_TIME = 0.15;
export const ROAD_PAD = 0.28;
export const LOG_PAD = 0.08;

export function rand(n) {
  let x = (n | 0) + 0x9e3779b9;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

export function kindFor(y) {
  if (y <= 0) return 'grass';
  if (y < 11) {
    const intro = ['grass', 'road', 'road', 'grass', 'road', 'road', 'road', 'grass', 'road', 'road'];
    return intro[y - 1];
  }
  if (y < 24) {
    const mid = ['grass', 'road', 'road', 'river', 'river', 'grass', 'road', 'rail', 'grass', 'road', 'road', 'grass'];
    return mid[(y - 11) % mid.length];
  }
  const late = ['road', 'road', 'grass', 'river', 'river', 'rail', 'grass', 'road', 'road', 'river', 'grass', 'road'];
  return late[(y - 24) % late.length];
}

export function occupied(actors, x, pad = 0.2) {
  const left = x + pad;
  const right = x + 1 - pad;
  return actors.some((actor) => right > actor.x && left < actor.x + actor.len);
}

function wrapActors(actors) {
  for (const actor of actors) {
    while (actor.x >= SPAN) actor.x -= SPAN;
    while (actor.x < -3) actor.x += SPAN;
  }
}

function shiftUntil(actors, x, wantCovered) {
  let guard = 0;
  while (occupied(actors, x, 0.18) !== wantCovered && guard < 48) {
    for (const actor of actors) {
      actor.x += 0.35;
      if (actor.x >= SPAN) actor.x -= SPAN;
    }
    guard += 1;
  }
}

export function createRow(y) {
  const kind = kindFor(y);
  const row = {
    y,
    kind,
    trees: [],
    coins: [],
    decor: [],
    actors: [],
    dir: y % 2 === 0 ? 1 : -1,
    speed: 0,
    trainOn: false,
    warning: false,
    nextTrain: 0,
    trainX: 0,
    trips: 0,
  };

  if (kind === 'grass') {
    if (y > 1) {
      const used = new Set();
      const n = 1 + Math.floor(rand(y * 13) * (y > 18 ? 3.4 : 2.2));
      for (let i = 0; i < n; i += 1) {
        const col = Math.floor(rand(y * 17 + i * 13) * COLS);
        if (y < 9 && col === 4) continue;
        used.add(col);
      }
      row.trees = [...used].slice(0, 4);
    }
    const flowers = 3 + Math.floor(rand(y * 41) * 5);
    for (let i = 0; i < flowers; i += 1) {
      row.decor.push({
        x: rand(y * 43 + i * 3) * COLS,
        tint: Math.floor(rand(y * 47 + i) * 3),
      });
    }
    if (y > 2 && rand(y * 29) > 0.55) {
      let col = Math.floor(rand(y * 31) * COLS);
      let guard = 0;
      while (row.trees.includes(col) && guard < COLS) {
        col = (col + 1) % COLS;
        guard += 1;
      }
      if (!row.trees.includes(col)) row.coins.push({ x: col, got: false });
    }
  }

  if (kind === 'road') {
    const boost = y < 16 ? y * 0.01 : Math.min(2.4, (y - 12) * 0.03);
    const vary = y < 16 ? 0.4 : 0.85;
    row.speed = (0.9 + boost + rand(y * 5) * vary) * row.dir;
    const count = 2 + (y > 26 && rand(y * 9) > 0.5 ? 1 : 0);
    for (let i = 0; i < count; i += 1) {
      const roll = rand(y * 11 + i * 5);
      let kind = 'car';
      let len = 1.22;
      if (y > 8 && roll > 0.82) {
        kind = 'truck';
        len = 2.2;
      } else if (y > 16 && roll > 0.68) {
        kind = 'bus';
        len = 2.5;
      }
      row.actors.push({
        x: (i + 0.25) * (SPAN / count),
        len,
        kind,
        paint: Math.floor(rand(y * 23 + i * 7) * 8),
      });
    }
    if (y < 18) shiftUntil(row.actors, 4, false);
    else wrapActors(row.actors);
  }

  if (kind === 'river') {
    const boost = Math.min(1.15, y * 0.012);
    row.speed = (0.62 + boost + rand(y * 5) * 0.38) * row.dir;
    for (let i = 0; i < 3; i += 1) {
      row.actors.push({
        x: (i + 0.2) * (SPAN / 3),
        len: 1.85 + rand(y * 11 + i * 3) * 1.25,
        kind: 'log',
      });
    }
    if (y < 20) shiftUntil(row.actors, 4, true);
    else wrapActors(row.actors);
  }

  if (kind === 'rail') {
    row.speed = 13 * row.dir;
    row.nextTrain = 1.7 + rand(y * 19) * 2.1;
  }

  return row;
}

export function stepRow(row, dt) {
  if (row.kind === 'road' || row.kind === 'river') {
    for (const actor of row.actors) {
      actor.x += row.speed * dt;
      if (actor.x >= SPAN) actor.x -= SPAN;
      if (actor.x < -3) actor.x += SPAN;
    }
    return;
  }
  if (row.kind !== 'rail') return;
  if (!row.trainOn) {
    row.nextTrain -= dt;
    row.warning = row.nextTrain < 1.15 && row.nextTrain > 0;
    if (row.nextTrain <= 0) {
      row.trainOn = true;
      row.warning = false;
      row.trainX = row.dir > 0 ? -TRAIN_LEN - 0.5 : COLS + 0.6;
    }
    return;
  }
  row.trainX += row.speed * dt;
  const gone = row.dir > 0 ? row.trainX > COLS + 1 : row.trainX + TRAIN_LEN < -1;
  if (gone) {
    row.trainOn = false;
    row.trips += 1;
    row.nextTrain = 2.3 + rand(row.y * 31 + row.trips * 17) * 2.6;
  }
}

export function trainHits(row, x) {
  if (!row.trainOn) return false;
  const left = x + 0.16;
  const right = x + 0.84;
  return right > row.trainX && left < row.trainX + TRAIN_LEN;
}

export function hopTarget(x, y, dx, dy, rowAt) {
  if (!dx && !dy) return null;
  const y1 = y + dy;
  if (y1 < 0) return null;
  const dest = rowAt(Math.round(y1));
  if (!dest) return null;
  const x1 = dest.kind === 'river' ? x + dx : Math.round(x + dx);
  if (x1 < 0 || x1 > COLS - 1) return null;
  if (dest.kind === 'grass' && dest.trees.includes(Math.round(x1))) return null;
  return { x: x1, y: y1 };
}
