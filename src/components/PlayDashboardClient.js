'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BrandLogo from './BrandLogo';

const GAMES = [
  { id: 'pairs', label: 'Pairs', blurb: 'Flip two cards. Find every match.' },
  { id: 'marks', label: 'Marks', blurb: 'Two players. Three in a row.' },
  { id: 'higher', label: 'Higher', blurb: 'Guess a number from 1 to 50.' },
  { id: 'echo', label: 'Echo', blurb: 'Watch the order, then tap it back.' },
  { id: 'odd', label: 'Odd one', blurb: 'Three belong. Tap the one that does not.' },
  { id: 'sum', label: 'Sum', blurb: 'Add the pair. Keep the streak.' },
];

const BEST_KEY = 'kaeluma.play.bests';

function readBests() {
  try {
    return JSON.parse(localStorage.getItem(BEST_KEY) || '{}');
  } catch {
    return {};
  }
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

const PAIR_WORDS = ['Sun', 'Moon', 'House', 'Book', 'Leaf', 'Coin', 'Star', 'Key'];

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
    if (first.word === second.word) {
      const matched = opened.map((row) => (nextPicks.includes(row.id) ? { ...row, matched: true } : row));
      setCards(matched);
      if (matched.every((row) => row.matched)) saveBest(count, (next, prev) => next < prev);
      return;
    }
    setLock(true);
    window.setTimeout(() => {
      setCards((rows) => rows.map((row) => (nextPicks.includes(row.id) ? { ...row, open: false } : row)));
      setLock(false);
    }, 650);
  };

  return (
    <section className="play-panel">
      <p className="vital-muted">
        {done ? `Matched in ${moves} turns.` : `${moves} turns`}
        {best != null ? ` · Best ${best}` : ''}
      </p>
      <div className="play-grid play-grid-4">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            className={`play-card${card.open || card.matched ? ' is-open' : ''}${card.matched ? ' is-matched' : ''}`}
            onClick={() => flip(card.id)}
          >
            {card.open || card.matched ? card.word : '·'}
          </button>
        ))}
      </div>
      <button type="button" className="vital-text-btn" onClick={() => { setCards(freshPairs()); setPicks([]); setMoves(0); setLock(false); }}>
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
      <p className="vital-muted">
        {winner ? `${winner} wins` : full ? 'Draw' : `${turn} to play`}
        {` · X ${score.X} · O ${score.O}`}
      </p>
      <div className="play-marks">
        {cells.map((mark, index) => (
          <button
            key={index}
            type="button"
            className={`play-mark${line?.includes(index) ? ' is-win' : ''}`}
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
      <button type="button" className="vital-text-btn" onClick={() => { setCells(Array(9).fill('')); setTurn('X'); }}>
        Next round
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
  const [best, saveBest] = useBest('higher');

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
      saveBest(count, (next, prev) => next < prev);
      setHint(`That’s it, in ${count} ${count === 1 ? 'guess' : 'guesses'}.`);
      return;
    }
    setHint(value < secret ? 'Higher.' : 'Lower.');
    setGuess('');
  };

  return (
    <section className="play-panel">
      <p className="vital-muted">{hint}{best != null ? ` · Best ${best}` : ''}</p>
      <form className="play-guess" onSubmit={submit}>
        <input className="vital-input" inputMode="numeric" value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="1–50" disabled={done} />
        <button className="vital-btn" type="submit" disabled={done}>Guess</button>
      </form>
      <button type="button" className="vital-text-btn" onClick={() => { setSecret(nextSecret()); setGuess(''); setHint('A number from 1 to 50.'); setTries(0); setDone(false); }}>
        New number
      </button>
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
      window.setTimeout(() => setLit(null), 380);
    }, 500 + index * 640));
    const done = window.setTimeout(() => {
      setPlaying(false);
      setStep(0);
    }, 500 + seq.length * 640);
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(done);
    };
  }, [seq]);

  const press = (tone) => {
    if (playing || missed) return;
    setLit(tone);
    window.setTimeout(() => setLit(null), 180);
    if (tone !== seq[step]) {
      saveBest(seq.length - 1, (next, prev) => next > prev);
      setMissed(true);
      return;
    }
    if (step + 1 === seq.length) {
      const reached = seq.length;
      saveBest(reached, (next, prev) => next > prev);
      setPlaying(true);
      setSeq((rows) => [...rows, Math.floor(Math.random() * 4)]);
      return;
    }
    setStep(step + 1);
  };

  return (
    <section className="play-panel">
      <p className="vital-muted">
        {missed ? `Missed at ${seq.length}.` : playing ? 'Watch.' : 'Your turn.'}
        {` · Length ${seq.length}`}
        {best != null ? ` · Best ${best}` : ''}
      </p>
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
      {missed ? (
        <button type="button" className="vital-text-btn" onClick={() => { setMissed(false); setPlaying(true); setSeq([Math.floor(Math.random() * 4)]); }}>
          Again
        </button>
      ) : null}
    </section>
  );
}

const ODD_ROUNDS = [
  { words: ['Oak', 'Pine', 'Maple', 'Spoon'], odd: 'Spoon' },
  { words: ['Red', 'Blue', 'Green', 'Seven'], odd: 'Seven' },
  { words: ['Chair', 'Table', 'Sofa', 'River'], odd: 'River' },
  { words: ['Apple', 'Pear', 'Plum', 'Hammer'], odd: 'Hammer' },
  { words: ['Dog', 'Cat', 'Horse', 'Cloud'], odd: 'Cloud' },
  { words: ['Monday', 'Friday', 'Sunday', 'March'], odd: 'March' },
  { words: ['Circle', 'Square', 'Triangle', 'Whisper'], odd: 'Whisper' },
  { words: ['Piano', 'Violin', 'Drum', 'Ladder'], odd: 'Ladder' },
  { words: ['Boot', 'Sandal', 'Slipper', 'Window'], odd: 'Window' },
  { words: ['Soup', 'Stew', 'Chili', 'Marble'], odd: 'Marble' },
];

function Odd() {
  const [round, setRound] = useState(0);
  const [order, setOrder] = useState(() => shuffle(ODD_ROUNDS[0].words));
  const [streak, setStreak] = useState(0);
  const [note, setNote] = useState('Tap the word that does not belong.');
  const [best, saveBest] = useBest('odd');
  const current = ODD_ROUNDS[round % ODD_ROUNDS.length];

  const pick = (word) => {
    if (word === current.odd) {
      const next = streak + 1;
      setStreak(next);
      saveBest(next, (value, prev) => value > prev);
      setNote('Yes.');
      const upcoming = ODD_ROUNDS[(round + 1) % ODD_ROUNDS.length];
      setRound(round + 1);
      setOrder(shuffle(upcoming.words));
      return;
    }
    setNote(`${current.odd} was the odd one.`);
    setStreak(0);
  };

  return (
    <section className="play-panel">
      <p className="vital-muted">{note} · Streak {streak}{best != null ? ` · Best ${best}` : ''}</p>
      <div className="play-echo">
        {order.map((word) => (
          <button key={word} type="button" className="play-choice" onClick={() => pick(word)}>{word}</button>
        ))}
      </div>
    </section>
  );
}

function nextSum() {
  const a = 2 + Math.floor(Math.random() * 10);
  const b = 2 + Math.floor(Math.random() * 10);
  const answer = a + b;
  const choices = new Set([answer]);
  while (choices.size < 4) {
    const drift = answer + (Math.floor(Math.random() * 7) - 3);
    if (drift > 0 && drift !== answer) choices.add(drift);
  }
  return { a, b, answer, choices: shuffle([...choices]) };
}

function Sum() {
  const [problem, setProblem] = useState(nextSum);
  const [streak, setStreak] = useState(0);
  const [note, setNote] = useState('Tap the sum.');
  const [best, saveBest] = useBest('sum');

  const pick = (value) => {
    if (value === problem.answer) {
      const next = streak + 1;
      setStreak(next);
      saveBest(next, (n, prev) => n > prev);
      setNote('Yes.');
      setProblem(nextSum());
      return;
    }
    setNote(`${problem.a} + ${problem.b} is ${problem.answer}.`);
    setStreak(0);
    setProblem(nextSum());
  };

  return (
    <section className="play-panel">
      <p className="play-sum">{problem.a} + {problem.b}</p>
      <p className="vital-muted">{note} · Streak {streak}{best != null ? ` · Best ${best}` : ''}</p>
      <div className="play-echo">
        {problem.choices.map((value) => (
          <button key={value} type="button" className="play-choice" onClick={() => pick(value)}>{value}</button>
        ))}
      </div>
    </section>
  );
}

const BOARDS = { pairs: Pairs, marks: Marks, higher: Higher, echo: Echo, odd: Odd, sum: Sum };

export default function PlayDashboardClient() {
  const [game, setGame] = useState(null);
  const Active = game ? BOARDS[game] : null;
  const meta = GAMES.find((row) => row.id === game);

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
              <button key={row.id} type="button" className="play-lobby-card" onClick={() => setGame(row.id)}>
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
