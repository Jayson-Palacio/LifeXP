'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BrandLogo from './BrandLogo';

const GAMES = [
  { id: 'listen', label: 'Listen', blurb: 'Hear a word. Tap it.' },
  { id: 'spell', label: 'Spell', blurb: 'Hear it, then type it.' },
  { id: 'recall', label: 'Recall', blurb: 'Watch the order. Repeat it.' },
  { id: 'match', label: 'Match', blurb: 'Turn two tiles. Find the pair.' },
  { id: 'board', label: 'Board', blurb: 'Two players. Three in a row.' },
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
  utter.rate = 0.9;
  utter.lang = 'en-US';
  window.speechSynthesis.speak(utter);
}

function Hud({ value, detail, action, onAction }) {
  return (
    <div className="ios-hud">
      <strong>{value}</strong>
      <span>{detail}</span>
      {action ? <button type="button" onClick={onAction}>{action}</button> : null}
    </div>
  );
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

function Listen() {
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState(null);
  const [streak, setStreak] = useState(0);
  const [best, saveBest] = useBest('listen');
  const current = WORDS[round % WORDS.length];
  const options = shuffle([current.word, ...current.near]);

  useEffect(() => {
    speak(current.word);
  }, [round, current.word]);

  const choose = (word) => {
    if (picked) return;
    setPicked(word);
    if (word === current.word) {
      const next = streak + 1;
      setStreak(next);
      saveBest(next, (value, prev) => value > prev);
      window.setTimeout(() => {
        setPicked(null);
        setRound((value) => value + 1);
      }, 450);
      return;
    }
    setStreak(0);
    speak(current.word);
    window.setTimeout(() => setPicked(null), 700);
  };

  return (
    <section className="ios-game">
      <Hud value={streak} detail={best != null ? `Best ${best}` : 'Listen'} action="Hear" onAction={() => speak(current.word)} />
      <div className="ios-group">
        {options.map((word) => (
          <button
            key={word}
            type="button"
            className={`ios-row${picked === word ? (word === current.word ? ' is-yes' : ' is-no') : ''}`}
            onClick={() => choose(word)}
          >
            {word}
          </button>
        ))}
      </div>
    </section>
  );
}

const SPELL_WORDS = ['cat', 'dog', 'sun', 'hat', 'pig', 'bus', 'cup', 'bed', 'map', 'mom', 'fish', 'bug'];

function spellRound(index) {
  const word = SPELL_WORDS[index % SPELL_WORDS.length];
  const extras = shuffle('abcdefghijklmnopqrstuvwxyz'.split('').filter((letter) => !word.includes(letter))).slice(0, 2);
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
    speak(puzzle.word);
  }, [puzzle.word, round]);

  const tap = (letter) => {
    const next = built + letter;
    if (!puzzle.word.startsWith(next)) {
      setBad(true);
      setBuilt('');
      setStreak(0);
      speak(puzzle.word);
      window.setTimeout(() => setBad(false), 350);
      return;
    }
    setBuilt(next);
    if (next !== puzzle.word) return;
    const count = streak + 1;
    setStreak(count);
    saveBest(count, (value, prev) => value > prev);
    const upcoming = round + 1;
    window.setTimeout(() => {
      setRound(upcoming);
      setPuzzle(spellRound(upcoming));
      setBuilt('');
    }, 400);
  };

  return (
    <section className="ios-game">
      <Hud value={streak} detail={best != null ? `Best ${best}` : 'Spell'} action="Hear" onAction={() => speak(puzzle.word)} />
      <p className={`ios-built${bad ? ' is-bad' : ''}`}>{built || ' '}</p>
      <div className="ios-keys">
        {puzzle.letters.map((letter, index) => (
          <button key={`${letter}-${index}`} type="button" onClick={() => tap(letter)}>{letter}</button>
        ))}
      </div>
    </section>
  );
}

const RECALL = [
  { id: 0, label: 'Blue' },
  { id: 1, label: 'Green' },
  { id: 2, label: 'Orange' },
  { id: 3, label: 'Purple' },
];

function Recall() {
  const [seq, setSeq] = useState(() => [Math.floor(Math.random() * 4)]);
  const [step, setStep] = useState(0);
  const [lit, setLit] = useState(null);
  const [playing, setPlaying] = useState(true);
  const [missed, setMissed] = useState(false);
  const [best, saveBest] = useBest('recall');

  useEffect(() => {
    const timers = seq.map((tone, index) => window.setTimeout(() => {
      setLit(tone);
      window.setTimeout(() => setLit(null), 280);
    }, 400 + index * 520));
    const done = window.setTimeout(() => {
      setPlaying(false);
      setStep(0);
    }, 400 + seq.length * 520);
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(done);
    };
  }, [seq]);

  const press = (tone) => {
    if (playing || missed) return;
    setLit(tone);
    window.setTimeout(() => setLit(null), 140);
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
    <section className="ios-game">
      <Hud
        value={seq.length}
        detail={missed ? 'Missed' : playing ? 'Watch' : 'Your turn'}
        action={missed ? 'Again' : null}
        onAction={() => { setMissed(false); setPlaying(true); setSeq([Math.floor(Math.random() * 4)]); }}
      />
      {best != null ? <p className="ios-footnote">Best {best}</p> : null}
      <div className="ios-recall">
        {RECALL.map((tone) => (
          <button
            key={tone.id}
            type="button"
            className={`ios-orb is-${tone.id}${lit === tone.id ? ' is-lit' : ''}`}
            onClick={() => press(tone.id)}
            aria-label={tone.label}
          />
        ))}
      </div>
    </section>
  );
}

function Glyph({ name }) {
  const props = { viewBox: '0 0 24 24', width: '28', height: '28', fill: 'none', stroke: 'currentColor', strokeWidth: '1.6', strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (name === 'Sun') return <svg {...props}><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" /></svg>;
  if (name === 'Moon') return <svg {...props}><path d="M16 4a8 8 0 1 0 4 13A7 7 0 0 1 16 4z" /></svg>;
  if (name === 'House') return <svg {...props}><path d="M4 11 12 4l8 7v8H4z" /><path d="M10 19v-5h4v5" /></svg>;
  if (name === 'Star') return <svg {...props}><path d="m12 3 2.2 5.2L20 9l-4 3.6L17.2 18 12 15.4 6.8 18 8 12.6 4 9l5.8-.8z" /></svg>;
  if (name === 'Leaf') return <svg {...props}><path d="M5 19c6-1 11-6 13-13-7 1-12 6-13 13z" /><path d="M8 15c2-2 4-4 7-6" /></svg>;
  return <svg {...props}><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2" /></svg>;
}

const PAIR_NAMES = ['Sun', 'Moon', 'House', 'Star', 'Leaf', 'Ring'];

function freshPairs() {
  return shuffle(PAIR_NAMES.flatMap((name) => [name, name])).map((name, index) => ({
    id: index, name, open: false, matched: false,
  }));
}

function Match() {
  const [cards, setCards] = useState(freshPairs);
  const [picks, setPicks] = useState([]);
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);
  const [best, saveBest] = useBest('match');
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
    }, 550);
  };

  return (
    <section className="ios-game">
      <Hud
        value={moves}
        detail={done ? 'Done' : 'Turns'}
        action="New"
        onAction={() => { setCards(freshPairs()); setPicks([]); setMoves(0); setLock(false); }}
      />
      {best != null ? <p className="ios-footnote">Best {best}</p> : null}
      <div className="ios-match">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            className={`ios-tile${card.open || card.matched ? ' is-open' : ''}${card.matched ? ' is-matched' : ''}`}
            onClick={() => flip(card.id)}
          >
            {card.open || card.matched ? <Glyph name={card.name} /> : null}
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

function Board() {
  const [cells, setCells] = useState(Array(9).fill(''));
  const [turn, setTurn] = useState('X');
  const [score, setScore] = useState({ X: 0, O: 0 });
  const line = winningLine(cells);
  const winner = line ? cells[line[0]] : null;
  const full = cells.every(Boolean);

  return (
    <section className="ios-game">
      <Hud
        value={winner || (full ? '–' : turn)}
        detail={winner ? 'Wins' : full ? 'Draw' : 'To play'}
        action="Next"
        onAction={() => { setCells(Array(9).fill('')); setTurn('X'); }}
      />
      <p className="ios-footnote">X {score.X} · O {score.O}</p>
      <div className="ios-board">
        {cells.map((mark, index) => (
          <button
            key={index}
            type="button"
            className={line?.includes(index) ? 'is-win' : ''}
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

const BOARDS = { listen: Listen, spell: Spell, recall: Recall, match: Match, board: Board };

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
      <main className="vital-main ios-play">
        {Active ? (
          <>
            <button type="button" className="ios-back" onClick={() => setGame(null)}>{meta.label}</button>
            <Active key={game} />
          </>
        ) : (
          <>
            <h1 className="ios-title">Games</h1>
            <div className="ios-group">
              {GAMES.map((row) => (
                <button key={row.id} type="button" className="ios-nav" onClick={() => setGame(row.id)}>
                  <span>
                    <strong>{row.label}</strong>
                    <em>{row.blurb}</em>
                  </span>
                  <i />
                </button>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
