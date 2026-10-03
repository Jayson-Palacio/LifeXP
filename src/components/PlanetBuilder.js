'use client';

import { useEffect, useRef, useState } from 'react';
import {
  BLOCKS,
  MAX_HEIGHT,
  NODES,
  blockById,
  canStep,
  cellKey,
  findPath,
  inBounds,
  gatherNode,
  makeWorld,
  nearestStand,
  nodeAt,
  placeBuilt,
  spawn,
  surfaceHeight,
  takeBuilt,
  tileAt,
} from '../lib/planetWorld';
import {
  HERO,
  PATH_TEX,
  TERRAIN,
  blockTex,
  bloomModel,
  bushModel,
  crystalModel,
  fireModel,
  flowerModel,
  hash,
  lampModel,
  lilyModel,
  mushroomModel,
  pebbleModel,
  pillarModel,
  rabbitModel,
  reedModel,
  rockModel,
  seatModel,
  signModel,
  stumpModel,
  tentModel,
  treeModel,
} from '../lib/planetArt';

const SAVE_KEY = 'kaeluma.play.planet.v6';
const PITCH = -0.3;
const ORIGIN = 0.56;
const FOV = 1.1;

function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

const FACES = [
  { key: 'front', n: [0, 0, 1], u: [0, 1, 0] },
  { key: 'back', n: [0, 0, -1], u: [0, 1, 0] },
  { key: 'right', n: [1, 0, 0], u: [0, 1, 0] },
  { key: 'left', n: [-1, 0, 0], u: [0, 1, 0] },
  { key: 'top', n: [0, 1, 0], u: [0, 0, -1] },
  { key: 'bottom', n: [0, -1, 0], u: [0, 0, 1] },
].map((face) => ({ ...face, r: cross(face.u, face.n.map((v) => -v)) }));
const LIGHT = (() => {
  const v = [-0.45, 0.8, -0.4];
  const len = Math.hypot(...v);
  return v.map((x) => x / len);
})();

function polygon(ctx, points, color, pad) {
  let cx = 0;
  let cy = 0;
  for (const point of points) {
    cx += point.x;
    cy += point.y;
  }
  cx /= points.length;
  cy /= points.length;
  ctx.beginPath();
  points.forEach((point, i) => {
    const dx = point.x - cx;
    const dy = point.y - cy;
    const len = Math.hypot(dx, dy) || 1;
    const x = point.x + (dx / len) * pad;
    const y = point.y + (dy / len) * pad;
    if (i) ctx.lineTo(x, y);
    else ctx.moveTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function emptyBag() {
  return { wood: 0, stone: 0, gold: 0, leaf: 0 };
}

function loadSave() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (!raw || raw.seed == null || !raw.bag) return null;
    return raw;
  } catch {
    return null;
  }
}

const shadeCache = new Map();
function shade(hex, amount) {
  const key = hex + amount;
  let out = shadeCache.get(key);
  if (!out) {
    const value = parseInt(hex.slice(1), 16);
    const channel = (shift) => Math.max(0, Math.min(255, ((value >> shift) & 255) + amount));
    out = `rgb(${channel(16)} ${channel(8)} ${channel(0)})`;
    shadeCache.set(key, out);
  }
  return out;
}

class PlanetGame {
  constructor(canvas, ui) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ui = ui;
    const saved = loadSave();
    this.world = makeWorld(saved?.seed ?? 7);
    if (saved?.built) this.world.built = saved.built;
    if (saved?.nodes) {
      Object.entries(saved.nodes).forEach(([key, left]) => {
        if (this.world.nodes[key]) this.world.nodes[key].left = left;
      });
    }
    const home = spawn();
    this.ix = saved?.ix ?? home.x;
    this.iz = saved?.iz ?? home.z;
    this.px = this.ix + 0.5;
    this.pz = this.iz + 0.5;
    this.hop = null;
    this.path = [];
    this.job = null;
    this.placeOnArrive = null;
    this.bag = { ...emptyBag(), ...(saved?.bag || {}) };
    this.stats = { wood: 0, stone: 0, built: 0, ...(saved?.stats || {}) };
    this.near = null;
    this.critters = [0, 1, 2, 3, 4, 5].map((i) => ({
      x: home.x - 4 + i * 1.6,
      z: home.z + 4 + (i % 2),
      face: 1,
      hop: 0,
      wait: 0.4 * i,
    }));
    this.motes = Array.from({ length: 18 }, (_, i) => ({
      x: home.x - 7 + (i % 6) * 2.3,
      z: home.z - 3 + (i % 5) * 2.1,
      phase: i * 0.65,
    }));
    this.wings = [0, 1, 2, 3].map((i) => ({
      x: home.x + 2 + i * 2.2,
      z: home.z + 3 + (i % 2) * 1.4,
      phase: i * 1.3,
    }));
    this.yaw = saved?.yaw ?? 0.7;
    this.yawTarget = this.yaw;
    this.viewMode = ['behind', 'side', 'front'].includes(saved?.viewMode) ? saved.viewMode : 'behind';
    this.heading = this.yaw;
    this.headingTarget = this.yaw;
    this.idle = 0;
    this.stride = 1;
    this.audio = null;
    this.held = null;
    this.cam = {
      x: this.px - Math.sin(this.yaw) * 5.8,
      y: this.height() + 3,
      z: this.pz - Math.cos(this.yaw) * 5.8,
    };
    this.view = { w: 1, h: 1, dpr: 1 };
    this.hits = [];
    this.floats = [];
    this.bits = [];
    this.wobble = 0;
    this.time = 0;
    this.stopped = false;
    this.ui.onBag({ ...this.bag });
    this.ui.onStats({ ...this.stats });
    this.ui.onView(this.viewMode);
    this.reportNearby();
  }

  reportNearby() {
    let best = null;
    let bestDist = 3;
    Object.entries(this.world.nodes).forEach(([key, node]) => {
      if (!node.left) return;
      const [x, z] = key.split(',').map(Number);
      const dist = Math.abs(x - this.ix) + Math.abs(z - this.iz);
      if (dist > 0 && dist < bestDist) {
        bestDist = dist;
        best = { x, z, kind: node.kind, name: NODES[node.kind].name };
      }
    });
    this.near = best;
    this.ui.onNearby(best);
  }

  frontTile() {
    const { fx, fz } = this.screenAxes();
    const dx = Math.abs(fx) > Math.abs(fz) ? Math.sign(fx) : 0;
    const dz = Math.abs(fz) >= Math.abs(fx) ? Math.sign(fz) : 0;
    return { x: this.ix + (dx || 0), z: this.iz + (dz || -1) };
  }

  findWork() {
    let best = null;
    let bestDist = 1e9;
    Object.entries(this.world.nodes).forEach(([key, node]) => {
      if (!node.left) return;
      const [x, z] = key.split(',').map(Number);
      const dist = Math.abs(x - this.ix) + Math.abs(z - this.iz);
      if (dist < bestDist) {
        bestDist = dist;
        best = { x, z };
      }
    });
    if (best) this.goGather(best.x, best.z);
  }

  buildSpots() {
    const front = this.frontTile();
    return [
      front,
      { x: this.ix + 1, z: this.iz },
      { x: this.ix - 1, z: this.iz },
      { x: this.ix, z: this.iz + 1 },
      { x: this.ix, z: this.iz - 1 },
    ];
  }

  canBuild(x, z) {
    if (!inBounds(x, z)) return false;
    if (nodeAt(this.world, x, z)?.left > 0) return false;
    const h = surfaceHeight(this.world, x, z);
    return h != null && h < MAX_HEIGHT;
  }

  buildSpot() {
    return this.buildSpots().find((spot) => this.canBuild(spot.x, spot.z)) || null;
  }

  act() {
    this.unlock();
    const id = this.ui.blockId();
    if (id && (this.bag[id] || 0) > 0) {
      const spot = this.buildSpot();
      if (spot) this.tryPlace(spot.x, spot.z);
      return;
    }
    if (this.near) {
      this.goGather(this.near.x, this.near.z);
      return;
    }
    this.findWork();
  }

  unlock() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!this.audio) this.audio = new Ctx();
    if (this.audio.state === 'suspended') this.audio.resume();
  }

  tone(freq, dur, type, vol, slide) {
    if (!this.audio || this.audio.state === 'closed') return;
    try {
      const t = this.audio.currentTime;
      const osc = this.audio.createOscillator();
      const gain = this.audio.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(40, freq), t);
      if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slide), t + dur);
      gain.gain.setValueAtTime(Math.max(0.0001, vol), t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gain);
      gain.connect(this.audio.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    } catch {
      /* a missed note should not stop the walk */
    }
  }

  height() {
    return surfaceHeight(this.world, this.ix, this.iz) || 1;
  }

  wideFrame() {
    return this.view.w > this.view.h * 1.05;
  }

  persist() {
    const nodes = {};
    Object.entries(this.world.nodes).forEach(([key, node]) => {
      nodes[key] = node.left;
    });
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        seed: this.world.seed,
        ix: this.ix,
        iz: this.iz,
        yaw: this.yawTarget,
        viewMode: this.viewMode,
        built: this.world.built,
        nodes,
        bag: this.bag,
        stats: this.stats,
      }));
    } catch { /* private mode */ }
  }

  start() {
    this.layout();
    this.obs = new ResizeObserver(() => this.layout());
    this.obs.observe(this.canvas.parentElement);
    window.addEventListener('keydown', this.onKey);
    this.canvas.addEventListener('pointerdown', this.onDown);
    this.last = 0;
    this.raf = requestAnimationFrame(this.frame);
  }

  stop() {
    this.stopped = true;
    cancelAnimationFrame(this.raf);
    this.obs?.disconnect();
    window.removeEventListener('keydown', this.onKey);
    this.canvas.removeEventListener('pointerdown', this.onDown);
  }

  layout() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.view = { w: rect.width, h: rect.height, dpr };
    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);
  }

  project(wx, wy, wz) {
    const dx = wx - this.cam.x;
    const dy = wy - this.cam.y;
    const dz = wz - this.cam.z;
    const aim = this.lookYaw();
    const cos = Math.cos(aim);
    const sin = Math.sin(aim);
    const rx = dx * cos - dz * sin;
    const rz = dx * sin + dz * cos;
    const cp = Math.cos(PITCH);
    const sp = Math.sin(PITCH);
    const y2 = dy * cp - rz * sp;
    const z2 = dy * sp + rz * cp;
    if (z2 < 0.8) return null;
    const fov = this.view.h * FOV;
    return {
      x: this.view.w * 0.5 + (rx / z2) * fov,
      y: this.view.h * ORIGIN - (y2 / z2) * fov,
      z: z2,
      scale: fov / z2,
    };
  }

  onKey = (event) => {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    const stick = {
      ArrowUp: [0, -1], w: [0, -1],
      ArrowDown: [0, 1], s: [0, 1],
      ArrowLeft: [-1, 0], a: [-1, 0],
      ArrowRight: [1, 0], d: [1, 0],
    }[key];
    if (stick) {
      event.preventDefault();
      this.stepScreen(stick[0], stick[1]);
      return;
    }
    if (key === 'q') this.turn(-1);
    if (key === 'e') this.turn(1);
    if (key === 'v') this.cycleView();
  };

  onDown = (event) => {
    this.unlock();
    if (event.button != null && event.button !== 0) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let best = null;
    let bestDist = 72;
    for (let i = 0; i < this.hits.length; i += 1) {
      const hit = this.hits[i];
      const dist = Math.hypot(hit.sx - x, hit.sy - y);
      if (dist < bestDist) {
        bestDist = dist;
        best = hit;
      }
    }
    if (!best) return;
    this.ui.onHideHint();
    if (best.node) {
      this.goGather(best.x, best.z);
      return;
    }
    const selected = this.ui.blockId();
    const near = Math.abs(best.x - this.ix) + Math.abs(best.z - this.iz) <= 1;
    if (selected && near) {
      this.tryPlace(best.x, best.z);
      return;
    }
    if (selected) {
      this.placeOnArrive = { x: best.x, z: best.z };
      this.walkTo(best.x, best.z);
      return;
    }
    this.placeOnArrive = null;
    this.job = null;
    this.walkTo(best.x, best.z);
  };

  lookYaw() {
    if (this.viewMode === 'side') return this.yaw + Math.PI / 2;
    if (this.viewMode === 'front') return this.yaw + Math.PI;
    return this.yaw;
  }

  cycleView() {
    const order = ['behind', 'side', 'front'];
    const next = order[(order.indexOf(this.viewMode) + 1) % order.length];
    this.viewMode = next;
    this.ui.onView(next);
    this.persist();
    return next;
  }

  screenAxes() {
    const aim = this.lookYaw();
    const fx = Math.sin(aim);
    const fz = Math.cos(aim);
    const rx = Math.cos(aim);
    const rz = -Math.sin(aim);
    return { fx, fz, rx, rz };
  }

  stepScreen(sx, sy) {
    this.unlock();
    const { fx, fz, rx, rz } = this.screenAxes();
    const wx = rx * sx + fx * -sy;
    const wz = rz * sx + fz * -sy;
    const dx = Math.abs(wx) > Math.abs(wz) ? Math.sign(wx) : 0;
    const dz = Math.abs(wz) >= Math.abs(wx) ? Math.sign(wz) : 0;
    this.path = [];
    this.job = null;
    this.placeOnArrive = null;
    this.tryStep(dx, dz);
  }

  tryStep(dx, dz) {
    if (!dx && !dz) return;
    if (this.hop) return;
    if (!canStep(this.world, this.ix, this.iz, dx, dz)) return;
    this.headingTarget = Math.atan2(dx, dz);
    this.idle = 0;
    this.stride = -this.stride;
    this.tone(220, 0.045, 'triangle', 0.03, 320);
    this.hop = {
      x0: this.ix,
      z0: this.iz,
      x1: this.ix + dx,
      z1: this.iz + dz,
      t: 0,
    };
  }

  walkTo(x, z) {
    const path = findPath(this.world, this.ix, this.iz, x, z);
    this.path = path.slice(0, 24);
  }

  goGather(x, z) {
    const node = nodeAt(this.world, x, z);
    if (!node || node.left <= 0) return;
    const stand = nearestStand(this.world, x, z, this.ix, this.iz);
    if (!stand) return;
    this.placeOnArrive = null;
    if (Math.abs(stand.x - this.ix) + Math.abs(stand.z - this.iz) === 0) {
      this.job = { x, z, t: 0 };
      this.path = [];
      return;
    }
    this.job = { x, z, t: 0, wait: true };
    this.walkTo(stand.x, stand.z);
  }

  tryPlace(x, z) {
    const id = this.ui.blockId();
    if (!id) return;
    if (placeBuilt(this.world, x, z, id, this.bag)) {
      this.stats.built += 1;
      this.ui.onBag({ ...this.bag });
      this.ui.onStats({ ...this.stats });
      this.persist();
      this.float('+ built', x + 0.5, z + 0.5);
      this.tone(520, 0.08, 'triangle', 0.05, 740);
      return true;
    }
    return false;
  }

  takeHere() {
    const spots = [
      [this.ix, this.iz],
      [this.ix + 1, this.iz],
      [this.ix - 1, this.iz],
      [this.ix, this.iz + 1],
      [this.ix, this.iz - 1],
    ];
    for (let i = 0; i < spots.length; i += 1) {
      if (takeBuilt(this.world, spots[i][0], spots[i][1], this.bag)) {
        this.ui.onBag({ ...this.bag });
        this.persist();
        return;
      }
    }
  }

  turn(dir) {
    this.yawTarget += dir * 0.65;
  }

  float(text, x, z) {
    this.floats.push({ text, x, z, life: 0.9 });
  }

  burst(x, z, y, color) {
    for (let i = 0; i < 10; i += 1) {
      const angle = (i / 10) * Math.PI * 2;
      this.bits.push({
        x,
        z,
        y,
        vx: Math.cos(angle) * 1.5,
        vz: Math.sin(angle) * 1.5,
        vy: 1.4 + (i % 3) * 0.35,
        life: 0.75,
        color,
      });
    }
  }

  frame = (now) => {
    if (this.stopped) return;
    const dt = this.last ? Math.min(0.034, (now - this.last) / 1000) : 0.016;
    this.last = now;
    this.time += dt;
    this.yaw += (this.yawTarget - this.yaw) * Math.min(1, dt * 5);
    if (this.hop) {
      this.hop.t += dt / 0.18;
      const t = Math.min(1, this.hop.t);
      const e = 1 - (1 - t) ** 2;
      this.px = this.hop.x0 + 0.5 + (this.hop.x1 - this.hop.x0) * e;
      this.pz = this.hop.z0 + 0.5 + (this.hop.z1 - this.hop.z0) * e;
      if (t >= 1) {
        this.ix = this.hop.x1;
        this.iz = this.hop.z1;
        this.px = this.ix + 0.5;
        this.pz = this.iz + 0.5;
        this.hop = null;
        this.persist();
        this.reportNearby();
      }
    } else if (this.path.length) {
      const next = this.path[0];
      const dx = next.x - this.ix;
      const dz = next.z - this.iz;
      if (Math.abs(dx) + Math.abs(dz) === 1 && canStep(this.world, this.ix, this.iz, dx, dz)) {
        this.path.shift();
        this.tryStep(dx, dz);
      } else {
        this.path = [];
      }
    } else if (this.held) {
      this.stepScreen(this.held[0], this.held[1]);
    }

    if (this.job) {
      const beside = Math.abs(this.job.x - this.ix) + Math.abs(this.job.z - this.iz) === 1;
      if (this.job.wait && beside && !this.path.length && !this.hop) this.job.wait = false;
      if (!this.job.wait && beside && !this.hop) {
        this.wobble = 1;
        const spec = NODES[nodeAt(this.world, this.job.x, this.job.z)?.kind] || NODES.tree;
        this.job.t += dt;
        this.ui.onGather(spec.name, Math.min(1, this.job.t / spec.time));
        if (this.job.t >= spec.time) {
          const item = gatherNode(this.world, this.job.x, this.job.z);
          if (item) {
            this.bag[item] += 1;
            if (item === 'wood' || item === 'stone') this.stats[item] += 1;
            this.ui.onBag({ ...this.bag });
            this.ui.onStats({ ...this.stats });
            this.float(`+ ${blockById(item).name}`, this.job.x + 0.5, this.job.z + 0.5);
            this.burst(this.job.x + 0.5, this.job.z + 0.5, surfaceHeight(this.world, this.job.x, this.job.z) + 1.2, blockById(item).top);
            this.tone(item === 'gold' ? 880 : 360, 0.07, 'triangle', 0.05, item === 'gold' ? 1320 : 540);
            this.persist();
          }
          const left = nodeAt(this.world, this.job.x, this.job.z);
          if (!left || left.left <= 0) this.job = null;
          else this.job.t = 0;
        }
      } else if (!beside && !this.path.length && !this.hop) {
        this.job = null;
      }
      if (!this.job) this.ui.onGather(null, 0);
    }

    if (this.placeOnArrive && !this.path.length && !this.hop) {
      const spot = this.placeOnArrive;
      this.placeOnArrive = null;
      if (Math.abs(spot.x - this.ix) + Math.abs(spot.z - this.iz) <= 1) this.tryPlace(spot.x, spot.z);
    }

    if (this.job && !this.job.wait) {
      this.headingTarget = Math.atan2(this.job.x - this.ix, this.job.z - this.iz);
      this.idle = 0;
    } else if (!this.hop && !this.path.length) {
      this.idle += dt;
      if (this.idle > 1.2) this.headingTarget = this.yaw;
    }
    let turnBy = this.headingTarget - this.heading;
    turnBy = Math.atan2(Math.sin(turnBy), Math.cos(turnBy));
    this.heading += turnBy * Math.min(1, dt * 12);

    for (const critter of this.critters) this.stepCritter(critter, dt);
    for (const floater of this.floats) floater.life -= dt;
    this.floats = this.floats.filter((floater) => floater.life > 0);
    this.wobble = Math.max(0, this.wobble - dt * 2.4);
    for (const bit of this.bits) {
      bit.x += bit.vx * dt;
      bit.z += bit.vz * dt;
      bit.y += bit.vy * dt;
      bit.vy -= 3.2 * dt;
      bit.life -= dt;
    }
    this.bits = this.bits.filter((bit) => bit.life > 0);

    const aim = this.lookYaw();
    const reach = this.viewMode === 'side' ? 7.4 : this.viewMode === 'front' ? 6.4 : 6;
    const rise = this.viewMode === 'side' ? 3.3 : this.viewMode === 'front' ? 2.6 : 2.8;
    const base = this.height();
    let need = rise;
    for (let s = 0.8; s <= reach; s += 0.4) {
      const ground = surfaceHeight(this.world, Math.floor(this.px - Math.sin(aim) * s), Math.floor(this.pz - Math.cos(aim) * s));
      if (ground == null) continue;
      const over = ground + 0.35 - (base + 1.4);
      if (over > 0) need = Math.max(need, 1.4 + (over * reach) / s);
    }
    const capped = Math.min(need, rise + 1.4);
    const back = need > capped ? Math.max(2.8, (reach * (capped - 1.4)) / (need - 1.4)) : reach;
    const shoulder = this.viewMode === 'behind' ? 0.35 : 0;
    const lift = base + capped;
    const gx = this.px - Math.sin(aim) * back + Math.cos(aim) * shoulder;
    const gz = this.pz - Math.cos(aim) * back - Math.sin(aim) * shoulder;
    this.cam.x += (gx - this.cam.x) * Math.min(1, dt * 7);
    this.cam.z += (gz - this.cam.z) * Math.min(1, dt * 7);
    this.cam.y += (lift - this.cam.y) * Math.min(1, dt * 7);
    this.draw();
    this.raf = requestAnimationFrame(this.frame);
  };

  draw() {
    const ctx = this.ctx;
    const { w, h, dpr } = this.view;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const horizon = h * ORIGIN - Math.tan(-PITCH) * h * FOV;
    const pan = this.lookYaw();
    const sky = ctx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, '#140e2e');
    sky.addColorStop(0.4, '#3d2b78');
    sky.addColorStop(0.75, '#c56b8c');
    sky.addColorStop(1, '#f3c48a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    const sunX = (((0.78 - pan * 0.3) % 1.6) + 1.6) % 1.6 * w - w * 0.3;
    const sunY = horizon * 0.72;
    for (const [size, alpha] of [[150, 0.08], [96, 0.12], [58, 0.2]]) {
      ctx.fillStyle = `rgba(255, 214, 120, ${alpha})`;
      ctx.fillRect(sunX - size / 2, sunY - size / 2, size, size);
    }
    ctx.fillStyle = '#ffe9a8';
    ctx.fillRect(sunX - 17, sunY - 17, 34, 34);
    ctx.fillStyle = '#fff8df';
    ctx.fillRect(sunX - 11, sunY - 11, 22, 22);
    const moonX = w * 0.16;
    const moonY = h * (this.wideFrame() ? 0.14 : 0.11);
    const moon = this.wideFrame() ? 24 : 32;
    ctx.fillStyle = 'rgba(244, 239, 228, 0.95)';
    ctx.fillRect(moonX - moon / 2, moonY - moon / 2, moon, moon);
    ctx.fillStyle = 'rgba(200, 192, 214, 0.9)';
    ctx.fillRect(moonX - moon * 0.3, moonY - moon * 0.2, moon * 0.18, moon * 0.18);
    ctx.fillRect(moonX + moon * 0.05, moonY + moon * 0.12, moon * 0.22, moon * 0.18);
    for (let i = 0; i < 60; i += 1) {
      const sx = ((hash(i * 3.1) * w * 2 - pan * w * 0.25) % w + w) % w;
      const sy = hash(i * 7.7) * horizon * 0.7;
      const tw = 0.35 + Math.sin(this.time * (1.5 + hash(i) * 2) + i) * 0.35;
      const size = hash(i * 1.3) > 0.8 ? 3 : 2;
      ctx.globalAlpha = Math.max(0.05, tw);
      ctx.fillStyle = '#fff';
      ctx.fillRect(Math.round(sx), Math.round(sy), size, size);
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 4; i += 1) {
      const cell = 12;
      const cx = ((i * 0.27 + this.time * 0.006 - pan * 0.12) % 1.35 + 1.35) % 1.35 * w - w * 0.15;
      const cy = Math.round(horizon * (0.25 + i * 0.13) / 4) * 4;
      const span = 7 + (i % 3) * 2;
      ctx.fillStyle = 'rgba(214, 160, 200, 0.8)';
      ctx.fillRect(cx - (span / 2) * cell, cy, span * cell, cell);
      ctx.fillStyle = 'rgba(255, 236, 240, 0.92)';
      ctx.fillRect(cx - (span / 2) * cell, cy - cell, span * cell, cell);
      ctx.fillRect(cx - (span / 2 - 1 - (i % 2)) * cell, cy - cell * 2, (span - 3) * cell, cell);
    }
    this.drawIslands(horizon, pan);
    this.drawRidge('#6c5aa6', horizon, h * 0.11, 2.2, pan * w * 0.35, 1.3, true);
    this.drawSkyline(horizon, pan);
    this.drawRidge('#45387e', horizon, h * 0.06, 3.4, pan * w * 0.55, 4.1, false);
    const field = ctx.createLinearGradient(0, horizon, 0, h);
    field.addColorStop(0, '#9a8fc0');
    field.addColorStop(0.08, '#5a86c8');
    field.addColorStop(1, '#3a86d0');
    ctx.fillStyle = field;
    ctx.fillRect(0, horizon, w, h - horizon);

    const reach = 18;
    const tiles = [];
    this.hits = [];
    for (let z = this.iz - reach; z <= this.iz + reach; z += 1) {
      for (let x = this.ix - reach; x <= this.ix + reach; x += 1) {
        const tile = tileAt(this.world, x, z);
        if (!tile) continue;
        const height = surfaceHeight(this.world, x, z);
        const corners = [
          [x, height, z],
          [x + 1, height, z],
          [x + 1, height, z + 1],
          [x, height, z + 1],
        ].map(([wx, wy, wz]) => this.project(wx, wy, wz));
        const known = corners.filter(Boolean);
        if (known.length < 3) continue;
        for (let i = 0; i < corners.length; i += 1) if (!corners[i]) corners[i] = known[0];
        const depth = (corners[0].z + corners[2].z) * 0.5;
        if (depth < 0.55 || depth > 34) continue;
        tiles.push({ x, z, height, tile, corners, depth });
      }
    }
    tiles.sort((a, b) => b.depth - a.depth);
    const props = [];
    for (let i = 0; i < tiles.length; i += 1) {
      const tile = tiles[i];
      const built = this.world.built[cellKey(tile.x, tile.z)];
      const topBlock = built?.length ? built[built.length - 1] : null;
      ctx.globalAlpha = 1;
      this.drawSides(tile, built);
      const tex = this.topTex(tile, topBlock);
      const tint = topBlock
        ? 0
        : Math.round(Math.sin(tile.x * 0.08) * 5 + Math.cos(tile.z * 0.06) * 4 + (hash(tile.x * 31 + tile.z * 57) - 0.5) * 6);
      this.drawTexels(tile.corners, tex.faces.top, tex.palette, tint + 4, { pad: 1.2, detail: tile.depth < 20 });
      const mid = this.project(tile.x + 0.5, tile.height + 0.05, tile.z + 0.5);
      const node = nodeAt(this.world, tile.x, tile.z);
      if (mid) {
        this.hits.push({
          x: tile.x,
          z: tile.z,
          sx: mid.x,
          sy: mid.y,
          node: Boolean(node && node.left > 0),
        });
      }
      if (node && node.left > 0) props.push({ depth: tile.depth - 0.05, draw: () => this.drawNode(tile, node, mid) });
      if (topBlock || tile.depth < 2.4) continue;
      if (tile.tile.lily) props.push({ depth: tile.depth + 0.01, draw: () => this.drawProp(tile, lilyModel(tile.x * 17 + tile.z * 29, this.time)) });
      if (tile.tile.reed) props.push({ depth: tile.depth - 0.02, draw: () => this.drawProp(tile, reedModel(tile.x * 19 + tile.z * 7, this.time)) });
      if (tile.tile.lamp) props.push({ depth: tile.depth - 0.03, draw: () => this.drawLamp(tile) });
      if (tile.tile.flower && tile.depth < 22) props.push({ depth: tile.depth, draw: () => this.drawProp(tile, flowerModel(tile.x * 3 + tile.z * 5)) });
      if (tile.tile.bloom) props.push({ depth: tile.depth, draw: () => this.drawBloom(tile) });
      if (tile.tile.mushroom) props.push({ depth: tile.depth, draw: () => this.drawMushroom(tile) });
      if (tile.tile.pillar) props.push({ depth: tile.depth - 0.04, draw: () => this.drawProp(tile, pillarModel()) });
      if ((tile.tile.id === 'sand' || tile.tile.id === 'stone') && ((tile.x + tile.z) % 5) === 0 && tile.depth < 18) {
        props.push({ depth: tile.depth - 0.01, draw: () => this.drawProp(tile, pebbleModel(tile.tile.id === 'sand')) });
      }
      if (node && !(node.left > 0) && node.kind === 'tree') props.push({ depth: tile.depth - 0.05, draw: () => this.drawProp(tile, stumpModel()) });
    }

    const py = this.hop
      ? surfaceHeight(this.world, this.hop.x0, this.hop.z0) * (1 - Math.min(1, this.hop.t))
        + surfaceHeight(this.world, this.hop.x1, this.hop.z1) * Math.min(1, this.hop.t)
      : this.height();
    if (this.path.length) {
      const end = this.path[this.path.length - 1];
      props.push({ depth: 8, draw: () => this.drawMark(end.x, end.z) });
    }
    if (this.world.camp) {
      const campAt = this.project(this.world.camp.x + 0.5, 1, this.world.camp.z + 0.5);
      if (campAt) props.push({ depth: campAt.z, draw: () => this.drawCamp() });
      const tentAt = this.project(this.world.camp.x + 2.4, 1, this.world.camp.z - 2.7);
      if (tentAt) props.push({ depth: tentAt.z, draw: () => this.drawTent() });
    }
    const ghost = this.buildSpot();
    if (ghost) {
      const ghostHeight = surfaceHeight(this.world, ghost.x, ghost.z);
      const ghostAt = ghostHeight == null ? null : this.project(ghost.x + 0.5, ghostHeight + 0.4, ghost.z + 0.5);
      if (ghostAt) props.push({ depth: ghostAt.z, draw: () => this.drawGhost() });
    }
    for (const critter of this.critters) {
      const at = this.project(critter.x, (surfaceHeight(this.world, Math.floor(critter.x), Math.floor(critter.z)) || 1) + 0.2, critter.z);
      if (at) props.push({ depth: at.z, draw: () => this.drawCritter(critter) });
    }
    for (const mote of this.motes) {
      const bob = 0.9 + Math.sin(this.time * 1.5 + mote.phase) * 0.4;
      const x = mote.x + Math.sin(this.time * 0.55 + mote.phase) * 0.4;
      const z = mote.z + Math.cos(this.time * 0.45 + mote.phase) * 0.4;
      const ground = surfaceHeight(this.world, Math.round(x), Math.round(z)) || 1;
      const at = this.project(x, ground + bob, z);
      if (at) props.push({ depth: at.z, draw: () => this.drawMote(at, mote.phase) });
    }
    for (const wing of this.wings) {
      const y = 1.3 + Math.sin(this.time * 1.1 + wing.phase) * 0.25;
      const x = wing.x + Math.sin(this.time * 0.35 + wing.phase) * 1.2;
      const z = wing.z + Math.cos(this.time * 0.28 + wing.phase) * 0.8;
      const ground = surfaceHeight(this.world, Math.round(x), Math.round(z)) || 1;
      const at = this.project(x, ground + y, z);
      if (at) props.push({ depth: at.z, draw: () => this.drawWing(at, wing.phase) });
    }
    props.sort((a, b) => b.depth - a.depth);
    for (let i = 0; i < props.length; i += 1) props[i].draw();
    this.drawFocus();
    this.drawHero(py);

    for (const bit of this.bits) {
      const at = this.project(bit.x, bit.y, bit.z);
      if (!at) continue;
      ctx.globalAlpha = Math.max(0, bit.life);
      const size = Math.max(4, at.scale * 0.08);
      ctx.fillStyle = bit.color;
      ctx.fillRect(at.x - size / 2, at.y - size / 2, size, size);
    }
    for (const floater of this.floats) {
      const at = this.project(floater.x, this.height() + 1.4, floater.z);
      if (!at) continue;
      ctx.globalAlpha = Math.max(0, floater.life);
      ctx.fillStyle = '#fff';
      ctx.font = '700 18px ui-sans-serif, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(floater.text, at.x, at.y - (1 - floater.life) * 24);
    }
    ctx.globalAlpha = 1;
    const fog = ctx.createLinearGradient(0, 0, 0, h * 0.14);
    fog.addColorStop(0, 'rgba(20, 14, 46, 0.5)');
    fog.addColorStop(1, 'rgba(20, 14, 46, 0)');
    ctx.fillStyle = fog;
    ctx.fillRect(0, 0, w, h * 0.14);
    const vignette = ctx.createRadialGradient(w * 0.5, h * 0.55, h * 0.45, w * 0.5, h * 0.55, w * 0.62);
    vignette.addColorStop(0, 'rgba(10, 6, 30, 0)');
    vignette.addColorStop(1, 'rgba(10, 6, 30, 0.38)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
  }

  drawSides(tile, built) {
    const edges = [
      [0, -1, [0, 1], -14],
      [1, 0, [1, 2], -30],
      [0, 1, [3, 2], -6],
      [-1, 0, [0, 3], -22],
    ];
    const ground = tile.tile.h;
    const terrain = TERRAIN[tile.tile.id] || TERRAIN.stone;
    const pick = (list, k) => list[Math.abs(tile.x * 7 + tile.z * 13 + k * 5) % list.length];
    const corner = (c, y) => this.project(tile.x + (c === 1 || c === 2 ? 1 : 0), y, tile.z + (c >= 2 ? 1 : 0));
    const detail = tile.depth < 16;
    for (const [dx, dz, [a, b], light] of edges) {
      const low = surfaceHeight(this.world, tile.x + dx, tile.z + dz);
      if (low == null || low >= tile.height) continue;
      for (let y = tile.height - 1; y >= low; y -= 1) {
        const ta = corner(a, y + 1);
        const tb = corner(b, y + 1);
        const fb = corner(b, y);
        const fa = corner(a, y);
        if (!ta || !tb || !fb || !fa) continue;
        let tex;
        if (y >= ground) tex = blockTex(built[y - ground]);
        else if (y === ground - 1) tex = pick(terrain.side, y);
        else tex = pick(terrain.under, y);
        this.drawTexels([ta, tb, fb, fa], tex.faces.front, tex.palette, light, { pad: 0.8, detail });
      }
    }
  }

  topTex(tile, topBlock) {
    if (topBlock) return blockTex(topBlock);
    if (tile.tile.path) return PATH_TEX;
    const list = (TERRAIN[tile.tile.id] || TERRAIN.stone).top;
    const flow = tile.tile.id === 'water' ? Math.floor(this.time * 1.2 + hash(tile.x * 3 + tile.z * 7) * 4) : 0;
    return list[Math.abs(tile.x * 7 + tile.z * 13 + flow) % list.length];
  }

  drawProp(tile, parts, heading = 0) {
    this.drawModel(parts, tile.x + 0.5, tile.height, tile.z + 0.5, heading);
  }

  drawModel(parts, x, y, z, heading = 0) {
    this.paintFaces(this.modelFaces(parts, { x, y, z, heading }));
  }

  halo(x, y, z, radius, [r, g, b], alpha) {
    const spot = this.worldRadius(x, y, z, radius);
    if (!spot) return;
    const ctx = this.ctx;
    const glow = ctx.createRadialGradient(spot.at.x, spot.at.y, 0, spot.at.x, spot.at.y, spot.r);
    glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
    glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    ctx.fillStyle = glow;
    ctx.fillRect(spot.at.x - spot.r, spot.at.y - spot.r, spot.r * 2, spot.r * 2);
  }

  shadowQuad(x, y, z, half) {
    const pts = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => this.project(x + a * half, y + 0.01, z + b * half));
    if (pts.some((p) => !p)) return;
    polygon(this.ctx, pts, 'rgba(12, 24, 16, 0.26)', 0);
  }

  drawLamp(tile) {
    const [ox, oz] = tile.tile.lamp === 'n' ? [0, -0.44] : [-0.44, 0];
    this.drawProp(tile, lampModel(ox, oz));
    const flicker = 0.75 + Math.sin(this.time * 7 + tile.z) * 0.08;
    this.halo(tile.x + 0.5 + ox, tile.height + 1.24, tile.z + 0.5 + oz, 0.75, [255, 214, 120], 0.5 * flicker);
  }

  stepCritter(critter, dt) {
    critter.wait -= dt;
    if (critter.hop > 0) critter.hop -= dt;
    if (critter.wait > 0 || critter.hop > 0) return;
    const options = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const [dx, dz] = options[Math.floor(Math.random() * options.length)];
    const x = Math.round(critter.x) + dx;
    const z = Math.round(critter.z) + dz;
    const tile = tileAt(this.world, x, z);
    if (tile && tile.id === 'grass' && !(nodeAt(this.world, x, z)?.left > 0)) {
      critter.x = x + 0.5;
      critter.z = z + 0.5;
      if (dx) critter.face = dx;
      critter.heading = Math.atan2(dx, dz);
      critter.hop = 0.22;
    }
    critter.wait = 0.8 + Math.random() * 1.6;
  }

  drawRidge(color, base, amp, freq, offset, seed, caps) {
    const { w, h } = this.view;
    const ctx = this.ctx;
    const step = 14;
    const fill = ctx.createLinearGradient(0, base - amp * 1.2, 0, base);
    fill.addColorStop(0, shade(color, 24));
    fill.addColorStop(1, color);
    const shift = ((offset % step) + step) % step;
    for (let x = -shift; x < w + step; x += step) {
      const t = ((x + offset + step / 2) / w) * freq;
      const raw = base - Math.abs(Math.sin(t * 1.7 + seed)) * amp - Math.sin(t * 4.3 + seed * 2) * amp * 0.22;
      const y = Math.round(raw / 6) * 6;
      ctx.fillStyle = fill;
      ctx.fillRect(Math.floor(x), y, step + 1, h - y);
      if (caps && base - y > amp * 0.72) {
        ctx.fillStyle = 'rgba(248, 240, 255, 0.85)';
        ctx.fillRect(Math.floor(x), y, step + 1, 6);
      }
    }
  }

  drawIslands(horizon, pan) {
    const { w } = this.view;
    const ctx = this.ctx;
    const islands = [
      { at: 0.22, y: 0.42, r: 44 },
      { at: 0.7, y: 0.28, r: 30 },
      { at: 1.25, y: 0.5, r: 36 },
    ];
    for (let i = 0; i < islands.length; i += 1) {
      const isle = islands[i];
      const x = Math.round((((isle.at - pan * 0.2) % 1.6) + 1.6) % 1.6 * w - w * 0.3);
      const y = Math.round(horizon * isle.y + Math.sin(this.time * 0.6 + i * 2) * 4);
      const r = isle.r;
      const layer = Math.round(r * 0.26);
      for (let k = 0; k < 4; k += 1) {
        const half = Math.round(r * (1 - k * 0.24));
        ctx.fillStyle = k % 2 ? '#54447a' : '#5b4a7e';
        ctx.fillRect(x - half, y + 6 + k * layer, half * 2, layer + 1);
        ctx.fillStyle = '#7d68a8';
        ctx.fillRect(x - half, y + 6 + k * layer, Math.round(half * 0.4), layer + 1);
      }
      ctx.fillStyle = '#8a5a34';
      ctx.fillRect(x - r, y + 3, r * 2, 4);
      ctx.fillStyle = '#5fbf62';
      ctx.fillRect(x - r, y - 1, r * 2, 5);
      ctx.fillStyle = '#5a3a22';
      ctx.fillRect(x - Math.round(r * 0.42), y - Math.round(r * 0.18), 4, Math.round(r * 0.18));
      ctx.fillStyle = '#2f8a4a';
      ctx.fillRect(x - Math.round(r * 0.6), y - Math.round(r * 0.5), Math.round(r * 0.4), Math.round(r * 0.34));
      ctx.fillStyle = 'rgba(190, 230, 255, 0.8)';
      ctx.fillRect(x + Math.round(r * 0.55), y + 4, 4, Math.round(r * 1.5));
      ctx.fillStyle = 'rgba(190, 230, 255, 0.35)';
      ctx.fillRect(x + Math.round(r * 0.55) - 3, y + 4 + Math.round(r * 1.5), 10, 3);
    }
  }

  drawSkyline(horizon, pan) {
    const { w } = this.view;
    const ctx = this.ctx;
    const base = Math.round(horizon - 6);
    const x = Math.round((((0.62 - pan * 0.32) % 1.6) + 1.6) % 1.6 * w - w * 0.3);
    ctx.fillStyle = '#2f2768';
    ctx.fillRect(x - 26, base - 16, 92, 18);
    ctx.fillRect(x, base - 34, 16, 34);
    ctx.fillRect(x + 22, base - 56, 12, 56);
    ctx.fillRect(x + 48, base - 28, 14, 28);
    for (let k = 0; k < 7; k += 1) ctx.fillRect(x - 26 + k * 14, base - 21, 7, 5);
    for (const [cx, cy] of [[x + 8, base - 34], [x + 28, base - 56], [x + 55, base - 28]]) {
      ctx.fillRect(cx - 9, cy - 6, 18, 6);
      ctx.fillRect(cx - 6, cy - 12, 12, 6);
      ctx.fillRect(cx - 3, cy - 18, 6, 6);
    }
    ctx.fillRect(x + 27, base - 86, 2, 12);
    ctx.fillStyle = '#ff7aa8';
    ctx.fillRect(x + 29, base - 86, 7, 4);
    ctx.fillStyle = '#ffe7a3';
    ctx.globalAlpha = 0.6 + Math.sin(this.time * 2) * 0.2;
    ctx.fillRect(x + 26, base - 44, 3, 5);
    ctx.fillRect(x + 5, base - 24, 3, 4);
    ctx.fillRect(x + 53, base - 18, 3, 4);
    ctx.fillRect(x + 36, base - 10, 3, 4);
    ctx.globalAlpha = 1;
  }

  strokeLoop(points) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i].x, points[i].y);
    ctx.closePath();
    ctx.stroke();
  }

  drawFocus() {
    const building = Boolean(this.ui.blockId() && (this.bag[this.ui.blockId()] || 0) > 0);
    const spot = !building && this.near ? this.near : this.frontTile();
    const h = surfaceHeight(this.world, spot.x, spot.z);
    if (h == null) return;
    const top = h + (building ? 0.82 : 0.06);
    const corners = [
      [spot.x, top, spot.z],
      [spot.x + 1, top, spot.z],
      [spot.x + 1, top, spot.z + 1],
      [spot.x, top, spot.z + 1],
    ].map(([x, y, z]) => this.project(x, y, z));
    if (corners.some((point) => !point)) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.lineWidth = 2;
    this.strokeLoop(corners);
    if (building) {
      const foot = [
        this.project(spot.x, h, spot.z + 1),
        this.project(spot.x + 1, h, spot.z + 1),
      ];
      const cap = [corners[3], corners[2]];
      if (foot.every(Boolean)) {
        ctx.beginPath();
        ctx.moveTo(foot[0].x, foot[0].y);
        ctx.lineTo(cap[0].x, cap[0].y);
        ctx.moveTo(foot[1].x, foot[1].y);
        ctx.lineTo(cap[1].x, cap[1].y);
        ctx.moveTo(foot[0].x, foot[0].y);
        ctx.lineTo(foot[1].x, foot[1].y);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawGhost() {
    const spot = this.buildSpot();
    const id = this.ui.blockId();
    if (!spot || !id) return;
    const h = surfaceHeight(this.world, spot.x, spot.z);
    if (h == null) return;
    const color = blockById(id).top;
    const top = [
      [spot.x, h + 0.78, spot.z],
      [spot.x + 1, h + 0.78, spot.z],
      [spot.x + 1, h + 0.78, spot.z + 1],
      [spot.x, h + 0.78, spot.z + 1],
    ].map(([x, y, z]) => this.project(x, y, z));
    const face = [
      this.project(spot.x, h, spot.z + 1),
      this.project(spot.x + 1, h, spot.z + 1),
      this.project(spot.x + 1, h + 0.78, spot.z + 1),
      this.project(spot.x, h + 0.78, spot.z + 1),
    ];
    if (top.some((point) => !point)) return;
    const ctx = this.ctx;
    const paint = (points, paintColor) => {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i].x, points[i].y);
      ctx.closePath();
      ctx.fillStyle = paintColor;
      ctx.fill();
    };
    ctx.save();
    ctx.globalAlpha = 0.42 + Math.sin(this.time * 5) * 0.08;
    if (face.every(Boolean)) paint(face, shade(color, -36));
    paint(top, color);
    ctx.restore();
  }

  drawCamp() {
    const camp = this.world.camp;
    if (!camp) return;
    const h = surfaceHeight(this.world, camp.x, camp.z);
    if (h == null) return;
    const ctx = this.ctx;
    const cx = camp.x + 0.5;
    const cz = camp.z + 0.5;
    const faces = this.modelFaces(seatModel(), { x: cx, y: h, z: cz });
    this.modelFaces(fireModel(this.time), { x: cx, y: h, z: cz }, faces);
    this.modelFaces(signModel(), { x: camp.x - 0.8, y: h, z: camp.z + 0.2 }, faces);
    this.paintFaces(faces);
    this.halo(cx, h + 0.4, cz, 1.3, [255, 170, 40], 0.5);
    for (let i = 0; i < 5; i += 1) {
      const t = (this.time * 0.35 + i / 5) % 1;
      const puff = this.project(cx + Math.sin(t * 5 + i) * 0.15, h + 0.8 + t * 2.2, cz);
      if (!puff || puff.z < 2.5) continue;
      const size = Math.min(36, puff.scale * (0.1 + t * 0.26));
      ctx.fillStyle = `rgba(220, 210, 235, ${0.4 * (1 - t)})`;
      ctx.fillRect(puff.x - size / 2, puff.y - size / 2, size, size);
    }
    const board = this.project(camp.x - 0.8, h + 0.67, camp.z + 0.24);
    if (board && this.cam.z > camp.z + 0.24) {
      ctx.fillStyle = '#3a2412';
      ctx.font = `700 ${Math.max(7, Math.round(board.scale * 0.13))}px ui-sans-serif, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Home', board.x, board.y);
      ctx.textBaseline = 'alphabetic';
    }
  }

  drawTent() {
    const camp = this.world.camp;
    if (!camp) return;
    const x = camp.x + 2.4;
    const z = camp.z - 2.7;
    const h = surfaceHeight(this.world, Math.floor(x), Math.floor(z)) ?? surfaceHeight(this.world, camp.x, camp.z);
    if (h == null) return;
    this.shadowQuad(x, h, z, 0.85);
    this.drawModel(tentModel(this.time), x, h, z);
  }

  drawCritter(critter) {
    const ground = surfaceHeight(this.world, Math.floor(critter.x), Math.floor(critter.z)) ?? 1;
    this.shadowQuad(critter.x, ground, critter.z - 0.04, 0.16);
    this.drawModel(rabbitModel(critter.hop), critter.x, ground, critter.z, critter.heading ?? Math.PI / 2);
  }

  drawMushroom(tile) {
    const magic = tile.tile.mushroom === 'magic';
    if (magic) this.halo(tile.x + 0.35, tile.height + 0.2, tile.z + 0.62, 0.45, [190, 160, 255], 0.5);
    this.drawProp(tile, mushroomModel(magic));
  }

  drawBloom(tile) {
    this.halo(tile.x + 0.42, tile.height + 0.26, tile.z + 0.58, 0.4, [255, 220, 120], 0.6);
    this.drawProp(tile, bloomModel());
  }

  drawMote(at, phase) {
    const ctx = this.ctx;
    const pulse = 0.45 + Math.sin(this.time * 4 + phase) * 0.35;
    ctx.fillStyle = `rgba(255, 236, 160, ${pulse * 0.3})`;
    ctx.fillRect(at.x - 5, at.y - 5, 10, 10);
    ctx.fillStyle = '#fff8d8';
    ctx.fillRect(at.x - 1.5, at.y - 1.5, 3, 3);
  }

  drawWing(at, phase) {
    const ctx = this.ctx;
    const span = 2 + Math.abs(Math.sin(this.time * 10 + phase)) * 4;
    ctx.fillStyle = 'rgba(255, 186, 220, 0.95)';
    ctx.fillRect(at.x - 1 - span, at.y - 3, span, 4);
    ctx.fillRect(at.x + 1, at.y - 3, span, 4);
    ctx.fillStyle = '#5b3d86';
    ctx.fillRect(at.x - 1, at.y - 3, 2, 5);
  }

  drawMark(x, z) {
    const h = surfaceHeight(this.world, x, z);
    if (h == null) return;
    const pulse = 0.16 + Math.sin(this.time * 6) * 0.04;
    const corners = [[pulse, pulse], [1 - pulse, pulse], [1 - pulse, 1 - pulse], [pulse, 1 - pulse]]
      .map(([u, v]) => this.project(x + u, h + 0.04, z + v));
    if (corners.some((p) => !p)) return;
    this.ctx.strokeStyle = 'rgba(255, 214, 10, 0.95)';
    this.ctx.lineWidth = 2.5;
    this.strokeLoop(corners);
  }

  worldRadius(wx, wy, wz, radius) {
    const center = this.project(wx, wy, wz);
    const edge = this.project(wx + radius, wy, wz);
    if (!center || !edge) return null;
    const r = Math.hypot(center.x - edge.x, center.y - edge.y);
    return { at: center, r: Math.max(2, Math.min(r, this.view.h * 0.34)) };
  }

  drawNode(tile, node, mid) {
    if (!mid) return;
    const ctx = this.ctx;
    const scale = node.scale || 1;
    const here = Boolean(this.job && this.job.x === tile.x && this.job.z === tile.z);
    const sway = here ? Math.sin(this.time * 22) * this.wobble * 5 : 0;
    const lift = node.kind === 'tree' ? 2.05 * scale : node.kind === 'crystal' ? 1.25 : node.kind === 'rock' ? 0.85 : 0.75;
    const top = this.project(tile.x + 0.5, tile.height + lift, tile.z + 0.5);
    if (!top) return;
    this.hits.push({ x: tile.x, z: tile.z, sx: top.x + sway, sy: top.y, node: true });
    if (tile.depth < 2.4) return;
    const cx = tile.x + 0.5;
    const cz = tile.z + 0.5;
    const near = this.near && this.near.x === tile.x && this.near.z === tile.z;
    if (near) {
      const inset = 0.04 + (Math.sin(this.time * 6) + 1) * 0.04;
      const ring = [[inset, inset], [1 - inset, inset], [1 - inset, 1 - inset], [inset, 1 - inset]]
        .map(([u, v]) => this.project(tile.x + u, tile.height + 0.04, tile.z + v));
      if (ring.every(Boolean)) {
        ctx.strokeStyle = 'rgba(255, 214, 10, 0.95)';
        ctx.lineWidth = 3;
        this.strokeLoop(ring);
      }
    }
    if (node.kind === 'tree') this.shadowQuad(cx, tile.height, cz, 0.6 * scale);
    if (node.kind === 'tree' && node.variant === 'glow') this.halo(cx, tile.height + 1.3 * scale, cz, 1.4 * scale, [127, 240, 224], 0.26);
    if (node.kind === 'crystal') this.halo(cx, tile.height + 0.6, cz, 0.9, [126, 200, 255], 0.42);
    const model = node.kind === 'tree'
      ? treeModel(node.variant || 'oak', scale, tile.x * 31 + tile.z * 17)
      : node.kind === 'rock'
        ? rockModel(tile.x * 13 + tile.z * 7)
        : node.kind === 'crystal'
          ? crystalModel()
          : bushModel();
    ctx.save();
    ctx.translate(sway, 0);
    if (tile.depth < 4.4) ctx.globalAlpha = Math.max(0, Math.min(1, (tile.depth - 2.4) / 2));
    this.drawModel(model, cx, tile.height, cz);
    ctx.restore();
    if (here && !this.job.wait) {
      const stage = 1 + Math.floor(Math.min(0.99, this.job.t / (NODES[node.kind].time || 1)) * 4);
      const body = this.project(cx, tile.height + lift * 0.45, cz);
      if (body) {
        const s = Math.max(3, body.scale * 0.06);
        ctx.fillStyle = 'rgba(24, 16, 16, 0.72)';
        for (let i = 0; i < stage * 3; i += 1) {
          const ox = (hash(i * 3.7 + tile.x) - 0.5) * 5;
          const oy = (hash(i * 5.3 + tile.z) - 0.5) * 5;
          ctx.fillRect(body.x + sway + ox * s - s / 2, body.y + oy * s - s / 2, s, s);
        }
      }
    }
    if (near) {
      ctx.font = '700 14px ui-sans-serif, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(20, 14, 30, 0.6)';
      ctx.strokeText(NODES[node.kind].name, top.x, top.y - 12);
      ctx.fillStyle = '#fff';
      ctx.fillText(NODES[node.kind].name, top.x, top.y - 12);
    }
  }

  drawHero(groundY) {
    const hopT = this.hop ? Math.min(1, this.hop.t) : 0;
    const y0 = groundY + (this.hop ? Math.sin(hopT * Math.PI) * 0.14 : 0);
    this.shadowQuad(this.px, groundY, this.pz, 0.3);
    const swing = this.hop ? Math.sin(hopT * Math.PI) * 0.7 * this.stride : 0;
    const working = this.job && !this.job.wait && !this.hop
      && Math.abs(this.job.x - this.ix) + Math.abs(this.job.z - this.iz) === 1;
    const heldId = this.ui.blockId();
    const holding = Boolean(heldId && this.bag[heldId] > 0);
    const sway = Math.sin(this.time * 2) * 0.05;
    let rightArm = -swing + sway;
    const leftArm = swing - sway;
    if (holding) rightArm = -0.85 + swing * 0.2;
    if (working) rightArm = -1.6 + Math.sin(this.time * 18) * 0.8;
    const cape = 0.12 + (this.hop ? 0.5 : 0) + Math.sin(this.time * 2.6) * 0.05;
    const nod = this.hop ? Math.sin(hopT * Math.PI) * 0.015 : Math.sin(this.time * 1.6) * 0.006;
    const parts = [
      { c: [-0.095, 0.18, 0], s: [0.17, 0.36, 0.19], pivot: [0.36, 0], rot: swing, tex: HERO.leg },
      { c: [0.095, 0.18, 0], s: [0.17, 0.36, 0.19], pivot: [0.36, 0], rot: -swing, tex: HERO.leg },
      { c: [0, 0.58, 0], s: [0.4, 0.44, 0.22], tex: HERO.body },
      { c: [-0.27, 0.58, 0], s: [0.14, 0.42, 0.15], pivot: [0.77, 0], rot: leftArm, tex: HERO.arm },
      { c: [0.27, 0.58, 0], s: [0.14, 0.42, 0.15], pivot: [0.77, 0], rot: rightArm, tex: HERO.arm },
      { c: [0, 1.04 + nod, 0], s: [0.48, 0.48, 0.48], tex: HERO.head },
      { c: [0, 0.52, -0.13], s: [0.38, 0.52, 0.03], pivot: [0.78, -0.12], rot: cape, tex: HERO.cape },
    ];
    if (holding) {
      parts.push({ c: [0.27, 0.3, 0.06], s: [0.2, 0.2, 0.2], pivot: [0.77, 0], rot: rightArm, tex: blockTex(heldId) });
    }
    this.paintFaces(this.modelFaces(parts, { x: this.px, y: y0, z: this.pz, heading: this.heading, scale: 1.15 }));
  }

  modelFaces(parts, origin, faces = []) {
    const K = origin.scale || 1;
    const th = origin.heading || 0;
    const fx = Math.sin(th);
    const fz = Math.cos(th);
    const rx = Math.cos(th);
    const rz = -Math.sin(th);
    const spin = (p, part, pivot = part.pivot) => {
      if (!part.rot) return p;
      const [py, pz] = pivot;
      const cos = Math.cos(part.rot);
      const sin = Math.sin(part.rot);
      const dy = p[1] - py;
      const dz = p[2] - pz;
      return [p[0], py + dy * cos - dz * sin, pz + dy * sin + dz * cos];
    };
    const world = (p) => [
      origin.x + (rx * p[0] + fx * p[2]) * K,
      origin.y + p[1] * K,
      origin.z + (rz * p[0] + fz * p[2]) * K,
    ];
    for (const part of parts) {
      const half = (axis) => (Math.abs(axis[0]) * part.s[0] + Math.abs(axis[1]) * part.s[1] + Math.abs(axis[2]) * part.s[2]) / 2;
      for (const face of FACES) {
        const { n, u, r } = face;
        const hn = half(n);
        const hr = half(r);
        const hu = half(u);
        const center = [part.c[0] + n[0] * hn, part.c[1] + n[1] * hn, part.c[2] + n[2] * hn];
        const normal = spin(n, part, [0, 0]);
        const nw = [rx * normal[0] + fx * normal[2], normal[1], rz * normal[0] + fz * normal[2]];
        const cw = world(spin(center, part));
        if (nw[0] * (this.cam.x - cw[0]) + nw[1] * (this.cam.y - cw[1]) + nw[2] * (this.cam.z - cw[2]) <= 0) continue;
        const corner = (a, b) => [
          center[0] + r[0] * hr * a + u[0] * hu * b,
          center[1] + r[1] * hr * a + u[1] * hu * b,
          center[2] + r[2] * hr * a + u[2] * hu * b,
        ];
        const pts = [corner(-1, 1), corner(1, 1), corner(1, -1), corner(-1, -1)].map((p) => {
          const w = world(spin(p, part));
          return this.project(w[0], w[1], w[2]);
        });
        const mid = this.project(cw[0], cw[1], cw[2]);
        if (!mid || pts.some((p) => !p)) continue;
        const light = Math.round((nw[0] * LIGHT[0] + nw[1] * LIGHT[1] + nw[2] * LIGHT[2]) * 34 - 6);
        faces.push({ depth: mid.z, pts, face: part.tex.faces[face.key], palette: part.tex.palette, light });
      }
    }
    return faces;
  }

  paintFaces(faces) {
    faces.sort((a, b) => b.depth - a.depth);
    for (const { pts, face, palette, light } of faces) this.drawTexels(pts, face, palette, light, { outline: true });
  }

  drawTexels(pts, face, palette, light, opts = {}) {
    const ctx = this.ctx;
    const [tl, tr, br, bl] = pts;
    polygon(ctx, pts, shade(palette[face.base], light), opts.pad ?? 0.5);
    const { wide, tall, groups } = face;
    const texel = Math.min(
      Math.hypot(tr.x - tl.x, tr.y - tl.y) / wide,
      Math.hypot(bl.x - tl.x, bl.y - tl.y) / tall,
    );
    if (opts.detail !== false && texel >= 1.6) {
      const e = 0.08;
      const go = (u, v, first) => {
        const topX = tl.x + (tr.x - tl.x) * u;
        const topY = tl.y + (tr.y - tl.y) * u;
        const x = topX + (bl.x + (br.x - bl.x) * u - topX) * v;
        const y = topY + (bl.y + (br.y - bl.y) * u - topY) * v;
        if (first) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      };
      for (const ch in groups) {
        const list = groups[ch];
        ctx.beginPath();
        for (let k = 0; k < list.length; k += 2) {
          const u0 = Math.max(0, (list[k] - e) / wide);
          const u1 = Math.min(1, (list[k] + 1 + e) / wide);
          const v0 = Math.max(0, (list[k + 1] - e) / tall);
          const v1 = Math.min(1, (list[k + 1] + 1 + e) / tall);
          go(u0, v0, true);
          go(u1, v0);
          go(u1, v1);
          go(u0, v1);
          ctx.closePath();
        }
        ctx.fillStyle = shade(palette[ch], light);
        ctx.fill();
      }
    }
    if (opts.outline && texel >= 1.2) {
      ctx.strokeStyle = 'rgba(20, 14, 30, 0.32)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tl.x, tl.y);
      ctx.lineTo(tr.x, tr.y);
      ctx.lineTo(br.x, br.y);
      ctx.lineTo(bl.x, bl.y);
      ctx.closePath();
      ctx.stroke();
    }
  }

  reset() {
    this.world = makeWorld(7);
    const home = spawn();
    this.ix = home.x;
    this.iz = home.z;
    this.px = this.ix + 0.5;
    this.pz = this.iz + 0.5;
    this.hop = null;
    this.path = [];
    this.job = null;
    this.bag = emptyBag();
    this.stats = { wood: 0, stone: 0, built: 0 };
    this.ui.onBag({ ...this.bag });
    this.ui.onStats({ ...this.stats });
    this.ui.onGather(null, 0);
    this.reportNearby();
    this.persist();
  }
}

export default function PlanetBuilder() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const blockRef = useRef(null);
  const [bag, setBag] = useState(emptyBag);
  const [blockId, setBlockId] = useState(null);
  const [gather, setGather] = useState(null);
  const [near, setNear] = useState(null);
  const [stats, setStats] = useState({ wood: 0, stone: 0, built: 0 });
  const [confirm, setConfirm] = useState(false);
  const [viewMode, setViewMode] = useState('behind');
  const viewName = { behind: 'Behind', side: 'Side', front: 'Front' }[viewMode];
  const tasks = [
    { label: 'Chop trees', have: stats.wood, need: 3 },
    { label: 'Mine rocks', have: stats.stone, need: 2 },
    { label: 'Build blocks', have: stats.built, need: 4 },
  ];
  const done = tasks.every((task) => task.have >= task.need);
  const verbs = { tree: 'Chop tree', rock: 'Mine rock', crystal: 'Gather crystal', bush: 'Pick bush' };
  const busy = { tree: 'Chopping', rock: 'Mining', crystal: 'Gathering', bush: 'Picking' };
  const actLabel = blockId
    ? `Build ${blockById(blockId).name}`
    : near
      ? verbs[near.kind]
      : 'Gather';

  useEffect(() => {
    blockRef.current = blockId;
  }, [blockId]);

  useEffect(() => {
    const game = new PlanetGame(canvasRef.current, {
      blockId: () => blockRef.current,
      onBag: (next) => {
        setBag(next);
        setBlockId((current) => (current && !(next[current] > 0) ? null : current));
      },
      onHideHint: () => {},
      onGather: (name, amount) => setGather(name ? { name, amount } : null),
      onNearby: setNear,
      onStats: setStats,
      onView: setViewMode,
    });
    gameRef.current = game;
    game.start();
    const root = wrapRef.current;
    const onDown = (event) => {
      const turn = event.currentTarget.getAttribute('data-turn');
      const dir = event.currentTarget.getAttribute('data-dir');
      event.preventDefault();
      if (turn) {
        game.turn(Number(turn));
        return;
      }
      if (!dir) return;
      const [sx, sy] = dir.split(',').map(Number);
      game.held = [sx, sy];
      game.stepScreen(sx, sy);
    };
    const onUp = () => { game.held = null; };
    const pads = root.querySelectorAll('[data-dir], [data-turn]');
    pads.forEach((button) => {
      button.addEventListener('pointerdown', onDown);
      button.addEventListener('pointerup', onUp);
      button.addEventListener('pointercancel', onUp);
    });
    window.addEventListener('pointerup', onUp);
    return () => {
      pads.forEach((button) => {
        button.removeEventListener('pointerdown', onDown);
        button.removeEventListener('pointerup', onUp);
        button.removeEventListener('pointercancel', onUp);
      });
      window.removeEventListener('pointerup', onUp);
      game.stop();
      gameRef.current = null;
    };
  }, []);

  return (
    <div className="planet-root" ref={wrapRef}>
      <canvas ref={canvasRef} aria-label="Planet. Hold the phone sideways. Tap the ground to walk. Tap a tree or rock to gather." />
      <div className="planet-sideways">
        <div>
          <i />
          <strong>Hold it sideways</strong>
          <span>Planet is a wide game.</span>
        </div>
      </div>
      <div className="planet-hud">
        <strong>Planet</strong>
        <button type="button" onClick={() => setConfirm(true)}>New</button>
      </div>
      <ul className="planet-tasks">
        {tasks.map((task) => (
          <li key={task.label} className={task.have >= task.need ? 'is-done' : ''}>
            {task.label}
            <b>{task.have >= task.need ? '✓' : `${Math.min(task.have, task.need)}/${task.need}`}</b>
          </li>
        ))}
        {done ? <li className="is-done">Camp is set</li> : null}
      </ul>
      <button type="button" className="planet-act" onClick={() => gameRef.current?.act()}>
        {gather ? <i style={{ width: `${Math.round(gather.amount * 100)}%` }} /> : null}
        <span>{gather ? `${busy[gather.name] || 'Gathering'}…` : actLabel}</span>
      </button>
      <div className="planet-dock">
        <div className="planet-palette" role="listbox" aria-label="Pack">
          {BLOCKS.map((block) => (
            <button
              key={block.id}
              type="button"
              className={`${blockId === block.id ? 'is-on' : ''} ${(bag[block.id] || 0) > 0 ? '' : 'is-empty'}`}
              aria-label={`${block.name}, ${bag[block.id] || 0}`}
              onClick={() => {
                if (!(bag[block.id] > 0)) return;
                setBlockId(blockId === block.id ? null : block.id);
              }}
            >
              <i style={{ background: block.top }} />
              <b>{bag[block.id] || 0}</b>
              <em>{block.name}</em>
            </button>
          ))}
        </div>
        <div className="planet-actions">
          <button type="button" className="planet-take" onClick={() => gameRef.current?.takeHere()}>Take</button>
        </div>
      </div>
      <button type="button" className="planet-view" onClick={() => setViewMode(gameRef.current?.cycleView() || 'behind')}>{viewName}</button>
      <div className="planet-turns">
        <button type="button" data-turn="-1" aria-label="Turn view left">↺</button>
        <button type="button" data-turn="1" aria-label="Turn view right">↻</button>
      </div>
      <div className="planet-pad">
        <button type="button" className="is-up" data-dir="0,-1" aria-label="Walk forward">↑</button>
        <button type="button" className="is-left" data-dir="-1,0" aria-label="Walk left">←</button>
        <button type="button" className="is-down" data-dir="0,1" aria-label="Walk back">↓</button>
        <button type="button" className="is-right" data-dir="1,0" aria-label="Walk right">→</button>
      </div>
      {confirm ? (
        <div className="planet-confirm">
          <div>
            <strong>Start this planet over?</strong>
            <span>Gathered packs and builds on this device go back to the meadow.</span>
            <button type="button" onClick={() => { gameRef.current?.reset(); setConfirm(false); setBlockId(null); }}>New planet</button>
            <button type="button" className="is-quiet" onClick={() => setConfirm(false)}>Keep exploring</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
