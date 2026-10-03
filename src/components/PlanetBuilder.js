'use client';

import { useEffect, useRef, useState } from 'react';
import {
  BLOCKS,
  GROUND,
  NODES,
  blockById,
  canStep,
  cellKey,
  findPath,
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

const SAVE_KEY = 'kaeluma.play.planet.v3';

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
  return points.map((point) => {
    const dx = point.x - cx;
    const dy = point.y - cy;
    const len = Math.hypot(dx, dy) || 1;
    return { ...point, x: point.x + (dx / len) * 1.4, y: point.y + (dy / len) * 1.4 };
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
    this.yaw = saved?.yaw ?? 0.7;
    this.yawTarget = this.yaw;
    this.held = null;
    this.cam = { x: this.px, y: 8, z: this.pz - 10 };
    this.view = { w: 1, h: 1, dpr: 1 };
    this.hits = [];
    this.floats = [];
    this.time = 0;
    this.stopped = false;
    this.stars = Array.from({ length: 70 }, (_, i) => ({
      x: ((i * 97) % 100) / 100,
      y: ((i * 53) % 80) / 100,
      r: (i % 3) * 0.5 + 0.6,
    }));
    this.ui.onBag({ ...this.bag });
  }

  height() {
    return surfaceHeight(this.world, this.ix, this.iz) || 1;
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
        built: this.world.built,
        nodes,
        bag: this.bag,
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
    const cos = Math.cos(this.yaw);
    const sin = Math.sin(this.yaw);
    const rx = dx * cos - dz * sin;
    const rz = dx * sin + dz * cos;
    const pitch = -0.62;
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    const y2 = dy * cp - rz * sp;
    const z2 = dy * sp + rz * cp;
    if (z2 < 0.45) return null;
    const fov = this.view.h * 0.92;
    return {
      x: this.view.w * 0.5 + (rx / z2) * fov,
      y: this.view.h * 0.48 - (y2 / z2) * fov,
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
  };

  onDown = (event) => {
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

  screenAxes() {
    const fx = Math.sin(this.yaw);
    const fz = Math.cos(this.yaw);
    const rx = Math.cos(this.yaw);
    const rz = -Math.sin(this.yaw);
    return { fx, fz, rx, rz };
  }

  stepScreen(sx, sy) {
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
      this.ui.onBag({ ...this.bag });
      this.persist();
      this.float('+ built', x + 0.5, z + 0.5);
    }
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
        const spec = NODES[nodeAt(this.world, this.job.x, this.job.z)?.kind] || NODES.tree;
        this.job.t += dt;
        this.ui.onGather(spec.name, Math.min(1, this.job.t / spec.time));
        if (this.job.t >= spec.time) {
          const item = gatherNode(this.world, this.job.x, this.job.z);
          if (item) {
            this.bag[item] += 1;
            this.ui.onBag({ ...this.bag });
            this.float(`+ ${blockById(item).name}`, this.job.x + 0.5, this.job.z + 0.5);
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

    for (const floater of this.floats) floater.life -= dt;
    this.floats = this.floats.filter((floater) => floater.life > 0);

    const back = 16;
    const lift = this.height() + 9.5;
    const gx = this.px - Math.sin(this.yaw) * back;
    const gz = this.pz - Math.cos(this.yaw) * back;
    this.cam.x += (gx - this.cam.x) * Math.min(1, dt * 4);
    this.cam.z += (gz - this.cam.z) * Math.min(1, dt * 4);
    this.cam.y += (lift - this.cam.y) * Math.min(1, dt * 4);
    this.draw();
    this.raf = requestAnimationFrame(this.frame);
  };

  draw() {
    const ctx = this.ctx;
    const { w, h, dpr } = this.view;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#08101f');
    sky.addColorStop(0.45, '#243656');
    sky.addColorStop(0.72, '#c47a4a');
    sky.addColorStop(1, '#e7b15a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    for (const star of this.stars) {
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath();
      ctx.arc(star.x * w, star.y * h * 0.55, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
    const moon = this.project(this.px + 18, 14, this.pz - 6);
    if (moon && moon.z > 0) {
      ctx.fillStyle = 'rgba(255, 236, 190, 0.9)';
      ctx.beginPath();
      ctx.arc(w * 0.78, h * 0.16, 28, 0, Math.PI * 2);
      ctx.fill();
    }

    const reach = 15;
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
        if (corners.some((point) => !point)) continue;
        const depth = (corners[0].z + corners[2].z) * 0.5;
        if (depth < 2.4 || depth > 28) continue;
        tiles.push({ x, z, height, tile, corners, depth });
      }
    }
    tiles.sort((a, b) => b.depth - a.depth);
    for (let i = 0; i < tiles.length; i += 1) {
      const tile = tiles[i];
      const built = this.world.built[cellKey(tile.x, tile.z)];
      const topBlock = built?.length ? blockById(built[built.length - 1]) : null;
      const base = topBlock ? topBlock.top : GROUND[tile.tile.id];
      const fog = Math.max(0.15, Math.min(1, 1 - (tile.depth - 14) / 16));
      ctx.globalAlpha = fog;
      this.drawSides(tile, base);
      fillQuad(ctx, tile.corners, shade(base, (tile.height - 2) * 10));
      const mid = this.project(tile.x + 0.5, tile.height + 0.2, tile.z + 0.5);
      const node = nodeAt(this.world, tile.x, tile.z);
      if (mid) {
        this.hits.push({
          x: tile.x,
          z: tile.z,
          sx: mid.x,
          sy: mid.y,
          node: Boolean(node && node.left > 0),
        });
        if (node && node.left > 0) this.drawNode(tile, node, mid);
      }
    }

    const py = this.hop
      ? surfaceHeight(this.world, this.hop.x0, this.hop.z0) * (1 - Math.min(1, this.hop.t))
        + surfaceHeight(this.world, this.hop.x1, this.hop.z1) * Math.min(1, this.hop.t)
      : this.height();
    const bob = this.hop ? Math.sin(Math.min(1, this.hop.t) * Math.PI) * 0.35 : Math.sin(this.time * 3) * 0.05;
    const feet = this.project(this.px, py + 0.15 + bob, this.pz);
    if (feet) this.drawBuddy(feet);

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

  drawNode(tile, node, mid) {
    const top = this.project(tile.x + 0.5, tile.height + (node.kind === 'tree' ? 1.7 : 1.05), tile.z + 0.5);
    if (!top) return;
    const size = Math.max(10, mid.scale * 0.34);
    const ctx = this.ctx;
    this.hits.push({ x: tile.x, z: tile.z, sx: top.x, sy: top.y, node: true });
    if (node.kind === 'tree') {
      ctx.fillStyle = '#6b4423';
      ctx.fillRect(mid.x - size * 0.12, top.y, size * 0.24, mid.y - top.y);
      ctx.fillStyle = '#2f9a46';
      ctx.beginPath();
      ctx.arc(top.x, top.y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#46c46a';
      ctx.beginPath();
      ctx.arc(top.x - size * 0.28, top.y - size * 0.2, size * 0.45, 0, Math.PI * 2);
      ctx.fill();
    } else if (node.kind === 'rock') {
      ctx.fillStyle = '#9aa1ab';
      ctx.beginPath();
      ctx.ellipse(mid.x, mid.y - size * 0.45, size * 0.7, size * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (node.kind === 'crystal') {
      ctx.fillStyle = '#7ec8ff';
      ctx.beginPath();
      ctx.moveTo(mid.x, mid.y - size * 1.4);
      ctx.lineTo(mid.x + size * 0.38, mid.y - size * 0.2);
      ctx.lineTo(mid.x, mid.y);
      ctx.lineTo(mid.x - size * 0.38, mid.y - size * 0.2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#3cb85a';
      ctx.beginPath();
      ctx.arc(mid.x, mid.y - size * 0.35, size * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawBuddy(feet) {
    const ctx = this.ctx;
    const s = Math.max(22, feet.scale * 0.48);
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(feet.x, feet.y + 4, s * 0.45, s * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a4258';
    ctx.fillRect(feet.x - s * 0.28, feet.y - s * 0.85, s * 0.56, s * 0.7);
    ctx.fillStyle = '#ffb38a';
    ctx.beginPath();
    ctx.arc(feet.x, feet.y - s * 1.15, s * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff8a5b';
    ctx.fillRect(feet.x + s * 0.18, feet.y - s * 0.7, s * 0.22, s * 0.36);
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
    this.ui.onBag({ ...this.bag });
    this.ui.onGather(null, 0);
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
  const [hint, setHint] = useState(true);
  const [gather, setGather] = useState(null);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    blockRef.current = blockId;
  }, [blockId]);

  useEffect(() => {
    const game = new PlanetGame(canvasRef.current, {
      blockId: () => blockRef.current,
      onBag: setBag,
      onHideHint: () => setHint(false),
      onGather: (name, amount) => setGather(name ? { name, amount } : null),
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
      <canvas ref={canvasRef} aria-label="Planet. Tap the ground to walk. Tap a tree or rock to gather." />
      <div className="planet-hud">
        <strong>Planet</strong>
        <button type="button" onClick={() => setConfirm(true)}>New</button>
      </div>
      {hint ? <p className="planet-hint">Tap the ground to walk. Tap a tree, rock, or crystal to gather it.</p> : null}
      {gather ? (
        <p className="planet-gather">
          Gathering {gather.name}
          <i style={{ transform: `scaleX(${gather.amount})` }} />
        </p>
      ) : null}
      <div className="planet-dock">
        <div className="planet-palette" role="listbox" aria-label="Pack">
          {BLOCKS.map((block) => (
            <button
              key={block.id}
              type="button"
              className={blockId === block.id ? 'is-on' : ''}
              aria-label={`${block.name}, ${bag[block.id] || 0}`}
              onClick={() => setBlockId(blockId === block.id ? null : block.id)}
            >
              <i style={{ background: block.top }} />
              <b>{bag[block.id] || 0}</b>
            </button>
          ))}
        </div>
        <div className="planet-actions">
          <button type="button" className="planet-take" onClick={() => gameRef.current?.takeHere()}>Take</button>
        </div>
      </div>
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
