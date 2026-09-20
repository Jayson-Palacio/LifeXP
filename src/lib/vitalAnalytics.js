import {
  ageFromBirthYear,
  calorieFloor,
  formatWeight,
  isStepLog,
  isStrength,
  kgToLb,
  moderateMinutes,
  rollingAvg,
  shiftDay,
  sumMacros,
} from './nutrition';

function weekendDay(iso) {
  const day = new Date(`${iso}T12:00:00`).getDay();
  return day === 0 || day === 6;
}

function dayTotals(foods, startIso, count) {
  const map = new Map();
  for (let i = 0; i < count; i += 1) {
    map.set(shiftDay(startIso, i), { calories: 0, protein: 0, fiber: 0, count: 0 });
  }
  for (const row of foods) {
    const bucket = map.get(row.logged_on);
    if (!bucket) continue;
    bucket.calories += Number(row.calories || 0);
    bucket.protein += Number(row.protein_g || 0);
    bucket.fiber += Number(row.fiber_g || 0);
    bucket.count += 1;
  }
  return [...map.entries()].map(([day, value]) => ({ day, ...value }));
}

function weekMove(activities, startIso, count) {
  const days = new Map();
  for (let i = 0; i < count; i += 1) days.set(shiftDay(startIso, i), true);
  let moderate = 0;
  let minutes = 0;
  let kcal = 0;
  let steps = 0;
  const strengthDays = new Set();
  for (const row of activities || []) {
    if (!days.has(row.logged_on)) continue;
    if (isStepLog(row)) {
      steps += Number(row.steps || 0);
      continue;
    }
    minutes += Number(row.minutes || 0);
    moderate += moderateMinutes(row);
    kcal += Number(row.kcal_est || 0);
    if (isStrength(row.kind)) strengthDays.add(row.logged_on);
  }
  return { moderate, minutes, kcal, steps, strengthDays: strengthDays.size };
}

export function activityWeek({ activities = [], today, days = 7 }) {
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return Array.from({ length: days }, (_, index) => {
    const day = shiftDay(today, -(days - 1 - index));
    const rows = activities.filter((row) => row.logged_on === day);
    const workouts = rows.filter((row) => !isStepLog(row));
    const minutes = workouts.reduce((sum, row) => sum + Number(row.minutes || 0), 0);
    const steps = rows.reduce((sum, row) => sum + Number(row.steps || 0), 0);
    const date = new Date(`${day}T12:00:00`);
    return {
      day,
      label: names[date.getDay()],
      minutes,
      steps,
      strength: workouts.some((row) => isStrength(row.kind)),
      kinds: [...new Set(workouts.map((row) => row.kind))],
      isToday: day === today,
    };
  });
}

export function loggingStreak({ foods = [], activities = [], today }) {
  const days = new Set();
  for (const row of foods) if (row.logged_on) days.add(row.logged_on);
  for (const row of activities) if (row.logged_on) days.add(row.logged_on);
  let streak = 0;
  for (let i = 0; i < 60; i += 1) {
    const day = shiftDay(today, -i);
    if (!days.has(day)) {
      if (i === 0) continue;
      break;
    }
    streak += 1;
  }
  return streak;
}

export function memberInsights({ plan, foods, weighIns, activities = [], today, units, child }) {
  const start = shiftDay(today, -13);
  const energy = dayTotals(foods, start, 14);
  const thisWeek = energy.slice(-7);
  const lastWeek = energy.slice(0, 7);
  const method = plan?.method || 'high_protein';
  const simple = method === 'simple';
  const target = simple ? null : (plan?.calorie_target || null);
  const proteinTarget = plan?.protein_target_g || null;
  const fiberTarget = plan?.fiber_target_g || null;

  const loggedDays = thisWeek.filter((day) => day.count > 0).length;
  const onTarget = target
    ? thisWeek.filter((day) => day.count > 0 && day.calories <= target * 1.08).length
    : simple
      ? thisWeek.filter((day) => day.count > 0 && (!proteinTarget || day.protein >= proteinTarget * 0.75)).length
      : loggedDays;
  const avgKcal = loggedDays
    ? Math.round(thisWeek.reduce((sum, day) => sum + day.calories, 0) / loggedDays)
    : 0;
  const avgProtein = loggedDays
    ? Math.round(thisWeek.reduce((sum, day) => sum + day.protein, 0) / loggedDays)
    : 0;
  const avgFiber = loggedDays
    ? Math.round(thisWeek.reduce((sum, day) => sum + day.fiber, 0) / loggedDays)
    : 0;
  const prevAvg = lastWeek.some((day) => day.count > 0)
    ? Math.round(lastWeek.filter((d) => d.count > 0).reduce((sum, day) => sum + day.calories, 0) / lastWeek.filter((d) => d.count > 0).length)
    : null;

  const sortedWeights = [...(weighIns || [])].sort((a, b) => a.logged_on.localeCompare(b.logged_on));
  const weekAvg = rollingAvg(sortedWeights, 7);
  const prevAvgWeight = sortedWeights.length >= 8
    ? rollingAvg(sortedWeights.slice(-14, -7), 7)
    : null;
  const current = plan?.current_weight_kg ?? sortedWeights.at(-1)?.weight_kg ?? null;
  const startW = plan?.start_weight_kg ?? sortedWeights[0]?.weight_kg ?? current;
  const targetW = plan?.target_weight_kg ?? null;
  const lost = startW != null && current != null ? startW - current : null;
  const remaining = current != null && targetW != null ? current - targetW : null;
  const weekly = Number(plan?.weekly_change_kg) || 0;
  let etaLabel = null;
  if (plan?.intent === 'lose' && remaining != null && remaining > 0.15 && weekly > 0) {
    const weeks = Math.ceil(remaining / weekly);
    etaLabel = weeks <= 1 ? 'About a week' : `About ${weeks} weeks`;
  }

  const weekDelta = weekAvg != null && prevAvgWeight != null ? weekAvg - prevAvgWeight : null;
  const weekdayLogged = thisWeek.filter((day) => day.count > 0 && !weekendDay(day.day));
  const weekendLogged = thisWeek.filter((day) => day.count > 0 && weekendDay(day.day));
  const weekendMissed = thisWeek.some((day) => weekendDay(day.day) && day.count === 0);
  const weekdayAvg = weekdayLogged.length
    ? Math.round(weekdayLogged.reduce((sum, day) => sum + day.calories, 0) / weekdayLogged.length)
    : null;
  const weekendAvg = weekendLogged.length
    ? Math.round(weekendLogged.reduce((sum, day) => sum + day.calories, 0) / weekendLogged.length)
    : null;
  const weekEaten = Math.round(thisWeek.reduce((sum, day) => sum + day.calories, 0));
  const weekBudget = target && loggedDays ? target * loggedDays : null;
  const weekUnder = weekBudget != null ? weekBudget - weekEaten : null;
  const firstWeigh = sortedWeights[0]?.logged_on;
  const cutWeeks = firstWeigh
    ? Math.max(0, Math.floor((new Date(`${today}T12:00:00`) - new Date(`${firstWeigh}T12:00:00`)) / (7 * 86400000)))
    : 0;

  let intakePace = null;
  if (target && loggedDays >= 3) {
    const kgWeek = ((target - avgKcal) * 7) / 7700;
    if (Math.abs(kgWeek) >= 0.05) {
      const amount = formatWeight(Math.abs(kgWeek), units);
      intakePace = kgWeek > 0
        ? `This week’s eating is a ${amount}/week deficit.`
        : `This week’s eating is ${amount}/week above target.`;
    } else {
      intakePace = 'This week is holding near target.';
    }
  }

  const moveThis = weekMove(activities, shiftDay(today, -6), 7);
  const moveLast = weekMove(activities, shiftDay(today, -13), 7);
  const moveGoal = child ? 60 * 7 : 150;
  const strengthGoal = child ? 0 : 2;
  const weighInThisWeek = sortedWeights.some((row) => row.logged_on >= shiftDay(today, -6));
  const proteinDays = proteinTarget
    ? thisWeek.filter((day) => day.count > 0 && day.protein >= proteinTarget * 0.85).length
    : 0;

  const scoreParts = [
    loggedDays >= 5,
    onTarget >= Math.max(3, Math.ceil(loggedDays * 0.6)),
    child ? moveThis.minutes >= 60 * 4 : moveThis.moderate >= 90,
    child ? true : moveThis.strengthDays >= 1,
    weighInThisWeek,
  ];
  const weekScore = scoreParts.filter(Boolean).length;
  const streak = loggingStreak({ foods, activities, today });

  return {
    energy,
    thisWeek,
    lastWeek,
    target,
    proteinTarget,
    fiberTarget,
    method,
    simple,
    loggedDays,
    onTarget,
    proteinDays,
    avgKcal,
    avgProtein,
    avgFiber,
    prevAvg,
    current,
    startW,
    targetW,
    lost,
    remaining,
    weekAvg,
    weekDelta,
    etaLabel,
    intakePace,
    moveMinutes: moveThis.minutes,
    moveModerate: moveThis.moderate,
    moveKcal: moveThis.kcal,
    weekSteps: moveThis.steps,
    lastWeekSteps: moveLast.steps,
    strengthDays: moveThis.strengthDays,
    lastMoveMinutes: moveLast.minutes,
    moveGoal,
    strengthGoal,
    weighInThisWeek,
    weekScore,
    streak,
    weekdayAvg,
    weekendAvg,
    weekendGap: weekdayLogged.length >= 3 && weekendMissed,
    weekEaten,
    weekBudget,
    weekUnder,
    cutWeeks,
    weightPoints: sortedWeights.map((row) => Number(row.weight_kg)),
    energyPoints: energy.map((day) => day.calories),
    units,
    lostLabel: lost == null ? null : (lost >= 0 ? `Down ${formatWeight(lost, units)}` : `Up ${formatWeight(Math.abs(lost), units)}`),
    remainingLabel: remaining == null ? null : remaining <= 0.15 ? 'At the goal' : `${formatWeight(remaining, units)} to go`,
    weekDeltaLabel: weekDelta == null
      ? null
      : `${weekDelta < 0 ? 'Down' : weekDelta > 0 ? 'Up' : 'Even'} ${formatWeight(Math.abs(weekDelta), units)} vs last week`,
    currentLabel: formatWeight(current, units),
    targetLabel: formatWeight(targetW, units),
    displayKgAs: units === 'metric' ? (v) => Number(v).toFixed(1) : (v) => kgToLb(v).toFixed(1),
  };
}

export function adaptiveCheck({ plan, member, insights, child }) {
  if (child || plan?.intent !== 'lose' || !plan?.calorie_target) return null;
  const age = ageFromBirthYear(member?.birth_year);
  const floor = calorieFloor({ sex: member?.sex, age }) || 1500;
  const dailyDeficit = ((Number(plan.weekly_change_kg) || 0) * 7700) / 7;
  const maintenance = Math.round(plan.calorie_target + dailyDeficit);
  const target = plan.calorie_target;

  if (insights.weekendGap) {
    return {
      kind: 'weekend_gap',
      title: 'Weekdays look fine. Weekends are the leak.',
      body: 'Log Saturday and Sunday even if they are messy. The scale follows the week, and missing weekend meals hides the real average.',
    };
  }

  const nearTarget = insights.avgKcal && Math.abs(insights.avgKcal - target) / target < 0.12;
  const stalled = insights.weekDelta != null && insights.weekDelta > -0.08 && insights.loggedDays >= 5;

  if (insights.cutWeeks >= 10 && stalled) {
    return {
      kind: 'diet_break',
      title: 'A short hold can help the cut keep working.',
      body: `About ${insights.cutWeeks} weeks in, metabolism and hunger often push back. Eating near ${maintenance.toLocaleString()} kcal for 1–2 weeks is a diet break, not a failure.`,
      action: 'hold',
      calories: maintenance,
    };
  }

  if (nearTarget && stalled) {
    const suggested = Math.max(floor, target - 150);
    return {
      kind: 'stall',
      title: 'The scale is not matching the log.',
      body: `You are eating near ${target.toLocaleString()} kcal and the 7-day weight average is flat. That usually means TDEE dropped, not willpower. A small nudge to ${suggested.toLocaleString()} kcal is enough — do not crash it.`,
      action: 'cut',
      calories: suggested,
    };
  }

  return null;
}

export function familyWeek({ members, plans, foods, activities = [], today }) {
  return members.map((person) => {
    const plan = plans.find((row) => row.member_id === person.id);
    const personFoods = foods.filter((row) => row.member_id === person.id);
    const personMove = activities.filter((row) => row.member_id === person.id);
    const start = shiftDay(today, -6);
    const week = dayTotals(personFoods, start, 7);
    const move = weekMove(personMove, start, 7);
    const logged = week.filter((day) => day.count > 0).length;
    const todayFoods = personFoods.filter((row) => row.logged_on === today);
    const todayMove = personMove.filter((row) => row.logged_on === today);
    const todayMinutes = todayMove.reduce((sum, row) => sum + Number(row.minutes || 0), 0);
    return {
      person,
      logged,
      todayCalories: Math.round(sumMacros(todayFoods).calories),
      todayMinutes,
      weekMinutes: move.minutes,
      strengthDays: move.strengthDays,
      target: plan?.calorie_target || null,
    };
  });
}
