export default function VitalRing({
  value = 0,
  max = 100,
  label,
  unit = '',
  caption,
  remain = false,
  color = '#0d7377',
  size = 112,
}) {
  const safeMax = max > 0 ? max : 1;
  const n = Math.max(0, Number(value) || 0);
  const ratio = n / safeMax;
  const over = ratio > 1.02;
  const pct = Math.min(100, Math.round(ratio * 100));
  const left = Math.round(safeMax - n);
  const display = remain ? Math.abs(left) : Math.round(n);
  const stroke = over ? '#e24b4a' : color;
  const hint = remain ? (left < 0 ? 'over' : 'left') : unit;

  return (
    <div className="vital-ring" style={{ '--vital-ring-size': `${size}px` }}>
      <div className="vital-ring-dial">
        <svg viewBox="0 0 100 100" className="vital-ring-svg" aria-hidden="true">
          <circle cx="50" cy="50" r="38" className="vital-ring-track" />
          <circle
            cx="50"
            cy="50"
            r="38"
            className="vital-ring-arc"
            pathLength="100"
            stroke={stroke}
            strokeDasharray={`${pct} 100`}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="vital-ring-center">
          <strong>{display.toLocaleString()}</strong>
          {hint ? <span>{hint}</span> : null}
        </div>
      </div>
      {label ? <p className="vital-ring-label">{label}</p> : null}
      {caption ? <p className="vital-ring-caption">{caption}</p> : null}
    </div>
  );
}
