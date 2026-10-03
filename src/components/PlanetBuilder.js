'use client';

import { useEffect, useRef, useState } from 'react';
import {
  BLOCKS,
  blockById,
  canStep,
  cellKey,
  countBlocks,
  placeBlock,
  seedPlanet,
  takeBlock,
} from '../lib/planetWorld';

const SAVE_KEY = 'kaeluma.play.planet.v2';
const TILE = 46;

function loadSave() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (!raw || !raw.cells || !raw.cells['0,0']) return null;
    return raw;
  } catch {
    return null;
  }
}

function project(x, z, height) {
  return {
    x: x * TILE,
    y: z * TILE * 0.72 - height * TILE * 0.34,
  };
}

function roundBox(ctx, x, y, w, h, r) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawCube(ctx, px, py, block, alpha = 1) {
  const w = TILE * 0.98;
  const topH = TILE * 0.22;
  const sideH = TILE * 0.34;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = block.side;
  roundBox(ctx, px - w / 2, py - sideH, w, sideH, 3);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.14)';
  ctx.fillRect(px - w / 2, py - sideH, w * 0.18, sideH);
  ctx.fillStyle = block.top;
  roundBox(ctx, px - w / 2, py - sideH - topH + 4, w, topH + 2, 4);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  roundBox(ctx, px - w * 0.28, py - sideH - topH + 8, w * 0.28, 4, 2);
  ctx.fill();
  ctx.restore();
}

function drawBuddy(ctx, px, py, face, hop) {
  const lift = Math.sin(hop * Math.PI) * 14;
  ctx.save();
  ctx.translate(px, py - lift);
  ctx.fillStyle = 'rgba(10, 16, 32, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 8, 12 - hop * 4, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.scale(face < 0 ? -1 : 1, 1);
  ctx.fillStyle = '#3a4258';
  roundBox(ctx, -7, -16, 14, 16, 5);
  ctx.fill();
  ctx.fillStyle = '#ffb38a';
  ctx.beginPath();
  ctx.arc(0, -24, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1c1c1e';
  ctx.beginPath();
  ctx.arc(3, -25, 1.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff8a5b';
  ctx.fillRect(6, -18, 5, 8);
  ctx.restore();
}

class PlanetGame {
  constructor(canvas, ui) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ui = ui;
    const saved = loadSave();
    this.cells = saved?.cells || seedPlanet();
    this.px = saved?.px || 0;
    this.pz = saved?.pz || 0;
    this.face = saved?.face || { x: 0, z: -1 };
    this.look = 1;
    this.hop = null;
    this.held = null;
    this.cam = project(this.px, this.pz, this.heightAt(this.px, this.pz));
    this.undo = [];
    this.time = 0;
    this.stopped = false;
    this.view = { w: 1, h: 1, dpr: 1 };
    this.stars = Array.from({ length: 48 }, (_, i) => ({
      x: ((i * 97) % 100) / 100,
      y: ((i * 53) % 100) / 100,
      r: (i % 3) + 0.6,
    }));
    this.pushCount();
  }

  heightAt(x, z) {
    const column = this.cells[cellKey(x, z)];
    return column ? column.length : 0;
  }

  pushCount() {
    this.ui.onCount(countBlocks(this.cells));
  }

  persist() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        cells: this.cells,
        px: this.px,
        pz: this.pz,
        face: this.face,
      }));
    } catch { /* private mode */ }
  }

  remember() {
    this.undo.push(this.cells);
    if (this.undo.length > 40) this.undo.shift();
  }

  start() {
    this.layout();
    this.obs = new ResizeObserver(() => this.layout());
    this.obs.observe(this.canvas.parentElement);
    window.addEventListener('keydown', this.onKey);
    this.last = 0;
    this.raf = requestAnimationFrame(this.frame);
  }

  stop() {
    this.stopped = true;
    cancelAnimationFrame(this.raf);
    this.obs?.disconnect();
    window.removeEventListener('keydown', this.onKey);
  }

  layout() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.view = { w: rect.width, h: rect.height, dpr };
    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);
  }

  onKey = (event) => {
    const dir = {
      ArrowUp: [0, -1], w: [0, -1], W: [0, -1],
      ArrowDown: [0, 1], s: [0, 1], S: [0, 1],
      ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0],
      ArrowRight: [1, 0], d: [1, 0], D: [1, 0],
    }[event.key];
    if (dir) {
      event.preventDefault();
      this.move(dir[0], dir[1]);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.place();
    } else if (event.key === 'Backspace') {
      event.preventDefault();
      this.take();
    }
  };

  move(dx, dz) {
    this.face = { x: dx, z: dz };
    if (dx) this.look = dx < 0 ? -1 : 1;
    if (this.hop) {
      this.queued = [dx, dz];
      return;
    }
    if (!canStep(this.cells, this.px, this.pz, dx, dz)) return;
    this.hop = {
      x0: this.px,
      z0: this.pz,
      x1: this.px + dx,
      z1: this.pz + dz,
      h0: this.heightAt(this.px, this.pz),
      h1: this.heightAt(this.px + dx, this.pz + dz),
      t: 0,
    };
    this.ui.onHideHint();
  }

  place() {
    const before = this.cells;
    const next = placeBlock(this.cells, this.px, this.pz, this.face.x, this.face.z, this.ui.blockId());
    if (next === before) return;
    this.remember();
    this.cells = next;
    this.persist();
    this.pushCount();
    this.ui.onHideHint();
    this.ui.onPop();
  }

  take() {
    const before = this.cells;
    const next = takeBlock(this.cells, this.px, this.pz, this.face.x, this.face.z);
    if (next === before) return;
    this.remember();
    this.cells = next;
    if (this.heightAt(this.px, this.pz) === 0) {
      this.px = 0;
      this.pz = 0;
    }
    this.persist();
    this.pushCount();
  }

  undoLast() {
    const prev = this.undo.pop();
    if (!prev) return;
    this.cells = prev;
    if (this.heightAt(this.px, this.pz) === 0) {
      this.px = 0;
      this.pz = 0;
    }
    this.persist();
    this.pushCount();
  }

  reset() {
    this.remember();
    this.cells = seedPlanet();
    this.px = 0;
    this.pz = 0;
    this.face = { x: 0, z: -1 };
    this.persist();
    this.pushCount();
  }

  frame = (now) => {
    if (this.stopped) return;
    const dt = this.last ? Math.min(0.034, (now - this.last) / 1000) : 0.016;
    this.last = now;
    this.time += dt;
    if (this.hop) {
      this.hop.t += dt / 0.16;
      if (this.hop.t >= 1) {
        this.px = this.hop.x1;
        this.pz = this.hop.z1;
        this.hop = null;
        this.persist();
      }
    }
    if (!this.hop && this.queued) {
      const queued = this.queued;
      this.queued = null;
      this.move(queued[0], queued[1]);
    } else if (!this.hop && this.held) {
      this.move(this.held[0], this.held[1]);
    }
    const hopT = this.hop ? Math.min(1, this.hop.t) : 0;
    const drawX = this.hop ? this.hop.x0 + (this.hop.x1 - this.hop.x0) * hopT : this.px;
    const drawZ = this.hop ? this.hop.z0 + (this.hop.z1 - this.hop.z0) * hopT : this.pz;
    const drawH = this.hop ? this.hop.h0 + (this.hop.h1 - this.hop.h0) * hopT : this.heightAt(this.px, this.pz);
    const goal = project(drawX, drawZ, drawH);
    this.cam.x += (goal.x - this.cam.x) * Math.min(1, dt * 8);
    this.cam.y += (goal.y - this.cam.y) * Math.min(1, dt * 8);
    this.draw(drawX, drawZ, drawH);
    this.raf = requestAnimationFrame(this.frame);
  };

  draw(drawX, drawZ, drawH) {
    const ctx = this.ctx;
    if (!ctx) return;
    const { w, h, dpr } = this.view;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#1b2744');
    sky.addColorStop(1, '#0c1224');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    for (const star of this.stars) {
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.beginPath();
      ctx.arc(star.x * w, star.y * h, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.save();
    ctx.translate(w / 2 - this.cam.x, h * 0.42 - this.cam.y);
    ctx.fillStyle = 'rgba(90, 170, 255, 0.18)';
    ctx.beginPath();
    ctx.ellipse(0, 18, 210, 70, 0, 0, Math.PI * 2);
    ctx.fill();

    const spots = Object.entries(this.cells).map(([key, column]) => {
      const [x, z] = key.split(',').map(Number);
      return { x, z, column };
    });
    spots.sort((a, b) => a.z - b.z || a.x - b.x);
    const hopT = this.hop ? Math.min(1, this.hop.t) : 0;
    const buddyHeight = drawH;
    let buddyDrawn = false;
    const drawBuddyNow = () => {
      const at = project(drawX, drawZ, buddyHeight);
      drawBuddy(ctx, at.x, at.y - 6, this.look, hopT);
      buddyDrawn = true;
    };
    for (const spot of spots) {
      if (!buddyDrawn && (spot.z > drawZ || (spot.z === Math.round(drawZ) && spot.x > Math.round(drawX)))) {
        drawBuddyNow();
      }
      spot.column.forEach((id, index) => {
        const at = project(spot.x, spot.z, index + 1);
        const block = blockById(id);
        if (id === 'leaf') drawCube(ctx, at.x, at.y + 6, block);
        else drawCube(ctx, at.x, at.y, block);
      });
    }
    if (!buddyDrawn) drawBuddyNow();

    const fx = this.px + this.face.x;
    const fz = this.pz + this.face.z;
    const front = this.cells[cellKey(fx, fz)];
    const here = this.heightAt(this.px, this.pz);
    const frontLen = front ? front.length : 0;
    const ghostHeight = !front || frontLen < here ? Math.max(1, here) : Math.min(8, frontLen + 1);
    const ghostAt = project(fx, fz, ghostHeight);
    drawCube(ctx, ghostAt.x, ghostAt.y, blockById(this.ui.blockId()), 0.38 + Math.sin(this.time * 5) * 0.08);
    ctx.restore();
  }
}

export default function PlanetBuilder() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const blockRef = useRef('grass');
  const [blockId, setBlockId] = useState('grass');
  const [count, setCount] = useState(0);
  const [hint, setHint] = useState(true);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    blockRef.current = blockId;
  }, [blockId]);

  useEffect(() => {
    const game = new PlanetGame(canvasRef.current, {
      blockId: () => blockRef.current,
      onCount: setCount,
      onHideHint: () => setHint(false),
      onPop: () => {
        const button = wrapRef.current?.querySelector('.planet-place');
        if (!button) return;
        button.classList.remove('is-pop');
        void button.offsetWidth;
        button.classList.add('is-pop');
      },
    });
    gameRef.current = game;
    game.start();
    const pads = wrapRef.current.querySelectorAll('[data-dir]');
    const onDown = (event) => {
      event.preventDefault();
      const [dx, dz] = event.currentTarget.getAttribute('data-dir').split(',').map(Number);
      game.held = [dx, dz];
      game.move(dx, dz);
    };
    const onUp = () => { game.held = null; };
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

  const picked = blockById(blockId);

  return (
    <div className="planet-root" ref={wrapRef}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="planet-hud">
        <strong>{count}</strong>
        <span>blocks</span>
        <button type="button" onClick={() => gameRef.current?.undoLast()}>Undo</button>
        <button type="button" onClick={() => setConfirm(true)}>New</button>
      </div>
      {hint ? <p className="planet-hint">Arrows move. Place grows the ground in front of you.</p> : null}
      <div className="planet-dock">
        <div className="planet-palette" role="listbox" aria-label="Blocks">
          {BLOCKS.map((block) => (
            <button
              key={block.id}
              type="button"
              role="option"
              aria-selected={block.id === blockId}
              aria-label={block.name}
              className={block.id === blockId ? 'is-on' : ''}
              style={{ background: block.top }}
              onClick={() => setBlockId(block.id)}
            />
          ))}
        </div>
        <div className="planet-actions">
          <button type="button" className="planet-place" style={{ background: picked.top, color: picked.id === 'snow' || picked.id === 'sand' || picked.id === 'gold' ? '#1c1c1e' : '#fff' }} onClick={() => gameRef.current?.place()}>
            Place {picked.name}
          </button>
          <button type="button" className="planet-take" onClick={() => gameRef.current?.take()}>Take</button>
        </div>
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
            <strong>Start a new planet?</strong>
            <span>You can still undo it.</span>
            <button type="button" onClick={() => { gameRef.current?.reset(); setConfirm(false); }}>New planet</button>
            <button type="button" className="is-quiet" onClick={() => setConfirm(false)}>Keep this one</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
