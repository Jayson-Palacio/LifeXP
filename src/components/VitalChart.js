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

export default function VitalChart({
  values = [],
  trend,
  labels = [],
  target,
  height = 148,
  color = '#5e5ce6',
  unit = '',
}) {
  const width = 320;
  const pad = 8;
  const nums = values.map((value) => (value == null ? null : Number(value)));
  const trendNums = Array.isArray(trend)
    ? trend.map((value) => (value == null ? null : Number(value)))
    : null;
  const finite = [...nums, ...(trendNums || []), target].filter((value) => value != null && !Number.isNaN(value));
  const peak = Math.max(...finite, 1);
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const step = nums.length > 1 ? innerW / (nums.length - 1) : innerW;
  const xy = (index, value) => {
    const x = pad + index * step;
    const y = pad + innerH - (value / peak) * innerH;
    return `${x},${y}`;
  };
  const lineFor = (series) => segments(series).map((run) => run.map((index) => xy(index, series[index])).join(' '));
  const targetY = target ? pad + innerH - (target / peak) * innerH : null;
  const first = labels[0] || '';
  const last = labels.length > 1 ? labels[labels.length - 1] : '';

  return (
    <div className="vital-chart-wrap">
      <svg className="vital-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={unit ? `Chart in ${unit}` : 'Chart'}>
        {targetY != null && (
          <line x1={pad} x2={width - pad} y1={targetY} y2={targetY} stroke="rgba(29,29,31,0.18)" strokeDasharray="4 4" />
        )}
        {!trendNums && lineFor(nums).map((points) => (
          <polyline key={points} points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {trendNums && lineFor(trendNums).map((points) => (
          <polyline key={`t-${points}`} points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {nums.map((value, index) => (
          value == null ? null : (
            <circle key={index} cx={pad + index * step} cy={pad + innerH - (value / peak) * innerH} r="2.5" fill={color} />
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
