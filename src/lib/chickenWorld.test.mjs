import assert from 'node:assert/strict';
import test from 'node:test';
import {
  COLS,
  HOP_TIME,
  LOG_PAD,
  ROAD_PAD,
  SPAN,
  createRow,
  hopTarget,
  kindFor,
  occupied,
  stepRow,
  trainHits,
} from './chickenWorld.js';

test('the road starts gentle and then opens up', () => {
  assert.equal(kindFor(0), 'grass');
  assert.equal(kindFor(1), 'grass');
  assert.equal(kindFor(2), 'road');
  assert.equal(kindFor(14), 'river');
  assert.equal(kindFor(18), 'rail');
});

test('home is open and the first lane is not already blocked', () => {
  const home = createRow(0);
  assert.equal(home.trees.length, 0);
  const road = createRow(2);
  assert.equal(occupied(road.actors, 4, 0.18), false);
  const river = createRow(14);
  assert.equal(river.kind, 'river');
  assert.equal(occupied(river.actors, 4, 0.18), true);
});

test('traffic keeps moving and a gap comes back', () => {
  const road = createRow(6);
  let open = false;
  for (let i = 0; i < 160; i += 1) {
    stepRow(road, 0.05);
    for (const actor of road.actors) {
      assert.ok(actor.x < SPAN + 1);
      assert.ok(actor.x > -4);
    }
    if (!occupied(road.actors, 4, 0.2)) open = true;
  }
  assert.equal(open, true);
});

test('a train crosses the lane it belongs to', () => {
  const rail = createRow(18);
  assert.equal(rail.kind, 'rail');
  let crossed = false;
  for (let i = 0; i < 200; i += 1) {
    stepRow(rail, 0.05);
    if (trainHits(rail, 4)) crossed = true;
  }
  assert.equal(crossed, true);
});

function landSafe(row, x) {
  if (row.kind === 'grass') return !row.trees.includes(Math.round(x));
  if (row.kind === 'road') return !occupied(row.actors, x, ROAD_PAD);
  if (row.kind === 'river') return occupied(row.actors, x, LOG_PAD);
  if (row.kind === 'rail') return !trainHits(row, x);
  return false;
}

test('a patient hop forward gets through the opening', () => {
  const rows = new Map();
  const at = (y) => {
    if (!rows.has(y)) rows.set(y, createRow(y));
    return rows.get(y);
  };
  const advance = (dt) => {
    for (let rowY = 0; rowY <= y + 12; rowY += 1) stepRow(at(rowY), dt);
  };
  let x = 4;
  let y = 0;
  let alive = true;
  let waits = 0;
  for (let guard = 0; guard < 500 && y < 22 && alive; guard += 1) {
    const here = at(Math.round(y));
    const urgent = here.kind === 'road' || here.kind === 'rail';
    const options = urgent ? [[0, 1], [-1, 0], [1, 0], [0, -1]] : [[0, 1]];
    let dest = null;
    for (const [dx, dy] of options) {
      const hop = hopTarget(x, y, dx, dy, at);
      if (hop && landSafe(at(hop.y), hop.x)) {
        dest = hop;
        break;
      }
    }
    if (dest) {
      const landing = at(dest.y);
      const log = landing.kind === 'river'
        ? landing.actors.find((actor) => dest.x + 0.92 > actor.x && dest.x + 0.08 < actor.x + actor.len)
        : null;
      const offset = log ? dest.x - log.x : 0;
      advance(HOP_TIME);
      x = log ? log.x + offset : dest.x;
      y = dest.y;
      if (log && (x < -0.2 || x > COLS - 0.8)) alive = false;
      waits = 0;
      continue;
    }
    advance(0.05);
    const stood = at(Math.round(y));
    if (stood.kind === 'river') {
      x += stood.speed * 0.05;
      if (x < -0.2 || x > COLS - 0.8 || !occupied(stood.actors, x, LOG_PAD)) alive = false;
    } else if ((stood.kind === 'road' && occupied(stood.actors, x, ROAD_PAD)) || (stood.kind === 'rail' && trainHits(stood, x))) {
      alive = false;
    }
    waits += 1;
    if (waits > 240) break;
  }
  assert.equal(alive, true);
  assert.ok(y >= 18, `stopped at row ${y}`);
});

test('hops stay on the board and off the trees', () => {
  const rows = new Map();
  const at = (y) => {
    if (!rows.has(y)) rows.set(y, createRow(y));
    return rows.get(y);
  };
  assert.equal(hopTarget(4, 0, 0, -1, at), null);
  assert.equal(hopTarget(0, 0, -1, 0, at), null);
  assert.deepEqual(hopTarget(4, 0, 0, 1, at), { x: 4, y: 1 });
  let treeRow = null;
  for (let y = 0; y < 30 && !treeRow; y += 1) {
    const row = at(y);
    if (row.kind === 'grass' && row.trees.length && y > 0) treeRow = row;
  }
  assert.ok(treeRow);
  const tree = treeRow.trees[0];
  const fromX = (tree + 1) % COLS;
  assert.equal(hopTarget(fromX, treeRow.y - 1, tree - fromX, 1, at), null);
});
