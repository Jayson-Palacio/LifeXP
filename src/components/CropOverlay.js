"use client";

import { useState, useRef, useCallback, useEffect } from 'react';

// InlineCrop — image drag + pinch-to-zoom crop
export default function InlineCrop({ imageSrc, onConfirm, onCancel }) {
  const containerRef = useRef(null);
  const [naturalSize, setNaturalSize] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const startRef = useRef(null);
  const pinchRef = useRef(null);

  const CROP_SIZE = 200;
  const CONTAINER_SIZE = 280;

  // Measure natural dimensions on mount
  useEffect(() => {
    let active = true;
    const img = new Image();
    img.onload = () => {
      if (active) setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.src = imageSrc;
    return () => { active = false; };
  }, [imageSrc]);

  // Determine visual base size so the smallest dimension fills the container
  let baseW = CONTAINER_SIZE;
  let baseH = CONTAINER_SIZE;
  if (naturalSize) {
    const isLandscape = naturalSize.w > naturalSize.h;
    baseW = isLandscape ? (naturalSize.w / naturalSize.h) * CONTAINER_SIZE : CONTAINER_SIZE;
    baseH = isLandscape ? CONTAINER_SIZE : (naturalSize.h / naturalSize.w) * CONTAINER_SIZE;
  }

  const clampOffset = useCallback((x, y, s = scale) => {
    if (!naturalSize) return { x: 0, y: 0 };
    const maxX = (baseW * s - CROP_SIZE) / 2;
    const maxY = (baseH * s - CROP_SIZE) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }, [scale, baseW, baseH, naturalSize]);

  // ─── Desktop Pan (Mouse/Pen) ─────────────────────────────────────
  const handlePointerDown = (e) => {
    if (e.pointerType === 'touch') return;
    setDragging(true);
    startRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handlePointerMove = useCallback((e) => {
    if (!startRef.current) return;
    setOffset(clampOffset(e.clientX - startRef.current.x, e.clientY - startRef.current.y));
  }, [clampOffset]);

  const handlePointerUp = useCallback(() => {
    setDragging(false);
    startRef.current = null;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }, [handlePointerMove]);

  // ─── Touch Events (Pan & Pinch) ─────────────────────────────────
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setDragging(true);
      startRef.current = { x: e.touches[0].clientX - offset.x, y: e.touches[0].clientY - offset.y };
    } else if (e.touches.length === 2) {
      startRef.current = null;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchRef.current = { startDist: dist, startScale: scale };
    }
  };

  const handleTouchMove = (e) => {
    // touch-action: none prevents scrolling, so we don't need preventDefault() here which causes warnings/fails
    if (e.touches.length === 1 && startRef.current) {
      setOffset(clampOffset(e.touches[0].clientX - startRef.current.x, e.touches[0].clientY - startRef.current.y));
    } else if (e.touches.length === 2 && pinchRef.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const newScale = Math.max(0.8, Math.min(4, pinchRef.current.startScale * (dist / pinchRef.current.startDist)));
      setScale(newScale);
      setOffset(o => clampOffset(o.x, o.y, newScale));
    }
  };

  const handleTouchEnd = () => { 
    setDragging(false);
    startRef.current = null;
    pinchRef.current = null; 
  };

  // ─── Scroll wheel zoom (desktop) ──────────────────────────────
  const handleWheel = (e) => {
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(s => {
      const next = Math.max(0.8, Math.min(4, s * delta));
      setOffset(o => clampOffset(o.x, o.y, next));
      return next;
    });
  };

  // ─── Export ───────────────────────────────────────────────────
  const handleConfirm = () => {
    if (!naturalSize) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const OUT = 240;
      canvas.width = OUT;
      canvas.height = OUT;
      const ctx = canvas.getContext('2d');

      ctx.beginPath();
      ctx.arc(OUT / 2, OUT / 2, OUT / 2, 0, Math.PI * 2);
      ctx.clip();

      const visualW = baseW * scale;
      const visualH = baseH * scale;

      const srcVisualX = visualW / 2 - CROP_SIZE / 2 - offset.x; 
      const srcVisualY = visualH / 2 - CROP_SIZE / 2 - offset.y;

      const scaleToNatural = naturalSize.w / visualW;

      const srcX = srcVisualX * scaleToNatural;
      const srcY = srcVisualY * scaleToNatural;
      const srcW = CROP_SIZE * scaleToNatural;
      const srcH = CROP_SIZE * scaleToNatural;

      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, OUT, OUT);
      onConfirm(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.src = imageSrc;
  };

  if (!naturalSize) {
    return <div style={{ width: CONTAINER_SIZE, height: CONTAINER_SIZE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading image...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      <p style={{
        fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)',
        textAlign: 'center', margin: 0,
      }}>
        Drag to pan · Pinch or scroll to zoom
      </p>

      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: CONTAINER_SIZE,
          height: CONTAINER_SIZE,
          overflow: 'hidden',
          borderRadius: 'var(--radius-md)',
          background: '#111',
          cursor: dragging ? 'grabbing' : 'grab',
          touchAction: 'none',
          userSelect: 'none',
          flexShrink: 0,
        }}
        onPointerDown={handlePointerDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <img
          src={imageSrc}
          alt="Crop"
          draggable={false}
          style={{
            position: 'absolute',
            width: baseW * scale,
            height: baseH * scale,
            maxWidth: 'none',
            maxHeight: 'none',
            top: '50%',
            left: '50%',
            transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%)`,
            width: CROP_SIZE,
            height: CROP_SIZE,
            borderRadius: '50%',
            boxShadow: `0 0 0 ${CONTAINER_SIZE}px rgba(0,0,0,0.55), 0 0 0 3px var(--primary), var(--glow-primary)`,
            pointerEvents: 'none',
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: CONTAINER_SIZE }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🔍</span>
        <input
          type="range"
          min={80}
          max={400}
          value={Math.round(scale * 100)}
          onChange={(e) => {
            const next = parseInt(e.target.value) / 100;
            setScale(next);
            setOffset(o => clampOffset(o.x, o.y, next));
          }}
          style={{ flex: 1, accentColor: 'var(--primary)' }}
        />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Math.round(scale * 100)}%</span>
      </div>

      <div style={{ display: 'flex', gap: 8, width: CONTAINER_SIZE }}>
        <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel}>
          ← Back
        </button>
        <button type="button" className="btn btn-primary" style={{ flex: 2 }} onClick={handleConfirm}>
          ✓ Use Photo
        </button>
      </div>
    </div>
  );
}
