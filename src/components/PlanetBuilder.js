'use client';

import { useEffect, useRef, useState } from 'react';
import {
  BLOCKS,
  GROUND,
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

const SAVE_KEY = 'kaeluma.play.planet.v5';

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

function shade(hex, amount) {
  const value = parseInt(hex.slice(1), 16);
  const channel = (shift) => Math.max(0, Math.min(255, ((value >> shift) & 255) + amount));
  return `rgb(${channel(16)} ${channel(8)} ${channel(0)})`;
}

function growQuad(points) {
  const cx = (points[0].x + points[1].x + points[2].x + points[3].x) / 4;
  const cy = (points[0].y + points[1].y + points[2].y + points[3].y) / 4;
  const span = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
  const pad = Math.max(3, span * 0.32);
  return points.map((point) => {
    const dx = point.x - cx;
    const dy = point.y - cy;
    const len = Math.hypot(dx, dy) || 1;
    return { ...point, x: point.x + (dx / len) * pad, y: point.y + (dy / len) * pad };
  });
}

function fillQuad(ctx, points, color) {
  const grown = growQuad(points);
  ctx.beginPath();
  ctx.moveTo(grown[0].x, grown[0].y);
  for (let i = 1; i < grown.length; i += 1) ctx.lineTo(grown[i].x, grown[i].y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
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
    this.faceX = 0;
    this.faceZ = 1;
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
    const pitch = -0.42;
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    const y2 = dy * cp - rz * sp;
    const z2 = dy * sp + rz * cp;
    if (z2 < 0.8) return null;
    const fov = this.view.h * 1.15;
    return {
      x: this.view.w * 0.5 + (rx / z2) * fov,
      y: this.view.h * 0.58 - (y2 / z2) * fov,
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

  pose() {
    let rel = this.lookYaw() - this.yaw;
    while (rel > Math.PI) rel -= Math.PI * 2;
    while (rel < -Math.PI) rel += Math.PI * 2;
    const abs = Math.abs(rel);
    let pose = 'side';
    if (abs < 0.85) pose = 'back';
    else if (abs > 2.3) pose = 'front';
    return { pose, flip: rel > 0 ? -1 : 1 };
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
    this.faceX = dx;
    this.faceZ = dz;
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
      } else if (!beside && !this.path.length) {
        this.job = null;
      }
      if (!this.job) this.ui.onGather(null, 0);
    }

    if (this.placeOnArrive && !this.path.length && !this.hop) {
      const spot = this.placeOnArrive;
      this.placeOnArrive = null;
      if (Math.abs(spot.x - this.ix) + Math.abs(spot.z - this.iz) <= 1) this.tryPlace(spot.x, spot.z);
    }

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
    const back = this.viewMode === 'side' ? 7.4 : this.viewMode === 'front' ? 6.4 : 5.8;
    const shoulder = this.viewMode === 'behind' ? 0.35 : 0;
    const lift = this.height() + (this.viewMode === 'side' ? 3.6 : this.viewMode === 'front' ? 2.7 : 3.1);
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
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#140e2e');
    sky.addColorStop(0.26, '#3d2b78');
    sky.addColorStop(0.48, '#c56b8c');
    sky.addColorStop(0.64, '#f3c48a');
    sky.addColorStop(1, '#6fbf45');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    const sunX = w * 0.78;
    const sunY = h * 0.22;
    const sun = ctx.createRadialGradient(sunX, sunY, 6, sunX, sunY, 160);
    sun.addColorStop(0, 'rgba(255, 248, 220, 0.98)');
    sun.addColorStop(0.18, 'rgba(255, 214, 120, 0.55)');
    sun.addColorStop(1, 'rgba(255, 214, 120, 0)');
    ctx.fillStyle = sun;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 160, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff8df';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 18, 0, Math.PI * 2);
    ctx.fill();
    const moonX = w * 0.16;
    const moonY = h * (this.wideFrame() ? 0.14 : 0.11);
    ctx.fillStyle = 'rgba(244, 239, 228, 0.95)';
    ctx.beginPath();
    ctx.arc(moonX, moonY, this.wideFrame() ? 14 : 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#241a4e';
    ctx.beginPath();
    ctx.arc(moonX + 6, moonY - 3, this.wideFrame() ? 11 : 16, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 4; i += 1) {
      const cx = ((i * 0.27 + this.time * 0.006) % 1.35 - 0.15) * w;
      const cy = h * (0.16 + i * 0.045);
      ctx.fillStyle = 'rgba(255,255,255,0.82)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 54 + i * 12, 16, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 28, cy + 3, 36, 13, 0, 0, Math.PI * 2);
      ctx.ellipse(cx - 24, cy + 4, 28, 11, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#8fce62';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let i = 0; i <= 18; i += 1) {
      const x = (i / 18) * w;
      const y = h * (0.325 + Math.sin(i * 0.85 + 0.6) * 0.018 + Math.cos(i * 0.37) * 0.01);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
    this.drawSkyline();
    ctx.fillStyle = '#6fbf45';
    ctx.fillRect(0, h * 0.42, w, h);

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
      const topBlock = built?.length ? blockById(built[built.length - 1]) : null;
      const base = topBlock ? topBlock.top : GROUND[tile.tile.id];
      ctx.globalAlpha = 1;
      this.drawSides(tile, base);
      const tint = tile.tile.id === 'water'
        ? Math.sin(this.time * 1.6 + tile.x * 0.7 + tile.z) * 10
        : tile.tile.id === 'grass'
          ? Math.round(Math.sin(tile.x * 0.08) * 7 + Math.cos(tile.z * 0.06) * 5)
          : 0;
      fillQuad(ctx, tile.corners, shade(base, tint));
      if (tile.tile.path) this.drawPath(tile);
      if (tile.tile.id === 'water') this.drawRipple(tile);
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
      if (tile.tile.flower) props.push({ depth: tile.depth, draw: () => this.drawFlower(tile) });
      if (tile.tile.bloom) props.push({ depth: tile.depth, draw: () => this.drawBloom(tile) });
      if (tile.tile.mushroom) props.push({ depth: tile.depth, draw: () => this.drawMushroom(tile) });
      if (tile.tile.pillar) props.push({ depth: tile.depth - 0.04, draw: () => this.drawPillar(tile) });
      if (tile.tile.id === 'grass' && ((tile.x * 3 + tile.z * 5) % 5) === 0) {
        props.push({ depth: tile.depth - 0.01, draw: () => this.drawTuft(tile) });
      }
      if ((tile.tile.id === 'sand' || tile.tile.id === 'stone') && ((tile.x + tile.z) % 5) === 0) {
        props.push({ depth: tile.depth - 0.01, draw: () => this.drawPebble(tile) });
      }
      if (node && node.left > 0) props.push({ depth: tile.depth - 0.05, draw: () => this.drawNode(tile, node, mid) });
      else if (node && node.kind === 'tree') props.push({ depth: tile.depth - 0.05, draw: () => this.drawStump(tile) });
    }

    const py = this.hop
      ? surfaceHeight(this.world, this.hop.x0, this.hop.z0) * (1 - Math.min(1, this.hop.t))
        + surfaceHeight(this.world, this.hop.x1, this.hop.z1) * Math.min(1, this.hop.t)
      : this.height();
    const bob = this.hop ? Math.sin(Math.min(1, this.hop.t) * Math.PI) * 0.35 : Math.sin(this.time * 3) * 0.05;
    const feet = this.project(this.px, py + 0.15 + bob, this.pz);
    if (this.path.length) {
      const end = this.path[this.path.length - 1];
      props.push({ depth: 8, draw: () => this.drawMark(end.x, end.z) });
    }
    if (this.world.camp) props.push({ depth: 6, draw: () => this.drawCamp() });
    const ghost = this.buildSpot();
    if (ghost) {
      const ghostHeight = surfaceHeight(this.world, ghost.x, ghost.z);
      const ghostAt = ghostHeight == null ? null : this.project(ghost.x + 0.5, ghostHeight + 0.4, ghost.z + 0.5);
      if (ghostAt) props.push({ depth: ghostAt.z, draw: () => this.drawGhost() });
    }
    for (const critter of this.critters) {
      const at = this.project(critter.x, (surfaceHeight(this.world, Math.round(critter.x), Math.round(critter.z)) || 1) + 0.2, critter.z);
      if (at) props.push({ depth: at.z, draw: () => this.drawCritter(critter, at) });
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
    if (feet) this.drawBuddy(feet);

    for (const bit of this.bits) {
      const at = this.project(bit.x, bit.y, bit.z);
      if (!at) continue;
      ctx.globalAlpha = Math.max(0, bit.life);
      ctx.fillStyle = bit.color;
      ctx.beginPath();
      ctx.arc(at.x, at.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
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
    const fog = ctx.createLinearGradient(0, 0, 0, h * 0.28);
    fog.addColorStop(0, 'rgba(48, 32, 84, 0.55)');
    fog.addColorStop(1, 'rgba(48, 32, 84, 0)');
    ctx.fillStyle = fog;
    ctx.fillRect(0, 0, w, h * 0.3);
    this.drawFocus();
  }

  drawSides(tile, color) {
    const edges = [
      [0, -1, [0, 1]],
      [1, 0, [1, 2]],
      [0, 1, [3, 2]],
      [-1, 0, [0, 3]],
    ];
    for (let i = 0; i < edges.length; i += 1) {
      const [dx, dz, pair] = edges[i];
      const neighbor = surfaceHeight(this.world, tile.x + dx, tile.z + dz);
      const low = neighbor == null ? 0 : neighbor;
      if (low >= tile.height) continue;
      const [a, b] = pair;
      const highA = tile.corners[a];
      const highB = tile.corners[b];
      const footA = this.project(
        tile.x + (a === 1 || a === 2 ? 1 : 0),
        low,
        tile.z + (a >= 2 ? 1 : 0),
      );
      const footB = this.project(
        tile.x + (b === 1 || b === 2 ? 1 : 0),
        low,
        tile.z + (b >= 2 ? 1 : 0),
      );
      if (!footA || !footB) continue;
      fillQuad(this.ctx, [highA, highB, footB, footA], shade(color, -28));
    }
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
      critter.hop = 0.22;
    }
    critter.wait = 0.8 + Math.random() * 1.6;
  }

  drawSkyline() {
    const { w, h } = this.view;
    const ctx = this.ctx;
    const base = h * (this.wideFrame() ? 0.36 : 0.4);
    const x = w * 0.58;
    ctx.fillStyle = '#2c3568';
    ctx.fillRect(x - 26, base - 16, 92, 18);
    ctx.fillRect(x, base - 34, 16, 34);
    ctx.fillRect(x + 22, base - 52, 12, 52);
    ctx.beginPath();
    ctx.moveTo(x + 16, base - 52);
    ctx.lineTo(x + 28, base - 74);
    ctx.lineTo(x + 40, base - 52);
    ctx.fill();
    ctx.fillRect(x + 48, base - 26, 14, 26);
    ctx.fillStyle = '#ffe7a3';
    ctx.globalAlpha = 0.85;
    ctx.fillRect(x + 26, base - 40, 3, 5);
    ctx.fillRect(x + 5, base - 22, 3, 4);
    ctx.fillRect(x + 53, base - 16, 3, 4);
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

  drawPath(tile) {
    const at = this.project(tile.x + 0.5, tile.height + 0.04, tile.z + 0.5);
    if (!at) return;
    const r = Math.max(4, at.scale * 0.18);
    this.ctx.fillStyle = 'rgba(196, 154, 90, 0.85)';
    this.ctx.beginPath();
    this.ctx.ellipse(at.x, at.y, r, r * 0.42, 0.4, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawCamp() {
    const camp = this.world.camp;
    if (!camp) return;
    const h = surfaceHeight(this.world, camp.x, camp.z);
    if (h == null) return;
    const ctx = this.ctx;
    const base = this.project(camp.x + 0.5, h + 0.05, camp.z + 0.5);
    const flame = this.project(camp.x + 0.5, h + 0.55 + Math.sin(this.time * 9) * 0.06, camp.z + 0.5);
    if (!base || !flame) return;
    const glow = ctx.createRadialGradient(flame.x, flame.y, 2, flame.x, flame.y, 28);
    glow.addColorStop(0, 'rgba(255, 170, 40, 0.55)');
    glow.addColorStop(1, 'rgba(255, 170, 40, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(flame.x, flame.y, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6b4423';
    ctx.fillRect(base.x - 10, base.y - 4, 20, 6);
    ctx.fillStyle = '#ff9f0a';
    ctx.beginPath();
    ctx.moveTo(flame.x, flame.y - 16);
    ctx.lineTo(flame.x + 7, flame.y);
    ctx.lineTo(flame.x - 7, flame.y);
    ctx.fill();
    ctx.fillStyle = '#ffe14a';
    ctx.beginPath();
    ctx.moveTo(flame.x, flame.y - 10);
    ctx.lineTo(flame.x + 3, flame.y);
    ctx.lineTo(flame.x - 3, flame.y);
    ctx.fill();
    const sign = this.project(camp.x - 0.8, h + 0.7, camp.z + 0.2);
    if (sign) {
      ctx.fillStyle = '#8d5a2b';
      ctx.fillRect(sign.x - 2, sign.y, 4, 16);
      ctx.fillStyle = '#f3d7a6';
      ctx.fillRect(sign.x - 12, sign.y - 14, 24, 14);
      ctx.fillStyle = '#1c1c1e';
      ctx.font = '700 9px ui-sans-serif, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Home', sign.x, sign.y - 4);
    }
  }

  drawCritter(critter, at) {
    const ctx = this.ctx;
    const s = Math.max(7, at.scale * 0.12);
    const lift = critter.hop > 0 ? 6 : 0;
    ctx.fillStyle = 'rgba(20, 40, 20, 0.22)';
    ctx.beginPath();
    ctx.ellipse(at.x, at.y + 2, s * 0.9, s * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(at.x, at.y - lift);
    ctx.scale(critter.face < 0 ? -1 : 1, 1);
    ctx.fillStyle = '#d8d2c8';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 1.1, s * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(s * 0.7, -s * 0.35, s * 0.38, s * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f4a4b0';
    ctx.beginPath();
    ctx.ellipse(s * 0.55, -s * 0.7, s * 0.1, s * 0.28, -0.2, 0, Math.PI * 2);
    ctx.ellipse(s * 0.85, -s * 0.7, s * 0.1, s * 0.28, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawRipple(tile) {
    const at = this.project(tile.x + 0.5, tile.height + 0.08, tile.z + 0.5);
    if (!at) return;
    const rx = Math.max(3, at.scale * 0.12);
    this.ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.ellipse(at.x, at.y, rx, rx * 0.45, 0, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  drawTuft(tile) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(92, 176, 58, 0.9)';
    for (let i = 0; i < 4; i += 1) {
      const ox = 0.2 + ((tile.x * 3 + i) % 4) * 0.18;
      const oz = 0.22 + ((tile.z * 2 + i) % 4) * 0.16;
      const a = this.project(tile.x + ox, tile.height + 0.02, tile.z + oz);
      const b = this.project(tile.x + ox + 0.04, tile.height + 0.28, tile.z + oz);
      if (!a || !b) continue;
      ctx.beginPath();
      ctx.moveTo(a.x - 1.5, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineTo(a.x + 1.5, a.y);
      ctx.fill();
    }
  }

  drawMushroom(tile) {
    const stem = this.project(tile.x + 0.35, tile.height + 0.12, tile.z + 0.62);
    const cap = this.project(tile.x + 0.35, tile.height + 0.22, tile.z + 0.62);
    if (!stem || !cap) return;
    const magic = (tile.x + tile.z) % 3 === 0;
    const ctx = this.ctx;
    const glow = ctx.createRadialGradient(cap.x, cap.y, 1, cap.x, cap.y, 16);
    glow.addColorStop(0, magic ? 'rgba(190, 160, 255, 0.55)' : 'rgba(255, 120, 90, 0.4)');
    glow.addColorStop(1, 'rgba(255, 120, 90, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cap.x, cap.y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f4efe6';
    ctx.fillRect(stem.x - 1, stem.y, 2, 6);
    ctx.fillStyle = magic ? '#b48cff' : '#e24b4b';
    ctx.beginPath();
    ctx.ellipse(cap.x, cap.y, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(cap.x - 2, cap.y - 1, 1.2, 1.2);
    ctx.fillRect(cap.x + 1, cap.y, 1.2, 1.2);
  }

  drawBloom(tile) {
    const at = this.project(tile.x + 0.42, tile.height + 0.2, tile.z + 0.58);
    if (!at) return;
    const ctx = this.ctx;
    const glow = ctx.createRadialGradient(at.x, at.y, 1, at.x, at.y, 14);
    glow.addColorStop(0, 'rgba(255, 220, 120, 0.7)');
    glow.addColorStop(1, 'rgba(255, 220, 120, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(at.x, at.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffe14a';
    ctx.beginPath();
    ctx.arc(at.x, at.y, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  drawPillar(tile) {
    const base = this.project(tile.x + 0.5, tile.height + 0.02, tile.z + 0.5);
    const top = this.project(tile.x + 0.5, tile.height + 1.25, tile.z + 0.5);
    const width = this.worldRadius(tile.x + 0.5, tile.height + 0.6, tile.z + 0.5, 0.16);
    if (!base || !top || !width) return;
    const r = width.r;
    const ctx = this.ctx;
    ctx.fillStyle = '#5d6488';
    ctx.beginPath();
    ctx.moveTo(base.x - r, base.y);
    ctx.lineTo(base.x + r, base.y);
    ctx.lineTo(top.x + r * 0.72, top.y);
    ctx.lineTo(top.x - r * 0.72, top.y);
    ctx.fill();
    ctx.fillStyle = '#9aa3c4';
    ctx.fillRect(top.x - r, top.y - 4, r * 2, 5);
    ctx.fillStyle = 'rgba(198, 170, 255, 0.95)';
    ctx.fillRect(top.x - 1.2, top.y + r * 0.4, 2.4, r * 1.1);
  }

  drawMote(at, phase) {
    const ctx = this.ctx;
    const pulse = 0.45 + Math.sin(this.time * 4 + phase) * 0.35;
    const glow = ctx.createRadialGradient(at.x, at.y, 0, at.x, at.y, 10);
    glow.addColorStop(0, `rgba(255, 236, 160, ${pulse})`);
    glow.addColorStop(1, 'rgba(255, 236, 160, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(at.x, at.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff8d8';
    ctx.beginPath();
    ctx.arc(at.x, at.y, 1.7, 0, Math.PI * 2);
    ctx.fill();
  }

  drawWing(at, phase) {
    const ctx = this.ctx;
    const flap = Math.sin(this.time * 10 + phase) * 5;
    ctx.fillStyle = 'rgba(255, 186, 220, 0.9)';
    ctx.beginPath();
    ctx.ellipse(at.x - 4, at.y + flap * 0.2, 5, 2.2, -0.6, 0, Math.PI * 2);
    ctx.ellipse(at.x + 4, at.y - flap * 0.2, 5, 2.2, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5b3d86';
    ctx.fillRect(at.x - 1, at.y - 1, 2, 3);
  }

  drawPebble(tile) {
    const at = this.project(tile.x + 0.7, tile.height + 0.05, tile.z + 0.35);
    if (!at) return;
    const r = Math.max(1.5, at.scale * 0.04);
    this.ctx.fillStyle = tile.tile.id === 'sand' ? '#c4a15a' : '#6e7582';
    this.ctx.beginPath();
    this.ctx.ellipse(at.x, at.y, r * 1.4, r, 0.4, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawMark(x, z) {
    const h = surfaceHeight(this.world, x, z);
    if (h == null) return;
    const at = this.project(x + 0.5, h + 0.08, z + 0.5);
    if (!at) return;
    const r = Math.max(6, at.scale * 0.16);
    this.ctx.strokeStyle = 'rgba(255, 214, 10, 0.95)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.ellipse(at.x, at.y, r, r * 0.45, 0, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  drawStump(tile) {
    const base = this.project(tile.x + 0.5, tile.height + 0.02, tile.z + 0.5);
    const top = this.project(tile.x + 0.5, tile.height + 0.28, tile.z + 0.5);
    const width = this.worldRadius(tile.x + 0.5, tile.height + 0.15, tile.z + 0.5, 0.16);
    if (!base || !top || !width) return;
    const r = width.r;
    this.ctx.fillStyle = '#6b4423';
    this.ctx.beginPath();
    this.ctx.moveTo(base.x - r, base.y);
    this.ctx.lineTo(base.x + r, base.y);
    this.ctx.lineTo(top.x + r * 0.8, top.y);
    this.ctx.lineTo(top.x - r * 0.8, top.y);
    this.ctx.fill();
    this.ctx.fillStyle = '#c49a6c';
    this.ctx.beginPath();
    this.ctx.ellipse(top.x, top.y, r, r * 0.4, 0, 0, Math.PI * 2);
    this.ctx.fill();
  }

  worldRadius(wx, wy, wz, radius) {
    const center = this.project(wx, wy, wz);
    const edge = this.project(wx + radius, wy, wz);
    if (!center || !edge) return null;
    const r = Math.hypot(center.x - edge.x, center.y - edge.y);
    return { at: center, r: Math.max(2, Math.min(r, this.view.h * 0.34)) };
  }

  drawFlower(tile) {
    const at = this.project(tile.x + 0.68, tile.height + 0.16, tile.z + 0.32);
    if (!at || at.scale < 8) return;
    const s = Math.max(2.2, at.scale * 0.045);
    const colors = ['#ff6b8a', '#ffd60a', '#ffffff', '#d7b4ff'];
    const color = colors[(tile.x * 3 + tile.z * 5) % colors.length];
    const ctx = this.ctx;
    ctx.fillStyle = color;
    for (let i = 0; i < 5; i += 1) {
      const angle = (i / 5) * Math.PI * 2 - 0.4;
      ctx.beginPath();
      ctx.ellipse(at.x + Math.cos(angle) * s, at.y + Math.sin(angle) * s * 0.62, s * 0.55, s * 0.38, angle, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#ffe14a';
    ctx.beginPath();
    ctx.arc(at.x, at.y, s * 0.42, 0, Math.PI * 2);
    ctx.fill();
  }

  drawNode(tile, node, mid) {
    if (!mid) return;
    const scale = node.scale || 1;
    const sway = this.job && this.job.x === tile.x && this.job.z === tile.z ? Math.sin(this.time * 22) * this.wobble * 5 : 0;
    const lift = node.kind === 'tree' ? 1.85 * scale : node.kind === 'crystal' ? 1.35 : 0.7;
    const top = this.project(tile.x + 0.5, tile.height + lift, tile.z + 0.5);
    if (!top) return;
    const footprint = this.worldRadius(tile.x + 0.5, tile.height + 0.3, tile.z + 0.5, 0.34 * scale);
    const size = footprint ? footprint.r * 2.4 : mid.scale * 0.35 * scale;
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(sway, 0);
    this.hits.push({ x: tile.x, z: tile.z, sx: top.x + sway, sy: top.y, node: true });
    if (this.near && this.near.x === tile.x && this.near.z === tile.z) {
      const ring = this.project(tile.x + 0.5, tile.height + 0.08, tile.z + 0.5);
      if (ring) {
        const pulse = 8 + Math.sin(this.time * 6) * 3;
        ctx.strokeStyle = 'rgba(255, 214, 10, 0.95)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(ring.x, ring.y, pulse + 10, (pulse + 10) * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = '700 14px ui-sans-serif, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(NODES[node.kind].name, top.x, top.y - size - 8);
      }
    }
    if (this.job && !this.job.wait && this.job.x === tile.x && this.job.z === tile.z) {
      const cracks = 1 + Math.floor(Math.min(0.99, this.job.t / (NODES[node.kind].time || 1)) * 4);
      ctx.strokeStyle = 'rgba(24, 16, 16, 0.85)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      for (let i = 0; i < cracks; i += 1) {
        ctx.beginPath();
        ctx.moveTo(mid.x - size * 0.35 + i * size * 0.16, mid.y - size * 0.45);
        ctx.lineTo(mid.x - size * 0.1 + i * size * 0.12, mid.y - size * 0.05);
        ctx.stroke();
      }
    }
    if (node.kind === 'tree') {
      const ground = this.project(tile.x + 0.5, tile.height + 0.02, tile.z + 0.5) || mid;
      const trunkTop = this.project(tile.x + 0.5, tile.height + 0.85 * scale, tile.z + 0.5) || mid;
      const shadeR = this.worldRadius(tile.x + 0.5, tile.height + 0.02, tile.z + 0.5, 0.42 * scale);
      if (shadeR) {
        ctx.fillStyle = 'rgba(20, 50, 20, 0.22)';
        ctx.beginPath();
        ctx.ellipse(shadeR.at.x, shadeR.at.y, shadeR.r, shadeR.r * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      const width = this.worldRadius(tile.x + 0.5, tile.height + 0.4, tile.z + 0.5, 0.09 * scale);
      const half = width ? width.r : 3;
      ctx.fillStyle = '#4e321c';
      ctx.beginPath();
      ctx.moveTo(ground.x - half * 1.15, ground.y);
      ctx.lineTo(ground.x + half * 1.15, ground.y);
      ctx.lineTo(trunkTop.x + half * 0.75, trunkTop.y);
      ctx.lineTo(trunkTop.x - half * 0.75, trunkTop.y);
      ctx.fill();
      const blobs = [
        [0.04, 1.02, 0.46, '#145328'],
        [0, 1.2, 0.5, '#1f7a38'],
        [-0.22, 1.38, 0.34, '#34a84c'],
        [0.18, 1.52, 0.28, '#7adf72'],
      ];
      for (let i = 0; i < blobs.length; i += 1) {
        const [ox, hy, rad, color] = blobs[i];
        const blob = this.worldRadius(tile.x + 0.5 + ox * scale, tile.height + hy * scale, tile.z + 0.5, rad * scale);
        if (!blob) continue;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(blob.at.x, blob.at.y, blob.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(255, 214, 170, 0.35)';
      ctx.beginPath();
      ctx.moveTo(ground.x - half * 0.15, ground.y - 1);
      ctx.lineTo(trunkTop.x - half * 0.05, trunkTop.y);
      ctx.lineTo(trunkTop.x + half * 0.12, trunkTop.y);
      ctx.lineTo(ground.x + half * 0.2, ground.y - 1);
      ctx.fill();
      const shine = this.worldRadius(tile.x + 0.32, tile.height + 1.58 * scale, tile.z + 0.5, 0.14 * scale);
      if (shine) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
        ctx.beginPath();
        ctx.ellipse(shine.at.x, shine.at.y, shine.r, shine.r * 0.55, -0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      if ((tile.x + tile.z) % 4 === 0) {
        const lamp = this.project(tile.x + 0.62, tile.height + 0.95 * scale, tile.z + 0.38);
        if (lamp) {
          ctx.fillStyle = 'rgba(255, 214, 90, 0.95)';
          ctx.beginPath();
          ctx.arc(lamp.x, lamp.y, Math.max(2, (width ? width.r : 4) * 0.35), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (node.kind === 'rock') {
      ctx.fillStyle = '#6d7380';
      ctx.beginPath();
      ctx.ellipse(mid.x, mid.y - size * 0.22, size * 0.72, size * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#b7bec8';
      ctx.beginPath();
      ctx.ellipse(mid.x - size * 0.08, mid.y - size * 0.48, size * 0.48, size * 0.28, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.ellipse(mid.x - size * 0.18, mid.y - size * 0.58, size * 0.12, size * 0.07, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (node.kind === 'crystal') {
      const glow = ctx.createRadialGradient(mid.x, mid.y - size, size * 0.2, mid.x, mid.y - size * 0.4, size * 1.4);
      glow.addColorStop(0, 'rgba(160, 220, 255, 0.85)');
      glow.addColorStop(1, 'rgba(160, 220, 255, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(mid.x, mid.y - size * 0.6, size * 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d7f4ff';
      ctx.beginPath();
      ctx.moveTo(mid.x, mid.y - size * 1.7);
      ctx.lineTo(mid.x + size * 0.28, mid.y - size * 0.35);
      ctx.lineTo(mid.x, mid.y - size * 0.1);
      ctx.lineTo(mid.x - size * 0.22, mid.y - size * 0.45);
      ctx.fill();
      ctx.fillStyle = '#7ec8ff';
      ctx.beginPath();
      ctx.moveTo(mid.x + size * 0.05, mid.y - size * 1.45);
      ctx.lineTo(mid.x + size * 0.42, mid.y - size * 0.3);
      ctx.lineTo(mid.x + size * 0.08, mid.y - size * 0.15);
      ctx.fill();
    } else {
      ctx.fillStyle = '#2f8f48';
      ctx.beginPath();
      ctx.arc(mid.x - size * 0.2, mid.y - size * 0.28, size * 0.32, 0, Math.PI * 2);
      ctx.arc(mid.x + size * 0.18, mid.y - size * 0.36, size * 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff6b8a';
      ctx.beginPath();
      ctx.arc(mid.x - size * 0.05, mid.y - size * 0.42, size * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawHeld(ctx, s, x, y) {
    const heldId = this.ui.blockId();
    if (!heldId || !(this.bag[heldId] > 0)) return;
    const color = blockById(heldId).top;
    const edge = shade(color, -36);
    ctx.fillStyle = edge;
    ctx.beginPath();
    ctx.roundRect(x, y, s * 0.22, s * 0.22, s * 0.04);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x + s * 0.02, y - s * 0.06, s * 0.18, s * 0.14, s * 0.03);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(x + s * 0.05, y - s * 0.03, s * 0.06, s * 0.04);
  }

  drawBuddy(feet) {
    const ctx = this.ctx;
    const s = Math.max(78, feet.scale * 1.25);
    const hop = this.hop ? Math.sin(Math.min(1, this.hop.t) * Math.PI) : 0;
    const stride = this.hop ? Math.sin(this.hop.t * Math.PI * 2) : Math.sin(this.time * 1.6) * 0.12;
    const { pose, flip } = this.pose();
    ctx.fillStyle = 'rgba(12, 24, 16, 0.32)';
    ctx.beginPath();
    ctx.ellipse(feet.x + 2, feet.y + 5, s * 0.46, s * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(feet.x, feet.y - hop * s * 0.14);
    ctx.scale(flip, 1);
    if (pose === 'back') this.drawBack(ctx, s, stride);
    else if (pose === 'front') this.drawFront(ctx, s, stride);
    else this.drawSide(ctx, s, stride);
    ctx.restore();
  }

  drawLegs(ctx, s, stride, spread) {
    ctx.strokeStyle = '#3a2a22';
    ctx.lineWidth = Math.max(3.5, s * 0.09);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-spread, -s * 0.18);
    ctx.lineTo(-spread - stride * s * 0.12, s * 0.02);
    ctx.moveTo(spread, -s * 0.18);
    ctx.lineTo(spread + stride * s * 0.12, s * 0.02);
    ctx.stroke();
    ctx.fillStyle = '#2c241c';
    ctx.beginPath();
    ctx.ellipse(-spread - stride * s * 0.12, s * 0.04, s * 0.09, s * 0.045, 0, 0, Math.PI * 2);
    ctx.ellipse(spread + stride * s * 0.12, s * 0.04, s * 0.09, s * 0.045, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawBack(ctx, s, stride) {
    this.drawLegs(ctx, s, stride, s * 0.12);
    const cape = ctx.createLinearGradient(0, -s * 0.7, 0, s * 0.05);
    cape.addColorStop(0, '#8d68ee');
    cape.addColorStop(1, '#4c2f9e');
    ctx.fillStyle = cape;
    ctx.beginPath();
    ctx.moveTo(-s * 0.22, -s * 0.62);
    ctx.quadraticCurveTo(-s * 0.46, -s * 0.15, -s * 0.28, s * 0.06);
    ctx.lineTo(s * 0.28, s * 0.06);
    ctx.quadraticCurveTo(s * 0.46, -s * 0.15, s * 0.22, -s * 0.62);
    ctx.fill();
    const shirt = ctx.createLinearGradient(-s * 0.2, -s * 0.7, s * 0.2, -s * 0.2);
    shirt.addColorStop(0, '#5b9bff');
    shirt.addColorStop(1, '#2458c9');
    ctx.fillStyle = shirt;
    ctx.beginPath();
    ctx.roundRect(-s * 0.24, -s * 0.68, s * 0.48, s * 0.5, s * 0.14);
    ctx.fill();
    ctx.fillStyle = '#ffe14a';
    ctx.beginPath();
    ctx.arc(0, -s * 0.46, s * 0.045, 0, Math.PI * 2);
    ctx.fill();
    this.drawHeld(ctx, s, s * 0.18, -s * 0.42);
    const hair = ctx.createLinearGradient(0, -s * 1.2, 0, -s * 0.7);
    hair.addColorStop(0, '#6b4630');
    hair.addColorStop(1, '#2a1810');
    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.arc(0, -s * 0.9, s * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.ellipse(-s * 0.06, -s * 1.02, s * 0.08, s * 0.04, -0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  drawFront(ctx, s, stride) {
    this.drawLegs(ctx, s, stride, s * 0.13);
    ctx.fillStyle = '#ffb020';
    ctx.beginPath();
    ctx.ellipse(-s * 0.34, -s * 0.46, s * 0.1, s * 0.16, -0.5, 0, Math.PI * 2);
    ctx.fill();
    const shirt = ctx.createLinearGradient(0, -s * 0.72, 0, -s * 0.2);
    shirt.addColorStop(0, '#6aa6ff');
    shirt.addColorStop(1, '#2d62d6');
    ctx.fillStyle = shirt;
    ctx.beginPath();
    ctx.roundRect(-s * 0.26, -s * 0.7, s * 0.52, s * 0.52, s * 0.16);
    ctx.fill();
    ctx.fillStyle = '#ffe14a';
    ctx.beginPath();
    ctx.arc(0, -s * 0.48, s * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1f4fa3';
    ctx.beginPath();
    ctx.ellipse(s * 0.24, -s * 0.4, s * 0.11, s * 0.15, 0.3, 0, Math.PI * 2);
    ctx.fill();
    this.drawHeld(ctx, s, s * 0.16, -s * 0.4);
    const skin = ctx.createRadialGradient(-s * 0.04, -s * 0.98, s * 0.04, 0, -s * 0.9, s * 0.28);
    skin.addColorStop(0, '#ffe4cc');
    skin.addColorStop(1, '#f0b48a');
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(0, -s * 0.92, s * 0.26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a2418';
    ctx.beginPath();
    ctx.arc(0, -s * 1.02, s * 0.26, Math.PI * 1.05, Math.PI * 1.95);
    ctx.fill();
    ctx.fillStyle = '#1c1c1e';
    ctx.beginPath();
    ctx.arc(-s * 0.08, -s * 0.94, s * 0.035, 0, Math.PI * 2);
    ctx.arc(s * 0.08, -s * 0.94, s * 0.035, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-s * 0.07, -s * 0.95, s * 0.012, 0, Math.PI * 2);
    ctx.arc(s * 0.09, -s * 0.95, s * 0.012, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 140, 150, 0.45)';
    ctx.beginPath();
    ctx.ellipse(-s * 0.12, -s * 0.86, s * 0.04, s * 0.025, 0, 0, Math.PI * 2);
    ctx.ellipse(s * 0.12, -s * 0.86, s * 0.04, s * 0.025, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c47a62';
    ctx.lineWidth = Math.max(1.5, s * 0.03);
    ctx.beginPath();
    ctx.arc(0, -s * 0.84, s * 0.05, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }

  drawSide(ctx, s, stride) {
    this.drawLegs(ctx, s, stride, s * 0.04);
    const cape = ctx.createLinearGradient(-s * 0.3, -s * 0.6, s * 0.1, 0);
    cape.addColorStop(0, '#4c2f9e');
    cape.addColorStop(1, '#8d68ee');
    ctx.fillStyle = cape;
    ctx.beginPath();
    ctx.moveTo(-s * 0.08, -s * 0.62);
    ctx.quadraticCurveTo(-s * 0.42, -s * 0.2, -s * 0.22, s * 0.04);
    ctx.lineTo(-s * 0.02, -s * 0.28);
    ctx.fill();
    const shirt = ctx.createLinearGradient(0, -s * 0.7, 0, -s * 0.2);
    shirt.addColorStop(0, '#6aa6ff');
    shirt.addColorStop(1, '#2458c9');
    ctx.fillStyle = shirt;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.46, s * 0.2, s * 0.26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffb020';
    ctx.beginPath();
    ctx.ellipse(s * 0.16, -s * 0.42, s * 0.07, s * 0.14, 0.4, 0, Math.PI * 2);
    ctx.fill();
    this.drawHeld(ctx, s, s * 0.12, -s * 0.55);
    ctx.fillStyle = '#f0b48a';
    ctx.beginPath();
    ctx.arc(s * 0.04, -s * 0.9, s * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a2418';
    ctx.beginPath();
    ctx.arc(-s * 0.02, -s * 0.98, s * 0.22, Math.PI * 0.85, Math.PI * 1.7);
    ctx.fill();
    ctx.fillStyle = '#1c1c1e';
    ctx.beginPath();
    ctx.arc(s * 0.1, -s * 0.92, s * 0.03, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e7a07a';
    ctx.beginPath();
    ctx.ellipse(s * 0.2, -s * 0.86, s * 0.05, s * 0.03, 0, 0, Math.PI * 2);
    ctx.fill();
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
