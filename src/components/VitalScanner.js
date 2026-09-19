'use client';

import { useEffect, useRef, useState } from 'react';
import { lookupBarcodeFood } from '../app/actions/vital';

export default function VitalScanner({ onFound, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const onFoundRef = useRef(onFound);
  const [manual, setManual] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState(false);

  useEffect(() => {
    onFoundRef.current = onFound;
  }, [onFound]);

  useEffect(() => {
    let cancelled = false;
    let timer;

    async function resolveCode(code) {
      const barcode = String(code || '').replace(/\s/g, '');
      if (!barcode) return;
      setBusy(true);
      setError('');
      const result = await lookupBarcodeFood(barcode);
      setBusy(false);
      if (!result.success) {
        setError(result.error);
        return;
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      onFoundRef.current(result.data);
    }

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setLive(true);
        if (typeof window.BarcodeDetector !== 'function') return;
        const detector = new window.BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'],
        });
        const tick = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes[0]?.rawValue) {
              await resolveCode(codes[0].rawValue);
              return;
            }
          } catch {
            /* keep scanning */
          }
          timer = window.setTimeout(tick, 280);
        };
        tick();
      } catch {
        setError('Camera blocked. Type the barcode instead.');
      }
    }

    start();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="vital-overlay" onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="vital-sheet vital-scan-sheet">
        <button type="button" className="vital-sheet-close" onClick={onClose} aria-label="Close">×</button>
        <h2>Scan a barcode</h2>
        <p>Point at the package. If the camera cannot see it, type the numbers under the barcode.</p>
        <video ref={videoRef} className={`vital-scan-video${live ? ' is-on' : ''}`} playsInline muted />
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const barcode = manual.replace(/\s/g, '');
            if (!barcode || busy) return;
            setBusy(true);
            setError('');
            const result = await lookupBarcodeFood(barcode);
            setBusy(false);
            if (!result.success) {
              setError(result.error);
              return;
            }
            streamRef.current?.getTracks().forEach((track) => track.stop());
            onFound(result.data);
          }}
        >
          <label htmlFor="barcode">Barcode</label>
          <input
            id="barcode"
            className="vital-input"
            inputMode="numeric"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="012345678905"
          />
          {error && <p className="vital-err">{error}</p>}
          <button type="submit" className="vital-btn" disabled={busy || !manual.trim()}>
            {busy ? 'Looking up…' : 'Look up'}
          </button>
        </form>
      </div>
    </div>
  );
}
