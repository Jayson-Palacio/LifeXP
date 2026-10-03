'use client';

import Link from 'next/link';
import BrandLogo from './BrandLogo';
import ChickenCross from './ChickenCross';

export default function PlayDashboardClient() {
  return (
    <div className="vital-app play-app">
      <header className="vital-top">
        <div className="vital-top-brand">
          <BrandLogo href="/apps" size="sm" tone="light" />
        </div>
        <Link href="/apps" className="vital-text-btn">Apps</Link>
      </header>
      <main className="vital-main">
        <ChickenCross />
      </main>
    </div>
  );
}
