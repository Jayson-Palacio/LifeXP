'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import SiteAuth from '../components/SiteAuth';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Kaeluma error boundary caught:', error);
  }, [error]);

  return (
    <SiteAuth
      title="Something went wrong."
      subtitle="Your data is safe. Try again, or go back home."
    >
      <div className="site-hero-actions" style={{ justifyContent: 'center' }}>
        <button type="button" onClick={reset} className="site-btn">
          Try again
        </button>
        <Link href="/" className="site-more">
          Home
        </Link>
      </div>
    </SiteAuth>
  );
}
