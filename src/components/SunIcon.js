/** Official Kaeluma sun mark — geometric 8-ray spec from branding/logos. */
export default function SunIcon({ size = 32, className }) {
  const dim = typeof size === 'number' ? size : undefined;
  return (
    <svg
      className={className}
      width={dim ?? size}
      height={dim ?? size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g fill="#ffffff">
        <rect x="85" y="10" width="30" height="180" rx="15" />
        <rect x="10" y="85" width="180" height="30" rx="15" />
        <rect x="85" y="10" width="30" height="180" rx="15" transform="rotate(45 100 100)" />
        <rect x="85" y="10" width="30" height="180" rx="15" transform="rotate(-45 100 100)" />
        <circle cx="100" cy="100" r="50" />
      </g>
    </svg>
  );
}
