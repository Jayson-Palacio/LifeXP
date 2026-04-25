'use client';

import Link from 'next/link';
import { useState } from 'react';

/**
 * NavLink — wraps Next.js <Link> with hover-triggered prefetching.
 * Prefetch only fires when the user shows intent (hover/touch),
 * keeping bandwidth usage low while making navigation feel instant.
 *
 * Usage:
 *   <NavLink href="/parent" className="cool-home-btn">
 *     🏠 Home
 *   </NavLink>
 */
export default function NavLink({ href, children, className, style, title, onClick }) {
  const [active, setActive] = useState(false);

  return (
    <Link
      href={href}
      prefetch={active ? null : false}
      onMouseEnter={() => setActive(true)}
      onTouchStart={() => setActive(true)}
      className={className}
      style={style}
      title={title}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
