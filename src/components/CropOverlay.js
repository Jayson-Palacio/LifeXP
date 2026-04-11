"use client";

import { useState, useRef, useCallback } from 'react';

// InlineCrop — image drag + pinch-to-zoom crop
// Renders inline inside the modal — no z-index issues
export default function InlineCrop({ imageSrc, onConfirm, onCancel }) {
  const containerRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const startRef = useRef(null);
  const pinchRef = useRef(null); // track initial pinch distance + scale
  const CROP_SIZE = 200;
  const CONTAINER_SIZE = 280; // px (square)

  // ─── Pan ───────────────────────────────────────────────────────
  const clampOffset = useCallback((x, y, s = scale) => {
    const imgSize = CONTAINER_SIZE * s;
    const maxX = (imgSize - CROP_SIZE) / 2;
    const maxY = (imgSize - CROP_SIZE) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }, [scale]);

  // ─── Desktop Pan (Mouse) ─────────────────────────────────────────
  const handleMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    startRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback((e) => {
    if (!startRef.current) return;
    setOffset(clampOffset(e.clientX - startRef.current.x, e.clientY - startRef.current.y));
  }, [clampOffset]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
    startRef.current = null;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  // ─── Touch Events (Pan & Pinch) ─────────────────────────────────
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setDragging(true);
      startRef.current = { x: e.touches[0].clientX - offset.x, y: e.touches[0].clientY - offset.y };
    } else if (e.touches.length === 2) {
      // It's a pinch. Prevent pan.
      startRef.current = null; 
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchRef.current = { startDist: dist, startScale: scale };
    }
  };

  const handleTouchMove = (e) => {
    // If panning
    if (e.touches.length === 1 && startRef.current) {
      setOffset(clampOffset(e.touches[0].clientX - startRef.current.x, e.touches[0].clientY - startRef.current.y));
    } 
    // If pinching
    else if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault(); // prevent native scroll
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
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(s => {
      const next = Math.max(0.8, Math.min(4, s * delta));
      setOffset(o => clampOffset(o.x, o.y, next));
      return next;
    });
  };

  // ─── Export ───────────────────────────────────────────────────
  const handleConfirm = () => {
    const canvas = document.createElement('canvas');
    const OUT = 240;
    canvas.width = OUT;
    canvas.height = OUT;
    const ctx = canvas.getContext('2d');

    // Circular clip
    ctx.beginPath();
    ctx.arc(OUT / 2, OUT / 2, OUT / 2, 0, Math.PI * 2);
    ctx.clip();

    const img = new Image();
    img.src = imageSrc;

    // The image is rendered at CONTAINER_SIZE * scale, centered
    // The crop circle is offset by (offset.x, offset.y) from container center
    // We need to figure out what area of the image falls inside the crop circle
    const renderedW = CONTAINER_SIZE * scale;
    const renderedH = CONTAINER_SIZE * scale;

    // Position of crop circle top-left in container space
    const circleLeft = (CONTAINER_SIZE - CROP_SIZE) / 2 + offset.x;
    const circleTop  = (CONTAINER_SIZE - CROP_SIZE) / 2 + offset.y;

    // Image top-left in container space (image is centered in container)
    const imgLeft = (CONTAINER_SIZE - renderedW) / 2;
    const imgTop  = (CONTAINER_SIZE - renderedH) / 2;

    // Natural image scale factor
    const scaleToNatural = img.naturalWidth / renderedW;

    const srcX = (circleLeft - imgLeft) * scaleToNatural;
    const srcY = (circleTop - imgTop) * scaleToNatural;
    const srcW = CROP_SIZE * scaleToNatural;
    const srcH = CROP_SIZE * scaleToNatural;

    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, OUT, OUT);
    onConfirm(canvas.toDataURL('image/jpeg', 0.88));
  };

  const imgSize = CONTAINER_SIZE * scale;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      <p style={{
        fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)',
        textAlign: 'center', margin: 0,
      }}>
        Drag to pan · Pinch or scroll to zoom
      </p>

      {/* Single container — image rendered once, crop ring overlaid */}
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
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {/* The image — rendered ONCE, scaled + panned */}
        <img
          src={imageSrc}
          alt="Crop"
          draggable={false}
          style={{
            position: 'absolute',
            width: imgSize,
            height: imgSize,
            objectFit: 'contain',
            top: '50%',
            left: '50%',
            transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
            pointerEvents: 'none',
          }}
        />

        {/* Dark overlay with circular hole — using box-shadow trick */}
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

      {/* Zoom slider for accessibility */}
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

      {/* Actions */}
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
