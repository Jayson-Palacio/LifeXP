import { formatWeight, kgToLb, localDateISO, rollingAvg, sumMacros } from './nutrition';

function shiftDay(iso, days) {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  return localDateISO(date);
}

function dayTotals(foods, startIso, count) {
  const map = new Map();
  for (let i = 0; i < count; i += 1) {
    map.set(shiftDay(startIso, i), { calories: 0, protein: 0, count: 0 });
  }
  for (const row of foods) {
    const bucket = map.get(row.logged_on);
    if (!bucket) continue;
    bucket.calories += Number(row.calories || 0);
    bucket.protein += Number(row.protein_g || 0);
    bucket.count += 1;
  }
  return [...map.entries()].map(([day, value]) => ({ day, ...value }));
}

export function memberInsights({ plan, foods, weighIns, today, units }) {
  const start = shiftDay(today, -13);
  const energy = dayTotals(foods, start, 14);
  const thisWeek = energy.slice(-7);
  const lastWeek = energy.slice(0, 7);
  const target = plan?.calorie_target || null;
  const proteinTarget = plan?.protein_target_g || null;

  const loggedDays = thisWeek.filter((day) => day.count > 0).length;
  const onTarget = target
    ? thisWeek.filter((day) => day.count > 0 && day.calories <= target * 1.08).length
    : loggedDays;
  const avgKcal = loggedDays
    ? Math.round(thisWeek.reduce((sum, day) => sum + day.calories, 0) / loggedDays)
    : 0;
  const avgProtein = loggedDays
    ? Math.round(thisWeek.reduce((sum, day) => sum + day.protein, 0) / loggedDays)
    : 0;
  const prevAvg = lastWeek.some((day) => day.count > 0)
    ? Math.round(lastWeek.filter((d) => d.count > 0).reduce((sum, day) => sum + day.calories, 0) / lastWeek.filter((d) => d.count > 0).length)
    : null;

  const sortedWeights = [...(weighIns || [])].sort((a, b) => a.logged_on.localeCompare(b.logged_on));
  const weekAvg = rollingAvg(sortedWeights, 7);
  const prevAvgWeight = sortedWeights.length >= 8
    ? rollingAvg(sortedWeights.slice(0, -7), 7)
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

  return {
    energy,
    thisWeek,
    target,
    proteinTarget,
    loggedDays,
    onTarget,
    avgKcal,
    avgProtein,
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

export function familyWeek({ members, plans, foods, today }) {
  return members.map((person) => {
    const plan = plans.find((row) => row.member_id === person.id);
    const personFoods = foods.filter((row) => row.member_id === person.id);
    const start = shiftDay(today, -6);
    const week = dayTotals(personFoods, start, 7);
    const logged = week.filter((day) => day.count > 0).length;
    const todayFoods = personFoods.filter((row) => row.logged_on === today);
    return {
      person,
      logged,
      todayCalories: Math.round(sumMacros(todayFoods).calories),
      target: plan?.calorie_target || null,
    };
  });
}
