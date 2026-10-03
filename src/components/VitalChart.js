function segments(values) {
  const runs = [];
  let current = [];
  values.forEach((value, index) => {
    if (value == null || Number.isNaN(Number(value))) {
      if (current.length) runs.push(current);
      current = [];
      return;
    }
    current.push(index);
  });
  if (current.length) runs.push(current);
  return runs;
}

function asNumbers(series) {
  return Array.isArray(series) ? series.map((value) => (value == null ? null : Number(value))) : null;
}

function roundLabel(value) {
  return Math.abs(value) >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
}

export default function VitalChart({
  values = [],
  trend,
  guide,
  xs,
  labels = [],
  target,
  height = 148,
  color = '#5e5ce6',
  unit = '',
  zero = true,
  minSpan = 2,
}) {
  const width = 320;
  const pad = 8;
  const padLeft = zero ? pad : 34;
  const nums = asNumbers(values) || [];
  const trendNums = asNumbers(trend);
  const guideNums = asNumbers(guide);
  const finite = [...nums, ...(trendNums || []), ...(guideNums || []), target]
    .filter((value) => value != null && !Number.isNaN(value));

  let lo = 0;
  let hi = Math.max(...finite, 1);
  if (!zero && finite.length) {
    lo = Math.min(...finite);
    hi = Math.max(...finite);
    if (hi - lo < minSpan) {
      const mid = (hi + lo) / 2;
      lo = mid - minSpan / 2;
      hi = mid + minSpan / 2;
    }
    const room = (hi - lo) * 0.12;
    lo -= room;
    hi += room;
  }

  const innerW = width - padLeft - pad;
  const innerH = height - pad * 2;
  const spanX = xs && xs.length > 1 ? xs[xs.length - 1] - xs[0] : 0;
  const xAt = (index) => {
    if (spanX > 0) return padLeft + ((xs[index] - xs[0]) / spanX) * innerW;
    return padLeft + (nums.length > 1 ? (index / (nums.length - 1)) * innerW : innerW / 2);
  };
  const yAt = (value) => pad + innerH - ((value - lo) / (hi - lo || 1)) * innerH;
  const lineFor = (series) => segments(series).map((run) => run.map((index) => `${xAt(index)},${yAt(series[index])}`).join(' '));
  const targetY = target ? yAt(target) : null;
  const first = labels[0] || '';
  const last = labels.length > 1 ? labels[labels.length - 1] : '';

  return (
    <div className="vital-chart-wrap">
      <svg className="vital-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={unit ? `Chart in ${unit}` : 'Chart'}>
        {!zero && (
          <>
            <line x1={padLeft} x2={width - pad} y1={pad} y2={pad} stroke="rgba(29,29,31,0.06)" />
            <line x1={padLeft} x2={width - pad} y1={pad + innerH} y2={pad + innerH} stroke="rgba(29,29,31,0.06)" />
            <text x={padLeft - 6} y={pad + 4} textAnchor="end" fontSize="10" fill="rgba(29,29,31,0.45)">{roundLabel(hi)}</text>
            <text x={padLeft - 6} y={pad + innerH} textAnchor="end" fontSize="10" fill="rgba(29,29,31,0.45)">{roundLabel(lo)}</text>
          </>
        )}
        {targetY != null && (
          <line x1={padLeft} x2={width - pad} y1={targetY} y2={targetY} stroke="rgba(29,29,31,0.18)" strokeDasharray="4 4" />
        )}
        {guideNums && lineFor(guideNums).map((points) => (
          <polyline key={`g-${points}`} points={points} fill="none" stroke="rgba(29,29,31,0.35)" strokeWidth="1.5" strokeDasharray="5 4" />
        ))}
        {!trendNums && lineFor(nums).map((points) => (
          <polyline key={points} points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {trendNums && lineFor(trendNums).map((points) => (
          <polyline key={`t-${points}`} points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {nums.map((value, index) => (
          value == null ? null : (
            <circle key={index} cx={xAt(index)} cy={yAt(value)} r="2.5" fill={color} opacity={trendNums ? 0.45 : 1} />
          )
        ))}
      </svg>
      {(first || unit) && (
        <div className="vital-chart-axis">
          <span>{first}</span>
          <span>{unit}</span>
          <span>{last}</span>
        </div>
      )}
    </div>
  );
}
