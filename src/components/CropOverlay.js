"use client";

import { useState, useRef, useCallback } from 'react';

// CropOverlay — shows uploaded image with draggable circular crop window
// onConfirm(dataUrl) — called with the cropped base64 JPEG
// onCancel() — dismiss without saving
export default function CropOverlay({ imageSrc, onConfirm, onCancel }) {
  const containerRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const startRef = useRef(null);
  const CROP_SIZE = 220; // px diameter of the crop circle

  const handlePointerDown = (e) => {
    e.preventDefault();
    setDragging(true);
    startRef.current = {
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handlePointerMove = useCallback((e) => {
    if (!startRef.current) return;
    const container = containerRef.current;
    if (!container) return;
    const { width, height } = container.getBoundingClientRect();
    const halfCrop = CROP_SIZE / 2;

    let newX = e.clientX - startRef.current.x;
    let newY = e.clientY - startRef.current.y;

    // Clamp so the crop circle stays inside the container
    newX = Math.max(-width / 2 + halfCrop, Math.min(width / 2 - halfCrop, newX));
    newY = Math.max(-height / 2 + halfCrop, Math.min(height / 2 - halfCrop, newY));

    setOffset({ x: newX, y: newY });
  }, []);

  const handlePointerUp = useCallback(() => {
    setDragging(false);
    startRef.current = null;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }, [handlePointerMove]);

  const handleConfirm = () => {
    const container = containerRef.current;
    if (!container) return;

    const { width: cw, height: ch } = container.getBoundingClientRect();
    const img = container.querySelector('img');
    const imgRect = img.getBoundingClientRect();

    // Crop circle center in container coords
    const circleCenterX = cw / 2 + offset.x;
    const circleCenterY = ch / 2 + offset.y;

    // Scale from rendered size to natural size
    const scaleX = img.naturalWidth / imgRect.width;
    const scaleY = img.naturalHeight / imgRect.height;

    // Circle center offset from image top-left (in rendered px)
    const imgOffsetX = imgRect.left - container.getBoundingClientRect().left;
    const imgOffsetY = imgRect.top - container.getBoundingClientRect().top;
    const cropX = (circleCenterX - imgOffsetX - CROP_SIZE / 2) * scaleX;
    const cropY = (circleCenterY - imgOffsetY - CROP_SIZE / 2) * scaleY;
    const cropW = CROP_SIZE * scaleX;
    const cropH = CROP_SIZE * scaleY;

    const canvas = document.createElement('canvas');
    const OUT_SIZE = 200;
    canvas.width = OUT_SIZE;
    canvas.height = OUT_SIZE;
    const ctx = canvas.getContext('2d');

    // Draw circle clip
    ctx.beginPath();
    ctx.arc(OUT_SIZE / 2, OUT_SIZE / 2, OUT_SIZE / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, OUT_SIZE, OUT_SIZE);

    onConfirm(canvas.toDataURL('image/jpeg', 0.88));
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 24,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-bright)' }}>
        Drag to position · Circle = your avatar
      </p>

      {/* Crop Container */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: 320,
          height: 320,
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          background: '#000',
          cursor: dragging ? 'grabbing' : 'grab',
          touchAction: 'none',
          userSelect: 'none',
        }}
        onPointerDown={handlePointerDown}
      >
        {/* The Image */}
        <img
          src={imageSrc}
          alt="Crop preview"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            opacity: 0.4,
            pointerEvents: 'none',
          }}
        />

        {/* Crop Ring Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
            width: CROP_SIZE,
            height: CROP_SIZE,
            borderRadius: '50%',
            border: `3px solid var(--primary)`,
            boxShadow: `0 0 0 9999px rgba(0,0,0,0.55), var(--glow-primary)`,
            pointerEvents: 'none',
          }}
        />

        {/* Crop Content Preview (visible area inside the ring) */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
            width: CROP_SIZE,
            height: CROP_SIZE,
            borderRadius: '50%',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <img
            src={imageSrc}
            alt=""
            style={{
              position: 'absolute',
              top: `calc(50% - ${offset.y}px - 160px)`,
              left: `calc(50% - ${offset.x}px - 160px)`,
              width: 320,
              height: 320,
              objectFit: 'contain',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 16 }}>
        <button
          className="btn btn-ghost"
          style={{ minWidth: 120 }}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary"
          style={{ minWidth: 120 }}
          onClick={handleConfirm}
        >
          ✓ Use Photo
        </button>
      </div>
    </div>
  );
}
