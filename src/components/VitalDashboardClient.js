'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BrandLogo from './BrandLogo';
import VitalChart from './VitalChart';
import VitalScanner from './VitalScanner';
import { searchKitchen } from '../lib/foods';
import {
  ACTIVITY_LEVELS,
  ageFromBirthYear,
  cmToIn,
  defaultMeal,
  formatWeight,
  inferIntent,
  kgToLb,
  lbToKg,
  localDateISO,
  suggestedWeeklyChangeKg,
  sumMacros,
} from '../lib/nutrition';
import { familyWeek, memberInsights } from '../lib/vitalAnalytics';
import { coachNote, familyStatusLine } from '../lib/vitalCoach';
import {
  copyYesterdayMeals,
  deleteVitalFood,
  deleteVitalKitchenItem,
  logVitalFood,
  logVitalWeight,
  saveVitalKitchenItem,
  saveVitalMember,
  saveVitalPlan,
} from '../app/actions/vital';

const MEALS = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snack' },
];

const TABS = [
  { id: 'today', label: 'Today' },
  { id: 'insights', label: 'Insights' },
  { id: 'plan', label: 'Plan' },
];

function DayMeter({ eaten, target, mealCount, child }) {
  const hasTarget = Boolean(target);
  const pct = hasTarget
    ? Math.min(110, (eaten / target) * 100)
    : Math.min(100, (mealCount / 4) * 100);
  const over = hasTarget && eaten > target + 40;
  return (
    <div className="vital-meter" aria-hidden="true">
      <div
        className={`vital-meter-fill${over ? ' is-over' : ''}`}
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </div>
  );
}

function emptyPerson() {
  return { display_name: '', kind: 'adult', age: '', units: 'us' };
}

function planForm(member, plan) {
  const units = member?.units === 'metric' ? 'metric' : 'us';
  const age = ageFromBirthYear(member?.birth_year) || '';
  const height = member?.height_cm
    ? (units === 'metric' ? Number(member.height_cm) : Math.round(cmToIn(member.height_cm) * 10) / 10)
    : '';
  const current = plan?.current_weight_kg
    ? (units === 'metric' ? Number(plan.current_weight_kg) : Math.round(kgToLb(plan.current_weight_kg) * 10) / 10)
    : '';
  const target = plan?.target_weight_kg
    ? (units === 'metric' ? Number(plan.target_weight_kg) : Math.round(kgToLb(plan.target_weight_kg) * 10) / 10)
    : '';
  return {
    units,
    sex: member?.sex || '',
    age,
    height,
    current_weight: current,
    target_weight: target,
    activity_level: member?.activity_level || 'moderate',
    intent: plan?.intent || (member?.kind === 'child' ? 'grow' : 'maintain'),
  };
}

export default function VitalDashboardClient({
  members,
  plans,
  foods,
  weighIns,
  kitchen = [],
  suggestedKids,
  tableMissing,
  kitchenMissing,
}) {
  const router = useRouter();
  const today = localDateISO();
  const [memberId, setMemberId] = useState(members[0]?.id || '');
  const [tab, setTab] = useState('today');
  const [showPerson, setShowPerson] = useState(false);
  const [person, setPerson] = useState(() => emptyPerson());
  const [personError, setPersonError] = useState('');
  const [personBusy, setPersonBusy] = useState(false);
  const [query, setQuery] = useState('');
  const [meal, setMeal] = useState(defaultMeal);
  const [foodError, setFoodError] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [weightError, setWeightError] = useState('');
  const [planError, setPlanError] = useState('');
  const [planBusy, setPlanBusy] = useState(false);
  const [plan, setPlan] = useState(() => planForm(members[0], plans.find((row) => row.member_id === members[0]?.id)));
  const [showScan, setShowScan] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [custom, setCustom] = useState({ name: '', calories: '', protein_g: '', carbs_g: '', fat_g: '' });
  const [copyError, setCopyError] = useState('');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('vital-member');
      if (saved && members.some((row) => row.id === saved)) setMemberId(saved);
      else if (members[0]) setMemberId(members[0].id);
    } catch {
      if (members[0]) setMemberId(members[0].id);
    }
  }, [members]);

  useEffect(() => {
    const member = members.find((row) => row.id === memberId);
    const memberPlan = plans.find((row) => row.member_id === memberId);
    setPlan(planForm(member, memberPlan));
  }, [memberId, members, plans]);

  const member = members.find((row) => row.id === memberId) || null;
  const memberPlan = plans.find((row) => row.member_id === memberId) || null;
  const memberFoods = useMemo(
    () => foods.filter((row) => row.member_id === memberId),
    [foods, memberId]
  );
  const todaysFoods = useMemo(
    () => memberFoods.filter((row) => row.logged_on === today),
    [memberFoods, today]
  );
  const eaten = useMemo(() => sumMacros(todaysFoods), [todaysFoods]);
  const memberWeights = useMemo(
    () => weighIns.filter((row) => row.member_id === memberId),
    [weighIns, memberId]
  );
  const age = ageFromBirthYear(member?.birth_year);
  const child = member?.kind === 'child' || (age != null && age < 18);
  const units = member?.units || 'us';

  const recents = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const row of memberFoods) {
      const key = row.name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      list.push(row);
      if (list.length >= 6) break;
    }
    return list;
  }, [memberFoods]);

  const matches = searchKitchen(query, kitchen);
  const kitchenTop = useMemo(
    () => [...kitchen].sort((a, b) => (b.times_logged || 0) - (a.times_logged || 0)).slice(0, 10),
    [kitchen]
  );
  const insights = useMemo(
    () => memberInsights({ plan: memberPlan, foods: memberFoods, weighIns: memberWeights, today, units }),
    [memberPlan, memberFoods, memberWeights, today, units]
  );
  const houseWeek = useMemo(
    () => familyWeek({ members, plans, foods, today }),
    [members, plans, foods, today]
  );
  const coach = coachNote({
    member,
    plan: memberPlan,
    eaten,
    mealCount: todaysFoods.length,
    recentWeights: memberWeights.slice(-7),
  });

  const familyCards = members.map((personRow) => {
    const dayFoods = foods.filter((row) => row.member_id === personRow.id && row.logged_on === today);
    const dayPlan = plans.find((row) => row.member_id === personRow.id);
    const dayAge = ageFromBirthYear(personRow.birth_year);
    return {
      person: personRow,
      line: familyStatusLine({
        plan: dayPlan,
        eaten: sumMacros(dayFoods),
        mealCount: dayFoods.length,
        child: personRow.kind === 'child' || (dayAge != null && dayAge < 18),
      }),
    };
  });

  const selectMember = (id) => {
    setMemberId(id);
    setTab('today');
    try { window.localStorage.setItem('vital-member', id); } catch { /* ignore */ }
  };

  const addPerson = async (event) => {
    event.preventDefault();
    setPersonBusy(true);
    setPersonError('');
    const result = await saveVitalMember(person);
    setPersonBusy(false);
    if (!result.success) {
      setPersonError(result.error);
      return;
    }
    setShowPerson(false);
    setPerson(emptyPerson());
    if (result.data?.id) {
      try { window.localStorage.setItem('vital-member', result.data.id); } catch { /* ignore */ }
    }
    router.refresh();
  };

  const addSuggested = async (name) => {
    const result = await saveVitalMember({ display_name: name, kind: 'child', units: 'us' });
    if (result.success && result.data?.id) {
      try { window.localStorage.setItem('vital-member', result.data.id); } catch { /* ignore */ }
    }
    router.refresh();
  };

  const addFood = async (item, extras = {}) => {
    if (!member) return;
    setFoodError('');
    const result = await logVitalFood({
      member_id: member.id,
      name: item.name,
      calories: item.calories,
      protein_g: item.protein_g,
      carbs_g: item.carbs_g,
      fat_g: item.fat_g,
      meal: extras.meal || item.meal || meal,
      logged_on: today,
    });
    if (!result.success) {
      setFoodError(result.error);
      return;
    }
    setQuery('');
    setShowCustom(false);
    setCustom({ name: '', calories: '', protein_g: '', carbs_g: '', fat_g: '' });
    router.refresh();
  };

  const handleCustomFood = async (event) => {
    event.preventDefault();
    const item = query.trim() && !showCustom
      ? { name: query, meal }
      : { ...custom, name: custom.name || query, meal };
    await addFood(item);
  };

  const handleSaveCustom = async (event) => {
    event.preventDefault();
    const payload = { ...custom, name: custom.name || query, meal };
    const saved = await saveVitalKitchenItem(payload);
    if (!saved.success) {
      setFoodError(saved.error);
      return;
    }
    await addFood(payload);
  };

  const handleScanFound = async (item) => {
    setShowScan(false);
    await addFood({ ...item, meal });
  };

  const handleCopyYesterday = async () => {
    setCopyError('');
    const result = await copyYesterdayMeals(member.id);
    if (!result.success) setCopyError(result.error);
    else router.refresh();
  };

  const handleWeight = async (event) => {
    event.preventDefault();
    setWeightError('');
    const result = await logVitalWeight({ member_id: member.id, weight: weightInput, logged_on: today });
    if (!result.success) {
      setWeightError(result.error);
      return;
    }
    setWeightInput('');
    router.refresh();
  };

  const handlePlan = async (event) => {
    event.preventDefault();
    setPlanBusy(true);
    setPlanError('');
    const result = await saveVitalPlan({
      member_id: member.id,
      ...plan,
    });
    setPlanBusy(false);
    if (!result.success) {
      setPlanError(result.error);
      return;
    }
    setTab('today');
    router.refresh();
  };

  const currentKg = plan.units === 'metric' ? Number(plan.current_weight) : lbToKg(Number(plan.current_weight) || 0);
  const targetKg = plan.units === 'metric' ? Number(plan.target_weight) : lbToKg(Number(plan.target_weight) || 0);
  const previewIntent = inferIntent({
    kind: member?.kind,
    currentKg,
    targetKg,
    age: Number(plan.age) || age,
  });
  const weeklyHint = suggestedWeeklyChangeKg(
    currentKg || 70,
    targetKg || currentKg || 70,
    plan.intent || previewIntent
  );

  return (
    <div className="vital-app">
      <header className="vital-top">
        <div className="vital-top-brand">
          <BrandLogo href="/apps" size="sm" tone="ink" />
          <span>Vital</span>
        </div>
        <button type="button" className="vital-text-btn" onClick={() => router.push('/apps')}>
          Apps
        </button>
      </header>

      <main className="vital-main">
        {tableMissing && (
          <div className="vital-card vital-warn">
            <strong>One setup step left.</strong>
            <p>Run <code>vital_schema.sql</code> in the Supabase SQL editor so the household can save meals and plans.</p>
          </div>
        )}
        {kitchenMissing && (
          <div className="vital-card vital-warn">
            <strong>Kitchen is not saved yet.</strong>
            <p>Run the latest <code>vital_schema.sql</code> so custom foods, barcodes, and your kitchen list persist.</p>
          </div>
        )}

        <div className="vital-people">
          {members.map((row) => (
            <button
              key={row.id}
              type="button"
              className={`vital-person${row.id === memberId ? ' is-active' : ''}`}
              onClick={() => selectMember(row.id)}
            >
              <span className="vital-avatar" style={{ background: row.accent }}>{row.display_name.slice(0, 1)}</span>
              {row.display_name}
            </button>
          ))}
          <button
            type="button"
            className="vital-person vital-person-add"
            onClick={() => { setPerson(emptyPerson()); setShowPerson(true); }}
          >
            Add
          </button>
        </div>

        {!members.length && (
          <section className="vital-empty">
            <h1>Who is at the table?</h1>
            <p>Add each person once. Logging a meal is a tap after that — no calorie math required up front.</p>
            {suggestedKids.length > 0 && (
              <div className="vital-suggest">
                <p>From Quests</p>
                {suggestedKids.map((kid) => (
                  <button key={kid.id} type="button" className="vital-chip" onClick={() => addSuggested(kid.name)}>
                    Add {kid.name}
                  </button>
                ))}
              </div>
            )}
            <button type="button" className="vital-btn" onClick={() => { setPerson(emptyPerson()); setShowPerson(true); }}>
              Add someone
            </button>
          </section>
        )}

        {member && (
          <>
            <section className="vital-coach">
              <p className="vital-kicker">{coach.kicker}</p>
              <h1>{coach.title}</h1>
              <p>{coach.body}</p>
              <DayMeter
                eaten={eaten.calories}
                target={memberPlan?.calorie_target}
                mealCount={todaysFoods.length}
                child={child}
              />
              {memberPlan?.calorie_target ? (
                <div className="vital-stats">
                  <div>
                    <span>Today</span>
                    <strong>{Math.round(eaten.calories)}</strong>
                    <em>/ {memberPlan.calorie_target} kcal</em>
                  </div>
                  {memberPlan.protein_target_g != null && (
                    <div>
                      <span>Protein</span>
                      <strong>{Math.round(eaten.protein)}</strong>
                      <em>/ {memberPlan.protein_target_g}g</em>
                    </div>
                  )}
                </div>
              ) : (
                <div className="vital-stats">
                  <div>
                    <span>Logged</span>
                    <strong>{todaysFoods.length}</strong>
                    <em>{todaysFoods.length === 1 ? 'item' : 'items'}</em>
                  </div>
                  <div>
                    <span>Energy</span>
                    <strong>{Math.round(eaten.calories)}</strong>
                    <em>kcal</em>
                  </div>
                </div>
              )}
              <button type="button" className="vital-insights-peek" onClick={() => setTab('insights')}>
                <span>
                  <strong>
                    {insights.loggedDays
                      ? `${insights.onTarget} of ${insights.loggedDays} days on target`
                      : 'No meals logged this week'}
                  </strong>
                  <em>
                    {insights.currentLabel !== '—' ? insights.currentLabel : 'Add a weigh-in'}
                    {insights.lostLabel ? ` · ${insights.lostLabel}` : ''}
                    {insights.intakePace ? ` · ${insights.intakePace}` : ''}
                  </em>
                </span>
                <span>Insights</span>
              </button>
            </section>

            {members.length > 1 && tab === 'today' && (
              <div className="vital-house">
                {familyCards.map((card) => (
                  <button
                    key={card.person.id}
                    type="button"
                    className="vital-house-card"
                    onClick={() => selectMember(card.person.id)}
                  >
                    <span className="vital-avatar" style={{ background: card.person.accent }}>{card.person.display_name.slice(0, 1)}</span>
                    <span>
                      <strong>{card.person.display_name}</strong>
                      <em>{card.line}</em>
                    </span>
                  </button>
                ))}
              </div>
            )}

            <nav className="vital-tabs" aria-label="Vital">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={tab === item.id ? 'is-active' : ''}
                  onClick={() => setTab(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {tab === 'today' && (
              <section>
                <div className="vital-quickbar">
                  <button type="button" className="vital-btn vital-btn-quiet" onClick={() => setShowScan(true)}>
                    Scan
                  </button>
                  <button type="button" className="vital-btn vital-btn-quiet" onClick={handleCopyYesterday}>
                    Repeat yesterday
                  </button>
                  <button type="button" className="vital-btn vital-btn-quiet" onClick={() => { setShowCustom(true); setCustom((prev) => ({ ...prev, name: query })); }}>
                    New food
                  </button>
                </div>
                {copyError && <p className="vital-err">{copyError}</p>}

                <form onSubmit={showCustom ? handleSaveCustom : handleCustomFood} className="vital-log">
                  <div className="vital-meals">
                    {MEALS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={meal === item.id ? 'is-active' : ''}
                        onClick={() => setMeal(item.id)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <label htmlFor="vital-food">What did you eat?</label>
                  <input
                    id="vital-food"
                    className="vital-input"
                    value={showCustom ? custom.name : query}
                    onChange={(e) => {
                      if (showCustom) setCustom({ ...custom, name: e.target.value });
                      else setQuery(e.target.value);
                    }}
                    placeholder="Search your kitchen, or type a name"
                    autoComplete="off"
                  />
                  {showCustom && (
                    <div className="vital-grid">
                      <div>
                        <label htmlFor="custom_kcal">Calories</label>
                        <input id="custom_kcal" className="vital-input" type="number" min="0" value={custom.calories} onChange={(e) => setCustom({ ...custom, calories: e.target.value })} required />
                      </div>
                      <div>
                        <label htmlFor="custom_p">Protein</label>
                        <input id="custom_p" className="vital-input" type="number" min="0" step="0.1" value={custom.protein_g} onChange={(e) => setCustom({ ...custom, protein_g: e.target.value })} />
                      </div>
                      <div>
                        <label htmlFor="custom_c">Carbs</label>
                        <input id="custom_c" className="vital-input" type="number" min="0" step="0.1" value={custom.carbs_g} onChange={(e) => setCustom({ ...custom, carbs_g: e.target.value })} />
                      </div>
                      <div>
                        <label htmlFor="custom_f">Fat</label>
                        <input id="custom_f" className="vital-input" type="number" min="0" step="0.1" value={custom.fat_g} onChange={(e) => setCustom({ ...custom, fat_g: e.target.value })} />
                      </div>
                    </div>
                  )}
                  {!showCustom && matches.length > 0 && (
                    <div className="vital-matches">
                      {matches.map((item) => (
                        <button key={`${item.source || 'x'}-${item.id || item.name}`} type="button" onClick={() => addFood({ ...item, meal })}>
                          <span>
                            {item.name}
                            {item.source === 'kitchen' && <i>Kitchen</i>}
                          </span>
                          <em>{item.calories}</em>
                        </button>
                      ))}
                    </div>
                  )}
                  {foodError && <p className="vital-err">{foodError}</p>}
                  <button type="submit" className="vital-btn" disabled={showCustom ? !custom.calories : !query.trim()}>
                    {showCustom ? 'Save to kitchen and log' : 'Log it'}
                  </button>
                  {showCustom && (
                    <button type="button" className="vital-text-btn" onClick={() => setShowCustom(false)}>Cancel</button>
                  )}
                </form>

                {kitchenTop.length > 0 && (
                  <div className="vital-recents">
                    <p className="vital-kicker">Your kitchen</p>
                    <div className="vital-chips">
                      {kitchenTop.map((row) => (
                        <button key={row.id} type="button" className="vital-chip" onClick={() => addFood({ ...row, meal })}>
                          {row.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {recents.length > 0 && (
                  <div className="vital-recents">
                    <p className="vital-kicker">Again</p>
                    <div className="vital-chips">
                      {recents.map((row) => (
                        <button key={row.id} type="button" className="vital-chip" onClick={() => addFood(row)}>
                          {row.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="vital-day-log vital-card">
                  {todaysFoods.length === 0 && (
                    <p className="vital-muted">Nothing yet. Scan a package, tap your kitchen, or repeat yesterday.</p>
                  )}
                  {MEALS.map((group) => {
                    const rows = todaysFoods.filter((row) => row.meal === group.id);
                    if (!rows.length) return null;
                    return (
                      <div key={group.id}>
                        <p className="vital-kicker">{group.label}</p>
                        {rows.map((row) => (
                          <div key={row.id} className="vital-row">
                            <div>
                              <strong>{row.name}</strong>
                              <span>{row.calories} kcal</span>
                            </div>
                            <button
                              type="button"
                              className="vital-text-btn"
                              onClick={async () => {
                                await deleteVitalFood(row.id);
                                router.refresh();
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {tab === 'insights' && (
              <section className="vital-insights">
                <div className="vital-card vital-hero-card">
                  <p className="vital-kicker">Weight</p>
                  <p className="vital-number">{insights.currentLabel}</p>
                  <p className="vital-hero-sub">
                    {insights.lostLabel || 'Log a weigh-in to start the trend.'}
                    {insights.remainingLabel ? ` · ${insights.remainingLabel}` : ''}
                  </p>
                  {insights.etaLabel && <p className="vital-muted">{insights.etaLabel} at this pace.</p>}
                  {insights.weightPoints.length > 1 && (
                    <VitalChart
                      values={insights.weightPoints.map((kg) => (units === 'metric' ? kg : kgToLb(kg)))}
                      color="#5e5ce6"
                    />
                  )}
                  {insights.weekDeltaLabel && <p className="vital-muted">{insights.weekDeltaLabel}</p>}
                </div>

                <div className="vital-stat-grid">
                  <div className="vital-card">
                    <p className="vital-kicker">This week</p>
                    <p className="vital-number">{insights.onTarget}/{insights.loggedDays || 0}</p>
                    <p className="vital-muted">Days on target</p>
                  </div>
                  <div className="vital-card">
                    <p className="vital-kicker">Avg energy</p>
                    <p className="vital-number">{insights.avgKcal || '—'}</p>
                    <p className="vital-muted">{insights.target ? `Target ${insights.target}` : 'kcal / logged day'}</p>
                  </div>
                  <div className="vital-card">
                    <p className="vital-kicker">Protein</p>
                    <p className="vital-number">{insights.avgProtein || '—'}</p>
                    <p className="vital-muted">{insights.proteinTarget ? `Target ${insights.proteinTarget}g` : 'grams / logged day'}</p>
                  </div>
                </div>

                <div className="vital-card">
                  <p className="vital-kicker">Energy · 14 days</p>
                  <VitalChart values={insights.energyPoints} target={insights.target} color="#1d1d1f" />
                  <p className="vital-muted">
                    {insights.intakePace || 'Dashed line is the daily target. The week that wins is the average, not Tuesday.'}
                  </p>
                </div>

                {members.length > 1 && (
                  <div className="vital-card">
                    <p className="vital-kicker">Household this week</p>
                    {houseWeek.map((row) => (
                      <div key={row.person.id} className="vital-row">
                        <div>
                          <strong>{row.person.display_name}</strong>
                          <span>{row.logged} day{row.logged === 1 ? '' : 's'} logged</span>
                        </div>
                        <em>{row.todayCalories ? `${row.todayCalories} today` : '—'}</em>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleWeight} className="vital-card">
                  <label htmlFor="weigh_in">Today’s weigh-in ({units === 'metric' ? 'kg' : 'lb'})</label>
                  <input
                    id="weigh_in"
                    className="vital-input"
                    type="number"
                    min="0"
                    step="0.1"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    required
                  />
                  {weightError && <p className="vital-err">{weightError}</p>}
                  <button type="submit" className="vital-btn">Save weigh-in</button>
                </form>

                <div className="vital-card">
                  <p className="vital-kicker">Recent weigh-ins</p>
                  {memberWeights.length === 0 && <p className="vital-muted">No weigh-ins yet.</p>}
                  {[...memberWeights].reverse().slice(0, 10).map((row) => (
                    <div key={row.id} className="vital-row">
                      <span>{row.logged_on}</span>
                      <strong>{formatWeight(row.weight_kg, units)}</strong>
                    </div>
                  ))}
                </div>

                {kitchen.length > 0 && (
                  <div className="vital-card">
                    <p className="vital-kicker">Kitchen</p>
                    {kitchen.slice(0, 12).map((row) => (
                      <div key={row.id} className="vital-row">
                        <div>
                          <strong>{row.name}</strong>
                          <span>{row.calories} kcal · used {row.times_logged}×</span>
                        </div>
                        <button
                          type="button"
                          className="vital-text-btn"
                          onClick={async () => {
                            await deleteVitalKitchenItem(row.id);
                            router.refresh();
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {tab === 'plan' && (
              <form onSubmit={handlePlan} className="vital-plan">
                <p className="vital-muted">
                  {child
                    ? 'We estimate what a growing body typically needs. This is not a diet. A pediatrician should sign off before any calorie cut.'
                    : 'Targets use Mifflin–St Jeor (adults) with a protein-forward split. 0.5–1 lb a week is the pace that tends to stick.'}
                </p>

                <div className="vital-meals">
                  {['us', 'metric'].map((id) => (
                    <button key={id} type="button" className={plan.units === id ? 'is-active' : ''} onClick={() => setPlan((prev) => ({ ...prev, units: id }))}>
                      {id === 'us' ? 'lb / in' : 'kg / cm'}
                    </button>
                  ))}
                </div>

                <div className="vital-grid">
                  <div>
                    <label htmlFor="sex">Sex</label>
                    <select id="sex" className="vital-input" value={plan.sex} onChange={(e) => setPlan({ ...plan, sex: e.target.value })} required>
                      <option value="">Choose</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="age">Age</label>
                    <input id="age" className="vital-input" type="number" min="2" max="100" value={plan.age} onChange={(e) => setPlan({ ...plan, age: e.target.value })} required />
                  </div>
                  <div>
                    <label htmlFor="height">Height ({plan.units === 'metric' ? 'cm' : 'in'})</label>
                    <input id="height" className="vital-input" type="number" min="0" step="0.1" value={plan.height} onChange={(e) => setPlan({ ...plan, height: e.target.value })} required />
                  </div>
                  <div>
                    <label htmlFor="activity_level">Movement</label>
                    <select id="activity_level" className="vital-input" value={plan.activity_level} onChange={(e) => setPlan({ ...plan, activity_level: e.target.value })}>
                      {ACTIVITY_LEVELS.map((level) => (
                        <option key={level.id} value={level.id}>{level.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="current_weight">Weight now ({plan.units === 'metric' ? 'kg' : 'lb'})</label>
                    <input id="current_weight" className="vital-input" type="number" min="0" step="0.1" value={plan.current_weight} onChange={(e) => setPlan({ ...plan, current_weight: e.target.value })} required />
                  </div>
                  {!child && (
                    <div>
                      <label htmlFor="target_weight">Aim ({plan.units === 'metric' ? 'kg' : 'lb'})</label>
                      <input id="target_weight" className="vital-input" type="number" min="0" step="0.1" value={plan.target_weight} onChange={(e) => setPlan({ ...plan, target_weight: e.target.value })} />
                    </div>
                  )}
                </div>

                {!child && (
                  <div>
                    <p className="vital-kicker">Intent</p>
                    <div className="vital-meals">
                      {[
                        { id: 'lose', label: 'Lose' },
                        { id: 'maintain', label: 'Hold' },
                        { id: 'gain', label: 'Gain' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={plan.intent === item.id ? 'is-active' : ''}
                          onClick={() => setPlan((prev) => ({ ...prev, intent: item.id }))}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                    {(plan.intent === 'lose' || plan.intent === 'gain') && weeklyHint > 0 && (
                      <p className="vital-muted">We’ll pace about {plan.units === 'metric' ? `${weeklyHint} kg` : `${(weeklyHint * 2.2046).toFixed(1)} lb`} a week unless you tell us otherwise.</p>
                    )}
                  </div>
                )}

                {planError && <p className="vital-err">{planError}</p>}
                <button type="submit" className="vital-btn" disabled={planBusy}>
                  {planBusy ? 'Saving…' : memberPlan ? 'Update plan' : 'Set the plan'}
                </button>
              </form>
            )}
          </>
        )}
      </main>

      {showPerson && (
        <div className="vital-overlay" onPointerDown={(e) => { if (e.target === e.currentTarget) setShowPerson(false); }}>
          <form className="vital-sheet" onSubmit={addPerson}>
            <button type="button" className="vital-sheet-close" onClick={() => setShowPerson(false)} aria-label="Close">×</button>
            <h2>Add to the household</h2>
            <p>A name is enough to start logging. Age and a plan can wait.</p>
            <label htmlFor="display_name">Name</label>
            <input
              id="display_name"
              className="vital-input"
              value={person.display_name}
              onChange={(e) => setPerson({ ...person, display_name: e.target.value })}
              autoFocus
              required
            />
            <div className="vital-meals">
              {[
                { id: 'adult', label: 'Adult' },
                { id: 'child', label: 'Child' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={person.kind === item.id ? 'is-active' : ''}
                  onClick={() => setPerson({ ...person, kind: item.id })}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <label htmlFor="person_age">Age (optional)</label>
            <input
              id="person_age"
              className="vital-input"
              type="number"
              min="2"
              max="100"
              value={person.age}
              onChange={(e) => setPerson({ ...person, age: e.target.value })}
            />
            {personError && <p className="vital-err">{personError}</p>}
            <button type="submit" className="vital-btn" disabled={personBusy}>
              {personBusy ? 'Adding…' : 'Add'}
            </button>
          </form>
        </div>
      )}

      {showScan && (
        <VitalScanner
          onClose={() => setShowScan(false)}
          onFound={handleScanFound}
        />
      )}
    </div>
  );
}
