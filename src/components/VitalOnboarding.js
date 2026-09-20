'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ACTIVITY_LEVELS,
  PLAN_METHODS,
  cmToIn,
  defaultMethod,
  inToCm,
  kgToLb,
  lbToKg,
  previewPlanTargets,
} from '../lib/nutrition';
import { completeVitalOnboarding } from '../app/actions/vital';

const ADULT_INTENTS = [
  { id: 'lose', label: 'Lose', hint: 'A modest deficit. Protein first. Leftovers do not roll over.' },
  { id: 'maintain', label: 'Hold', hint: 'Eat around maintenance. Track, do not cut.' },
  { id: 'gain', label: 'Gain', hint: 'A small surplus. Strength work still matters more than extra snacks.' },
];

const PACE_US = [
  { id: '0.5', label: '0.5 lb', hint: 'Gentle' },
  { id: '1', label: '1 lb', hint: 'Steady' },
  { id: '1.5', label: '1.5 lb', hint: 'Brisk' },
];

const PACE_METRIC = [
  { id: '0.25', label: '0.25 kg', hint: 'Gentle' },
  { id: '0.5', label: '0.5 kg', hint: 'Steady' },
  { id: '0.75', label: '0.75 kg', hint: 'Brisk' },
];

const METHODS = PLAN_METHODS.filter((item) => item.id !== 'custom');

function inchesFromMember(member) {
  if (!member?.height_cm) return { ft: '', inch: '' };
  const total = cmToIn(member.height_cm);
  const ft = Math.floor((total + 0.01) / 12);
  const inch = Math.round((total - ft * 12) * 10) / 10;
  return { ft: String(ft), inch: String(inch) };
}

function draftFrom(member, plan, firstName) {
  const units = member?.units === 'metric' ? 'metric' : 'us';
  const age = member?.birth_year ? new Date().getFullYear() - member.birth_year : '';
  const height = inchesFromMember(member);
  const weight = plan?.current_weight_kg
    ? (units === 'metric'
      ? String(Math.round(plan.current_weight_kg * 10) / 10)
      : String(Math.round(kgToLb(plan.current_weight_kg) * 10) / 10))
    : '';
  const target = plan?.target_weight_kg
    ? (units === 'metric'
      ? String(Math.round(plan.target_weight_kg * 10) / 10)
      : String(Math.round(kgToLb(plan.target_weight_kg) * 10) / 10))
    : '';
  const kind = member?.kind === 'child' ? 'child' : 'adult';
  const intent = plan?.intent || (kind === 'child' ? 'grow' : 'lose');
  const weekly = plan?.weekly_change_kg
    ? (units === 'metric'
      ? String(plan.weekly_change_kg)
      : String(Math.round(kgToLb(plan.weekly_change_kg) * 10) / 10))
    : (intent === 'lose' ? (units === 'metric' ? '0.5' : '1') : '0');
  return {
    display_name: member?.display_name || firstName || '',
    kind,
    units,
    sex: member?.sex || '',
    age: age ? String(age) : '',
    heightFt: height.ft,
    heightIn: height.inch,
    heightCm: member?.height_cm ? String(Math.round(member.height_cm)) : '',
    weight,
    target_weight: target,
    intent,
    weekly_change: weekly,
    method: plan?.method && plan.method !== 'custom' ? plan.method : defaultMethod(intent),
    activity_level: member?.activity_level || 'moderate',
  };
}

function heightValue(draft) {
  if (draft.units === 'metric') return Number(draft.heightCm) || 0;
  const ft = Number(draft.heightFt) || 0;
  const inch = Number(draft.heightIn) || 0;
  return ft * 12 + inch;
}

function heightCm(draft) {
  const raw = heightValue(draft);
  if (!raw) return 0;
  return draft.units === 'metric' ? raw : inToCm(raw);
}

function weightKg(draft) {
  const raw = Number(draft.weight);
  if (!raw) return 0;
  return draft.units === 'metric' ? raw : lbToKg(raw);
}

function weeklyKg(draft) {
  const raw = Number(draft.weekly_change) || 0;
  if (!raw) return 0;
  return draft.units === 'metric' ? raw : lbToKg(raw);
}

function round1(value) {
  if (!value) return '';
  return String(Math.round(value * 10) / 10);
}

function convertDraftUnits(draft, next) {
  if (draft.units === next) return draft;
  const rawHeight = heightValue(draft);
  const cm = rawHeight ? (draft.units === 'metric' ? rawHeight : inToCm(rawHeight)) : 0;
  const totalIn = cm ? cmToIn(cm) : 0;
  const ft = Math.floor((totalIn + 0.01) / 12);
  const inch = Math.round((totalIn - ft * 12) * 10) / 10;
  const kg = weightKg(draft);
  const targetKg = Number(draft.target_weight)
    ? (draft.units === 'metric' ? Number(draft.target_weight) : lbToKg(Number(draft.target_weight)))
    : 0;
  const wkg = weeklyKg(draft);
  return {
    ...draft,
    units: next,
    heightCm: cm ? String(Math.round(cm)) : '',
    heightFt: totalIn ? String(ft) : '',
    heightIn: totalIn ? String(inch) : '',
    weight: kg ? round1(next === 'metric' ? kg : kgToLb(kg)) : '',
    target_weight: targetKg ? round1(next === 'metric' ? targetKg : kgToLb(targetKg)) : '',
    weekly_change: wkg ? round1(next === 'metric' ? wkg : kgToLb(wkg)) : draft.weekly_change,
  };
}

function paceChips(draft) {
  const base = draft.units === 'metric' ? PACE_METRIC : PACE_US;
  const current = String(draft.weekly_change || '');
  if (!current || current === '0' || base.some((item) => item.id === current)) return base;
  return [...base, {
    id: current,
    label: `${current} ${draft.units === 'metric' ? 'kg' : 'lb'}`,
    hint: 'Yours',
  }];
}

function isChildDraft(draft) {
  if (draft.kind === 'child') return true;
  const years = Number(draft.age);
  return Number.isFinite(years) && years >= 2 && years < 18;
}

function stepsFor(draft) {
  if (isChildDraft(draft)) return ['welcome', 'you', 'body', 'style', 'ready'];
  return ['welcome', 'you', 'body', 'goal', 'style', 'ready'];
}

export default function VitalOnboarding({ firstName, member, plan, onDone, onCancel }) {
  const [step, setStep] = useState('welcome');
  const [draft, setDraft] = useState(() => draftFrom(member, plan, firstName));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const child = isChildDraft(draft);
  const steps = stepsFor(draft);
  const active = steps.includes(step) ? step : (child ? 'style' : 'goal');
  const index = Math.max(0, steps.indexOf(active));
  const last = index >= steps.length - 1;

  useEffect(() => {
    if (step !== active) setStep(active);
  }, [active, step]);
  const preview = useMemo(
    () => previewPlanTargets({
      sex: draft.sex,
      age: Number(draft.age),
      heightCm: heightCm(draft),
      weightKg: weightKg(draft),
      activity_level: draft.activity_level,
      intent: child ? 'grow' : draft.intent,
      weeklyChangeKg: child ? 0 : weeklyKg(draft),
      method: child ? 'simple' : draft.method,
      kind: child ? 'child' : 'adult',
    }),
    [draft, child]
  );

  const set = (patch) => setDraft((prev) => ({ ...prev, ...patch }));

  const canContinue = () => {
    if (active === 'you') {
      if (!draft.display_name.trim()) return 'Add a name to continue.';
      return '';
    }
    if (active === 'body') {
      if (!draft.sex) return 'Pick female or male — it is only used for the calorie estimate.';
      if (!(Number(draft.age) >= 2)) return 'Add an age.';
      if (!(heightValue(draft) > 0)) return 'Add a height.';
      if (!(Number(draft.weight) > 0)) return 'Add a weight.';
      return '';
    }
    if (active === 'goal' && !draft.intent) return 'Pick a goal.';
    if (active === 'style' && !draft.activity_level) return 'Pick a usual activity level.';
    return '';
  };

  const goNext = () => {
    const blocked = canContinue();
    if (blocked) {
      setError(blocked);
      return;
    }
    setError('');
    const next = steps[index + 1];
    if (next) setStep(next);
  };

  const goBack = () => {
    setError('');
    const prev = steps[index - 1];
    if (prev) setStep(prev);
  };

  const finish = async () => {
    const blocked = canContinue();
    if (blocked) {
      setError(blocked);
      return;
    }
    if (!preview) {
      setError('Go back and add age, height, and weight so we can set a target.');
      return;
    }
    setBusy(true);
    setError('');
    const intent = child ? 'grow' : draft.intent;
    const result = await completeVitalOnboarding({
      member_id: member?.id,
      display_name: draft.display_name.trim(),
      kind: child ? 'child' : 'adult',
      units: draft.units,
      sex: draft.sex,
      age: draft.age,
      height: heightValue(draft),
      current_weight: draft.weight,
      target_weight: child ? '' : (draft.target_weight || (intent === 'maintain' ? draft.weight : '')),
      activity_level: draft.activity_level,
      intent,
      method: child ? 'simple' : draft.method,
      weekly_change: child || intent === 'maintain' ? '' : draft.weekly_change,
      step_goal: child ? 6000 : 8000,
    });
    setBusy(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    onDone?.(result.data);
  };

  return (
    <section className="vital-onboard">
      <div className="vital-onboard-progress" aria-hidden="true">
        {steps.map((id, i) => (
          <i key={id} className={i <= index ? 'is-on' : ''} />
        ))}
      </div>

      {active === 'welcome' && (
        <div className="vital-onboard-copy">
          <p className="vital-kicker">Vital</p>
          <h1>A calm plan for your household.</h1>
          <p>
            About a minute. We set calories and protein from your body and a goal — then Eat is ready to log.
            Kids never get a diet.
          </p>
        </div>
      )}

      {active === 'you' && (
        <form className="vital-onboard-copy" onSubmit={(e) => { e.preventDefault(); goNext(); }}>
          <p className="vital-kicker">You first</p>
          <h1>Who is this plan for?</h1>
          <p>Add everyone else after. Logging a meal is a tap once they are in the household.</p>
          <label htmlFor="onboard_name">Name</label>
          <input
            id="onboard_name"
            className="vital-input"
            value={draft.display_name}
            onChange={(e) => set({ display_name: e.target.value })}
            autoComplete="given-name"
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
                className={draft.kind === item.id ? 'is-active' : ''}
                onClick={() => set({
                  kind: item.id,
                  intent: item.id === 'child' ? 'grow' : (draft.intent === 'grow' ? 'lose' : draft.intent),
                  method: item.id === 'child' ? 'simple' : draft.method,
                })}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="vital-meals">
            {['us', 'metric'].map((id) => (
              <button
                key={id}
                type="button"
                className={draft.units === id ? 'is-active' : ''}
                onClick={() => setDraft((prev) => convertDraftUnits(prev, id))}
              >
                {id === 'us' ? 'lb / ft' : 'kg / cm'}
              </button>
            ))}
          </div>
        </form>
      )}

      {active === 'body' && (
        <form className="vital-onboard-copy" onSubmit={(e) => { e.preventDefault(); goNext(); }}>
          <p className="vital-kicker">Body</p>
          <h1>A few numbers so the targets are yours.</h1>
          <p>
            {child
              ? 'This estimates what a growing body typically needs. It is not a calorie diet.'
              : 'Sex and height are only used for energy. Movement you log later does not add food.'}
          </p>
          <div className="vital-meals">
            {[
              { id: 'female', label: 'Female' },
              { id: 'male', label: 'Male' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className={draft.sex === item.id ? 'is-active' : ''}
                onClick={() => set({ sex: item.id })}
              >
                {item.label}
              </button>
            ))}
          </div>
          <label htmlFor="onboard_age">Age</label>
          <input
            id="onboard_age"
            className="vital-input"
            type="number"
            inputMode="numeric"
            min="2"
            max="100"
            value={draft.age}
            onChange={(e) => set({ age: e.target.value })}
            autoFocus
            required
          />
          {draft.units === 'metric' ? (
            <>
              <label htmlFor="onboard_cm">Height (cm)</label>
              <input
                id="onboard_cm"
                className="vital-input"
                type="number"
                inputMode="decimal"
                min="70"
                max="250"
                value={draft.heightCm}
                onChange={(e) => set({ heightCm: e.target.value })}
                required
              />
            </>
          ) : (
            <div className="vital-onboard-split">
              <div>
                <label htmlFor="onboard_ft">Height (ft)</label>
                <input
                  id="onboard_ft"
                  className="vital-input"
                  type="number"
                  inputMode="numeric"
                  min="3"
                  max="8"
                  value={draft.heightFt}
                  onChange={(e) => set({ heightFt: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="onboard_in">in</label>
                <input
                  id="onboard_in"
                  className="vital-input"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="11.9"
                  step="0.1"
                  value={draft.heightIn}
                  onChange={(e) => set({ heightIn: e.target.value })}
                />
              </div>
            </div>
          )}
          <label htmlFor="onboard_weight">Weight now ({draft.units === 'metric' ? 'kg' : 'lb'})</label>
          <input
            id="onboard_weight"
            className="vital-input"
            type="number"
            inputMode="decimal"
            min="20"
            step="0.1"
            value={draft.weight}
            onChange={(e) => set({ weight: e.target.value })}
            required
          />
        </form>
      )}

      {active === 'goal' && (
        <div className="vital-onboard-copy">
          <p className="vital-kicker">Goal</p>
          <h1>What should this week work toward?</h1>
          <p>Workouts do not unlock extra calories. Unused calories do not move to tomorrow.</p>
          <div className="vital-choices">
            {ADULT_INTENTS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`vital-choice${draft.intent === item.id ? ' is-active' : ''}`}
                onClick={() => set({
                  intent: item.id,
                  method: defaultMethod(item.id),
                  weekly_change: item.id === 'lose'
                    ? (draft.units === 'metric' ? '0.5' : '1')
                    : item.id === 'gain'
                      ? (draft.units === 'metric' ? '0.25' : '0.5')
                      : '0',
                })}
              >
                <strong>{item.label}</strong>
                <span>{item.hint}</span>
              </button>
            ))}
          </div>
          {(draft.intent === 'lose' || draft.intent === 'gain') && (
            <>
              <p className="vital-kicker">Weekly pace</p>
              <div className="vital-meals">
                {paceChips(draft).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={String(draft.weekly_change) === item.id ? 'is-active' : ''}
                    onClick={() => set({ weekly_change: item.id })}
                  >
                    {item.label} · {item.hint}
                  </button>
                ))}
              </div>
              <label htmlFor="onboard_aim">Aim weight, optional ({draft.units === 'metric' ? 'kg' : 'lb'})</label>
              <input
                id="onboard_aim"
                className="vital-input"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={draft.target_weight}
                onChange={(e) => set({ target_weight: e.target.value })}
                placeholder="Leave blank if you are not sure"
              />
            </>
          )}
        </div>
      )}

      {active === 'style' && (
        <div className="vital-onboard-copy">
          <p className="vital-kicker">{child ? 'Days' : 'How you eat'}</p>
          <h1>{child ? 'How active is a usual day?' : 'Protein first, or keep it simple?'}</h1>
          {!child && (
            <div className="vital-choices">
              {METHODS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`vital-choice${draft.method === item.id ? ' is-active' : ''}`}
                  onClick={() => set({ method: item.id })}
                >
                  <strong>{item.label}</strong>
                  <span>{item.hint}</span>
                </button>
              ))}
            </div>
          )}
          <p className="vital-kicker">Baseline movement</p>
          <p className="vital-muted">This sets the calorie budget. A walk you log later is not extra food.</p>
          <div className="vital-choices">
            {ACTIVITY_LEVELS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`vital-choice${draft.activity_level === item.id ? ' is-active' : ''}`}
                onClick={() => set({ activity_level: item.id })}
              >
                <strong>{item.label}</strong>
                <span>{item.hint}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {active === 'ready' && (
        <div className="vital-onboard-copy">
          <p className="vital-kicker">Ready</p>
          <h1>{preview ? 'Your day looks like this.' : 'One more look.'}</h1>
          {preview ? (
            <>
              <div className="vital-onboard-stats">
                <div>
                  <span>Calories</span>
                  <strong>{preview.calories.toLocaleString()}</strong>
                </div>
                <div>
                  <span>Protein</span>
                  <strong>{preview.protein}g</strong>
                </div>
              </div>
              <p>
                {child
                  ? 'No calorie diet. Log meals so the household stays honest — growth still leads.'
                  : 'Leftovers do not roll over. Training does not add food. You can change this later in Plan.'}
              </p>
            </>
          ) : (
            <p>Go back a step if a number looks off. We need age, height, and weight to set targets.</p>
          )}
        </div>
      )}

      {error && <p className="vital-err">{error}</p>}

      <div className="vital-onboard-foot">
        {index > 0 && (
          <button type="button" className="vital-text-btn" onClick={goBack}>
            Back
          </button>
        )}
        {index === 0 && onCancel && (
          <button type="button" className="vital-text-btn" onClick={onCancel}>
            Not now
          </button>
        )}
        <button
          type="button"
          className="vital-btn"
          disabled={busy}
          onClick={last ? finish : goNext}
        >
          {busy ? 'Saving…' : last ? 'Start logging' : 'Continue'}
        </button>
      </div>
    </section>
  );
}
