import { ageFromBirthYear } from './nutrition';

/**
 * Calm, specific guidance. Not medical advice — estimates from energy-balance
 * research (Mifflin–St Jeor / Schofield) and protein ranges used in adult fat-loss.
 */
export function coachNote({
  member,
  plan,
  eaten,
  mealCount,
  recentWeights,
  todayMoveMinutes = 0,
  strengthDays = 0,
  child,
  hour = 12,
  adaptive = null,
}) {
  const name = member?.display_name || 'This person';
  const age = ageFromBirthYear(member?.birth_year);
  const isChild = child || member?.kind === 'child' || (age != null && age < 18);
  const method = plan?.method || 'high_protein';
  const simple = method === 'simple';

  if (!member) {
    return {
      kicker: 'Household',
      title: 'Add the people you cook for.',
      body: 'Vital is built for the whole roof — adults chasing a goal, kids who just need regular meals. Two taps to add someone, then log food as it happens.',
    };
  }

  if (!plan) {
    if (mealCount === 0) {
      return {
        kicker: name,
        title: isChild ? 'Kids need enough to grow.' : 'Log the first meal. Targets can wait.',
        body: isChild
          ? 'We do not put children on calorie diets. Track what they actually eat so dinner stays ordinary.'
          : 'Tap a food. We will fill calories from the kitchen list. Set a plan when you want protein and a daily target.',
      };
    }
    return {
      kicker: name,
      title: `${mealCount} ${mealCount === 1 ? 'item' : 'items'} today`,
      body: isChild
        ? 'Nice. Regular meals beat a perfect log. Add height and weight later if you want a growth snapshot — not a diet.'
        : 'When you are ready, a short plan gives a calorie and protein target from your stats. Until then, keep logging.',
    };
  }

  if (isChild) {
    if (mealCount === 0) {
      return {
        kicker: name,
        title: 'Start with breakfast.',
        body: 'Childhood energy needs bounce with growth spurts. We estimate a range, never a cut. Protein at breakfast (eggs, yogurt, milk) makes the rest of the day easier.',
      };
    }
    const protein = Math.round(eaten.protein);
    if (todayMoveMinutes < 20) {
      return {
        kicker: name,
        title: 'Meals plus play.',
        body: `${mealCount} logged. Tap Play when they run around — about 60 minutes a day is the WHO sketch, not a workout.`,
      };
    }
    return {
      kicker: name,
      title: protein < 25 ? 'A little more protein helps them grow.' : 'Meals are landing.',
      body: protein < 25
        ? `Only ${protein}g of protein so far. Milk, yogurt, eggs, or chicken at the next meal is enough — no need to count the rest of the plate.`
        : `${mealCount} logged, ${Math.round(eaten.calories)} kcal. Treat the number as a sketch. Pediatricians, not apps, should change a child’s diet.`,
    };
  }

  const target = plan.calorie_target;
  const proteinTarget = plan.protein_target_g;
  const fiberTarget = plan.fiber_target_g;
  const remaining = !simple && target ? Math.round(target - eaten.calories) : null;
  const proteinGap = proteinTarget ? Math.round(proteinTarget - eaten.protein) : null;
  const fiberGap = fiberTarget ? Math.round(fiberTarget - (eaten.fiber || 0)) : null;
  const proteinPerMeal = proteinTarget ? Math.round(proteinTarget / 3) : 30;

  if (mealCount === 0) {
    if (simple) {
      return {
        kicker: name,
        title: 'Protein, plants, then a walk.',
        body: `Aim about ${proteinPerMeal}g protein at this meal, fiber through the day${fiberTarget ? ` (~${fiberTarget}g)` : ''}, and 30 minutes of movement. No need to chase a calorie total.`,
      };
    }
    return {
      kicker: name,
      title: plan.intent === 'lose' ? 'Protein first, deficit second.' : 'Eat on a schedule. The math follows.',
      body: plan.intent === 'lose'
        ? `About ${target} kcal today, with ${proteinTarget}g protein. Front-load protein at the first meal so the deficit does not turn into a crash at 4pm.`
        : `Maintenance is about ${target} kcal. You do not need a perfect log — breakfast and a protein check are enough to steer.`,
    };
  }

  if (remaining != null && remaining > 400 && hour >= 17 && hour < 22) {
    return {
      kicker: name,
      title: 'Eat a real dinner now.',
      body: `About ${remaining} kcal still sit in the day. Do not bank them. A plate with protein and plants beats a late snack pile.`,
    };
  }

  if (adaptive?.kind === 'weekend_gap' && mealCount >= 1) {
    return {
      kicker: name,
      title: adaptive.title,
      body: adaptive.body,
    };
  }

  if (todayMoveMinutes >= 30 && plan.intent === 'lose') {
    return {
      kicker: name,
      title: 'You moved. Keep dinner the same size.',
      body: `${todayMoveMinutes} minutes is the health win. We do not add it back to the food budget — that extra pizza is how the scale stalls.`,
    };
  }

  if (plan.intent === 'lose' && strengthDays < 2 && mealCount >= 1) {
    return {
      kicker: name,
      title: 'Lift twice this week if you can.',
      body: `Strength work protects muscle while the deficit does the fat loss. ${strengthDays === 0 ? 'A short Lift log is enough to start.' : 'One more Lift day this week closes the WHO minimum.'}`,
    };
  }

  if (simple && proteinGap != null && proteinGap > 25) {
    return {
      kicker: name,
      title: 'Get the next meal to 30g protein.',
      body: `About ${proteinGap}g left for the day. Eggs, yogurt, chicken, or a shake. Fiber and a 30-minute walk do the rest.`,
    };
  }

  if (fiberGap != null && fiberGap > 10 && (remaining == null || remaining > 150)) {
    return {
      kicker: name,
      title: 'Fiber is still light.',
      body: `About ${fiberGap}g to the day’s fiber target. Berries, beans, oats, or broccoli fill it without a calorie spike.`,
    };
  }

  if (remaining != null && remaining < -180) {
    return {
      kicker: name,
      title: 'Over the line — make the next meal quieter.',
      body: `You are about ${Math.abs(remaining)} kcal over. Skip the extra snack, drink water, and keep protein in the last meal. One day does not move the weekly average.`,
    };
  }

  if (proteinGap != null && proteinGap > 30 && (remaining == null || remaining > 200)) {
    return {
      kicker: name,
      title: 'Protein is the gap, not willpower.',
      body: `About ${proteinGap}g left. Greek yogurt, eggs, chicken, or a shake close it without a huge calorie spike. Muscle and satiety both need it.`,
    };
  }

  if (remaining != null && remaining > 450 && mealCount >= 2) {
    return {
      kicker: name,
      title: 'Plenty of room for a real dinner.',
      body: `Roughly ${remaining} kcal left. Do not “save” it for later and then overshoot. Sit down for a plate with protein and plants.`,
    };
  }

  if (recentWeights?.length >= 4 && plan.intent === 'lose') {
    const first = Number(recentWeights[0].weight_kg);
    const last = Number(recentWeights[recentWeights.length - 1].weight_kg);
    if (last - first > 0.3) {
      return {
        kicker: name,
        title: 'Weight wiggles. The week matters.',
        body: 'Sodium, workouts, and hormones move the scale more than fat in a few days. Weigh in the morning, watch the weekly average, and stay on the protein target.',
      };
    }
  }

  if (simple) {
    return {
      kicker: name,
        title: todayMoveMinutes >= 30 ? 'The simple day is working.' : 'A 30-minute walk still fits.',
        body: proteinGap != null && proteinGap > 0
          ? `Protein still wants about ${proteinGap}g. Movement is health, not extra food.`
          : 'Keep meals ordinary. Movement is not a license to eat more.',
    };
  }

  return {
    kicker: name,
    title: remaining != null ? `${remaining} kcal left in the day` : 'Keep the log light.',
      body: proteinGap != null && proteinGap > 0
        ? `Protein still wants about ${proteinGap}g.`
        : 'Log what is in front of you.',
  };
}

export function familyStatusLine({ plan, eaten, mealCount, child, minutes = 0 }) {
  if (mealCount === 0 && minutes === 0) return child ? 'No meals yet' : 'Not started';
  if (child) {
    const bits = [];
    if (mealCount) bits.push(`${mealCount} logged`);
    if (minutes) bits.push(`${minutes} min`);
    return bits.join(' · ') || 'No meals yet';
  }
  if (!plan?.calorie_target || plan?.method === 'simple') {
    return minutes ? `${Math.round(eaten.calories)} kcal · ${minutes} min` : `${Math.round(eaten.calories)} kcal`;
  }
  const remaining = Math.round(plan.calorie_target - eaten.calories);
  const cal = remaining < 0 ? `${Math.abs(remaining)} over` : `${remaining} left`;
  return minutes ? `${cal} · ${minutes} min` : cal;
}

export function weekSentence({ insights, child }) {
  if (!insights?.loggedDays) {
    return child ? 'Add food or play to start the week.' : 'Add food or a walk to start the week.';
  }
  if (child) {
    if ((insights.moveMinutes || 0) < 120) return 'Meals are landing. Play is the gap this week.';
    return 'Ordinary meals and play — that’s a good week.';
  }
  const logged = insights.loggedDays || 0;
  const proteinOk = (insights.proteinDays || insights.onTarget || 0) >= Math.max(1, Math.ceil(logged * 0.6));
  const liftGap = (insights.strengthDays || 0) < (insights.strengthGoal || 2);
  const moveGap = (insights.moveModerate || 0) < ((insights.moveGoal || 150) * 0.5);
  if (proteinOk && liftGap) return 'Protein was fine. Lift is the gap.';
  if (proteinOk && moveGap) return 'Protein was fine. Walking is the gap.';
  if (!proteinOk && !liftGap) return 'Lifts are in. Protein is the gap.';
  if (insights.weekUnder != null && insights.weekUnder < -400) return 'The week is running hot. Quieter plates, keep lifting.';
  if (insights.weekUnder != null && insights.weekUnder > 400) return 'You are under for the week. Eat a real dinner — leftover calories are not a prize.';
  if (insights.streak) return `${insights.streak}-day logging streak. Keep the average honest.`;
  return 'The week is underway. The average matters more than Tuesday.';
}
