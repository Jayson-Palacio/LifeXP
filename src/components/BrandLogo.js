import Link from 'next/link';
import SunIcon from './SunIcon';

const SIZES = {
  sm: { icon: 22, text: '1.05rem' },
  md: { icon: 32, text: '1.6rem' },
  lg: { icon: 40, text: '1.85rem' },
  hero: { icon: 72, text: '3.2rem' },
};

/**
 * Official Kaeluma lockup.
 * @param {'full' | 'icon' | 'wordmark'} variant
 * @param {'sm' | 'md' | 'lg' | 'hero'} size
 * @param {string} [href] wrap in a Link when set
 */
export default function BrandLogo({
  variant = 'full',
  size = 'md',
  href,
  className = '',
  style,
}) {
  const s = SIZES[size] || SIZES.md;
  const inner = (
    <span
      className={`brand-logo brand-logo-${variant} ${className}`.trim()}
      style={style}
    >
      {variant !== 'wordmark' && <SunIcon size={s.icon} />}
      {variant !== 'icon' && (
        <span className="brand-wordmark" style={{ fontSize: s.text }}>
          Kaeluma
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="brand-logo-link" aria-label="Kaeluma home">
        {inner}
      </Link>
    );
  }

  return inner;
}
