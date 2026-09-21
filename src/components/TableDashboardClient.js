'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import BrandLogo from './BrandLogo';
import { saveTableWeek } from '../app/actions/table';
import { saveVitalKitchenItem } from '../app/actions/vital';
import {
  TABLE_AISLES,
  TABLE_LABELS,
  TABLE_SLOTS,
  copyMeals,
  countPlates,
  countSlot,
  dayLabel,
  dayNum,
  emptyMeals,
  extrasFromGrocery,
  groceryFromMeals,
  groceryLeft,
  groceryText,
  mergeMeals,
  plateSnapshot,
  searchPlates,
  shiftYmd,
  suggestDinners,
  weekDays,
  weekLabel,
  weekProtein,
  weekdayShort,
} from '../lib/table';
import { encodeKitchenRecipe, safeHttpUrl } from '../lib/vitalSuggest';
import { localYmd } from '../lib/time';
import { playClick, playPop } from '../lib/sounds';

const LOCAL_KEY = 'kaeluma.table.v1';
const TABS = [
  { id: 'week', label: 'Week' },
  { id: 'list', label: 'List' },
];

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeLocal(weekStart, meals, grocery) {
  const all = readLocal();
  all[weekStart] = { meals, grocery, extras: extrasFromGrocery(grocery) };
  localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
}

function planForWeek(plans, weekStart, local) {
  const saved = local?.[weekStart];
  if (saved?.meals) {
    const meals = mergeMeals(weekStart, saved.meals);
    return {
      meals,
      grocery: groceryFromMeals(meals, saved.extras || extrasFromGrocery(saved.grocery), saved.grocery || []),
    };
  }
  const row = plans.find((item) => String(item.week_start).slice(0, 10) === weekStart);
  if (row) {
    return {
      meals: mergeMeals(weekStart, row.meals),
      grocery: groceryFromMeals(row.meals, row.extras || [], row.grocery || []),
    };
  }
  return { meals: emptyMeals(weekStart), grocery: [] };
}

function macrosLabel(kcal, protein) {
  const energy = Math.round(Number(kcal) || 0);
  const grams = Math.round(Number(protein) || 0);
  if (!energy && !grams) return '';
  return `${energy} kcal · ${grams}g protein`;
}

function shopParts(row) {
  const need = String(row.need || row.name || '');
  const name = String(row.name || '');
  if (name && need.toLowerCase().endsWith(name.toLowerCase())) {
    return { amount: need.slice(0, need.length - name.length).trim() || '1', item: name };
  }
  return { amount: need, item: name };
}

function RecipeLabels({ labels, className = 'table-labels' }) {
  if (!labels?.length) return null;
  return (
    <span className={className}>
      {labels.map((label) => (
        <i key={label}>{label}</i>
      ))}
    </span>
  );
}

function emptyRecipe(name = '') {
  return {
    name,
    ingredients: '',
    url: '',
    notes: '',
    servings: '4',
    calories: '',
    protein_g: '',
    labels: [],
  };
}

function parseIngs(raw) {
  return String(raw || '')
    .split(/[\n,;]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 16);
}

function RecipeLink({ plate, className = 'vital-text-btn' }) {
  const href = safeHttpUrl(plate?.recipeUrl);
  if (!href) return null;
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {plate.recipeSource ? `Recipe · ${plate.recipeSource}` : 'Recipe'}
    </a>
  );
}

export default function TableDashboardClient({
  plans = [],
  kitchen = [],
  tableMissing = false,
  initialToday,
  initialWeek,
}) {
  const [, startTransition] = useTransition();
  const [tab, setTab] = useState('week');
  const [today, setToday] = useState(initialToday);
  const [weekStart, setWeekStart] = useState(initialWeek);
  const [canCopyLast, setCanCopyLast] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [picker, setPicker] = useState(null);
  const [query, setQuery] = useState('');
  const [label, setLabel] = useState('');
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(() => emptyRecipe());
  const [pickError, setPickError] = useState('');
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [ownKitchen, setOwnKitchen] = useState(kitchen);
  const [extraName, setExtraName] = useState('');

  const seeded = useMemo(() => planForWeek(plans, weekStart, {}), [plans, weekStart]);
  const [meals, setMeals] = useState(seeded.meals);
  const [grocery, setGrocery] = useState(seeded.grocery);

  useEffect(() => {
    setToday(localYmd());
  }, []);

  useEffect(() => {
    const next = planForWeek(plans, weekStart, readLocal());
    setMeals(next.meals);
    setGrocery(next.grocery);
    const previous = planForWeek(plans, shiftYmd(weekStart, -7), readLocal());
    setCanCopyLast(countPlates(previous.meals) > 0);
  }, [plans, weekStart]);

  useEffect(() => {
    setOwnKitchen(kitchen);
  }, [kitchen]);

  const days = useMemo(() => weekDays(weekStart), [weekStart]);
  const plates = countPlates(meals);
  const dinners = countSlot(meals, 'dinner');
  const left = groceryLeft(grocery);
  const protein = weekProtein(meals);
  const lastWeek = shiftYmd(weekStart, -7);
  const hits = useMemo(
    () => (picker ? searchPlates(query, { slot: picker.slot, kitchen: ownKitchen, label }) : []),
    [picker, query, ownKitchen, label]
  );

  const openSlot = (ymd, slot) => {
    playClick?.();
    setPicker({ ymd, slot: slot.id || slot, label: slot.label || TABLE_SLOTS.find((row) => row.id === slot)?.label || 'Dinner' });
    setQuery('');
    setLabel('');
    setAdding(false);
    setDraft(emptyRecipe());
    setPickError('');
  };

  const persist = (nextMeals, nextGrocery) => {
    const rebuilt = groceryFromMeals(nextMeals, extrasFromGrocery(nextGrocery), nextGrocery);
    setMeals(nextMeals);
    setGrocery(rebuilt);
    writeLocal(weekStart, nextMeals, rebuilt);
    setError('');
    startTransition(async () => {
      const result = await saveTableWeek({ week_start: weekStart, meals: nextMeals, grocery: rebuilt });
      if (!result.success && !/table_schema/i.test(result.error || '')) {
        setError(result.error);
      }
    });
  };

  const setPlate = (ymd, slot, plate) => {
    persist({
      ...meals,
      [ymd]: { ...meals[ymd], [slot]: plate },
    }, grocery);
  };

  const saveRecipe = async (event) => {
    event.preventDefault();
    if (!picker || savingRecipe) return;
    const name = String(draft.name || '').trim();
    const platesMade = Math.max(1, Math.min(24, Number(draft.servings) || 1));
    const totalKcal = Number(draft.calories);
    const ings = parseIngs(draft.ingredients);
    if (!name) {
      setPickError('Name the recipe.');
      return;
    }
    if (!ings.length) {
      setPickError('Add ingredients so they land on the grocery list.');
      return;
    }
    if (!Number.isFinite(totalKcal) || totalKcal < 0) {
      setPickError('Add calories for the pot, or for one plate.');
      return;
    }
    if (draft.protein_g === '' || Number(draft.protein_g) < 0) {
      setPickError('Add protein for the pot, or for one plate.');
      return;
    }
    const linkRaw = String(draft.url || '').trim();
    if (linkRaw && !safeHttpUrl(linkRaw)) {
      setPickError('Use a web link that starts with http.');
      return;
    }
    const per = (value) => Math.round(((Number(value) || 0) / platesMade) * 10) / 10;
    setSavingRecipe(true);
    setPickError('');
    const kcal = Math.round(totalKcal / platesMade);
    const protein = per(draft.protein_g);
    const payload = {
      name,
      calories: kcal,
      protein_g: protein,
      meal: picker.slot,
      barcode: encodeKitchenRecipe({
        ingredients: draft.ingredients,
        url: linkRaw,
        notes: draft.notes,
        servings: platesMade,
        meal: picker.slot,
        tags: draft.labels,
      }),
    };
    const saved = await saveVitalKitchenItem(payload);
    setSavingRecipe(false);
    setOwnKitchen((rows) => [{
      id: saved.success ? `local-${name}` : `local-${Date.now()}`,
      name,
      calories: kcal,
      protein_g: protein,
      barcode: payload.barcode,
    }, ...rows]);
    setPlate(picker.ymd, picker.slot, plateSnapshot({
      title: name,
      ingredients: ings,
      recipeUrl: safeHttpUrl(linkRaw),
      recipeSource: safeHttpUrl(linkRaw) ? undefined : 'Your recipe',
      notes: String(draft.notes || '').trim(),
      tags: draft.labels,
      kcal,
      protein,
      saved: true,
    }));
    setPicker(null);
    if (!saved.success) setError(saved.error);
    playPop?.();
  };

  const fillDinners = (remix = false) => {
    const used = remix ? [] : days.map((ymd) => meals[ymd]?.dinner?.title).filter(Boolean);
    const empty = remix ? days : days.filter((ymd) => !meals[ymd]?.dinner);
    const ideas = suggestDinners(weekStart, empty.length, used, remix ? Date.now() : 0);
    const next = { ...meals };
    empty.forEach((ymd, index) => {
      if (ideas[index]) next[ymd] = { ...next[ymd], dinner: ideas[index] };
    });
    persist(next, grocery);
    playPop?.();
  };

  const copyLast = () => {
    const previous = planForWeek(plans, lastWeek, readLocal());
    persist(copyMeals(previous.meals, lastWeek, weekStart), grocery);
    playPop?.();
  };

  const toggleItem = (key) => {
    persist(meals, grocery.map((row) => (row.key === key ? { ...row, done: !row.done } : row)));
  };

  const addExtra = (event) => {
    event.preventDefault();
    const name = extraName.trim();
    if (!name) return;
    persist(meals, [...grocery, { key: `extra:${name.toLowerCase()}`, name, count: 1, aisle: 'Other', from: [], done: false, extra: true }]);
    setExtraName('');
  };

  const copyList = async () => {
    const text = groceryText(grocery);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setError('Could not copy the list.');
    }
  };

  const grouped = TABLE_AISLES
    .map((aisle) => ({ aisle, items: grocery.filter((row) => row.aisle === aisle) }))
    .filter((group) => group.items.length);
  const current = picker ? meals[picker.ymd]?.[picker.slot] : null;

  return (
    <div className="vital-app table-app">
      <header className="vital-top">
        <div className="vital-top-brand">
          <BrandLogo href="/apps" size="sm" tone="ink" />
          <span>Table</span>
        </div>
        <Link href="/apps?tab=account" className="vital-text-btn">Account</Link>
        <Link href="/apps" className="vital-text-btn">Apps</Link>
      </header>

      <main className="vital-main">
        {tableMissing ? (
          <p className="table-note">Saving on this device. Run <code>table_schema.sql</code> so the week follows the login.</p>
        ) : null}

        <div className="table-bar">
          <div className="table-week-bar">
            <button type="button" className="table-week-shift" onClick={() => setWeekStart(shiftYmd(weekStart, -7))} aria-label="Last week">
              ‹
            </button>
            <strong>Week of {weekLabel(weekStart)}</strong>
            <button type="button" className="table-week-shift" onClick={() => setWeekStart(shiftYmd(weekStart, 7))} aria-label="Next week">
              ›
            </button>
          </div>
          <p className="table-meta">
            {plates ? `${plates} plates` : 'No meals yet'}
            {protein ? ` · ${protein}g protein` : ''}
            {grocery.length ? ` · ${left} to buy` : ''}
          </p>
          <div className="table-bar-actions">
            <button type="button" className="vital-text-btn" onClick={() => fillDinners(dinners >= 7)}>
              {dinners >= 7 ? 'Remix dinners' : 'Fill dinners'}
            </button>
            <button type="button" className="vital-text-btn" onClick={copyLast} disabled={!canCopyLast}>
              Copy last week
            </button>
            <button
              type="button"
              className="vital-text-btn"
              onClick={() => persist(emptyMeals(weekStart), extrasFromGrocery(grocery).map((row) => ({ ...row, extra: true, key: `extra:${row.name.toLowerCase()}` })))}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="table-toolbar">
          <nav className="vital-tabs" aria-label="Table">
            {TABS.map((row) => (
              <button
                key={row.id}
                type="button"
                className={tab === row.id ? 'is-active' : ''}
                onClick={() => setTab(row.id)}
              >
                {row.label}
                {row.id === 'list' && grocery.length ? <i>{left}</i> : null}
              </button>
            ))}
          </nav>
        </div>

        {error ? <p className="vital-err">{error}</p> : null}

        {tab === 'week' && (
          <div className="table-board">
            <div className="table-board-head" aria-hidden="true">
              <span />
              {TABLE_SLOTS.map((slot) => (
                <span key={slot.id}>{slot.label}</span>
              ))}
            </div>
            {days.map((ymd) => (
              <div
                key={ymd}
                className={`table-board-row${ymd === today ? ' is-today' : ''}`}
              >
                <header className="table-board-day">
                  <b>{weekdayShort(ymd)}</b>
                  <span>{dayNum(ymd)}</span>
                  {ymd === today ? <em>Today</em> : null}
                </header>
                {TABLE_SLOTS.map((slot) => {
                  const plate = meals[ymd]?.[slot.id];
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      className={`table-cell${plate ? ' has-plate' : ''}`}
                      onClick={() => openSlot(ymd, slot)}
                    >
                      <span className="table-cell-slot">{slot.label}</span>
                      {plate ? (
                        <>
                          <strong>{plate.title}</strong>
                          <RecipeLabels labels={(plate.labels || []).filter((name) => name !== 'Easy').slice(0, 2)} />
                          {macrosLabel(plate.kcal, plate.protein) ? <em>{macrosLabel(plate.kcal, plate.protein)}</em> : null}
                        </>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {tab === 'list' && (
          <section className="table-list">
            <div className="table-list-head">
              <h2>{grocery.length ? `${left} to buy` : 'Grocery'}</h2>
              <button type="button" className="vital-text-btn" onClick={copyList} disabled={!left}>
                {copied ? 'Copied' : 'Copy list'}
              </button>
            </div>
            <form className="table-extra" onSubmit={addExtra}>
              <label htmlFor="table-extra" className="vital-sr">Add to the list</label>
              <input
                id="table-extra"
                className="vital-input"
                value={extraName}
                onChange={(e) => setExtraName(e.target.value)}
                placeholder="1 gal milk, 2 lb bananas…"
                maxLength={80}
              />
              <button className="vital-btn" type="submit" disabled={!extraName.trim()}>Add</button>
            </form>
            {grouped.map((group) => (
              <div key={group.aisle} className={`table-aisle aisle-${group.aisle.split(' ')[0].toLowerCase()}`}>
                <p className="vital-kicker">{group.aisle}<span>{group.items.filter((row) => !row.done).length} left</span></p>
                <ul>
                  {group.items.map((row) => {
                    const parts = shopParts(row);
                    return (
                    <li key={row.key}>
                      <label className={row.done ? 'is-done' : ''}>
                        <input type="checkbox" checked={Boolean(row.done)} onChange={() => toggleItem(row.key)} />
                        <b className="table-qty">{parts.amount}</b>
                        <span>
                          <strong>{parts.item}</strong>
                          {row.from?.length ? <em>{row.from.join(' · ')}</em> : row.extra ? <em>Added</em> : null}
                        </span>
                      </label>
                    </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </section>
        )}
      </main>

      {picker && (
        <div
          className="vital-overlay"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) setPicker(null);
          }}
        >
          <div className="vital-sheet table-pick">
            <button type="button" className="vital-sheet-close" onClick={() => setPicker(null)} aria-label="Close">×</button>
            <h2>{dayLabel(picker.ymd)} · {picker.label}</h2>
            {adding ? (
              <form className="table-pick-add" onSubmit={saveRecipe}>
                <p>Numbers are for the whole pot if plates is more than 1.</p>
                <label htmlFor="table-recipe-name">Recipe name</label>
                <input
                  id="table-recipe-name"
                  className="vital-input"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="Turkey chili"
                  maxLength={120}
                  required
                />
                <label htmlFor="table-recipe-ings">Ingredients</label>
                <textarea
                  id="table-recipe-ings"
                  className="vital-input"
                  rows={3}
                  value={draft.ingredients}
                  onChange={(e) => setDraft({ ...draft, ingredients: e.target.value })}
                  placeholder="Ground turkey, beans, chili powder"
                  required
                />
                <label htmlFor="table-recipe-url">Recipe link</label>
                <input
                  id="table-recipe-url"
                  className="vital-input"
                  type="text"
                  inputMode="url"
                  value={draft.url}
                  onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                  placeholder="https://"
                />
                <span>Labels</span>
                <div className="table-label-picks" role="group" aria-label="Recipe labels">
                  {TABLE_LABELS.map((row) => {
                    const on = (draft.labels || []).includes(row.id);
                    return (
                      <button
                        key={row.id}
                        type="button"
                        className={`table-label-btn${on ? ' is-on' : ''}`}
                        onClick={() => {
                          setDraft((prev) => ({
                            ...prev,
                            labels: on
                              ? prev.labels.filter((id) => id !== row.id)
                              : [...(prev.labels || []), row.id],
                          }));
                        }}
                      >
                        {row.label}
                      </button>
                    );
                  })}
                </div>
                <label htmlFor="table-recipe-notes">How you cook it</label>
                <textarea
                  id="table-recipe-notes"
                  className="vital-input"
                  rows={2}
                  value={draft.notes}
                  onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                  maxLength={400}
                />
                <div className="table-pick-nums">
                  <div>
                    <label htmlFor="table-recipe-servings">Plates</label>
                    <input
                      id="table-recipe-servings"
                      className="vital-input"
                      type="number"
                      min="1"
                      max="24"
                      value={draft.servings}
                      onChange={(e) => setDraft({ ...draft, servings: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="table-recipe-kcal">Calories</label>
                    <input
                      id="table-recipe-kcal"
                      className="vital-input"
                      type="number"
                      min="0"
                      value={draft.calories}
                      onChange={(e) => setDraft({ ...draft, calories: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="table-recipe-p">Protein</label>
                    <input
                      id="table-recipe-p"
                      className="vital-input"
                      type="number"
                      min="0"
                      step="0.1"
                      value={draft.protein_g}
                      onChange={(e) => setDraft({ ...draft, protein_g: e.target.value })}
                      required
                    />
                  </div>
                </div>
                {pickError ? <p className="vital-err">{pickError}</p> : null}
                <div className="table-pick-add-actions">
                  <button className="vital-btn" type="submit" disabled={savingRecipe}>
                    {savingRecipe ? 'Saving…' : 'Save and add'}
                  </button>
                  <button type="button" className="vital-text-btn" onClick={() => { setAdding(false); setPickError(''); }}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                {current ? (
                  <div className="table-pick-now">
                    <strong>{current.title}</strong>
                    {macrosLabel(current.kcal, current.protein) ? <p>{macrosLabel(current.kcal, current.protein)}</p> : null}
                    {current.ingredients?.length ? <p>{current.ingredients.join(' · ')}</p> : null}
                    <RecipeLabels labels={current.labels} />
                    {current.notes ? <p>{current.notes}</p> : null}
                    <RecipeLink plate={current} />
                  </div>
                ) : null}
                <label htmlFor="table-pick-search" className="vital-sr">Search recipes</label>
                <input
                  id="table-pick-search"
                  className="vital-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  autoComplete="off"
                />
                <div className="table-label-picks" role="group" aria-label="Filter recipes">
                  {TABLE_LABELS.map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      className={`table-label-btn${label === row.id ? ' is-on' : ''}`}
                      onClick={() => setLabel((prev) => (prev === row.id ? '' : row.id))}
                    >
                      {row.label}
                    </button>
                  ))}
                </div>
                <div className="table-pick-add-actions">
                  <button
                    type="button"
                    className="vital-text-btn"
                    onClick={() => {
                      setAdding(true);
                      setDraft(emptyRecipe(query.trim()));
                      setPickError('');
                    }}
                  >
                    Add recipe
                  </button>
                  {current ? (
                    <button
                      type="button"
                      className="vital-text-btn"
                      onClick={() => {
                        setPlate(picker.ymd, picker.slot, null);
                        setPicker(null);
                      }}
                    >
                      Clear slot
                    </button>
                  ) : null}
                </div>
                <div className="table-pick-hits">
                  {hits.map((hit) => (
                    <div key={`${hit.id}-${hit.title}`} className="table-pick-hit">
                      <button
                        type="button"
                        onClick={() => {
                          setPlate(picker.ymd, picker.slot, plateSnapshot(hit));
                          setPicker(null);
                          playPop?.();
                        }}
                      >
                        <strong>{hit.title}</strong>
                        <RecipeLabels labels={hit.labels} />
                        {macrosLabel(hit.kcal, hit.protein) ? <em>{macrosLabel(hit.kcal, hit.protein)}</em> : null}
                      </button>
                      {safeHttpUrl(hit.recipeUrl) ? (
                        <a href={safeHttpUrl(hit.recipeUrl)} target="_blank" rel="noopener noreferrer">
                          {hit.recipeSource || 'Recipe'}
                        </a>
                      ) : (
                        <span>{hit.saved ? 'Yours' : 'Recipe'}</span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
