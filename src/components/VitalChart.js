export default function VitalChart({ values = [], target, height = 148, color = '#5e5ce6' }) {
  const width = 320;
  const pad = 8;
  const nums = values.map((value) => Number(value) || 0);
  const peak = Math.max(target || 0, ...nums, 1);
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const step = nums.length > 1 ? innerW / (nums.length - 1) : innerW;
  const points = nums.map((value, index) => {
    const x = pad + index * step;
    const y = pad + innerH - (value / peak) * innerH;
    return `${x},${y}`;
  }).join(' ');
  const area = nums.length
    ? `${pad},${pad + innerH} ${points} ${pad + (nums.length - 1) * step},${pad + innerH}`
    : '';
  const targetY = target ? pad + innerH - (target / peak) * innerH : null;

  return (
    <svg className="vital-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-hidden="true">
      {targetY != null && (
        <line x1={pad} x2={width - pad} y1={targetY} y2={targetY} stroke="rgba(29,29,31,0.18)" strokeDasharray="4 4" />
      )}
      {area && <polygon points={area} fill={color} opacity="0.14" />}
      {nums.length > 1 && (
        <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      )}
    </svg>
  );
}
