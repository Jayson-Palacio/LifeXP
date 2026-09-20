'use client';

import Link from 'next/link';
import BrandLogo from './BrandLogo';

export default function QuestsTopBar({ right }) {
  return (
    <header className="quests-top">
      <div className="quests-top-brand">
        <BrandLogo href="/apps" size="sm" tone="ink" />
        <span>Quests</span>
      </div>
      <div className="quests-top-right">
        {right || (
          <Link href="/apps" className="quests-top-link">
            Apps
          </Link>
        )}
      </div>
    </header>
  );
}
