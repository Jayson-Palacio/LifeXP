'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BrandLogo from './BrandLogo';
import { QUICK_FOODS } from '../lib/foods';
import {
  ACTIVITY_LEVELS,
  cmToIn,
  formatWeight,
  kgToLb,
  localDateISO,
  sumMacros,
  tdeeKcal,
} from '../lib/nutrition';
import { deleteVitalFood, logVitalFood, logVitalWeight, saveVitalPlan } from '../app/actions/vital';
import { playClick, playPop } from '../lib/sounds';

const MEALS = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snack' },
];

function CalorieRing({ eaten, target }) {
  const pct = target > 0 ? Math.min(100, (eaten / target) * 100) : 0;
  const remaining = Math.round(target - eaten);
  const over = remaining < 0;
  return (
    <div
      className="vital-ring"
      style={{ background: `conic-gradient(${over ? 'var(--red)' : 'var(--cyan)'} ${pct}%, rgba(255,255,255,0.08) 0)` }}
    >
      <div className="vital-ring-inner">
        <div className="vital-ring-value">{over ? `+${Math.abs(remaining)}` : remaining}</div>
        <div className="vital-ring-label">{over ? 'kcal over' : 'kcal left'}</div>
      </div>
    </div>
  );
}

function MacroBar({ label, value, target, color }) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  return (
    <div className="vital-macro">
      <div className="vital-macro-row">
        <span>{label}</span>
        <span>{Math.round(value)} / {target}g</span>
      </div>
      <div className="vital-macro-track">
        <div className="vital-macro-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function emptyPlan(profile, goals) {
  const units = profile?.units === 'metric' ? 'metric' : 'us';
  return {
    units,
    sex: profile?.sex || 'male',
    birth_year: profile?.birth_year || 1990,
    height: profile
      ? (units === 'metric' ? Number(profile.height_cm) : Math.round(cmToIn(profile.height_cm) * 10) / 10)
      : (units === 'metric' ? 175 : 70),
    current_weight: goals
      ? (units === 'metric' ? Number(goals.current_weight_kg) : Math.round(kgToLb(goals.current_weight_kg) * 10) / 10)
      : (units === 'metric' ? 80 : 180),
    target_weight: goals
      ? (units === 'metric' ? Number(goals.target_weight_kg) : Math.round(kgToLb(goals.target_weight_kg) * 10) / 10)
      : (units === 'metric' ? 73 : 160),
    weekly_loss: goals
      ? (units === 'metric' ? Number(goals.weekly_loss_kg) : Math.round(kgToLb(goals.weekly_loss_kg) * 10) / 10)
      : (units === 'metric' ? 0.45 : 1),
    activity_level: profile?.activity_level || 'moderate',
  };
}

export default function VitalDashboardClient({ profile, goals, foods, weighIns, tableMissing }) {
  const router = useRouter();
  const today = localDateISO();
  const setupDone = Boolean(profile && goals) && !tableMissing;
  const [tab, setTab] = useState(setupDone ? 'today' : 'plan');
  const [plan, setPlan] = useState(() => emptyPlan(profile, goals));
  const [planError, setPlanError] = useState('');
  const [planBusy, setPlanBusy] = useState(false);
  const [meal, setMeal] = useState('breakfast');
  const [food, setFood] = useState({ name: '', calories: '', protein_g: '', carbs_g: '', fat_g: '' });
  const [foodError, setFoodError] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [weightError, setWeightError] = useState('');

  const todaysFoods = useMemo(() => foods.filter((row) => row.logged_on === today), [foods, today]);
  const eaten = useMemo(() => sumMacros(todaysFoods), [todaysFoods]);
  const units = profile?.units || plan.units;

  const weightProgress = useMemo(() => {
    if (!goals) return 0;
    const start = Number(goals.start_weight_kg);
    const current = Number(goals.current_weight_kg);
    const target = Number(goals.target_weight_kg);
    const span = start - target;
    if (Math.abs(span) < 0.05) return 100;
    return Math.max(0, Math.min(100, ((start - current) / span) * 100));
  }, [goals]);

  const handlePlanSave = async (event) => {
    event.preventDefault();
    setPlanBusy(true);
    setPlanError('');
    const result = await saveVitalPlan(plan);
    setPlanBusy(false);
    if (!result.success) {
      setPlanError(result.error);
      return;
    }
    if (playPop) playPop();
    router.refresh();
    setTab('today');
  };

  const handleFood = async (event) => {
    event.preventDefault();
    setFoodError('');
    const result = await logVitalFood({ ...food, meal, logged_on: today });
    if (!result.success) {
      setFoodError(result.error);
      return;
    }
    if (playPop) playPop();
    setFood({ name: '', calories: '', protein_g: '', carbs_g: '', fat_g: '' });
    router.refresh();
  };

  const quickAdd = async (item) => {
    if (playClick) playClick();
    const result = await logVitalFood({ ...item, logged_on: today });
    if (!result.success) setFoodError(result.error);
    else router.refresh();
  };

  const handleWeight = async (event) => {
    event.preventDefault();
    setWeightError('');
    const result = await logVitalWeight({ weight: weightInput, logged_on: today });
    if (!result.success) {
      setWeightError(result.error);
      return;
    }
    if (playPop) playPop();
    setWeightInput('');
    router.refresh();
  };

  return (
    <div className="app-shell" style={{ position: 'relative' }}>
      <div className="kaeluma-bg" style={{ opacity: 0.12, position: 'fixed', zIndex: 0 }} />
      <div className="app-shell-content" style={{ position: 'relative', zIndex: 1, paddingBottom: 96 }}>
        <div className="page" style={{ paddingTop: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div>
              <BrandLogo href="/apps" size="sm" />
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--cyan)', marginTop: 8 }}>Vital</div>
            </div>
            <button className="cool-home-btn" onClick={() => router.push('/apps')}>
              <span>🏠</span> <span>Apps</span>
            </button>
          </div>

          {tableMissing && (
            <div className="card" style={{ padding: 20, marginBottom: 20, borderColor: 'var(--amber)' }}>
              <strong>One setup step left.</strong>
              <p style={{ color: 'var(--text-muted)', margin: '8px 0 0' }}>
                Run <code>vital_schema.sql</code> in the Supabase SQL editor so Vital can save your food, weight, and goals.
              </p>
            </div>
          )}

          {tab === 'today' && setupDone && (
            <>
              <div className="vital-hero">
                <CalorieRing eaten={eaten.calories} target={goals.calorie_target} />
                <div>
                  <h1 className="page-title" style={{ marginBottom: 6 }}>Today</h1>
                  <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                    {Math.round(eaten.calories)} / {goals.calorie_target} kcal
                    {profile ? ` · burn ~${tdeeKcal(profile, Number(goals.current_weight_kg))}` : ''}
                  </p>
                  <div className="vital-macros">
                    <MacroBar label="Protein" value={eaten.protein} target={goals.protein_target_g} color="var(--green)" />
                    <MacroBar label="Carbs" value={eaten.carbs} target={goals.carbs_target_g} color="var(--amber)" />
                    <MacroBar label="Fat" value={eaten.fat} target={goals.fat_target_g} color="var(--purple)" />
                  </div>
                </div>
              </div>

              <form onSubmit={handleFood} className="card vital-log-card">
                <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem' }}>Log a meal</h2>
                <div className="vital-meal-row">
                  {MEALS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`btn ${meal === item.id ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      onClick={() => setMeal(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="input-group">
                  <label htmlFor="food_name">What did you eat?</label>
                  <input className="input" id="food_name" value={food.name} onChange={(e) => setFood({ ...food, name: e.target.value })} required />
                </div>
                <div className="vital-macro-inputs">
                  {[['calories', 'kcal'], ['protein_g', 'P'], ['carbs_g', 'C'], ['fat_g', 'F']].map(([key, label]) => (
                    <div className="input-group" key={key}>
                      <label htmlFor={key}>{label}</label>
                      <input className="input" id={key} type="number" min="0" step="0.1" value={food[key]} onChange={(e) => setFood({ ...food, [key]: e.target.value })} required={key === 'calories'} />
                    </div>
                  ))}
                </div>
                {foodError && <p style={{ color: 'var(--red)', fontSize: '0.9rem' }}>{foodError}</p>}
                <button type="submit" className="btn btn-primary btn-block">Add to today</button>
              </form>

              <div style={{ margin: '20px 0 10px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Quick add</div>
              <div className="vital-quick-row">
                {QUICK_FOODS.map((item) => (
                  <button key={item.name} type="button" className="btn btn-ghost vital-chip" onClick={() => quickAdd(item)}>
                    {item.name}
                    <span>{item.calories}</span>
                  </button>
                ))}
              </div>

              <h2 style={{ margin: '28px 0 12px', fontSize: '1.1rem' }}>Logged today</h2>
              {todaysFoods.length === 0 && (
                <p style={{ color: 'var(--text-muted)' }}>Nothing yet. Log breakfast and the ring starts moving.</p>
              )}
              {MEALS.map((group) => {
                const rows = todaysFoods.filter((row) => row.meal === group.id);
                if (!rows.length) return null;
                return (
                  <div key={group.id} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>{group.label}</div>
                    {rows.map((row) => (
                      <div key={row.id} className="vital-food-row">
                        <div>
                          <div style={{ fontWeight: 700 }}>{row.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {row.calories} kcal · P {Number(row.protein_g)} · C {Number(row.carbs_g)} · F {Number(row.fat_g)}
                          </div>
                        </div>
                        <button
                          className="btn btn-ghost"
                          style={{ color: 'var(--red)', padding: '6px 10px' }}
                          onClick={async () => {
                            await deleteVitalFood(row.id);
                            router.refresh();
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </>
          )}

          {tab === 'weight' && setupDone && (
            <>
              <h1 className="page-title">Weight</h1>
              <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                  <div>
                    <div className="vital-stat-label">Now</div>
                    <div className="vital-stat-value">{formatWeight(goals.current_weight_kg, units)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="vital-stat-label">Goal</div>
                    <div className="vital-stat-value">{formatWeight(goals.target_weight_kg, units)}</div>
                  </div>
                </div>
                <div className="vital-macro-track" style={{ height: 10 }}>
                  <div className="vital-macro-fill" style={{ width: `${weightProgress}%`, background: 'var(--cyan)' }} />
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '10px 0 0' }}>
                  {Math.round(weightProgress)}% of the way from {formatWeight(goals.start_weight_kg, units)} toward your goal.
                </p>
              </div>

              <form onSubmit={handleWeight} className="card" style={{ padding: 20, marginBottom: 20 }}>
                <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem' }}>Log today&apos;s weigh-in</h2>
                <div className="input-group">
                  <label htmlFor="weigh_in">Weight ({units === 'metric' ? 'kg' : 'lb'})</label>
                  <input className="input" id="weigh_in" type="number" min="0" step="0.1" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} required />
                </div>
                {weightError && <p style={{ color: 'var(--red)' }}>{weightError}</p>}
                <button type="submit" className="btn btn-primary btn-block">Save weigh-in</button>
              </form>

              <h2 style={{ fontSize: '1.1rem' }}>Recent</h2>
              {weighIns.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No weigh-ins yet.</p>}
              <div className="vital-weight-list">
                {[...weighIns].reverse().map((row) => (
                  <div key={row.id} className="vital-food-row">
                    <span>{row.logged_on}</span>
                    <strong>{formatWeight(row.weight_kg, units)}</strong>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'plan' && (
            <form onSubmit={handlePlanSave} className="card" style={{ padding: 20 }}>
              <h1 className="page-title">{setupDone ? 'Your plan' : 'Set your first goal'}</h1>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.55 }}>
                Tell Vital where you are and where you want to go. We&apos;ll estimate calories and macros from your stats — you can tighten them anytime.
              </p>

              <div className="vital-meal-row" style={{ marginBottom: 16 }}>
                {['us', 'metric'].map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={`btn ${plan.units === id ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setPlan((prev) => ({ ...prev, units: id }))}
                  >
                    {id === 'us' ? 'lb / in' : 'kg / cm'}
                  </button>
                ))}
              </div>

              <div className="vital-plan-grid">
                <div className="input-group">
                  <label htmlFor="sex">Sex</label>
                  <select className="input" id="sex" value={plan.sex} onChange={(e) => setPlan({ ...plan, sex: e.target.value })}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="input-group">
                  <label htmlFor="birth_year">Birth year</label>
                  <input className="input" id="birth_year" type="number" value={plan.birth_year} onChange={(e) => setPlan({ ...plan, birth_year: e.target.value })} required />
                </div>
              </div>

              <div className="vital-plan-grid">
                <div className="input-group">
                  <label htmlFor="height">Height ({plan.units === 'metric' ? 'cm' : 'in'})</label>
                  <input className="input" id="height" type="number" min="0" step="0.1" value={plan.height} onChange={(e) => setPlan({ ...plan, height: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label htmlFor="activity_level">Activity</label>
                  <select className="input" id="activity_level" value={plan.activity_level} onChange={(e) => setPlan({ ...plan, activity_level: e.target.value })}>
                    {ACTIVITY_LEVELS.map((level) => (
                      <option key={level.id} value={level.id}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="vital-plan-grid">
                <div className="input-group">
                  <label htmlFor="current_weight">Current weight ({plan.units === 'metric' ? 'kg' : 'lb'})</label>
                  <input className="input" id="current_weight" type="number" min="0" step="0.1" value={plan.current_weight} onChange={(e) => setPlan({ ...plan, current_weight: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label htmlFor="target_weight">Goal weight ({plan.units === 'metric' ? 'kg' : 'lb'})</label>
                  <input className="input" id="target_weight" type="number" min="0" step="0.1" value={plan.target_weight} onChange={(e) => setPlan({ ...plan, target_weight: e.target.value })} required />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="weekly_loss">Weekly change ({plan.units === 'metric' ? 'kg' : 'lb'})</label>
                <input className="input" id="weekly_loss" type="number" min="0" step="0.05" value={plan.weekly_loss} onChange={(e) => setPlan({ ...plan, weekly_loss: e.target.value })} required />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>
                  0.5–1 lb per week is a sustainable fat-loss pace. Set 0 to eat at maintenance.
                </p>
              </div>

              {planError && <p style={{ color: 'var(--red)' }}>{planError}</p>}
              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={planBusy}>
                {planBusy ? 'Saving…' : setupDone ? 'Update my plan' : 'Start tracking'}
              </button>
            </form>
          )}
        </div>
      </div>

      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {[
            { id: 'today', label: 'Today', icon: '🔥' },
            { id: 'weight', label: 'Weight', icon: '⚖️' },
            { id: 'plan', label: 'Plan', icon: '🎯' },
          ].map((item) => (
            <button
              key={item.id}
              className={`nav-tab ${tab === item.id ? 'active' : ''}`}
              onClick={() => {
                if (!setupDone && item.id !== 'plan') return;
                if (playClick) playClick();
                setTab(item.id);
              }}
            >
              <div className="nav-tab-icon-wrapper">
                <span className="nav-tab-icon">{item.icon}</span>
              </div>
              <span className="nav-tab-label">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
