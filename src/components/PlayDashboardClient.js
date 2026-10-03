'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import BrandLogo from './BrandLogo';

const GAMES = [
  { id: 'pairs', label: 'Pairs' },
  { id: 'marks', label: 'Marks' },
  { id: 'higher', label: 'Higher' },
];

const PAIR_WORDS = ['Sun', 'Moon', 'House', 'Book', 'Leaf', 'Coin'];

function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function freshPairs() {
  return shuffle(PAIR_WORDS.flatMap((word) => [word, word])).map((word, index) => ({
    id: index,
    word,
    open: false,
    matched: false,
  }));
}

function Pairs() {
  const [cards, setCards] = useState(freshPairs);
  const [picks, setPicks] = useState([]);
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);
  const done = cards.every((card) => card.matched);

  const flip = (id) => {
    if (lock || done) return;
    const card = cards.find((row) => row.id === id);
    if (!card || card.open || card.matched) return;
    const opened = cards.map((row) => (row.id === id ? { ...row, open: true } : row));
    const nextPicks = [...picks, id];
    setCards(opened);
    if (nextPicks.length < 2) {
      setPicks(nextPicks);
      return;
    }
    setMoves((count) => count + 1);
    setPicks([]);
    const [first, second] = nextPicks.map((pick) => opened.find((row) => row.id === pick));
    if (first.word === second.word) {
      setCards(opened.map((row) => (nextPicks.includes(row.id) ? { ...row, matched: true } : row)));
      return;
    }
    setLock(true);
    window.setTimeout(() => {
      setCards((rows) => rows.map((row) => (nextPicks.includes(row.id) ? { ...row, open: false } : row)));
      setLock(false);
    }, 700);
  };

  return (
    <section className="play-panel">
      <p className="vital-muted">{done ? `All matched in ${moves} turns.` : `${moves} turns`}</p>
      <div className="play-grid">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            className={`play-card${card.open || card.matched ? ' is-open' : ''}${card.matched ? ' is-matched' : ''}`}
            onClick={() => flip(card.id)}
          >
            {card.open || card.matched ? card.word : ''}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="vital-text-btn"
        onClick={() => {
          setCards(freshPairs());
          setPicks([]);
          setMoves(0);
          setLock(false);
        }}
      >
        New board
      </button>
    </section>
  );
}

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function winnerOf(cells) {
  const line = LINES.find((trio) => cells[trio[0]] && cells[trio[0]] === cells[trio[1]] && cells[trio[0]] === cells[trio[2]]);
  return line ? cells[line[0]] : null;
}

function Marks() {
  const [cells, setCells] = useState(Array(9).fill(''));
  const [turn, setTurn] = useState('X');
  const winner = winnerOf(cells);
  const full = cells.every(Boolean);
  const status = winner ? `${winner} wins` : full ? 'Draw' : `${turn} to play`;

  return (
    <section className="play-panel">
      <p className="vital-muted">{status}</p>
      <div className="play-marks">
        {cells.map((mark, index) => (
          <button
            key={index}
            type="button"
            className="play-mark"
            disabled={Boolean(mark) || Boolean(winner)}
            onClick={() => {
              const next = cells.slice();
              next[index] = turn;
              setCells(next);
              setTurn(turn === 'X' ? 'O' : 'X');
            }}
          >
            {mark}
          </button>
        ))}
      </div>
      <button type="button" className="vital-text-btn" onClick={() => { setCells(Array(9).fill('')); setTurn('X'); }}>
        New game
      </button>
    </section>
  );
}

function nextSecret() {
  return 1 + Math.floor(Math.random() * 50);
}

function Higher() {
  const [secret, setSecret] = useState(nextSecret);
  const [guess, setGuess] = useState('');
  const [hint, setHint] = useState('A number from 1 to 50.');
  const [tries, setTries] = useState(0);
  const [done, setDone] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    const value = Number(guess);
    if (!Number.isInteger(value) || value < 1 || value > 50) {
      setHint('Use a whole number from 1 to 50.');
      return;
    }
    const count = tries + 1;
    setTries(count);
    if (value === secret) {
      setDone(true);
      setHint(`That’s it, in ${count} ${count === 1 ? 'guess' : 'guesses'}.`);
      return;
    }
    setHint(value < secret ? 'Higher.' : 'Lower.');
    setGuess('');
  };

  return (
    <section className="play-panel">
      <p className="vital-muted">{hint}</p>
      <form className="play-guess" onSubmit={submit}>
        <input
          className="vital-input"
          inputMode="numeric"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="1–50"
          disabled={done}
        />
        <button className="vital-btn" type="submit" disabled={done}>Guess</button>
      </form>
      <button
        type="button"
        className="vital-text-btn"
        onClick={() => {
          setSecret(nextSecret());
          setGuess('');
          setHint('A number from 1 to 50.');
          setTries(0);
          setDone(false);
        }}
      >
        New number
      </button>
    </section>
  );
}

export default function PlayDashboardClient() {
  const [game, setGame] = useState('pairs');
  const board = useMemo(() => {
    if (game === 'marks') return <Marks />;
    if (game === 'higher') return <Higher />;
    return <Pairs />;
  }, [game]);

  return (
    <div className="vital-app">
      <header className="vital-top">
        <div className="vital-top-brand">
          <BrandLogo href="/apps" size="sm" tone="ink" />
          <span>Play</span>
        </div>
        <Link href="/apps" className="vital-text-btn">Apps</Link>
      </header>
      <main className="vital-main">
        <nav className="vital-tabs" aria-label="Games">
          {GAMES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={game === item.id ? 'is-active' : ''}
              onClick={() => setGame(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        {board}
      </main>
    </div>
  );
}
