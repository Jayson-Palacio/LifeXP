import {
  ageFromBirthYear,
  calorieFloor,
  formatWeight,
  isStepLog,
  isStrength,
  kgToLb,
  moderateMinutes,
  shiftDay,
  sumMacros,
} from './nutrition';

const DRINK_NAME = /beer|wine|whiskey|cocktail|seltzer|ipa|margarita/i;

function weekendDay(iso) {
  const day = new Date(`${iso}T12:00:00`).getDay();
  return day === 0 || day === 6;
}

function shortDate(iso) {
  const date = new Date(`${iso}T12:00:00`);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function calorieBand(intent) {
  if (intent === 'gain') return [0.92, 1.15];
  if (intent === 'maintain') return [0.9, 1.1];
  return [0.85, 1.08];
}

function inBand(day, { intent, target, proteinTarget, simple }) {
  if (!day || day.count <= 0) return false;
  if (simple) return Boolean(proteinTarget) && day.protein >= proteinTarget * 0.85;
  if (!target) return false;
  const [low, high] = calorieBand(intent);
  const ratio = day.calories / target;
  return ratio >= low && ratio <= high;
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

function meanInRange(weights, startIso, endIso) {
  const rows = (weights || []).filter((row) => row.logged_on >= startIso && row.logged_on <= endIso);
  if (rows.length < 2) return null;
  return rows.reduce((sum, row) => sum + Number(row.weight_kg), 0) / rows.length;
}

function weekMove(activities, startIso, count) {
  const days = new Map();
  for (let i = 0; i < count; i += 1) days.set(shiftDay(startIso, i), true);
  let moderate = 0;
  let minutes = 0;
  let kcal = 0;
  let steps = 0;
  const strengthDays = new Set();
  const playDays = new Set();
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
    if (row.kind === 'play') playDays.add(row.logged_on);
  }
  return { moderate, minutes, kcal, steps, strengthDays: strengthDays.size, playDays: playDays.size };
}

function isDrink(row) {
  return row?.meal === 'drink' || DRINK_NAME.test(row?.name || '');
}

function foodDrivers(foods, startIso, endIso) {
  const map = new Map();
  let drinkKcal = 0;
  for (const row of foods || []) {
    if (!row.logged_on || row.logged_on < startIso || row.logged_on > endIso) continue;
    const kcal = Number(row.calories || 0);
    const protein = Number(row.protein_g || 0);
    if (isDrink(row)) drinkKcal += kcal;
    const key = String(row.name || '').trim().toLowerCase();
    if (!key) continue;
    const bucket = map.get(key) || { name: row.name, calories: 0, protein: 0, count: 0, drink: isDrink(row) };
    bucket.calories += kcal;
    bucket.protein += protein;
    bucket.count += 1;
    map.set(key, bucket);
  }
  const foodsRanked = [...map.values()]
    .sort((a, b) => b.calories - a.calories)
    .slice(0, 5)
    .map((row) => ({
      ...row,
      calories: Math.round(row.calories),
      protein: Math.round(row.protein),
      proteinPer100: row.calories > 0 ? Math.round((row.protein / row.calories) * 100) : 0,
    }));
  return { foods: foodsRanked, drinkKcal: Math.round(drinkKcal) };
}

function thinMeal(foods, startIso, endIso, proteinTarget) {
  if (!proteinTarget) return null;
  const perMeal = proteinTarget / 3;
  const meals = ['breakfast', 'lunch', 'dinner'];
  let worst = null;
  for (const meal of meals) {
    const rows = (foods || []).filter((row) => row.meal === meal && row.logged_on >= startIso && row.logged_on <= endIso);
    const days = new Set(rows.map((row) => row.logged_on));
    if (days.size < 2) continue;
    const avg = rows.reduce((sum, row) => sum + Number(row.protein_g || 0), 0) / days.size;
    if (avg >= perMeal * 0.85) continue;
    if (!worst || avg / perMeal < worst.avg / worst.target) {
      worst = { meal, avg: Math.round(avg), target: Math.round(perMeal) };
    }
  }
  return worst;
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
  const weekStart = shiftDay(today, -6);
  const prevStart = shiftDay(today, -13);
  const prevEnd = shiftDay(today, -7);
  const intent = plan?.intent || (child ? 'grow' : 'maintain');
  const method = plan?.method || 'high_protein';
  const simple = method === 'simple';
  const target = simple ? null : (plan?.calorie_target || null);
  const proteinTarget = plan?.protein_target_g || null;
  const fiberTarget = plan?.fiber_target_g || null;
  const bandCtx = { intent, target, proteinTarget, simple };

  const energy = dayTotals(foods, start, 14).map((day) => ({
    ...day,
    status: day.count <= 0 ? 'missing' : inBand(day, bandCtx) ? 'band' : 'off',
  }));
  const thisWeek = energy.slice(-7);
  const lastWeek = energy.slice(0, 7);

  const loggedDays = thisWeek.filter((day) => day.count > 0).length;
  const onTarget = thisWeek.filter((day) => inBand(day, bandCtx)).length;
  const avgKcal = loggedDays
    ? Math.round(thisWeek.reduce((sum, day) => sum + day.calories, 0) / loggedDays)
    : 0;
  const avgProtein = loggedDays
    ? Math.round(thisWeek.reduce((sum, day) => sum + day.protein, 0) / loggedDays)
    : 0;
  const avgFiber = loggedDays
    ? Math.round(thisWeek.reduce((sum, day) => sum + day.fiber, 0) / loggedDays)
    : 0;
  const prevLogged = lastWeek.filter((day) => day.count > 0);
  const prevAvg = prevLogged.length
    ? Math.round(prevLogged.reduce((sum, day) => sum + day.calories, 0) / prevLogged.length)
    : null;
  const prevProtein = prevLogged.length
    ? Math.round(prevLogged.reduce((sum, day) => sum + day.protein, 0) / prevLogged.length)
    : null;

  const sortedWeights = [...(weighIns || [])].sort((a, b) => a.logged_on.localeCompare(b.logged_on));
  const weekAvg = meanInRange(sortedWeights, weekStart, today);
  const prevAvgWeight = meanInRange(sortedWeights, prevStart, prevEnd);
  const current = plan?.current_weight_kg ?? sortedWeights.at(-1)?.weight_kg ?? null;
  const startW = plan?.start_weight_kg ?? sortedWeights[0]?.weight_kg ?? current;
  const targetW = plan?.target_weight_kg ?? null;
  const lost = startW != null && current != null ? startW - current : null;
  const remaining = current != null && targetW != null ? current - targetW : null;
  const weekly = Number(plan?.weekly_change_kg) || 0;
  let etaLabel = null;
  if ((plan?.intent === 'lose' || plan?.intent === 'gain') && remaining != null && Math.abs(remaining) > 0.15 && weekly > 0) {
    const weeks = Math.ceil(Math.abs(remaining) / weekly);
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

  let intakeKgWeek = null;
  let intakePace = null;
  if (target && loggedDays >= 5) {
    intakeKgWeek = ((target - avgKcal) * 7) / 7700;
    if (Math.abs(intakeKgWeek) < 0.05) {
      intakePace = 'Logged days are holding near target.';
    } else {
      const amount = formatWeight(Math.abs(intakeKgWeek), units);
      intakePace = intakeKgWeek > 0
        ? `Logged days imply ${amount}/week down.`
        : `Logged days imply ${amount}/week above target.`;
    }
    if (weekDelta != null) {
      const scaleBit = Math.abs(weekDelta) < 0.05
        ? 'Scale is flat.'
        : `Scale is ${formatWeight(Math.abs(weekDelta), units)} ${weekDelta < 0 ? 'down' : 'up'}.`;
      intakePace = `${intakePace} ${scaleBit}`;
    }
  }

  const moveThis = weekMove(activities, weekStart, 7);
  const moveLast = weekMove(activities, prevStart, 7);
  const moveGoal = child ? 60 * 7 : 150;
  const strengthGoal = child ? 0 : 2;
  const weighInThisWeek = sortedWeights.some((row) => row.logged_on >= weekStart && row.logged_on <= today);
  const proteinDays = proteinTarget
    ? thisWeek.filter((day) => day.count > 0 && day.protein >= proteinTarget * 0.85).length
    : 0;

  const bandNeed = Math.max(3, Math.ceil(loggedDays * 0.6));
  const hasBandTarget = simple ? Boolean(proteinTarget) : Boolean(target);
  const checks = [
    {
      id: 'logged',
      label: 'Logged',
      ok: loggedDays >= 5,
      detail: `${loggedDays}/7 days`,
    },
    {
      id: 'band',
      label: simple ? 'Protein days' : 'In band',
      ok: hasBandTarget && onTarget >= bandNeed,
      detail: hasBandTarget ? `${onTarget}/${loggedDays || 0} days` : 'No target yet',
    },
    {
      id: 'move',
      label: child ? 'Play' : 'Move',
      ok: child ? moveThis.minutes >= moveGoal : moveThis.moderate >= moveGoal,
      detail: child ? `${moveThis.minutes}/${moveGoal} min` : `${moveThis.moderate}/${moveGoal} min`,
    },
    child
      ? {
        id: 'play',
        label: 'Play days',
        ok: moveThis.playDays >= 4,
        detail: `${moveThis.playDays}/4 days`,
      }
      : {
        id: 'strength',
        label: 'Lifts',
        ok: moveThis.strengthDays >= strengthGoal,
        detail: `${moveThis.strengthDays}/${strengthGoal} days`,
      },
    {
      id: 'weigh',
      label: 'Weigh-in',
      ok: weighInThisWeek,
      detail: weighInThisWeek ? 'This week' : 'None this week',
    },
  ].sort((a, b) => Number(a.ok) - Number(b.ok));

  const weightSeries = sortedWeights.map((row) => {
    const windowStart = shiftDay(row.logged_on, -6);
    const window = sortedWeights.filter((item) => item.logged_on >= windowStart && item.logged_on <= row.logged_on);
    const trendKg = window.reduce((sum, item) => sum + Number(item.weight_kg), 0) / window.length;
    return {
      day: row.logged_on,
      label: shortDate(row.logged_on),
      kg: Number(row.weight_kg),
      trendKg,
    };
  });

  const drivers = foodDrivers(foods, weekStart, today);
  const mealGap = thinMeal(foods, weekStart, today, proteinTarget);

  return {
    energy,
    thisWeek,
    lastWeek,
    target,
    proteinTarget,
    fiberTarget,
    method,
    simple,
    intent,
    loggedDays,
    onTarget,
    proteinDays,
    avgKcal,
    avgProtein,
    prevProtein,
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
    intakeKgWeek,
    intakePace,
    moveMinutes: moveThis.minutes,
    moveModerate: moveThis.moderate,
    moveKcal: moveThis.kcal,
    weekSteps: moveThis.steps,
    lastWeekSteps: moveLast.steps,
    strengthDays: moveThis.strengthDays,
    playDays: moveThis.playDays,
    lastMoveMinutes: moveLast.minutes,
    moveGoal,
    strengthGoal,
    weighInThisWeek,
    weekScore: checks.filter((check) => check.ok).length,
    checks,
    streak: loggingStreak({ foods, activities, today }),
    weekdayAvg,
    weekendAvg,
    weekendGap: weekdayLogged.length >= 3 && weekendMissed,
    weekEaten,
    weekBudget,
    weekUnder,
    cutWeeks,
    weightSeries,
    weightPoints: weightSeries.map((row) => row.kg),
    energyPoints: energy.map((day) => (day.count > 0 ? day.calories : null)),
    energyLabels: energy.map((day) => shortDate(day.day)),
    foodDrivers: drivers.foods,
    drinkKcal: drivers.drinkKcal,
    mealGap,
    units,
    lostLabel: lost == null ? null : (lost >= 0 ? `Down ${formatWeight(lost, units)}` : `Up ${formatWeight(Math.abs(lost), units)}`),
    remainingLabel: remaining == null ? null : Math.abs(remaining) <= 0.15 ? 'At the goal' : `${formatWeight(Math.abs(remaining), units)} to go`,
    weekDeltaLabel: weekDelta == null
      ? (sortedWeights.length ? 'Need another morning weigh-in' : null)
      : `${weekDelta < 0 ? 'Down' : weekDelta > 0 ? 'Up' : 'Even'} ${formatWeight(Math.abs(weekDelta), units)} vs last week`,
    currentLabel: formatWeight(current, units),
    targetLabel: formatWeight(targetW, units),
    displayKgAs: units === 'metric' ? (v) => Number(v).toFixed(1) : (v) => kgToLb(v).toFixed(1),
  };
}

export function weekGap({ insights, child }) {
  if (!insights?.loggedDays) {
    return {
      id: 'empty',
      title: child ? 'Add food or play' : 'Add food or a walk',
      body: child ? 'Add food or play to start the week.' : 'Add food or a walk to start the week.',
    };
  }
  if (insights.loggedDays < 4) {
    return {
      id: 'incomplete',
      title: 'The log is too thin to judge.',
      body: `${insights.loggedDays} of 7 days logged — not enough to judge the week.`,
    };
  }
  if (insights.weekendGap) {
    return {
      id: 'weekend',
      title: 'Weekdays look fine. Weekends are the leak.',
      body: 'Log Saturday and Sunday even if they are messy. The scale follows the week, and missing weekend meals hides the real average.',
    };
  }
  const proteinShort = insights.proteinTarget
    && insights.proteinDays < Math.max(1, Math.ceil(insights.loggedDays * 0.6));
  if (proteinShort) {
    return {
      id: 'protein',
      title: 'Protein is the gap.',
      body: `Protein landed on ${insights.proteinDays} of ${insights.loggedDays} logged days. Average ${insights.avgProtein}g against ${insights.proteinTarget}g.`,
    };
  }
  if (
    insights.intakeKgWeek != null
    && insights.intakeKgWeek > 0.05
    && insights.weekDelta != null
    && insights.weekDelta > -0.08
  ) {
    return {
      id: 'stall',
      title: 'The scale is not matching the log.',
      body: insights.intakePace || 'Logged days are under target and the 7-day weight average is flat.',
    };
  }
  const moveShort = child
    ? (insights.moveMinutes || 0) < (insights.moveGoal || 420)
    : (insights.moveModerate || 0) < (insights.moveGoal || 150);
  const liftShort = !child && (insights.strengthDays || 0) < (insights.strengthGoal || 2);
  const playShort = child && (insights.playDays || 0) < 4;
  if (moveShort || liftShort || playShort) {
    const title = child
      ? 'Play is the gap.'
      : liftShort && !moveShort
        ? 'Lift is the gap.'
        : 'Movement is the gap.';
    const body = child
      ? `${insights.moveMinutes || 0} minutes of play, on ${insights.playDays || 0} days. The week wants ${insights.moveGoal} minutes and 4 play days.`
      : liftShort && !moveShort
        ? `${insights.strengthDays || 0} of ${insights.strengthGoal || 2} lift days.`
        : `${insights.moveModerate || 0} of ${insights.moveGoal || 150} moderate minutes.`;
    return { id: 'move', title, body };
  }
  if (insights.weekUnder != null && insights.weekUnder < -400) {
    return {
      id: 'hot',
      title: 'The week is running hot.',
      body: 'Quieter plates from here. One heavy day is fine. The average is what the scale sees.',
    };
  }
  if (insights.weekUnder != null && insights.weekUnder > 400) {
    return {
      id: 'under',
      title: 'You are under for the week.',
      body: 'Eat a real dinner. Leftover calories are not a prize.',
    };
  }
  if (insights.mealGap) {
    const label = insights.mealGap.meal[0].toUpperCase() + insights.mealGap.meal.slice(1);
    return {
      id: 'meal',
      title: `${label} is light on protein.`,
      body: `${label} is ${insights.mealGap.avg}g against about ${insights.mealGap.target}g.`,
    };
  }
  return {
    id: 'steady',
    title: child ? 'Ordinary meals and play.' : 'The average is holding.',
    body: insights.streak
      ? `${insights.streak}-day logging streak. Keep the average honest.`
      : 'The week is underway. The average matters more than one day.',
  };
}

export function adaptiveCheck({ plan, member, insights, child }) {
  if (child || plan?.intent !== 'lose' || !plan?.calorie_target) return null;
  if ((insights?.loggedDays || 0) < 4) return null;
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

  if (nearTarget && stalled && insights.loggedDays >= 5) {
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

export function familyWeek({ members, plans, foods, activities = [], weighIns = [], today }) {
  return members.map((person) => {
    const plan = plans.find((row) => row.member_id === person.id);
    const personFoods = foods.filter((row) => row.member_id === person.id);
    const personMove = activities.filter((row) => row.member_id === person.id);
    const personWeights = (weighIns || []).filter((row) => row.member_id === person.id);
    const start = shiftDay(today, -6);
    const simple = plan?.method === 'simple';
    const week = dayTotals(personFoods, start, 7);
    const move = weekMove(personMove, start, 7);
    const bandCtx = {
      intent: plan?.intent,
      target: simple ? null : plan?.calorie_target,
      proteinTarget: plan?.protein_target_g,
      simple,
    };
    const logged = week.filter((day) => day.count > 0).length;
    const onBand = week.filter((day) => inBand(day, bandCtx)).length;
    const weighed = personWeights.some((row) => row.logged_on >= start && row.logged_on <= today);
    const todayFoods = personFoods.filter((row) => row.logged_on === today);
    const todayMove = personMove.filter((row) => row.logged_on === today && !isStepLog(row));
    const todayMinutes = todayMove.reduce((sum, row) => sum + Number(row.minutes || 0), 0);
    return {
      person,
      logged,
      onBand,
      weighed,
      todayCalories: Math.round(sumMacros(todayFoods).calories),
      todayMinutes,
      weekMinutes: move.minutes,
      strengthDays: move.strengthDays,
      target: plan?.calorie_target || null,
    };
  });
}
