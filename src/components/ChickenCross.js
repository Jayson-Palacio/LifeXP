'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  COLS,
  HOP_TIME,
  TRAIN_LEN,
  createRow,
  hopTarget,
  LOG_PAD,
  occupied,
  ROAD_PAD,
  stepRow,
  trainHits,
} from '../lib/chickenWorld';

const BEST_KEY = 'kaeluma.play.chicken';
const DIR = { up: [0, 1], down: [0, -1], left: [-1, 0], right: [1, 0] };
const PAINTS = ['#ff4d3a', '#2f80ed', '#ffd60a', '#30d158', '#f7f7f5', '#222326', '#bf5af2', '#ff9f0a'];
const LEAVES = ['#2f9e4a', '#248a3d', '#3cb85a', '#1e7a36'];
const FLOWERS = ['#ff6b8a', '#ffe14a', '#ffffff'];
const CHEERS = { 10: 'Nice', 25: 'Fast', 50: 'Wow', 75: 'Flying', 100: 'Legend' };
const TITLES = { road: 'Bonk', splash: 'Splash', train: 'Whoosh', eagle: 'Too slow' };
const NOTES = {
  road: 'A car got to that square first.',
  splash: 'Stay on a log. The water does not hold you.',
  train: 'Red lights mean the train is close.',
  eagle: 'Keep hopping. A hawk finds a still chicken.',
};

function readBest() {
  try { return Number(localStorage.getItem(BEST_KEY) || 0) || 0; } catch { return 0; }
}

function mix(a, b, t) {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

function rgb(c) {
  return `rgb(${c[0] | 0} ${c[1] | 0} ${c[2] | 0})`;
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

function keyDir(key) {
  const k = key.length === 1 ? key.toLowerCase() : key;
  if (k === 'ArrowUp' || k === 'w') return 'up';
  if (k === 'ArrowDown' || k === 's') return 'down';
  if (k === 'ArrowLeft' || k === 'a') return 'left';
  if (k === 'ArrowRight' || k === 'd') return 'right';
  return null;
}

class CrossGame {
  constructor(wrap, canvas, ui) {
    this.wrap = wrap;
    this.canvas = canvas;
    this.ui = ui;
    this.ctx = canvas.getContext('2d');
    this.rows = new Map();
    this.chicken = { x: 4, y: 0, z: 0 };
    this.hop = null;
    this.queued = null;
    this.held = new Set();
    this.pad = null;
    this.parts = [];
    this.floats = [];
    this.trail = [];
    this.cheer = null;
    this.score = 0;
    this.seeds = 0;
    this.best = readBest();
    this.bestAtStart = this.best;
    this.idle = 0;
    this.streak = 0;
    this.lastForward = 0;
    this.time = 0;
    this.shake = 0;
    this.flash = 0;
    this.squash = 1;
    this.look = 0;
    this.over = false;
    this.stopped = false;
    this.cam = null;
    this.tile = 64;
    this.originX = 0;
    this.view = { w: 1, h: 1, dpr: 1 };
    this.audio = null;
    this.gesture = null;
    this.restartTap = false;
    this.shown = -1;
    this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  start() {
    this.layout();
    this.cam = this.chicken.y - this.focus();
    this.ui.bestEl.textContent = String(this.best);
    this.ui.scoreEl.textContent = '0';
    this.ui.seedEl.textContent = '0';
    if (this.ui.hintEl) this.ui.hintEl.hidden = false;
    this.resizeObs = new ResizeObserver(() => this.layout());
    this.resizeObs.observe(this.wrap);
    this.onWindowUp = () => this.release();
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('pointerup', this.onWindowUp);
    window.addEventListener('pointercancel', this.onWindowUp);
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
    this.last = 0;
    this.raf = requestAnimationFrame(this.frame);
  }

  stop() {
    this.stopped = true;
    cancelAnimationFrame(this.raf);
    this.resizeObs?.disconnect();
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('pointerup', this.onWindowUp);
    window.removeEventListener('pointercancel', this.onWindowUp);
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.audio?.close().catch(() => {});
  }

  layout() {
    const rect = this.wrap.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.view = { w: rect.width, h: rect.height, dpr };
    this.tile = Math.min(92, rect.width / COLS, rect.height / 11);
    this.originX = (rect.width - this.tile * COLS) / 2;
    this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  }

  focus() {
    if (!this.tile) return 3;
    return Math.max(2.5, Math.min(3.4, 230 / this.tile));
  }

  row(y) {
    const gy = Math.round(y);
    if (gy < 0) return null;
    let row = this.rows.get(gy);
    if (!row) {
      row = createRow(gy);
      this.rows.set(gy, row);
    }
    return row;
  }

  unlock() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!this.audio) this.audio = new Ctx();
    if (this.audio.state === 'suspended') this.audio.resume();
  }

  tone(freq, dur, type, vol, slide) {
    if (!this.audio) return;
    const t = this.audio.currentTime;
    const osc = this.audio.createOscillator();
    const gain = this.audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slide), t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(this.audio.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  press(dir, event) {
    this.unlock();
    if (this.over) return;
    try { event?.currentTarget?.setPointerCapture?.(event.pointerId); } catch { /* already gone */ }
    this.pad = dir;
    this.tryHop(...DIR[dir]);
  }

  release() {
    this.pad = null;
  }

  onKeyDown = (event) => {
    const dir = keyDir(event.key);
    if (!dir && event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    this.unlock();
    if (this.over) {
      if (!event.repeat) this.ui.onRestart();
      return;
    }
    if (dir) {
      this.held.add(dir);
      if (!event.repeat) this.tryHop(...DIR[dir]);
      return;
    }
    this.tryHop(0, 1);
  };

  onKeyUp = (event) => {
    const dir = keyDir(event.key);
    if (dir) this.held.delete(dir);
  };

  onPointerDown = (event) => {
    if (event.button != null && event.button !== 0) return;
    this.unlock();
    this.restartTap = this.over;
    if (this.over) return;
    this.gesture = { x: event.clientX, y: event.clientY, id: event.pointerId };
    try { this.canvas.setPointerCapture(event.pointerId); } catch { /* ignore */ }
  };

  onPointerUp = (event) => {
    if (this.restartTap && this.over) {
      this.restartTap = false;
      this.ui.onRestart();
      return;
    }
    const gesture = this.gesture;
    this.gesture = null;
    if (!gesture || event.pointerId !== gesture.id || this.over) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (Math.hypot(dx, dy) < 26) this.tryHop(0, 1);
    else if (Math.abs(dx) > Math.abs(dy)) this.tryHop(dx > 0 ? 1 : -1, 0);
    else this.tryHop(0, dy < 0 ? 1 : -1);
  };

  heldDir() {
    if (this.pad) return this.pad;
    if (this.held.has('up')) return 'up';
    if (this.held.has('down')) return 'down';
    if (this.held.has('left')) return 'left';
    if (this.held.has('right')) return 'right';
    return null;
  }

  tryHop(dx, dy, fromHold = false) {
    if (this.over || this.stopped) return;
    if (this.hop) {
      this.queued = [dx, dy];
      return;
    }
    const target = hopTarget(this.chicken.x, this.chicken.y, dx, dy, (y) => this.row(y));
    if (!target) {
      if (!fromHold) {
        this.tone(140, 0.05, 'triangle', 0.03, 90);
        if (!this.reduce) this.shake = Math.max(this.shake, 3);
      }
      return;
    }
    const dest = this.row(target.y);
    const log = dest.kind === 'river'
      ? dest.actors.find((actor) => target.x + (1 - LOG_PAD) > actor.x && target.x + LOG_PAD < actor.x + actor.len)
      : null;
    const doomed = (dest.kind === 'road' && occupied(dest.actors, target.x, ROAD_PAD))
      || (dest.kind === 'rail' && trainHits(dest, target.x))
      || (dest.kind === 'river' && !log);
    if (doomed) {
      if (!fromHold) {
        this.tone(140, 0.05, 'triangle', 0.03, 90);
        if (!this.reduce) this.shake = Math.max(this.shake, 2);
      }
      return;
    }
    this.hop = {
      x0: this.chicken.x,
      y0: this.chicken.y,
      x1: target.x,
      y1: target.y,
      dx,
      dy,
      t: 0,
      log,
      logOffset: log ? target.x - log.x : 0,
      doomed: false,
    };
    this.idle = 0;
    this.look = dx < 0 ? -1 : dx > 0 ? 1 : this.look * 0.4;
    if (dy > 0 && dx === 0) this.look *= 0.3;
    if (dy > 0) {
      this.streak = this.time - this.lastForward < 0.42 ? this.streak + 1 : 1;
      this.lastForward = this.time;
    } else {
      this.streak = 0;
    }
    if (this.streak >= 4) this.trail.push({ x: this.chicken.x, y: this.chicken.y, life: 0.28 });
    this.burst(this.chicken.x, this.chicken.y, '#e7f2c4', 4, 0.7);
    const pitch = 420 + Math.min(6, this.streak) * 36;
    this.tone(pitch, 0.07, 'sine', 0.045, pitch * 0.7);
    if (this.ui.hintEl) this.ui.hintEl.hidden = true;
  }

  burst(x, y, color, n, speed) {
    for (let i = 0; i < n; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const v = speed * (0.35 + Math.random() * 0.7);
      this.parts.push({
        x: x + 0.5,
        y: y + 0.45,
        vx: Math.cos(angle) * v,
        vy: Math.sin(angle) * v - speed * 0.4,
        life: 0.4 + Math.random() * 0.35,
        max: 0.75,
        color,
        size: 3 + Math.random() * 3.5,
      });
    }
    if (this.parts.length > 90) this.parts.splice(0, this.parts.length - 90);
  }

  finishHop() {
    const hop = this.hop;
    this.chicken.y = hop.y1;
    this.chicken.x = hop.log ? hop.log.x + hop.logOffset : hop.x1;
    this.chicken.z = 0;
    this.hop = null;
    this.squash = 1.16;
    const row = this.row(this.chicken.y);
    if (hop.doomed || (row.kind === 'river' && (this.chicken.x < -0.25 || this.chicken.x > COLS - 0.75))) {
      if (row.kind === 'river') this.die('splash');
      else if (row.kind === 'rail') this.die('train');
      else this.die('road');
      return;
    }
    this.collect(row);
    const next = Math.round(this.chicken.y);
    if (next > this.score) {
      this.score = next;
      this.noteScore();
    }
    if (this.over) return;
    if (this.queued) {
      const queued = this.queued;
      this.queued = null;
      this.tryHop(queued[0], queued[1]);
      return;
    }
    const dir = this.heldDir();
    if (dir) this.tryHop(...DIR[dir], true);
  }

  collect(row) {
    if (!row || row.kind !== 'grass') return;
    const col = Math.round(this.chicken.x);
    for (const coin of row.coins) {
      if (coin.got || coin.x !== col) continue;
      coin.got = true;
      this.seeds += 1;
      this.ui.seedEl.textContent = String(this.seeds);
      this.burst(col, row.y, '#ffd60a', 8, 1.3);
      this.tone(880, 0.08, 'sine', 0.05, 1320);
      this.floats.push({ text: '+', x: col, y: row.y, life: 0.65, max: 0.65, gold: true });
    }
  }

  noteScore() {
    const el = this.ui.scoreEl;
    el.textContent = String(this.score);
    el.classList.remove('is-pop');
    void el.offsetWidth;
    el.classList.add('is-pop');
    if (this.score > this.best) {
      this.best = this.score;
      this.ui.bestEl.textContent = String(this.best);
      try { localStorage.setItem(BEST_KEY, String(this.best)); } catch { /* private mode */ }
    }
    this.floats.push({ text: String(this.score), x: this.chicken.x, y: this.chicken.y, life: 0.55, max: 0.55, gold: false });
    if (CHEERS[this.score]) this.cheer = { text: CHEERS[this.score], life: 1.05 };
  }

  die(reason) {
    if (this.over || this.stopped) return;
    this.over = true;
    this.hop = null;
    this.queued = null;
    if (!this.reduce) this.shake = 12;
    this.flash = 0.55;
    if (reason === 'splash') {
      this.burst(this.chicken.x, this.chicken.y, '#8fd4ff', 14, 1.8);
      this.tone(220, 0.18, 'sine', 0.06, 70);
    } else {
      this.burst(this.chicken.x, this.chicken.y, '#fffaf2', 10, 1.7);
      this.burst(this.chicken.x, this.chicken.y, '#f3d7a4', 6, 1.4);
      this.burst(this.chicken.x, this.chicken.y, '#ff8a80', 4, 1.2);
      this.tone(180, 0.22, 'triangle', 0.06, 55);
    }
    if (this.score > this.best) {
      this.best = this.score;
      try { localStorage.setItem(BEST_KEY, String(this.best)); } catch { /* private mode */ }
    }
    this.ui.onDead({
      reason,
      score: this.score,
      best: this.best,
      seeds: this.seeds,
      fresh: this.score > this.bestAtStart && this.score > 0,
    });
  }

  frame = (now) => {
    if (this.stopped) return;
    const dt = this.last ? Math.min(0.034, (now - this.last) / 1000) : 0.016;
    this.last = now;
    this.update(dt);
    this.draw();
    this.raf = requestAnimationFrame(this.frame);
  };

  update(dt) {
    this.time += dt;
    this.shake = Math.max(0, this.shake - dt * 28);
    this.flash = Math.max(0, this.flash - dt * 1.6);
    this.squash += (1 - this.squash) * Math.min(1, dt * 14);
    for (const part of this.parts) {
      part.vy += 2.4 * dt;
      part.x += part.vx * dt;
      part.y += part.vy * dt;
      part.life -= dt;
    }
    this.parts = this.parts.filter((part) => part.life > 0);
    for (const float of this.floats) float.life -= dt;
    this.floats = this.floats.filter((float) => float.life > 0);
    for (const ghost of this.trail) ghost.life -= dt;
    this.trail = this.trail.filter((ghost) => ghost.life > 0);
    if (this.cheer) {
      this.cheer.life -= dt;
      if (this.cheer.life <= 0) this.cheer = null;
    }
    if (this.over) return;

    const from = Math.max(0, Math.floor(this.chicken.y) - 6);
    const to = Math.floor(this.chicken.y + this.view.h / Math.max(this.tile, 1)) + 3;
    for (let y = from; y <= to; y += 1) {
      const row = this.row(y);
      const wasOn = row.trainOn;
      stepRow(row, dt);
      if (row.kind === 'rail' && !wasOn && row.trainOn && Math.abs(row.y - this.chicken.y) < 8) {
        this.tone(520, 0.12, 'square', 0.03, 280);
      }
    }

    if (this.hop) {
      this.hop.t += dt;
      const u = Math.min(1, this.hop.t / HOP_TIME);
      const e = 1 - (1 - u) ** 3;
      this.chicken.x = this.hop.x0 + (this.hop.x1 - this.hop.x0) * e;
      this.chicken.y = this.hop.y0 + (this.hop.y1 - this.hop.y0) * e;
      this.chicken.z = Math.sin(u * Math.PI);
      if (u >= 1) this.finishHop();
    } else {
      this.hazard();
      if (!this.over && !this.hop) {
        const dir = this.heldDir();
        if (dir) this.tryHop(...DIR[dir], true);
      }
      if (!this.over && !this.hop) this.drift(dt);
    }

    const goal = this.chicken.y - this.focus();
    if (this.cam == null) this.cam = goal;
    this.cam += (goal - this.cam) * Math.min(1, dt * 7);
  }

  hazard() {
    const row = this.row(this.chicken.y);
    if (!row) return;
    if (row.kind === 'river' && !occupied(row.actors, this.chicken.x, LOG_PAD)) {
      this.die('splash');
      return;
    }
    if (row.kind === 'road' && occupied(row.actors, this.chicken.x, ROAD_PAD)) {
      this.die('road');
      return;
    }
    if (row.kind === 'rail' && trainHits(row, this.chicken.x)) {
      this.die('train');
      return;
    }
    if (row.kind === 'grass') this.collect(row);
    if (this.score > 0) this.idle += dt;
    if (this.idle > 8.6) this.die('eagle');
  }

  drift(dt) {
    const row = this.row(this.chicken.y);
    if (!row || row.kind !== 'river') return;
    const next = this.chicken.x + row.speed * dt;
    if (next < -0.05 || next > COLS - 0.95) {
      const back = row.speed > 0 ? -1 : 1;
      this.tryHop(back, 0, true);
      if (!this.hop) this.tryHop(0, 1, true);
      if (!this.hop) this.tryHop(0, -1, true);
      if (!this.hop) this.die('splash');
      return;
    }
    this.chicken.x = next;
    if (!occupied(row.actors, this.chicken.x, LOG_PAD)) this.die('splash');
  }

  rowTop(worldY) {
    return this.view.h - (worldY - this.cam) * this.tile - this.tile;
  }

  dusk() {
    return Math.max(0, Math.min(1, (this.score - 28) / 56));
  }

  draw() {
    const ctx = this.ctx;
    if (!ctx || !this.tile) return;
    const { w, h, dpr } = this.view;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if (this.shake > 0.4 && !this.reduce) {
      ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
    }
    const dusk = this.dusk();
    const y0 = Math.floor(this.cam) - 1;
    const y1 = Math.ceil(this.cam + h / this.tile) + 2;
    for (let y = y1; y >= y0; y -= 1) {
      if (y < 0) {
        this.drawMeadow(ctx, y, dusk);
        continue;
      }
      this.drawRow(ctx, this.row(y), dusk);
    }
    this.drawSun(ctx, dusk);
    if (dusk > 0) {
      ctx.fillStyle = `rgba(18, 14, 42, ${dusk * 0.28})`;
      ctx.fillRect(0, 0, w, h);
    }
    const vignette = ctx.createRadialGradient(w / 2, h * 0.45, w * 0.2, w / 2, h * 0.5, w * 0.72);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.16)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
    for (const ghost of this.trail) this.drawGhost(ctx, ghost);
    this.drawChicken(ctx);
    this.drawParts(ctx);
    this.drawThreat(ctx);
    this.drawFloats(ctx);
    this.drawCheer(ctx);
    if (this.flash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${this.flash * 0.45})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  drawSun(ctx, dusk) {
    const { w, h } = this.view;
    const x = w * (0.84 - dusk * 0.25);
    const y = h * (0.08 + dusk * 0.5);
    const glow = ctx.createRadialGradient(x, y, 8, x, y, 120);
    glow.addColorStop(0, dusk > 0.55 ? 'rgba(255,122,64,0.55)' : 'rgba(255,226,150,0.5)');
    glow.addColorStop(1, 'rgba(255,200,80,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, 120, 0, Math.PI * 2);
    ctx.fill();
    if (dusk > 0.35) {
      for (let i = 0; i < 8; i += 1) {
        const px = (Math.sin(this.time * 0.35 + i) * 0.5 + 0.5) * w;
        const py = (Math.cos(this.time * 0.22 + i * 1.7) * 0.5 + 0.5) * h * 0.7;
        const alpha = (0.25 + Math.sin(this.time * 3 + i) * 0.2) * dusk;
        ctx.fillStyle = `rgba(255, 236, 170, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  drawRow(ctx, row, dusk) {
    const top = this.rowTop(row.y);
    const tile = this.tile;
    if (top > this.view.h + 4 || top < -tile * 2) return;
    const x = this.originX;
    const width = tile * COLS;
    if (x > 0) {
      ctx.fillStyle = rgb(mix([20, 64, 28], [12, 28, 22], dusk));
      ctx.fillRect(0, top, x, tile + 1);
      ctx.fillRect(x + width, top, this.view.w - x - width, tile + 1);
    }
    if (row.kind === 'grass') this.drawGrass(ctx, row, top, dusk);
    else if (row.kind === 'road') this.drawRoad(ctx, row, top, dusk);
    else if (row.kind === 'river') this.drawRiver(ctx, row, top, dusk);
    else this.drawRail(ctx, row, top, dusk);

    if (row.kind === 'road' || row.kind === 'river') {
      for (const actor of row.actors) {
        if (actor.x > COLS + 0.2 || actor.x + actor.len < -0.2) continue;
        if (actor.kind === 'log') this.drawLog(ctx, actor, top);
        else this.drawVehicle(ctx, actor, top, row.dir, dusk);
      }
    }
    if (row.kind === 'rail' && row.trainOn) this.drawTrain(ctx, row, top);
    if (row.kind === 'grass') {
      for (const coin of row.coins) if (!coin.got) this.drawCoin(ctx, coin, top);
      for (const col of row.trees) this.drawTree(ctx, col, top, row.y);
    }
  }

  drawMeadow(ctx, y, dusk) {
    const top = this.rowTop(y);
    const tile = this.tile;
    if (top > this.view.h || top < -tile) return;
    ctx.fillStyle = rgb(mix(y % 2 ? [108, 168, 54] : [124, 186, 66], [40, 64, 48], dusk));
    ctx.fillRect(0, top, this.view.w, tile + 1);
  }

  drawGrass(ctx, row, top, dusk) {
    const tile = this.tile;
    const x = this.originX;
    const width = tile * COLS;
    ctx.fillStyle = rgb(mix(row.y % 2 ? [116, 178, 58] : [136, 198, 74], row.y % 2 ? [34, 56, 44] : [44, 70, 52], dusk));
    ctx.fillRect(x, top, width, tile + 1);
    ctx.fillStyle = `rgba(0,0,0,${0.07 + dusk * 0.08})`;
    ctx.fillRect(x, top + tile - 7, width, 7);
    if (row.y <= 1) {
      ctx.fillStyle = 'rgba(214, 176, 96, 0.28)';
      ctx.beginPath();
      ctx.ellipse(x + 4.5 * tile, top + tile * 0.62, tile * 0.28, tile * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 7; i += 1) {
      const bx = x + ((row.y * 17 + i * 53) % 1000) / 1000 * width;
      const by = top + 10 + ((row.y * 13 + i * 29) % 100) / 100 * (tile - 18);
      const sway = Math.sin(this.time * 2 + i + row.y) * 2;
      ctx.beginPath();
      ctx.moveTo(bx, by + 7);
      ctx.quadraticCurveTo(bx + sway, by + 3, bx + sway * 1.4, by);
      ctx.stroke();
    }
    for (const flower of row.decor) {
      const fx = x + (flower.x / COLS) * width;
      const fy = top + tile * 0.45;
      ctx.fillStyle = FLOWERS[flower.tint];
      ctx.beginPath();
      ctx.arc(fx, fy, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawRoad(ctx, row, top, dusk) {
    const tile = this.tile;
    const x = this.originX;
    const width = tile * COLS;
    ctx.fillStyle = rgb(mix([86, 92, 104], [24, 26, 32], dusk));
    ctx.fillRect(x, top, width, tile + 1);
    ctx.fillStyle = rgb(mix([232, 226, 214], [78, 74, 68], dusk));
    ctx.fillRect(x, top, width, 5);
    ctx.fillRect(x, top + tile - 5, width, 5);
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    const dash = 18;
    const gap = 16;
    let cursor = x + ((row.y * 13) % (dash + gap));
    while (cursor < x + width) {
      ctx.fillRect(cursor, top + tile * 0.46, dash, 3);
      cursor += dash + gap;
    }
  }

  drawRiver(ctx, row, top, dusk) {
    const tile = this.tile;
    const x = this.originX;
    const width = tile * COLS;
    const grad = ctx.createLinearGradient(0, top, 0, top + tile);
    grad.addColorStop(0, rgb(mix([72, 176, 232], [16, 42, 96], dusk)));
    grad.addColorStop(1, rgb(mix([32, 118, 210], [8, 24, 64], dusk)));
    ctx.fillStyle = grad;
    ctx.fillRect(x, top, width, tile + 1);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1.5;
    for (let band = 0; band < 3; band += 1) {
      const yy = top + 8 + band * (tile / 3.2);
      const shift = this.time * (28 + band * 10) + row.y * 12;
      ctx.beginPath();
      for (let px = x; px <= x + width; px += 8) {
        const wy = yy + Math.sin((px + shift) / 16) * 2.2;
        if (px === x) ctx.moveTo(px, wy);
        else ctx.lineTo(px, wy);
      }
      ctx.stroke();
    }
  }

  drawRail(ctx, row, top, dusk) {
    const tile = this.tile;
    const x = this.originX;
    const width = tile * COLS;
    ctx.fillStyle = rgb(mix([120, 112, 102], [48, 44, 40], dusk));
    ctx.fillRect(x, top, width, tile + 1);
    ctx.fillStyle = '#5c4636';
    for (let col = 0; col < COLS; col += 1) {
      ctx.fillRect(x + col * tile + tile * 0.2, top + tile * 0.22, tile * 0.6, tile * 0.56);
    }
    ctx.strokeStyle = '#e6e8ee';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, top + tile * 0.32);
    ctx.lineTo(x + width, top + tile * 0.32);
    ctx.moveTo(x, top + tile * 0.68);
    ctx.lineTo(x + width, top + tile * 0.68);
    ctx.stroke();
    if (row.warning) {
      const on = Math.sin(this.time * 18) > 0;
      ctx.fillStyle = on ? '#ff3b30' : '#6e221c';
      ctx.beginPath();
      ctx.arc(x + 18, top + tile / 2, 6, 0, Math.PI * 2);
      ctx.arc(x + width - 18, top + tile / 2, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawVehicle(ctx, actor, top, dir, dusk) {
    const tile = this.tile;
    const w = actor.len * tile * 0.94;
    const h = tile * (actor.kind === 'car' ? 0.48 : actor.kind === 'bus' ? 0.62 : 0.56);
    const x = this.originX + actor.x * tile + tile * 0.03;
    const y = top + (tile - h) / 2;
    const paint = PAINTS[actor.paint % PAINTS.length];
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, top + tile - 6, w * 0.36, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    roundBox(ctx, x, y, w, h, Math.min(18, h * 0.38));
    ctx.fillStyle = paint;
    ctx.fill();
    ctx.save();
    roundBox(ctx, x, y, w, h, Math.min(18, h * 0.38));
    ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(x, y, w, h * 0.34);
    ctx.restore();
    ctx.fillStyle = '#d7eef8';
    if (actor.kind === 'car') {
      const cabW = w * 0.4;
      const cabX = dir > 0 ? x + w * 0.46 : x + w * 0.12;
      roundBox(ctx, cabX, y + h * 0.12, cabW, h * 0.4, 6);
      ctx.fill();
    } else if (actor.kind === 'bus') {
      const cabW = w * 0.16;
      const cabX = dir > 0 ? x + w - cabW - 6 : x + 6;
      roundBox(ctx, cabX, y + h * 0.14, cabW, h * 0.42, 5);
      ctx.fill();
      ctx.fillStyle = 'rgba(215,238,248,0.9)';
      const windows = 3;
      for (let i = 0; i < windows; i += 1) {
        const wx = dir > 0 ? x + 10 + i * (w * 0.22) : x + w * 0.28 + i * (w * 0.2);
        roundBox(ctx, wx, y + h * 0.18, w * 0.14, h * 0.32, 4);
        ctx.fill();
      }
    } else {
      const cabW = w * 0.28;
      const cabX = dir > 0 ? x + w - cabW - 4 : x + 4;
      roundBox(ctx, cabX, y + h * 0.12, cabW, h * 0.42, 5);
      ctx.fill();
    }
    const wheelY = y + h - 1;
    const wheelR = Math.max(5, tile * 0.085);
    for (const wx of [x + w * 0.24, x + w * 0.76]) {
      ctx.fillStyle = '#1c1c1e';
      ctx.beginPath();
      ctx.arc(wx, wheelY, wheelR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d1d1d6';
      ctx.beginPath();
      ctx.arc(wx, wheelY, wheelR * 0.42, 0, Math.PI * 2);
      ctx.fill();
    }
    const hx = dir > 0 ? x + w - 8 : x + 3;
    ctx.fillStyle = dusk > 0.3 ? '#fff3c4' : '#fff8e8';
    roundBox(ctx, hx, y + h * 0.36, 5, 8, 2);
    ctx.fill();
    if (dusk > 0.25) {
      const beam = ctx.createRadialGradient(hx, y + h * 0.5, 2, hx + dir * 18, y + h * 0.5, tile * 0.55);
      beam.addColorStop(0, `rgba(255, 226, 150, ${0.45 * dusk})`);
      beam.addColorStop(1, 'rgba(255, 226, 150, 0)');
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.arc(hx + dir * 10, y + h * 0.5, tile * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawLog(ctx, actor, top) {
    const tile = this.tile;
    const w = actor.len * tile * 0.98;
    const h = tile * 0.42;
    const x = this.originX + actor.x * tile;
    const y = top + (tile - h) * 0.58;
    ctx.fillStyle = 'rgba(0,30,60,0.25)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, top + tile - 7, w * 0.36, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    const wood = ctx.createLinearGradient(x, y, x, y + h);
    wood.addColorStop(0, '#e0b07a');
    wood.addColorStop(0.4, '#c48445');
    wood.addColorStop(1, '#8d5528');
    roundBox(ctx, x, y, w, h, h / 2);
    ctx.fillStyle = wood;
    ctx.fill();
    ctx.fillStyle = '#f0d2a4';
    ctx.beginPath();
    ctx.ellipse(x + h * 0.35, y + h / 2, h * 0.18, h * 0.28, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w - h * 0.35, y + h / 2, h * 0.18, h * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(90, 44, 16, 0.28)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 14, y + h * 0.38);
    ctx.lineTo(x + w - 14, y + h * 0.38);
    ctx.stroke();
  }

  drawTrain(ctx, row, top) {
    const tile = this.tile;
    const w = TRAIN_LEN * tile;
    const h = tile * 0.8;
    const x = this.originX + row.trainX * tile;
    const y = top + (tile - h) / 2;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, top + tile - 5, w * 0.4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    roundBox(ctx, x, y, w, h, 18);
    ctx.fillStyle = '#f4efe6';
    ctx.fill();
    ctx.fillStyle = '#e10600';
    ctx.fillRect(x, y + h * 0.42, w, h * 0.16);
    ctx.fillStyle = '#9fd6ee';
    for (let i = 0; i < 5; i += 1) {
      const wx = row.dir > 0 ? x + 16 + i * tile * 0.85 : x + tile + i * tile * 0.85;
      roundBox(ctx, wx, y + 8, tile * 0.55, h * 0.28, 5);
      ctx.fill();
    }
    ctx.fillStyle = '#f4efe6';
    ctx.beginPath();
    ctx.arc(row.dir > 0 ? x + w - 8 : x + 8, y + h / 2, h * 0.36, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1c1c1e';
    const eyeX = row.dir > 0 ? x + w - 12 : x + 12;
    ctx.beginPath();
    ctx.arc(eyeX, y + h * 0.4, 3, 0, Math.PI * 2);
    ctx.arc(eyeX - row.dir * 10, y + h * 0.4, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  drawCoin(ctx, coin, top) {
    const tile = this.tile;
    const bob = Math.sin(this.time * 4 + coin.x) * 3;
    const cx = this.originX + coin.x * tile + tile / 2;
    const cy = top + tile * 0.48 + bob;
    const spin = 0.35 + Math.abs(Math.sin(this.time * 3 + coin.x)) * 0.65;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(spin, 1);
    ctx.fillStyle = '#f5c518';
    ctx.beginPath();
    ctx.arc(0, 0, tile * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff4b0';
    ctx.beginPath();
    ctx.arc(-2, -2, tile * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawTree(ctx, col, top, yIndex) {
    const tile = this.tile;
    const jiggle = (Math.sin(yIndex * 12.3 + col) ) * 3;
    const cx = this.originX + col * tile + tile / 2 + jiggle;
    const base = top + tile * 0.86;
    const r = tile * 0.36;
    ctx.fillStyle = 'rgba(20,40,10,0.18)';
    ctx.beginPath();
    ctx.ellipse(cx, top + tile - 3, r * 0.72, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6b452c';
    roundBox(ctx, cx - tile * 0.055, base - tile * 0.34, tile * 0.11, tile * 0.36, 3);
    ctx.fill();
    ctx.fillStyle = LEAVES[(yIndex + col) % LEAVES.length];
    ctx.beginPath();
    ctx.arc(cx, base - tile * 0.5, r, 0, Math.PI * 2);
    ctx.arc(cx - r * 0.55, base - tile * 0.32, r * 0.72, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.5, base - tile * 0.34, r * 0.68, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.28, base - tile * 0.62, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }

  drawGhost(ctx, ghost) {
    const top = this.rowTop(ghost.y);
    const cx = this.originX + ghost.x * this.tile + this.tile / 2;
    ctx.fillStyle = `rgba(255,255,255,${ghost.life})`;
    ctx.beginPath();
    ctx.ellipse(cx, top + this.tile * 0.48, this.tile * 0.16, this.tile * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawChicken(ctx) {
    const tile = this.tile;
    const top = this.rowTop(this.chicken.y);
    const cx = this.originX + this.chicken.x * tile + tile / 2;
    const feetY = top + tile * 0.8;
    const z = this.chicken.z || 0;
    const lift = z * tile * 0.62;
    const hop = this.hop;
    let sx = this.squash;
    let sy = 1;
    if (hop) {
      const t = hop.t / HOP_TIME;
      if (t < 0.18) { sx = 1.14; sy = 0.9; }
      else if (t > 0.82) { sx = 1.1; sy = 0.92; }
      else { sx = 0.94; sy = 1.08; }
    }
    if (this.over) { sx = 1.28; sy = 0.72; }
    const bob = hop || this.over ? 0 : Math.sin(this.time * 5) * 1.6;
    ctx.save();
    ctx.fillStyle = `rgba(20, 40, 16, ${0.2 - z * 0.08})`;
    ctx.beginPath();
    ctx.ellipse(cx, feetY + 3, tile * (0.2 - z * 0.06), tile * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.translate(cx, feetY - lift + bob);
    ctx.rotate(this.look * 0.18);
    ctx.scale(sx * 1.28, sy * 1.28);
    const s = tile;

    ctx.strokeStyle = '#f0a030';
    ctx.lineWidth = Math.max(2, s * 0.04);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, -s * 0.02);
    ctx.lineTo(-s * 0.16, s * 0.1);
    ctx.moveTo(-s * 0.16, s * 0.1);
    ctx.lineTo(-s * 0.24, s * 0.08);
    ctx.moveTo(-s * 0.16, s * 0.1);
    ctx.lineTo(-s * 0.1, s * 0.14);
    ctx.moveTo(s * 0.1, -s * 0.02);
    ctx.lineTo(s * 0.16, s * 0.1);
    ctx.moveTo(s * 0.16, s * 0.1);
    ctx.lineTo(s * 0.24, s * 0.08);
    ctx.moveTo(s * 0.16, s * 0.1);
    ctx.lineTo(s * 0.1, s * 0.14);
    ctx.stroke();

    ctx.fillStyle = '#f3d7a6';
    for (const [tx, rot] of [[-0.18, -0.55], [-0.02, 0.05], [0.14, 0.6]]) {
      ctx.save();
      ctx.translate(tx * s, -s * 0.2);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.ellipse(0, s * 0.02, s * 0.055, s * 0.13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const body = ctx.createLinearGradient(0, -s * 0.55, 0, -s * 0.08);
    body.addColorStop(0, '#ffffff');
    body.addColorStop(1, '#f6e2bc');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.28, s * 0.26, s * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(s * 0.06, -s * 0.28);
    ctx.rotate((hop ? Math.sin((hop.t / HOP_TIME) * Math.PI) : Math.sin(this.time * 6) * 0.12) * 0.5);
    ctx.fillStyle = '#f0d09a';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.11, s * 0.08, 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const headX = this.look * s * 0.08;
    ctx.fillStyle = '#fffefb';
    ctx.beginPath();
    ctx.ellipse(headX * 0.4, -s * 0.42, s * 0.07, s * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(headX, -s * 0.54, s * 0.12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff3b30';
    ctx.beginPath();
    ctx.moveTo(headX - s * 0.04, -s * 0.62);
    ctx.quadraticCurveTo(headX - s * 0.02, -s * 0.78, headX + s * 0.02, -s * 0.64);
    ctx.quadraticCurveTo(headX + s * 0.05, -s * 0.8, headX + s * 0.09, -s * 0.62);
    ctx.quadraticCurveTo(headX + s * 0.02, -s * 0.6, headX - s * 0.04, -s * 0.62);
    ctx.fill();

    ctx.fillStyle = '#ff9f0a';
    ctx.beginPath();
    ctx.moveTo(headX + s * 0.06, -s * 0.56);
    ctx.lineTo(headX + s * 0.2, -s * 0.52);
    ctx.lineTo(headX + s * 0.06, -s * 0.48);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1c1c1e';
    ctx.beginPath();
    ctx.arc(headX + s * 0.02, -s * 0.56, s * 0.022, 0, Math.PI * 2);
    ctx.arc(headX + s * 0.075, -s * 0.555, s * 0.018, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(headX + s * 0.026, -s * 0.566, s * 0.008, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 140, 150, 0.5)';
    ctx.beginPath();
    ctx.ellipse(headX - s * 0.02, -s * 0.5, s * 0.028, s * 0.016, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawParts(ctx) {
    for (const part of this.parts) {
      const top = this.rowTop(part.y);
      const x = this.originX + part.x * this.tile;
      ctx.globalAlpha = Math.max(0, part.life / part.max);
      ctx.fillStyle = part.color;
      ctx.beginPath();
      ctx.ellipse(x, top, part.size, part.size * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  drawThreat(ctx) {
    if (this.score < 1 || this.idle < 6.4 || this.over) return;
    const p = Math.min(1, (this.idle - 6.4) / 2.2);
    const top = this.rowTop(this.chicken.y);
    const cx = this.originX + this.chicken.x * this.tile + this.tile / 2;
    const feet = top + this.tile * 0.8;
    ctx.fillStyle = `rgba(40, 30, 20, ${0.1 + p * 0.3})`;
    ctx.beginPath();
    ctx.ellipse(cx, feet + 4, this.tile * (0.22 + p * 0.4), this.tile * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    const by = feet - this.tile * (2.5 - p * 2.05);
    const flap = Math.sin(this.time * 16) * (8 + p * 6);
    ctx.fillStyle = '#c4a574';
    ctx.beginPath();
    ctx.ellipse(cx - this.tile * 0.2, by + flap, this.tile * 0.22, this.tile * 0.07, -0.5, 0, Math.PI * 2);
    ctx.ellipse(cx + this.tile * 0.2, by - flap, this.tile * 0.22, this.tile * 0.07, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8d6a45';
    ctx.beginPath();
    ctx.ellipse(cx, by, this.tile * 0.14, this.tile * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx - 5, by - 2, 3, 0, Math.PI * 2);
    ctx.arc(cx + 5, by - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1c1c1e';
    ctx.beginPath();
    ctx.arc(cx - 5, by - 2, 1.3, 0, Math.PI * 2);
    ctx.arc(cx + 5, by - 2, 1.3, 0, Math.PI * 2);
    ctx.fill();
  }

  drawFloats(ctx) {
    ctx.textAlign = 'center';
    ctx.font = '700 22px ui-sans-serif, system-ui, sans-serif';
    for (const float of this.floats) {
      const top = this.rowTop(float.y);
      const x = this.originX + float.x * this.tile + this.tile / 2;
      const rise = (1 - float.life / float.max) * 42;
      ctx.globalAlpha = Math.max(0, float.life / float.max);
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(0,0,0,0.28)';
      ctx.strokeText(float.text, x, top + this.tile * 0.3 - rise);
      ctx.fillStyle = float.gold ? '#ffd60a' : '#fff';
      ctx.fillText(float.text, x, top + this.tile * 0.3 - rise);
    }
    ctx.globalAlpha = 1;
  }

  drawCheer(ctx) {
    if (!this.cheer) return;
    const t = this.cheer.life;
    const alpha = t > 0.8 ? (1.05 - t) / 0.25 : Math.min(1, t / 0.3);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.translate(this.view.w / 2, this.view.h * 0.42);
    const scale = 0.86 + Math.min(1, (1.05 - t) * 3) * 0.14;
    ctx.scale(scale, scale);
    ctx.textAlign = 'center';
    ctx.font = '700 54px ui-sans-serif, system-ui, sans-serif';
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillText(this.cheer.text, 0, 4);
    ctx.fillStyle = '#fff';
    ctx.fillText(this.cheer.text, 0, 0);
    ctx.restore();
  }
}

function Arrow({ dir }) {
  const turn = { up: 0, right: 90, down: 180, left: 270 }[dir];
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" style={{ transform: `rotate(${turn}deg)` }} aria-hidden="true">
      <path d="M6 14.5 12 8.5 18 14.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ChickenCross() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const scoreRef = useRef(null);
  const bestRef = useRef(null);
  const seedRef = useRef(null);
  const hintRef = useRef(null);
  const [run, setRun] = useState(0);
  const [dead, setDead] = useState(null);
  const restart = useCallback(() => {
    setDead(null);
    setRun((n) => n + 1);
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const game = new CrossGame(wrap, canvasRef.current, {
      scoreEl: scoreRef.current,
      bestEl: bestRef.current,
      seedEl: seedRef.current,
      hintEl: hintRef.current,
      onDead: (info) => setDead(info),
      onRestart: restart,
    });
    const pads = wrap.querySelectorAll('[data-dir]');
    const onDown = (event) => {
      event.preventDefault();
      game.press(event.currentTarget.getAttribute('data-dir'), event);
    };
    const onUp = () => game.release();
    pads.forEach((button) => {
      button.addEventListener('pointerdown', onDown);
      button.addEventListener('pointerup', onUp);
      button.addEventListener('pointercancel', onUp);
    });
    game.start();
    return () => {
      pads.forEach((button) => {
        button.removeEventListener('pointerdown', onDown);
        button.removeEventListener('pointerup', onUp);
        button.removeEventListener('pointercancel', onUp);
      });
      game.stop();
    };
  }, [restart, run]);

  return (
    <div className={`chicken-root${dead ? ' is-over' : ''}`} ref={wrapRef} onContextMenu={(event) => event.preventDefault()}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="chicken-hud">
        <strong ref={scoreRef} className="chicken-score" aria-live="polite">0</strong>
        <p className="chicken-meta">
          best <span ref={bestRef}>0</span>
          {' · '}
          <span className="chicken-seed" ref={seedRef}>0</span>
          {' seeds'}
        </p>
      </div>
      <p className="chicken-hint" ref={hintRef}>Hold to hop</p>
      <div className="chicken-pad">
        <button type="button" className="is-up" data-dir="up" aria-label="Hop forward"><Arrow dir="up" /></button>
        <button type="button" className="is-left" data-dir="left" aria-label="Hop left"><Arrow dir="left" /></button>
        <button type="button" className="is-down" data-dir="down" aria-label="Hop back"><Arrow dir="down" /></button>
        <button type="button" className="is-right" data-dir="right" aria-label="Hop right"><Arrow dir="right" /></button>
      </div>
      {dead ? (
        <div
          className="chicken-over"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) restart();
          }}
        >
          <div className="chicken-card" role="dialog" aria-label={TITLES[dead.reason]}>
            {dead.fresh ? <em>New best</em> : null}
            <p>{TITLES[dead.reason]}</p>
            <strong>{dead.score}</strong>
            <span>{NOTES[dead.reason]}</span>
            <span>Best {dead.best} · {dead.seeds} seeds</span>
            <button type="button" onClick={restart}>Again</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
