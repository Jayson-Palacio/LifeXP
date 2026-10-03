'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BrandLogo from './BrandLogo';

const GAMES = [
  { id: 'pop', label: 'Pop', blurb: 'Hear a word. Pop that bubble.', hue: '#e36a45' },
  { id: 'spell', label: 'Spell', blurb: 'Hear it, then tap the letters.', hue: '#3d7ea6' },
  { id: 'echo', label: 'Echo', blurb: 'Watch the colors. Tap them back.', hue: '#d4a017' },
  { id: 'pairs', label: 'Pairs', blurb: 'Flip two. Find the match.', hue: '#2f6b4f' },
  { id: 'marks', label: 'Marks', blurb: 'Two players. Three in a row.', hue: '#5c4d7a' },
];

const BEST_KEY = 'kaeluma.play.bests';

function readBests() {
  try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}'); } catch { return {}; }
}

function useBest(id) {
  const [best, setBest] = useState(() => {
    if (typeof window === 'undefined') return null;
    return readBests()[id] ?? null;
  });
  const save = (value, better) => {
    const all = readBests();
    const prev = all[id];
    if (prev == null || better(value, prev)) {
      all[id] = value;
      localStorage.setItem(BEST_KEY, JSON.stringify(all));
      setBest(value);
    }
  };
  return [best, save];
}

function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function speak(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.86;
  utter.lang = 'en-US';
  window.speechSynthesis.speak(utter);
}

const WORDS = [
  { word: 'cat', near: ['cap', 'bat'] },
  { word: 'dog', near: ['log', 'dig'] },
  { word: 'sun', near: ['sit', 'run'] },
  { word: 'hat', near: ['hot', 'bat'] },
  { word: 'pig', near: ['pin', 'big'] },
  { word: 'bus', near: ['bug', 'bun'] },
  { word: 'cup', near: ['cap', 'pup'] },
  { word: 'bed', near: ['bad', 'red'] },
  { word: 'map', near: ['mop', 'mat'] },
  { word: 'mom', near: ['mud', 'man'] },
  { word: 'fish', near: ['dish', 'wish'] },
  { word: 'bug', near: ['bag', 'hug'] },
];

function Pop() {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [shake, setShake] = useState(null);
  const [best, saveBest] = useBest('pop');
  const current = WORDS[round % WORDS.length];
  const bubbles = shuffle([current.word, ...current.near]).map((word, index) => ({
    word,
    left: 18 + index * 28,
  }));

  useEffect(() => {
    speak(current.word);
    const timer = window.setTimeout(() => {
      setScore(0);
      setRound((value) => value + 1);
    }, 7000);
    return () => window.clearTimeout(timer);
  }, [round, current.word]);

  const tap = (word) => {
    if (word !== current.word) {
      setShake(word);
      window.setTimeout(() => setShake(null), 280);
      speak(current.word);
      return;
    }
    const next = score + 1;
    setScore(next);
    saveBest(next, (value, prev) => value > prev);
    setRound((value) => value + 1);
  };

  return (
    <section className="play-panel">
      <div className="play-hud">
        <strong>{score}</strong>
        <span>{best != null ? `Best ${best}` : 'Pop the word'}</span>
        <button type="button" onClick={() => speak(current.word)}>Hear</button>
      </div>
      <div className="play-field">
        {bubbles.map((bubble) => (
          <button
            key={`${round}-${bubble.word}`}
            type="button"
            className={`play-bubble${shake === bubble.word ? ' is-shake' : ''}`}
            style={{ left: `${bubble.left}%` }}
            onClick={() => tap(bubble.word)}
          >
            {bubble.word}
          </button>
        ))}
      </div>
    </section>
  );
}

const SPELL_WORDS = ['cat', 'dog', 'sun', 'hat', 'pig', 'bus', 'cup', 'bed', 'map', 'mom', 'fish', 'bug'];

function spellRound(index) {
  const word = SPELL_WORDS[index % SPELL_WORDS.length];
  const extras = shuffle('abcdefghijklmnopqrstuvwxyz'.split('').filter((letter) => !word.includes(letter))).slice(0, 3);
  return { word, letters: shuffle([...word.split(''), ...extras]) };
}

function Spell() {
  const [round, setRound] = useState(0);
  const [puzzle, setPuzzle] = useState(() => spellRound(0));
  const [built, setBuilt] = useState('');
  const [bad, setBad] = useState(false);
  const [streak, setStreak] = useState(0);
  const [best, saveBest] = useBest('spell');

  useEffect(() => {
    speak(`Spell ${puzzle.word}`);
  }, [puzzle.word, round]);

  const tap = (letter) => {
    const next = built + letter;
    if (!puzzle.word.startsWith(next)) {
      setBad(true);
      setBuilt('');
      setStreak(0);
      speak(`Spell ${puzzle.word}`);
      window.setTimeout(() => setBad(false), 280);
      return;
    }
    setBuilt(next);
    if (next !== puzzle.word) return;
    const count = streak + 1;
    setStreak(count);
    saveBest(count, (value, prev) => value > prev);
    const upcoming = round + 1;
    setRound(upcoming);
    setPuzzle(spellRound(upcoming));
    setBuilt('');
  };

  return (
    <section className="play-panel">
      <div className="play-hud">
        <strong>{streak}</strong>
        <span>{best != null ? `Best ${best}` : 'Spell what you hear'}</span>
        <button type="button" onClick={() => speak(`Spell ${puzzle.word}`)}>Hear</button>
      </div>
      <p className={`play-built${bad ? ' is-bad' : ''}`}>{built || '·'}</p>
      <div className="play-letters">
        {puzzle.letters.map((letter, index) => (
          <button key={`${letter}-${index}`} type="button" className="play-letter" onClick={() => tap(letter)}>{letter}</button>
        ))}
      </div>
    </section>
  );
}

const ECHO_TONES = [
  { id: 0, name: 'Clay', tone: 'clay' },
  { id: 1, name: 'Sea', tone: 'sea' },
  { id: 2, name: 'Leaf', tone: 'leaf' },
  { id: 3, name: 'Gold', tone: 'gold' },
];

function Echo() {
  const [seq, setSeq] = useState(() => [Math.floor(Math.random() * 4)]);
  const [step, setStep] = useState(0);
  const [lit, setLit] = useState(null);
  const [playing, setPlaying] = useState(true);
  const [missed, setMissed] = useState(false);
  const [best, saveBest] = useBest('echo');

  useEffect(() => {
    const timers = seq.map((tone, index) => window.setTimeout(() => {
      setLit(tone);
      window.setTimeout(() => setLit(null), 320);
    }, 420 + index * 560));
    const done = window.setTimeout(() => {
      setPlaying(false);
      setStep(0);
    }, 420 + seq.length * 560);
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(done);
    };
  }, [seq]);

  const press = (tone) => {
    if (playing || missed) return;
    setLit(tone);
    window.setTimeout(() => setLit(null), 160);
    if (tone !== seq[step]) {
      saveBest(Math.max(0, seq.length - 1), (next, prev) => next > prev);
      setMissed(true);
      return;
    }
    if (step + 1 < seq.length) {
      setStep(step + 1);
      return;
    }
    saveBest(seq.length, (next, prev) => next > prev);
    setPlaying(true);
    setSeq((rows) => [...rows, Math.floor(Math.random() * 4)]);
  };

  return (
    <section className="play-panel">
      <div className="play-hud">
        <strong>{seq.length}</strong>
        <span>{missed ? 'Missed' : playing ? 'Watch' : 'Your turn'}{best != null ? ` · Best ${best}` : ''}</span>
        {missed ? <button type="button" onClick={() => { setMissed(false); setPlaying(true); setSeq([Math.floor(Math.random() * 4)]); }}>Again</button> : <span />}
      </div>
      <div className="play-echo">
        {ECHO_TONES.map((tone) => (
          <button
            key={tone.id}
            type="button"
            className={`play-echo-pad is-${tone.tone}${lit === tone.id ? ' is-lit' : ''}`}
            onClick={() => press(tone.id)}
          >
            {tone.name}
          </button>
        ))}
      </div>
    </section>
  );
}

function Glyph({ name }) {
  const props = { viewBox: '0 0 48 48', width: '40', height: '40', fill: 'none', stroke: 'currentColor', strokeWidth: '2.4', strokeLinecap: 'round' };
  if (name === 'Sun') return <svg {...props}><circle cx="24" cy="24" r="8" /><path d="M24 6v5M24 37v5M6 24h5M37 24h5M11 11l4 4M33 33l4 4M37 11l-4 4M15 33l-4 4" /></svg>;
  if (name === 'Moon') return <svg {...props}><path d="M28 8a14 14 0 1 0 10 24A12 12 0 0 1 28 8z" /></svg>;
  if (name === 'House') return <svg {...props}><path d="M8 22 24 8l16 14v16H8z" /><path d="M20 38V26h8v12" /></svg>;
  if (name === 'Star') return <svg {...props}><path d="m24 6 4.8 10.6L40 18.2l-8 7.6L34 38 24 32.4 14 38l2-12.2-8-7.6 11.2-1.6z" /></svg>;
  if (name === 'Leaf') return <svg {...props}><path d="M10 34c12-2 22-12 26-26-14 2-24 12-26 26z" /><path d="M16 28c4-4 8-8 14-12" /></svg>;
  if (name === 'Key') return <svg {...props}><circle cx="18" cy="20" r="8" /><path d="M24 24l14 14M32 32l4-4M36 36l4-4" /></svg>;
  if (name === 'Heart') return <svg {...props}><path d="M24 40s-14-8.5-14-18a8 8 0 0 1 14-5 8 8 0 0 1 14 5c0 9.5-14 18-14 18z" /></svg>;
  return <svg {...props}><circle cx="24" cy="24" r="10" /><circle cx="24" cy="24" r="3" /></svg>;
}

const PAIR_NAMES = ['Sun', 'Moon', 'House', 'Star', 'Leaf', 'Key', 'Heart', 'Coin'];

function freshPairs() {
  return shuffle(PAIR_NAMES.flatMap((name) => [name, name])).map((name, index) => ({
    id: index,
    name,
    open: false,
    matched: false,
  }));
}

function Pairs() {
  const [cards, setCards] = useState(freshPairs);
  const [picks, setPicks] = useState([]);
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);
  const [best, saveBest] = useBest('pairs');
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
    const count = moves + 1;
    setMoves(count);
    setPicks([]);
    const [first, second] = nextPicks.map((pick) => opened.find((row) => row.id === pick));
    if (first.name === second.name) {
      const matched = opened.map((row) => (nextPicks.includes(row.id) ? { ...row, matched: true } : row));
      setCards(matched);
      if (matched.every((row) => row.matched)) saveBest(count, (next, prev) => next < prev);
      return;
    }
    setLock(true);
    window.setTimeout(() => {
      setCards((rows) => rows.map((row) => (nextPicks.includes(row.id) ? { ...row, open: false } : row)));
      setLock(false);
    }, 620);
  };

  return (
    <section className="play-panel">
      <div className="play-hud">
        <strong>{moves}</strong>
        <span>{done ? 'Matched' : 'Turns'}{best != null ? ` · Best ${best}` : ''}</span>
        <button type="button" onClick={() => { setCards(freshPairs()); setPicks([]); setMoves(0); setLock(false); }}>New</button>
      </div>
      <div className="play-grid">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            className={`play-card is-${card.name.toLowerCase()}${card.open || card.matched ? ' is-open' : ''}${card.matched ? ' is-matched' : ''}`}
            onClick={() => flip(card.id)}
          >
            {card.open || card.matched ? <Glyph name={card.name} /> : <i />}
          </button>
        ))}
      </div>
    </section>
  );
}

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function winningLine(cells) {
  return LINES.find((trio) => cells[trio[0]] && cells[trio[0]] === cells[trio[1]] && cells[trio[0]] === cells[trio[2]]) || null;
}

function Marks() {
  const [cells, setCells] = useState(Array(9).fill(''));
  const [turn, setTurn] = useState('X');
  const [score, setScore] = useState({ X: 0, O: 0 });
  const line = winningLine(cells);
  const winner = line ? cells[line[0]] : null;
  const full = cells.every(Boolean);

  return (
    <section className="play-panel">
      <div className="play-hud">
        <strong>{winner || turn}</strong>
        <span>{winner ? 'wins' : full ? 'Draw' : 'to play'} · X {score.X} · O {score.O}</span>
        <button type="button" onClick={() => { setCells(Array(9).fill('')); setTurn('X'); }}>Next</button>
      </div>
      <div className="play-marks">
        {cells.map((mark, index) => (
          <button
            key={index}
            type="button"
            className={`play-mark${line?.includes(index) ? ' is-win' : ''}${mark === 'O' ? ' is-o' : ''}`}
            disabled={Boolean(mark) || Boolean(winner)}
            onClick={() => {
              const next = cells.slice();
              next[index] = turn;
              setCells(next);
              if (winningLine(next)) setScore((prev) => ({ ...prev, [turn]: prev[turn] + 1 }));
              setTurn(turn === 'X' ? 'O' : 'X');
            }}
          >
            {mark}
          </button>
        ))}
      </div>
    </section>
  );
}

const BOARDS = { pop: Pop, spell: Spell, echo: Echo, pairs: Pairs, marks: Marks };

export default function PlayDashboardClient() {
  const [game, setGame] = useState(null);
  const Active = game ? BOARDS[game] : null;
  const meta = GAMES.find((row) => row.id === game);

  return (
    <div className="vital-app play-app">
      <header className="vital-top">
        <div className="vital-top-brand">
          <BrandLogo href="/apps" size="sm" tone="ink" />
          <span>Play</span>
        </div>
        <Link href="/apps" className="vital-text-btn">Apps</Link>
      </header>
      <main className="vital-main">
        {Active ? (
          <>
            <div className="play-bar">
              <button type="button" className="vital-text-btn" onClick={() => setGame(null)}>Games</button>
              <p className="vital-kicker">{meta.label}</p>
            </div>
            <Active key={game} />
          </>
        ) : (
          <div className="play-lobby">
            {GAMES.map((row) => (
              <button key={row.id} type="button" className="play-lobby-card" style={{ '--play-hue': row.hue }} onClick={() => setGame(row.id)}>
                <i />
                <strong>{row.label}</strong>
                <span>{row.blurb}</span>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
