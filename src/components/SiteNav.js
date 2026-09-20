'use client';

import { useState } from 'react';
import Link from 'next/link';
import BrandLogo from './BrandLogo';

export default function SiteNav({
  onSupport,
  account = false,
  onSignOut,
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-nav">
      <a href="#main" className="site-skip">Skip to content</a>
      <div className="site-nav-inner">
        <BrandLogo href={account ? '/apps' : '/'} size="sm" tone="ink" />

        {!account && (
          <nav className="site-nav-links" aria-label="Product">
            <a href="/#quests">Quests</a>
            <a href="/#vital">Vital</a>
            <a href="/#ledger">Ledger</a>
            {onSupport && (
              <button type="button" onClick={onSupport}>
                Support
              </button>
            )}
          </nav>
        )}

        <div className="site-nav-actions">
          {account ? (
            <button type="button" className="site-text-btn" onClick={onSignOut}>
              Sign out
            </button>
          ) : (
            <>
              <Link href="/login" className="site-text-btn">
                Log in
              </Link>
              <Link href="/signup" className="site-btn site-btn-sm">
                Get started
              </Link>
            </>
          )}
          {!account && (
            <button
              type="button"
              className="site-nav-menu"
              aria-expanded={open}
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
            </button>
          )}
        </div>
      </div>

      {open && !account && (
        <div className="site-nav-drawer">
          <a href="/#quests" onClick={() => setOpen(false)}>Quests</a>
          <a href="/#vital" onClick={() => setOpen(false)}>Vital</a>
          <a href="/#ledger" onClick={() => setOpen(false)}>Ledger</a>
          {onSupport && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onSupport();
              }}
            >
              Support
            </button>
          )}
          <Link href="/login" onClick={() => setOpen(false)}>
            Log in
          </Link>
          <Link href="/signup" className="site-btn" onClick={() => setOpen(false)}>
            Get started
          </Link>
        </div>
      )}
    </header>
  );
}
