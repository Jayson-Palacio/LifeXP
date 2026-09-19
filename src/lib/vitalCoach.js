import { ageFromBirthYear } from './nutrition';

/**
 * Calm, specific guidance. Not medical advice — estimates from energy-balance
 * research (Mifflin–St Jeor / Schofield) and protein ranges used in adult fat-loss.
 */
export function coachNote({ member, plan, eaten, mealCount, recentWeights }) {
  const name = member?.display_name || 'This person';
  const age = ageFromBirthYear(member?.birth_year);
  const child = member?.kind === 'child' || (age != null && age < 18);

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
        title: child ? 'Kids need enough to grow.' : 'Log the first meal. Targets can wait.',
        body: child
          ? 'We do not put children on calorie diets. Track what they actually eat so dinner stays ordinary.'
          : 'Tap a food. We will fill calories from the kitchen list. Set a plan when you want protein and a daily target.',
      };
    }
    return {
      kicker: name,
      title: `${mealCount} ${mealCount === 1 ? 'item' : 'items'} today`,
      body: child
        ? 'Nice. Regular meals beat a perfect log. Add height and weight later if you want a growth snapshot — not a diet.'
        : 'When you are ready, a short plan gives a calorie and protein target from your stats. Until then, keep logging.',
    };
  }

  if (child) {
    if (mealCount === 0) {
      return {
        kicker: name,
        title: 'Start with breakfast.',
        body: 'Childhood energy needs bounce with growth spurts. We estimate a range, never a cut. Protein at breakfast (eggs, yogurt, milk) makes the rest of the day easier.',
      };
    }
    const protein = Math.round(eaten.protein);
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
  const remaining = target ? Math.round(target - eaten.calories) : null;
  const proteinGap = proteinTarget ? Math.round(proteinTarget - eaten.protein) : null;

  if (mealCount === 0) {
    return {
      kicker: name,
      title: plan.intent === 'lose' ? 'Protein first, deficit second.' : 'Eat on a schedule. The math follows.',
      body: plan.intent === 'lose'
        ? `About ${target} kcal today, with ${proteinTarget}g protein. Front-load protein at the first meal so the deficit does not turn into a crash at 4pm.`
        : `Maintenance is about ${target} kcal. You do not need a perfect log — breakfast and a protein check are enough to steer.`,
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

  return {
    kicker: name,
    title: remaining != null ? `${remaining} kcal left in the day` : 'Keep the log light.',
    body: proteinGap != null && proteinGap > 0
      ? `Protein still wants about ${proteinGap}g. That is the lever that makes a modest calorie target feel livable.`
      : 'You are on the rails. Log what is in front of you and leave the rest of the evening alone.',
  };
}

export function familyStatusLine({ plan, eaten, mealCount, child }) {
  if (mealCount === 0) return child ? 'No meals yet' : 'Not started';
  if (child) return `${mealCount} logged`;
  if (!plan?.calorie_target) return `${Math.round(eaten.calories)} kcal`;
  const remaining = Math.round(plan.calorie_target - eaten.calories);
  if (remaining < 0) return `${Math.abs(remaining)} over`;
  return `${remaining} left`;
}
