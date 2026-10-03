import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canStep,
  cellKey,
  countBlocks,
  placeBlock,
  seedPlanet,
  takeBlock,
} from './planetWorld.js';

test('a new planet has ground under the start', () => {
  const cells = seedPlanet();
  assert.ok(cells[cellKey(0, 0)].includes('grass'));
  assert.equal(canStep(cells, 0, 0, 0, -1), true);
  assert.ok(countBlocks(cells) > 20);
});

test('place grows empty space up to the height you are standing on', () => {
  const cells = { [cellKey(0, 0)]: ['stone', 'dirt', 'grass'] };
  const next = placeBlock(cells, 0, 0, 1, 0, 'sand');
  assert.deepEqual(next[cellKey(1, 0)], ['sand', 'sand', 'sand']);
  assert.equal(canStep(next, 0, 0, 1, 0), true);
});

test('place stacks when the front tile is already as tall', () => {
  const cells = {
    [cellKey(0, 0)]: ['grass'],
    [cellKey(0, -1)]: ['grass'],
  };
  const next = placeBlock(cells, 0, 0, 0, -1, 'wood');
  assert.deepEqual(next[cellKey(0, -1)], ['grass', 'wood']);
});

test('you cannot walk off the edge or up a cliff', () => {
  const cells = { [cellKey(0, 0)]: ['grass', 'grass'] };
  assert.equal(canStep(cells, 0, 0, 1, 0), false);
  cells[cellKey(1, 0)] = ['grass', 'grass', 'grass', 'grass'];
  assert.equal(canStep(cells, 0, 0, 1, 0), false);
});

test('take removes one block and can open a hole', () => {
  const cells = {
    [cellKey(0, 0)]: ['grass'],
    [cellKey(1, 0)]: ['sand', 'sand'],
  };
  const once = takeBlock(cells, 0, 0, 1, 0);
  assert.deepEqual(once[cellKey(1, 0)], ['sand']);
  const twice = takeBlock(once, 0, 0, 1, 0);
  assert.equal(twice[cellKey(1, 0)], undefined);
});
