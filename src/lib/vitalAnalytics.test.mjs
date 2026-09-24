import assert from 'node:assert/strict';
import test from 'node:test';
import { adaptiveCheck, memberInsights } from './vitalAnalytics.js';
import { shiftDay } from './nutrition.js';

const today = '2026-09-23';

function foodsFor(days, calories, protein = 100) {
  return days.map((day) => ({
    logged_on: day,
    meal: 'lunch',
    name: 'Plate',
    calories,
    protein_g: protein,
    fiber_g: 10,
  }));
}

function plan(overrides = {}) {
  return {
    intent: 'lose',
    method: 'high_protein',
    calorie_target: 2000,
    protein_target_g: 140,
    weekly_change_kg: 0.5,
    current_weight_kg: 80,
    ...overrides,
  };
}

test('hides intake pace when fewer than four days are logged', () => {
  const days = [0, 1, 2].map((offset) => shiftDay(today, -offset));
  const insights = memberInsights({
    plan: plan(),
    foods: foodsFor(days, 1600),
    weighIns: [],
    today,
    units: 'us',
    child: false,
  });
  assert.equal(insights.intakePace, null);
  assert.match(insights.checks.find((check) => check.id === 'logged').detail, /^3\/7/);
});

test('a large under-eat is not on target for a cut', () => {
  const days = [0, 1, 2, 3, 4].map((offset) => shiftDay(today, -offset));
  const insights = memberInsights({
    plan: plan(),
    foods: foodsFor(days, 1200),
    weighIns: [],
    today,
    units: 'us',
    child: false,
  });
  assert.equal(insights.onTarget, 0);
  assert.equal(insights.checks.find((check) => check.id === 'band').ok, false);
});

test('weight delta uses calendar weeks, not the last fourteen rows', () => {
  const weighIns = [
    { logged_on: '2026-06-01', weight_kg: 90 },
    { logged_on: '2026-06-08', weight_kg: 89 },
    { logged_on: '2026-09-10', weight_kg: 82 },
    { logged_on: '2026-09-12', weight_kg: 82 },
    { logged_on: '2026-09-20', weight_kg: 80 },
    { logged_on: '2026-09-22', weight_kg: 80 },
  ];
  const insights = memberInsights({
    plan: plan(),
    foods: [],
    weighIns,
    today,
    units: 'metric',
    child: false,
  });
  assert.equal(insights.weekAvg, 80);
  assert.equal(insights.weekDelta, -2);
});

test('simple method uses one 85 percent protein bar', () => {
  const days = [0, 1, 2, 3, 4].map((offset) => shiftDay(today, -offset));
  const insights = memberInsights({
    plan: plan({ method: 'simple', calorie_target: 2000, protein_target_g: 100 }),
    foods: foodsFor(days, 2500, 80),
    weighIns: [],
    today,
    units: 'us',
    child: false,
  });
  assert.equal(insights.onTarget, 0);
  assert.equal(insights.proteinDays, 0);
});

test('a child score does not include a free strength point', () => {
  const days = [0, 1, 2, 3, 4].map((offset) => shiftDay(today, -offset));
  const insights = memberInsights({
    plan: plan({ intent: 'grow', method: 'simple', protein_target_g: 40, calorie_target: null }),
    foods: foodsFor(days, 1500, 40),
    weighIns: [{ logged_on: today, weight_kg: 30 }],
    activities: [],
    today,
    units: 'us',
    child: true,
  });
  const play = insights.checks.find((check) => check.id === 'play');
  assert.ok(play);
  assert.equal(play.ok, false);
  assert.equal(insights.checks.some((check) => check.id === 'strength'), false);
});

test('diet break can fire from weigh-ins older than 60 days', () => {
  const days = [0, 1, 2, 3, 4].map((offset) => shiftDay(today, -offset));
  const weighIns = [
    { logged_on: '2026-06-01', weight_kg: 80 },
    { logged_on: '2026-06-03', weight_kg: 80 },
    { logged_on: '2026-09-15', weight_kg: 80 },
    { logged_on: '2026-09-16', weight_kg: 80 },
    { logged_on: '2026-09-22', weight_kg: 80 },
    { logged_on: '2026-09-23', weight_kg: 80 },
  ];
  const insights = memberInsights({
    plan: plan(),
    foods: foodsFor(days, 2000, 140),
    weighIns,
    today,
    units: 'us',
    child: false,
  });
  const card = adaptiveCheck({
    plan: plan(),
    member: { sex: 'male', birth_year: 1990 },
    insights,
    child: false,
  });
  assert.ok(insights.cutWeeks >= 10);
  assert.equal(card?.kind, 'diet_break');
});
