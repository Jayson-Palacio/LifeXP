'use client';

import { useState } from 'react';
import Link from 'next/link';
import BrandLogo from './BrandLogo';
import ChickenCross from './ChickenCross';
import PlanetBuilder from './PlanetBuilder';

export default function PlayDashboardClient() {
  const [game, setGame] = useState(null);
  const tone = game ? 'light' : 'ink';

  return (
    <div className={`vital-app play-app${game ? ` is-${game}` : ' is-lobby'}`}>
      <header className="vital-top">
        <div className="vital-top-brand">
          <BrandLogo href="/apps" size="sm" tone={tone} />
        </div>
        <div className="play-top-actions">
          {game ? <button type="button" className="vital-text-btn" onClick={() => setGame(null)}>Games</button> : null}
          <Link href="/apps" className="vital-text-btn">Apps</Link>
        </div>
      </header>
      <main className="vital-main">
        {game === 'cross' ? <ChickenCross /> : null}
        {game === 'planet' ? <PlanetBuilder /> : null}
        {game ? null : (
          <section className="play-lobby">
            <h1>Play</h1>
            <button type="button" className="is-planet" onClick={() => setGame('planet')}>
              <strong>Planet</strong>
              <span>Tap to walk a big world. Gather trees and rocks, then build. The view does not spin on its own.</span>
            </button>
            <button type="button" onClick={() => setGame('cross')}>
              <strong>Cross</strong>
              <span>Hop a chicken across the road.</span>
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
