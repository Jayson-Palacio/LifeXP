"use client";

import { useState, useRef, useCallback } from 'react';

// InlineCropPicker — renders inline inside the child modal form
// imageSrc: raw data URL from FileReader
// onConfirm(dataUrl) — called with the cropped base64 JPEG
// onCancel() — go back to emoji grid without saving
export default function InlineCrop({ imageSrc, onConfirm, onCancel }) {
  const containerRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const startRef = useRef(null);
  const CROP_SIZE = 200; // diameter of the crop circle in container px

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
    const img = container.querySelector('img.crop-source');
    if (!img) return;
    const imgRect = img.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const scaleX = img.naturalWidth / imgRect.width;
    const scaleY = img.naturalHeight / imgRect.height;

    const circleCenterX = cw / 2 + offset.x;
    const circleCenterY = ch / 2 + offset.y;
    const imgOffsetX = imgRect.left - containerRect.left;
    const imgOffsetY = imgRect.top - containerRect.top;

    const cropX = (circleCenterX - imgOffsetX - CROP_SIZE / 2) * scaleX;
    const cropY = (circleCenterY - imgOffsetY - CROP_SIZE / 2) * scaleY;
    const cropW = CROP_SIZE * scaleX;
    const cropH = CROP_SIZE * scaleY;

    const OUT = 200;
    const canvas = document.createElement('canvas');
    canvas.width = OUT;
    canvas.height = OUT;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(OUT / 2, OUT / 2, OUT / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, OUT, OUT);
    onConfirm(canvas.toDataURL('image/jpeg', 0.88));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
      <p style={{
        fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)',
        textAlign: 'center', margin: 0, letterSpacing: '0.03em'
      }}>
        Drag to position your face in the circle
      </p>

      {/* Crop viewport */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 300,
          aspectRatio: '1',
          overflow: 'hidden',
          borderRadius: 'var(--radius-md)',
          background: '#000',
          cursor: dragging ? 'grabbing' : 'grab',
          touchAction: 'none',
          userSelect: 'none',
        }}
        onPointerDown={handlePointerDown}
      >
        {/* Dim full image */}
        <img
          className="crop-source"
          src={imageSrc}
          alt="Crop source"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            opacity: 0.3,
            pointerEvents: 'none',
          }}
        />

        {/* Bright circle preview */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
          width: CROP_SIZE, height: CROP_SIZE,
          borderRadius: '50%', overflow: 'hidden',
          pointerEvents: 'none',
        }}>
          <img
            src={imageSrc}
            alt=""
            style={{
              position: 'absolute',
              // Offset the inner image opposite to the crop circle position so it aligns
              top: `calc(50% - ${offset.y}px - ${CROP_SIZE / 2}px)`,
              left: `calc(50% - ${offset.x}px - ${CROP_SIZE / 2}px)`,
              width: '100%',
              height: '100%',
              // 100% of the outer container, positioned relative to it
              minWidth: 300, minHeight: 300,
              objectFit: 'contain',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Ring border */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
          width: CROP_SIZE, height: CROP_SIZE,
          borderRadius: '50%',
          border: '3px solid var(--primary)',
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.5), var(--glow-primary)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, width: '100%' }}>
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
