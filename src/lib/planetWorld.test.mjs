import assert from 'node:assert/strict';
import test from 'node:test';
import {
  SIZE,
  canStep,
  findPath,
  cellKey,
  gatherNode,
  makeQuests,
  makeWorld,
  placeBuilt,
  planProgress,
  reachable,
  spawn,
  surfaceHeight,
  takeBuilt,
  tileAt,
} from './planetWorld.js';

test('the planet is a wide walkable meadow at the start', () => {
  const world = makeWorld(7);
  const { x, z } = spawn();
  assert.equal(SIZE, 72);
  assert.equal(tileAt(world, x, z).id, 'grass');
  assert.equal(canStep(world, x, z, 1, 0), true);
  assert.ok(Object.keys(world.nodes).length > 40);
});

test('a click path stays on the ground', () => {
  const world = makeWorld(7);
  const { x, z } = spawn();
  const path = findPath(world, x, z, x + 4, z + 1);
  assert.ok(path.length >= 4);
  assert.equal(path[0].x === x && path[0].z === z, false);
  assert.equal(path[path.length - 1].x, x + 4);
});

test('cliffs are not a single step', () => {
  const world = makeWorld(7);
  const { x, z } = spawn();
  world.ground[(z) * SIZE + (x + 1)].h = surfaceHeight(world, x, z) + 3;
  assert.equal(canStep(world, x, z, 1, 0), false);
});

test('water stops a walk until a block bridges it', () => {
  const world = makeWorld(7);
  const { x, z } = spawn();
  const tile = world.ground[z * SIZE + (x + 1)];
  tile.id = 'water';
  tile.h = 1;
  assert.equal(canStep(world, x, z, 1, 0), false);
  world.built[`${x + 1},${z}`] = ['wood'];
  assert.equal(canStep(world, x, z, 1, 0), true);
});

test('every blueprint and treasure chest can be walked to from home', () => {
  const world = makeWorld(7);
  const { plans, chests } = makeQuests(world);
  const seen = reachable(world, spawn().x, spawn().z);
  assert.equal(plans.length, 3);
  assert.equal(chests.length, 5);
  const used = new Set();
  for (const spot of [...plans.flatMap((plan) => plan.cells), ...chests]) {
    const key = cellKey(spot.x, spot.z);
    assert.ok(seen.has(key), `${key} is reachable`);
    assert.equal(used.has(key), false);
    used.add(key);
  }
  const tower = plans.find((plan) => plan.id === 'tower');
  assert.deepEqual(planProgress(world, tower), { have: 0, need: 4, done: false });
  world.built[cellKey(tower.cells[0].x, tower.cells[0].z)] = ['stone', 'wood', 'stone', 'stone', 'leaf'];
  assert.equal(planProgress(world, tower).done, true);
});

test('gathering a tree gives wood and placing spends it', () => {
  const world = makeWorld(7);
  const { x, z } = spawn();
  world.nodes[`${x + 1},${z}`] = { kind: 'tree', left: 2 };
  const bag = { wood: 0, stone: 0, gold: 0, leaf: 0 };
  assert.equal(gatherNode(world, x + 1, z), 'wood');
  bag.wood += 1;
  assert.equal(placeBuilt(world, x, z + 1, 'wood', bag), true);
  assert.equal(bag.wood, 0);
  assert.equal(surfaceHeight(world, x, z + 1), tileAt(world, x, z + 1).h + 1);
  assert.equal(takeBuilt(world, x, z + 1, bag), true);
  assert.equal(bag.wood, 1);
  assert.equal(placeBuilt(world, x, z + 1, 'stone', bag), false);
});
