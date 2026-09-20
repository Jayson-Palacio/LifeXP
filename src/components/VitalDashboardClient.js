'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BrandLogo from './BrandLogo';
import VitalChart from './VitalChart';
import VitalOnboarding from './VitalOnboarding';
import VitalRing from './VitalRing';
import VitalScanner from './VitalScanner';
import { FOODS, searchKitchen } from '../lib/foods';
import {
  ACTIVITY_LEVELS,
  DEFAULT_MOVES,
  FAMILY_SERVINGS,
  FOOD_MEALS,
  PLAN_METHODS,
  SERVING_OPTIONS,
  WORKOUT_KINDS,
  ageFromBirthYear,
  cmToIn,
  defaultMeal,
  defaultMethod,
  formatWeight,
  inferIntent,
  isStepLog,
  kgToLb,
  lbToKg,
  localDateISO,
  scaleServing,
  shiftDay,
  suggestedWeeklyChangeKg,
  sumMacros,
} from '../lib/nutrition';
import { activityWeek, adaptiveCheck, familyWeek, memberInsights } from '../lib/vitalAnalytics';
import { coachNote, weekSentence } from '../lib/vitalCoach';
import { cookTonight, encodeKitchenRecipe, safeHttpUrl, searchCookRecipes } from '../lib/vitalSuggest';
import { usualPlates } from '../lib/vitalPlates';
import {
  deleteVitalActivity,
  deleteVitalFood,
  deleteVitalKitchenItem,
  deleteVitalMove,
  logVitalActivity,
  logVitalFood,
  logVitalPlate,
  logVitalWeight,
  nudgeVitalCalories,
  pinVitalKitchen,
  saveVitalKitchenItem,
  saveVitalMember,
  saveVitalPlan,
  searchVitalFoods,
  serveVitalFood,
  updateVitalFood,
  updateVitalKitchenItem,
} from '../app/actions/vital';

const MEALS = FOOD_MEALS;
const DRINK_FOODS = FOODS.filter((item) => item.meal === 'drink');

const TABS = [
  { id: 'eat', label: 'Eat' },
  { id: 'move', label: 'Move' },
  { id: 'week', label: 'Week' },
  { id: 'plan', label: 'Plan' },
];

const MOVE_MINUTES = [15, 30, 45, 60];
const STEP_PRESETS = [4000, 6000, 8000, 10000];
const PIN_KEY = 'vital-quick-pins';

function MoveGlyph({ kind }) {
  return (
    <svg className="vital-move-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {kind === 'walk' && (
        <>
          <circle cx="12" cy="5" r="2.1" />
          <path d="M12 8.2v4.6M9.2 22l2.6-7.2 3.1 2.4 2 4.8M8.4 12.2h6.4l2.2-2" />
        </>
      )}
      {kind === 'run' && (
        <>
          <circle cx="14" cy="5" r="2.1" />
          <path d="m7 22 3.2-7.4 3.4 2.2 3.2 5.2M8 12l4.2-2.4 3.6 2.6 3.2-1.4" />
        </>
      )}
      {kind === 'bike' && (
        <>
          <circle cx="6.5" cy="16.5" r="3.2" />
          <circle cx="17.5" cy="16.5" r="3.2" />
          <path d="M6.5 16.5h5.2l3.2-7.2H10M14.8 9.3h4" />
        </>
      )}
      {kind === 'lift' && (
        <>
          <path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10" />
        </>
      )}
      {kind === 'play' && (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.7 5.7l1.7 1.7M16.6 16.6l1.7 1.7M18.3 5.7l-1.7 1.7M7.4 16.6l-1.7 1.7" />
        </>
      )}
      {kind === 'swim' && (
        <>
          <path d="M4 16c1.6-1.4 3.2-2 4.8-2s3.2.6 4.8 2 3.2 2 4.8 2 3.2-.6 4.8-2" />
          <path d="M4 11c1.6-1.4 3.2-2 4.8-2s3.2.6 4.8 2 3.2 2 4.8 2 3.2-.6 4.8-2" />
        </>
      )}
      {kind === 'yoga' && (
        <>
          <circle cx="12" cy="5" r="2.1" />
          <path d="M12 8v4M8 21l4-9 4 9M6 13h12" />
        </>
      )}
      {kind === 'hiit' && (
        <>
          <path d="M13 3 6 14h6l-1 7 7-11h-6Z" />
        </>
      )}
      {kind === 'sport' && (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 4v16M4 12h16M7.2 7.2c2 3.2 7.6 3.2 9.6 0M7.2 16.8c2-3.2 7.6-3.2 9.6 0" />
        </>
      )}
      {kind === 'steps' && (
        <>
          <circle cx="8" cy="6" r="1.8" />
          <path d="M8 8.5v4l-2.2 7M8 12.5l3 1.5 1.5 6" />
          <circle cx="16.5" cy="7.5" r="1.5" />
          <path d="M16.5 9.5v3.2l-1.6 5.2M16.5 12.4l2.4 1.2 1.2 4.6" />
        </>
      )}
      {kind === 'other' && (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v8M8 12h8" />
        </>
      )}
    </svg>
  );
}

function emptyPerson() {
  return { display_name: '', kind: 'adult', age: '', units: 'us' };
}

function emptyCustom() {
  return { name: '', calories: '', protein_g: '', carbs_g: '', fat_g: '', fiber_g: '' };
}

function emptyCookRecipe() {
  return {
    name: '',
    calories: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
    fiber_g: '',
    ingredients: '',
    url: '',
    notes: '',
    servings: '1',
  };
}

function macrosLabel(kcal, protein) {
  return `${Math.round(Number(kcal) || 0)} kcal · ${Math.round(Number(protein) || 0)}g protein`;
}

function isDrinkItem(item) {
  return item?.meal === 'drink' || /beer|wine|whiskey|cocktail|seltzer|ipa|margarita/i.test(item?.name || '');
}

function mealForLog(item, selected) {
  if (isDrinkItem(item) || (selected === 'drink' && isDrinkItem(item))) return 'drink';
  if (selected && selected !== 'drink') return selected;
  return item?.meal && item.meal !== 'drink' ? item.meal : 'snack';
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
  const intent = plan?.intent || (member?.kind === 'child' ? 'grow' : 'maintain');
  const weekly = plan?.weekly_change_kg
    ? (units === 'metric' ? Number(plan.weekly_change_kg) : Math.round(kgToLb(plan.weekly_change_kg) * 10) / 10)
    : '';
  return {
    units,
    sex: member?.sex || '',
    age,
    height,
    current_weight: current,
    target_weight: target,
    activity_level: member?.activity_level || 'moderate',
    intent,
    method: plan?.method || defaultMethod(intent),
    weekly_change: weekly,
    calorie_override: plan?.calorie_override ?? '',
    protein_override: plan?.protein_override ?? '',
    carbs_override: plan?.carbs_override ?? '',
    fat_override: plan?.fat_override ?? '',
    fiber_target_g: plan?.fiber_target_g ?? '',
    step_goal: plan?.step_goal ?? (member?.kind === 'child' ? 6000 : 8000),
  };
}

export default function VitalDashboardClient({
  members,
  plans,
  foods,
  weighIns,
  kitchen = [],
  activities = [],
  moves = [],
  suggestedKids = [],
  tableMissing,
  kitchenMissing,
  activityMissing,
  firstName = '',
}) {
  const router = useRouter();
  const today = localDateISO();
  const [memberId, setMemberId] = useState(members[0]?.id || '');
  const [tab, setTab] = useState('eat');
  const [cookIndex, setCookIndex] = useState(0);
  const [cookBusy, setCookBusy] = useState(false);
  const [cookQuery, setCookQuery] = useState('');
  const [cookPick, setCookPick] = useState(null);
  const [showCookAdd, setShowCookAdd] = useState(false);
  const [cookRecipe, setCookRecipe] = useState(() => emptyCookRecipe());
  const [serveCook, setServeCook] = useState(null);
  const [showPerson, setShowPerson] = useState(false);
  const [person, setPerson] = useState(() => emptyPerson());
  const [personError, setPersonError] = useState('');
  const [personBusy, setPersonBusy] = useState(false);
  const [query, setQuery] = useState('');
  const [meal, setMeal] = useState(defaultMeal);
  const [servings, setServings] = useState(1);
  const [foodError, setFoodError] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [weightError, setWeightError] = useState('');
  const [planError, setPlanError] = useState('');
  const [planBusy, setPlanBusy] = useState(false);
  const [plan, setPlan] = useState(() => planForm(members[0], plans.find((row) => row.member_id === members[0]?.id)));
  const [showScan, setShowScan] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [custom, setCustom] = useState(emptyCustom);
  const [plateBusy, setPlateBusy] = useState(false);
  const [moveKind, setMoveKind] = useState('walk');
  const [moveMinutes, setMoveMinutes] = useState('30');
  const [moveEffort, setMoveEffort] = useState('moderate');
  const [moveError, setMoveError] = useState('');
  const [editKitchen, setEditKitchen] = useState(null);
  const [moveNote, setMoveNote] = useState('');
  const [stepInput, setStepInput] = useState('');
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [showOnboard, setShowOnboard] = useState(false);
  const [pinIds, setPinIds] = useState([]);
  const [logYesterday, setLogYesterday] = useState(false);
  const [remoteMatches, setRemoteMatches] = useState([]);
  const [remoteBusy, setRemoteBusy] = useState(false);
  const [serveFood, setServeFood] = useState(null);
  const [servePortions, setServePortions] = useState({});
  const [editFood, setEditFood] = useState(null);
  const foodRef = useRef(null);

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
    const nextMember = members.find((row) => row.id === memberId);
    const nextPlan = plans.find((row) => row.member_id === memberId);
    setPlan(planForm(nextMember, nextPlan));
    const isChild = nextMember?.kind === 'child';
    setMoveKind(isChild ? 'play' : 'walk');
  }, [memberId, members, plans]);

  useEffect(() => {
    setCookIndex(0);
    setCookPick(null);
    setCookQuery('');
    setShowCookAdd(false);
    setCookRecipe(emptyCookRecipe());
  }, [memberId, meal]);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(PIN_KEY) || '[]');
      if (Array.isArray(saved)) setPinIds(saved.filter((id) => typeof id === 'string'));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (showCustom || q.length < 2) {
      setRemoteMatches([]);
      setRemoteBusy(false);
      return undefined;
    }
    let cancelled = false;
    setRemoteBusy(true);
    const timer = window.setTimeout(async () => {
      const result = await searchVitalFoods(q);
      if (cancelled) return;
      setRemoteBusy(false);
      if (result.success) setRemoteMatches(result.data || []);
    }, 280);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, showCustom]);

  const member = members.find((row) => row.id === memberId) || null;
  const memberPlan = plans.find((row) => row.member_id === memberId) || null;
  const memberFoods = useMemo(
    () => foods.filter((row) => row.member_id === memberId),
    [foods, memberId]
  );
  const memberActivity = useMemo(
    () => activities.filter((row) => row.member_id === memberId),
    [activities, memberId]
  );
  const todaysFoods = useMemo(
    () => memberFoods.filter((row) => row.logged_on === today),
    [memberFoods, today]
  );
  const todaysMove = useMemo(
    () => memberActivity.filter((row) => row.logged_on === today),
    [memberActivity, today]
  );
  const eaten = useMemo(() => sumMacros(todaysFoods), [todaysFoods]);
  const memberWeights = useMemo(
    () => weighIns.filter((row) => row.member_id === memberId),
    [weighIns, memberId]
  );
  const todayWeight = useMemo(
    () => memberWeights.find((row) => row.logged_on === today) || null,
    [memberWeights, today]
  );
  const age = ageFromBirthYear(member?.birth_year);
  const child = member?.kind === 'child' || (age != null && age < 18);
  const units = member?.units || 'us';
  const simple = memberPlan?.method === 'simple' || child;
  const todayWorkouts = todaysMove.filter((row) => !isStepLog(row));
  const todayMinutes = todayWorkouts.reduce((sum, row) => sum + Number(row.minutes || 0), 0);
  const todaySteps = todaysMove.reduce((sum, row) => sum + Number(row.steps || 0), 0);

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

  const logDate = logYesterday ? shiftDay(today, -1) : today;
  const usuals = useMemo(
    () => usualPlates({ foods: memberFoods, meal, logDate, today }),
    [memberFoods, meal, logDate, today]
  );
  const journalFoods = useMemo(
    () => memberFoods.filter((row) => row.logged_on === logDate),
    [memberFoods, logDate]
  );
  const journalEaten = useMemo(() => sumMacros(journalFoods), [journalFoods]);
  const lastMove = todayWorkouts[0] || memberActivity.find((row) => !isStepLog(row)) || null;
  const localMatches = query.trim() ? searchKitchen(query, kitchen) : [];
  const matches = useMemo(() => {
    const seen = new Set(localMatches.map((row) => row.name.toLowerCase()));
    const extra = remoteMatches.filter((row) => !seen.has(row.name.toLowerCase()));
    return [...localMatches, ...extra].slice(0, 8);
  }, [localMatches, remoteMatches]);
  const hour = new Date().getHours();
  const pinPool = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const row of [...kitchen, ...recents]) {
      const key = String(row.name || '').trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      list.push(row);
    }
    return list;
  }, [kitchen, recents]);
  const dbPins = useMemo(
    () => [...kitchen].filter((row) => row.pin_rank != null).sort((a, b) => a.pin_rank - b.pin_rank),
    [kitchen]
  );
  const pinNames = pinIds.length ? pinIds : dbPins.map((row) => row.name);
  const quickFoods = useMemo(() => {
    const pinned = pinNames
      .map((key) => pinPool.find((row) => row.name.toLowerCase() === String(key).toLowerCase() || row.id === key))
      .filter(Boolean);
    const rest = pinPool.filter((row) => !pinned.some((item) => item.name.toLowerCase() === row.name.toLowerCase()));
    return [...pinned, ...rest].slice(0, 10);
  }, [pinPool, pinNames]);
  const weekStrip = useMemo(
    () => activityWeek({ activities: memberActivity, today }),
    [memberActivity, today]
  );
  const stepGoal = memberPlan?.step_goal || (child ? 6000 : 8000);
  const insights = useMemo(
    () => memberInsights({
      plan: memberPlan,
      foods: memberFoods,
      weighIns: memberWeights,
      activities: memberActivity,
      today,
      units,
      child,
    }),
    [memberPlan, memberFoods, memberWeights, memberActivity, today, units, child]
  );
  const houseWeek = useMemo(
    () => familyWeek({ members, plans, foods, activities, today }),
    [members, plans, foods, activities, today]
  );
  const adaptive = useMemo(
    () => adaptiveCheck({ plan: memberPlan, member, insights, child }),
    [memberPlan, member, insights, child]
  );

  const peopleStatus = members.map((personRow) => ({
    person: personRow,
    ate: foods.some((row) => row.member_id === personRow.id && row.logged_on === today),
    moved: activities.some((row) => row.member_id === personRow.id && row.logged_on === today),
  }));

  const moveKinds = child
    ? WORKOUT_KINDS.filter((item) => ['play', 'walk', 'bike', 'sport', 'swim'].includes(item.id))
    : WORKOUT_KINDS;

  const selectMember = (id) => {
    setMemberId(id);
    setTab('eat');
    try { window.localStorage.setItem('vital-member', id); } catch { /* ignore */ }
  };

  const focusLog = (mealId) => {
    if (mealId) setMeal(mealId);
    setTab('eat');
    window.setTimeout(() => foodRef.current?.focus(), 30);
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
      setShowPerson(false);
    }
    router.refresh();
  };

  const addFood = async (item, extras = {}) => {
    if (!member) return;
    setFoodError('');
    const portion = extras.servings ?? servings;
    const hasMacros = item.calories != null && item.calories !== '';
    const scaled = hasMacros ? scaleServing(item, portion) : item;
    const result = await logVitalFood({
      member_id: member.id,
      name: item.name,
      calories: hasMacros ? scaled.calories : undefined,
      protein_g: hasMacros ? scaled.protein_g : item.protein_g,
      carbs_g: hasMacros ? scaled.carbs_g : item.carbs_g,
      fat_g: hasMacros ? scaled.fat_g : item.fat_g,
      fiber_g: hasMacros ? scaled.fiber_g : item.fiber_g,
      servings: hasMacros ? 1 : portion,
      meal: extras.meal || mealForLog(item, meal),
      logged_on: logDate,
      barcode: item.barcode,
    });
    if (!result.success) {
      setFoodError(result.error);
      return false;
    }
    setQuery('');
    setShowCustom(false);
    setCustom(emptyCustom());
    router.refresh();
    return true;
  };

  const logCookPlate = async (dish, targets) => {
    if (!member || !dish?.items?.length) return;
    setCookBusy(true);
    setFoodError('');
    const people = targets?.length ? targets : [{ member_id: member.id, servings: 1 }];
    for (const target of people) {
      const portion = Number(target.servings) || 1;
      if (portion <= 0) continue;
      for (const item of dish.items) {
        const scaled = scaleServing(item, portion);
        const result = await logVitalFood({
          member_id: target.member_id,
          name: item.name,
          calories: scaled.calories,
          protein_g: scaled.protein_g,
          carbs_g: scaled.carbs_g,
          fat_g: scaled.fat_g,
          fiber_g: scaled.fiber_g,
          servings: 1,
          meal: dish.meal || meal,
          logged_on: logDate,
        });
        if (!result.success) {
          setFoodError(result.error);
          setCookBusy(false);
          return;
        }
      }
    }
    setCookBusy(false);
    setServeCook(null);
    router.refresh();
  };

  const handleCustomFood = async (event) => {
    event.preventDefault();
    if (!showCustom && matches[0]) {
      await addFood(matches[0]);
      return;
    }
    if (!showCustom && query.trim()) {
      setShowCustom(true);
      setCustom((prev) => ({ ...prev, name: query }));
      setFoodError('No catalog match yet. Add calories to save it.');
      return;
    }
    const item = { ...custom, name: custom.name || query };
    await addFood(item, meal === 'drink' ? { meal: 'drink' } : {});
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
    await addFood({ ...item, meal: mealForLog(item, meal) });
  };

  const handleUsualPlate = async (plate) => {
    if (!member || !plate?.items?.length || plateBusy) return;
    setPlateBusy(true);
    setFoodError('');
    const result = await logVitalPlate({
      member_id: member.id,
      meal: plate.meal || meal,
      logged_on: logDate,
      servings: 1,
      items: plate.items,
    });
    setPlateBusy(false);
    if (!result.success) setFoodError(result.error);
    else router.refresh();
  };

  const handleSaveCookRecipe = async (event, { logAfter = true } = {}) => {
    event.preventDefault();
    if (!member || !cookSlot) return;
    const name = String(cookRecipe.name || '').trim();
    const plates = Math.max(1, Math.min(24, Number(cookRecipe.servings) || 1));
    const totalKcal = Number(cookRecipe.calories);
    if (!name) {
      setFoodError('Give this recipe a name.');
      return;
    }
    if (!Number.isFinite(totalKcal) || totalKcal < 0) {
      setFoodError('Add calories for the pot, or for one plate.');
      return;
    }
    if (cookRecipe.protein_g === '' || Number(cookRecipe.protein_g) < 0) {
      setFoodError('Add protein for the pot, or for one plate.');
      return;
    }
    const linkRaw = String(cookRecipe.url || '').trim();
    if (linkRaw && !safeHttpUrl(linkRaw)) {
      setFoodError('Use a web link that starts with http.');
      return;
    }
    const per = (value) => Math.round(((Number(value) || 0) / plates) * 10) / 10;
    setCookBusy(true);
    setFoodError('');
    const payload = {
      name,
      calories: Math.round(totalKcal / plates),
      protein_g: per(cookRecipe.protein_g),
      carbs_g: per(cookRecipe.carbs_g),
      fat_g: per(cookRecipe.fat_g),
      fiber_g: per(cookRecipe.fiber_g),
      meal: cookSlot,
      barcode: encodeKitchenRecipe({
        ingredients: cookRecipe.ingredients,
        url: linkRaw,
        notes: cookRecipe.notes,
        servings: plates,
        meal: cookSlot,
      }),
    };
    const saved = await saveVitalKitchenItem(payload);
    if (!saved.success) {
      setFoodError(saved.error);
      setCookBusy(false);
      return;
    }
    if (logAfter) {
      const ok = await addFood(payload, { meal: cookSlot });
      setCookBusy(false);
      if (!ok) return;
    } else {
      setCookBusy(false);
      router.refresh();
    }
    setShowCookAdd(false);
    setCookRecipe(emptyCookRecipe());
  };

  const handleMove = async (event) => {
    event.preventDefault();
    if (!member) return;
    setMoveError('');
    const result = await logVitalActivity({
      member_id: member.id,
      kind: moveKind,
      minutes: moveMinutes,
      effort: moveEffort,
      note: moveNote,
      logged_on: today,
    });
    if (!result.success) setMoveError(result.error);
    else {
      setMoveNote('');
      router.refresh();
    }
  };

  const handleSteps = async (count) => {
    if (!member) return;
    setMoveError('');
    const steps = Number(count || stepInput);
    const result = await logVitalActivity({
      member_id: member.id,
      kind: 'steps',
      steps,
      effort: 'moderate',
      logged_on: today,
    });
    if (!result.success) setMoveError(result.error);
    else {
      setStepInput('');
      router.refresh();
    }
  };

  const savePins = async (ids) => {
    const keys = ids.map((key) => {
      const row = pinPool.find((item) => item.id === key || item.name === key);
      return row?.name || key;
    }).filter(Boolean);
    setPinIds(keys);
    try { window.localStorage.setItem(PIN_KEY, JSON.stringify(keys)); } catch { /* ignore */ }
    setShowQuickEdit(false);
    for (const name of keys) {
      const row = pinPool.find((item) => item.name.toLowerCase() === name.toLowerCase());
      const inKitchen = kitchen.some((item) => item.name.toLowerCase() === name.toLowerCase());
      if (row && !inKitchen) {
        await saveVitalKitchenItem({
          name: row.name,
          calories: row.calories,
          protein_g: row.protein_g,
          carbs_g: row.carbs_g,
          fat_g: row.fat_g,
          fiber_g: row.fiber_g,
        });
      }
    }
    await pinVitalKitchen(keys);
    router.refresh();
  };

  const logShortcut = async (row) => {
    setMoveError('');
    const result = await logVitalActivity({
      member_id: member.id,
      kind: row.kind,
      minutes: row.minutes,
      effort: row.effort,
      label: row.label,
      logged_on: today,
    });
    if (!result.success) setMoveError(result.error);
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
    setTab('eat');
    router.refresh();
  };

  const handleKitchenEdit = async (event) => {
    event.preventDefault();
    if (!editKitchen) return;
    const result = await updateVitalKitchenItem(editKitchen);
    if (!result.success) {
      setFoodError(result.error);
      return;
    }
    setEditKitchen(null);
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
  const moveGoalToday = child ? 60 : 30;
  const calorieTarget = memberPlan?.calorie_target || 0;
  const proteinTarget = memberPlan?.protein_target_g || 0;
  const fiberTarget = memberPlan?.fiber_target_g || 0;
  const kcalLeft = calorieTarget ? Math.round(calorieTarget - eaten.calories) : null;
  const proteinLeft = proteinTarget ? Math.round(proteinTarget - eaten.protein) : null;
  const cookSlot = meal === 'breakfast' || meal === 'lunch' || meal === 'dinner' ? meal : null;
  const cook = cookTonight({
    kitchen,
    remainingKcal: simple ? null : kcalLeft,
    remainingProtein: proteinLeft,
    child,
    hour,
    slot: cookSlot || undefined,
    simple,
  });
  const cookHits = useMemo(
    () => (cookSlot && cookQuery.trim().length >= 2
      ? searchCookRecipes(cookQuery, { slot: cookSlot, child, kitchen, hay: kitchen.map((row) => row.name).join(' | ') })
      : []),
    [cookQuery, cookSlot, child, kitchen]
  );
  const idea = cookPick
    || (cook.ideas.length ? cook.ideas[cookIndex % cook.ideas.length] : null);
  const weekLine = weekSentence({ insights, child });
  const coach = coachNote({
    member,
    plan: memberPlan,
    eaten,
    mealCount: todaysFoods.length,
    recentWeights: memberWeights.slice(-7),
    todayMoveMinutes: todayMinutes,
    strengthDays: insights.strengthDays,
    child,
    hour,
    adaptive,
  });
  const savedMoves = moves.length ? moves : DEFAULT_MOVES;
  const rings = [];
  if (simple) {
    rings.push({
      id: 'protein',
      label: 'Protein',
      value: eaten.protein,
      max: proteinTarget || 90,
      remain: true,
      caption: `${Math.round(eaten.protein)} of ${proteinTarget || 90}g`,
      color: 'var(--vital-protein)',
    });
    if (fiberTarget) {
      rings.push({
        id: 'fiber',
        label: 'Fiber',
        value: eaten.fiber,
        max: fiberTarget,
        remain: true,
        caption: `${Math.round(eaten.fiber)} of ${fiberTarget}g`,
        color: 'var(--vital-fiber)',
      });
    }
    rings.push({
      id: 'move',
      label: child ? 'Play' : 'Move',
      value: todayMinutes,
      max: moveGoalToday,
      unit: 'min',
      caption: `${todayMinutes} of ${moveGoalToday} min`,
      color: 'var(--vital-move)',
    });
  } else if (calorieTarget) {
    rings.push({
      id: 'energy',
      label: 'Calories',
      value: eaten.calories,
      max: calorieTarget,
      remain: true,
      caption: `${Math.round(eaten.calories).toLocaleString()} of ${calorieTarget.toLocaleString()}`,
      color: 'var(--vital-energy)',
    });
    if (proteinTarget) {
      rings.push({
        id: 'protein',
        label: 'Protein',
        value: eaten.protein,
        max: proteinTarget,
        remain: true,
        caption: `${Math.round(eaten.protein)} of ${proteinTarget}g`,
        color: 'var(--vital-protein)',
      });
    }
    rings.push({
      id: 'move',
      label: 'Move',
      value: todayMinutes,
      max: moveGoalToday,
      unit: 'min',
      caption: `${todayMinutes} of ${moveGoalToday} min`,
      color: 'var(--vital-move)',
    });
  } else {
    rings.push({
      id: 'meals',
      label: 'Meals',
      value: todaysFoods.length,
      max: 4,
      unit: '',
      caption: `${todaysFoods.length} logged`,
      color: 'var(--vital-energy)',
    });
    rings.push({
      id: 'move',
      label: child ? 'Play' : 'Move',
      value: todayMinutes,
      max: moveGoalToday,
      unit: 'min',
      caption: `${todayMinutes} of ${moveGoalToday} min`,
      color: 'var(--vital-move)',
    });
  }

  const needsFirstRun = !tableMissing && (!members.length || !plans.some((row) => row.calorie_target));
  const onboardOpen = needsFirstRun || showOnboard;
  const onboardMember = member || members[0] || null;
  const onboardPlan = plans.find((row) => row.member_id === onboardMember?.id) || null;

  return (
    <div className="vital-app">
      <header className="vital-top">
        <div className="vital-top-brand">
          <BrandLogo href="/apps" size="sm" tone="ink" />
          <span>Vital</span>
        </div>
        <Link href="/apps?tab=account" className="vital-text-btn">Account</Link>
        <Link href="/apps" className="vital-text-btn">Apps</Link>
      </header>

      {onboardOpen ? (
        <VitalOnboarding
          firstName={firstName}
          member={onboardMember}
          plan={onboardPlan}
          onDone={() => {
            setShowOnboard(false);
            router.refresh();
          }}
          onCancel={needsFirstRun ? undefined : () => setShowOnboard(false)}
        />
      ) : (
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
        {activityMissing && (
          <div className="vital-card vital-warn">
            <strong>Movement is not saved yet.</strong>
            <p>Run the latest <code>vital_schema.sql</code> so walks, lifts, and play can persist.</p>
          </div>
        )}

        <div className="vital-people">
          {peopleStatus.map(({ person: row, ate, moved }) => (
            <button
              key={row.id}
              type="button"
              className={`vital-person${row.id === memberId ? ' is-active' : ''}${ate || moved ? ' is-logged' : ''}`}
              onClick={() => selectMember(row.id)}
            >
              <span className="vital-avatar" style={{ background: row.accent }}>
                {row.display_name.slice(0, 1)}
                {(ate || moved) && <i className="vital-person-dot" />}
              </span>
              <span className="vital-person-name">{row.display_name}</span>
            </button>
          ))}
          <button
            type="button"
            className="vital-person vital-person-add"
            onClick={() => { setPerson(emptyPerson()); setShowPerson(true); }}
          >
            <span className="vital-avatar vital-avatar-add">+</span>
            <span className="vital-person-name">Add</span>
          </button>
        </div>

        {member && (
          <>
            <section className="vital-hero">
              <div className="vital-hero-copy">
                <p className="vital-kicker">{coach.kicker}</p>
                <h1>{coach.title}</h1>
                <p>{coach.body}</p>
                {(calorieTarget || proteinTarget) ? (
                  <div className="vital-budget">
                    {calorieTarget ? (
                      <div>
                        <span>Calories today</span>
                        <strong>{Math.abs(kcalLeft).toLocaleString()}</strong>
                        <em>{kcalLeft < 0 ? 'over' : 'left'} · {calorieTarget.toLocaleString()} target</em>
                      </div>
                    ) : null}
                    {proteinTarget ? (
                      <div>
                        <span>Protein today</span>
                        <strong>{Math.abs(proteinLeft)}g</strong>
                        <em>{proteinLeft < 0 ? 'over' : 'to go'} · {proteinTarget}g target</em>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {!simple && insights.loggedDays >= 2 && insights.avgKcal ? (
                  <p className="vital-week-line">
                    This week averaging {insights.avgKcal.toLocaleString()} vs {calorieTarget.toLocaleString()}
                    {insights.weekUnder != null
                      ? ` · ${Math.abs(Math.round(insights.weekUnder)).toLocaleString()} ${insights.weekUnder < 0 ? 'over' : 'under'} across logged days`
                      : ''}
                  </p>
                ) : null}
                <button type="button" className="vital-hero-link" onClick={() => setTab('week')}>
                  {insights.streak
                    ? `${insights.weekScore}/5 this week · ${insights.streak}-day streak`
                    : insights.loggedDays
                      ? `${insights.weekScore}/5 this week · Week`
                      : 'Open Week'}
                </button>
              </div>
              <div className="vital-rings" aria-label="Today’s rings">
                {rings.map((ring) => (
                  <button
                    key={ring.id}
                    type="button"
                    className="vital-ring-hit"
                    onClick={() => setTab(ring.id === 'move' ? 'move' : 'eat')}
                  >
                    <VitalRing {...ring} size={rings.length > 3 ? 96 : 118} />
                  </button>
                ))}
              </div>
            </section>

            <nav className="vital-tabs" aria-label="Vital">
              {(child
                ? TABS.map((item) => (item.id === 'move' ? { ...item, label: 'Play' } : item))
                : TABS
              ).map((item) => (
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

            {tab === 'eat' && (
              <section className="vital-board">
                <div className="vital-board-log">
                  <form onSubmit={showCustom ? handleSaveCustom : handleCustomFood} className="vital-card vital-composer">
                    <div className="vital-card-head">
                      <p className="vital-kicker">{logYesterday ? 'Logging yesterday' : 'Log a meal'}</p>
                      <div className="vital-meals">
                        <button type="button" className={!logYesterday ? 'is-active' : ''} onClick={() => setLogYesterday(false)}>Today</button>
                        <button type="button" className={logYesterday ? 'is-active' : ''} onClick={() => setLogYesterday(true)}>Yesterday</button>
                      </div>
                    </div>
                    <div className="vital-composer-search">
                      <input
                        id="vital-food"
                        ref={foodRef}
                        className="vital-input vital-input-lg"
                        value={showCustom ? custom.name : query}
                        onChange={(e) => {
                          if (showCustom) setCustom({ ...custom, name: e.target.value });
                          else setQuery(e.target.value);
                        }}
                        placeholder="What did you eat?"
                        autoComplete="off"
                      />
                      <button type="button" className="vital-icon-btn" onClick={() => setShowScan(true)}>
                        Scan
                      </button>
                    </div>
                    {meal !== 'drink' && !query.trim() && !showCustom && usuals.length > 0 && (
                      <div className="vital-usual">
                        <p className="vital-kicker">Usual</p>
                        <div className="vital-usual-chips">
                          {usuals.map((plate) => (
                            <button
                              key={plate.id}
                              type="button"
                              className="vital-chip is-usual"
                              disabled={plateBusy}
                              onClick={() => handleUsualPlate(plate)}
                            >
                              {plate.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {meal !== 'drink' && (quickFoods.length > 0 || recents.length > 0 || kitchen.length > 0) && (
                      <div className="vital-quick-foods">
                        {quickFoods.map((row) => (
                          <button
                            key={row.id || row.name}
                            type="button"
                            className={`vital-chip${pinNames.some((name) => name.toLowerCase() === row.name.toLowerCase()) ? ' is-pinned' : ''}`}
                            onClick={() => addFood(row)}
                          >
                            {row.name}
                          </button>
                        ))}
                        {recents.filter((row) => !quickFoods.some((item) => item.name.toLowerCase() === row.name.toLowerCase())).slice(0, 3).map((row) => (
                          <button key={row.id} type="button" className="vital-chip" onClick={() => addFood(row)}>
                            {row.name}
                          </button>
                        ))}
                        <button type="button" className="vital-text-btn" onClick={() => {
                          setPinIds((prev) => (prev.length ? prev : dbPins.map((row) => row.name)));
                          setShowQuickEdit(true);
                        }}>
                          Edit
                        </button>
                      </div>
                    )}
                    {meal === 'drink' && !child && (
                      <div className="vital-quick-foods">
                        {DRINK_FOODS.map((row) => (
                          <button key={row.name} type="button" className="vital-chip" onClick={() => addFood({ ...row, meal: 'drink' })}>
                            {row.name}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="vital-composer-meta">
                      <div className="vital-meals">
                        {(child ? MEALS.filter((item) => item.id !== 'drink') : MEALS).map((item) => (
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
                      <div className="vital-meals">
                        {SERVING_OPTIONS.map((size) => (
                          <button
                            key={size}
                            type="button"
                            className={servings === size ? 'is-active' : ''}
                            onClick={() => setServings(size)}
                          >
                            {size === 1 ? '1×' : `${size}×`}
                          </button>
                        ))}
                      </div>
                    </div>
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
                        <div>
                          <label htmlFor="custom_fiber">Fiber</label>
                          <input id="custom_fiber" className="vital-input" type="number" min="0" step="0.1" value={custom.fiber_g} onChange={(e) => setCustom({ ...custom, fiber_g: e.target.value })} />
                        </div>
                      </div>
                    )}
                    {!showCustom && query.trim() && (
                      <div className="vital-matches">
                        {matches.map((item) => {
                          const preview = scaleServing(item, servings);
                          return (
                            <button key={`${item.source || 'x'}-${item.id || item.name}`} type="button" onClick={() => addFood(item)}>
                              <span>
                                {item.name}
                                {item.source === 'kitchen' && <i>Kitchen</i>}
                                {item.source === 'store' && <i>{item.brand || (item.store === 'sams' ? "Sam's" : 'Walmart')}</i>}
                                {item.source === 'search' && <i>{item.serving === '100g' ? '100g' : 'Database'}</i>}
                              </span>
                              <em>{preview.calories}</em>
                            </button>
                          );
                        })}
                        {matches.length === 0 && (
                          <p className="vital-muted vital-match-empty">
                            {remoteBusy || query.trim().length < 2
                              ? `Looking up “${query.trim()}”…`
                              : 'No match. Tap New food and add calories to save it.'}
                          </p>
                        )}
                      </div>
                    )}
                    {foodError && <p className="vital-err">{foodError}</p>}
                    <div className="vital-composer-actions">
                      <button type="submit" className="vital-btn" disabled={showCustom ? !custom.calories : !query.trim()}>
                        {showCustom ? 'Save and log' : 'Log it'}
                      </button>
                      {logYesterday ? (
                        <span className="vital-muted">Adds to yesterday’s journal.</span>
                      ) : null}
                      {showCustom ? (
                        <button type="button" className="vital-text-btn" onClick={() => setShowCustom(false)}>Cancel</button>
                      ) : (
                        <button type="button" className="vital-text-btn" onClick={() => { setShowCustom(true); setCustom((prev) => ({ ...prev, name: query })); }}>
                          New food
                        </button>
                      )}
                    </div>
                  </form>

                  {cookSlot && !logYesterday && (
                    <div className="vital-card vital-plate">
                      <div className="vital-card-head">
                        <p className="vital-kicker">{cook.kicker}</p>
                        <div className="vital-plate-head-actions">
                          {!showCookAdd && !cookQuery.trim() && cook.ideas.length > 1 && (
                            <button type="button" className="vital-text-btn" onClick={() => { setCookPick(null); setCookIndex((index) => index + 1); }}>
                              Another idea
                            </button>
                          )}
                          <Link href="/table" className="vital-text-btn">Plan week</Link>
                          <button
                            type="button"
                            className="vital-text-btn"
                            onClick={() => {
                              setShowCookAdd((open) => {
                                const next = !open;
                                if (next) {
                                  const fromSearch = cookQuery.trim();
                                  if (fromSearch) {
                                    setCookRecipe((prev) => ({ ...prev, name: prev.name || fromSearch }));
                                  }
                                } else {
                                  setCookRecipe(emptyCookRecipe());
                                  setFoodError('');
                                }
                                return next;
                              });
                              setCookQuery('');
                            }}
                          >
                            {showCookAdd ? 'Cancel' : 'Add recipe'}
                          </button>
                        </div>
                      </div>
                      {!showCookAdd && (
                        <div className="vital-cook-search">
                          <label htmlFor="vital-cook-search" className="vital-sr">Search recipes</label>
                          <input
                            id="vital-cook-search"
                            className="vital-input"
                            value={cookQuery}
                            onChange={(e) => { setCookQuery(e.target.value); setCookPick(null); }}
                            placeholder="Search recipes"
                            autoComplete="off"
                          />
                        </div>
                      )}
                      {showCookAdd ? (
                        <form onSubmit={(event) => handleSaveCookRecipe(event, { logAfter: true })} className="vital-cook-add">
                          <p>Save a {cookSlot} you cook. Numbers are for the whole pot if you make more than one plate.</p>
                          <label htmlFor="cook_recipe_name">Recipe name</label>
                          <input
                            id="cook_recipe_name"
                            className="vital-input"
                            value={cookRecipe.name}
                            onChange={(e) => setCookRecipe({ ...cookRecipe, name: e.target.value })}
                            placeholder="Turkey chili"
                            maxLength={120}
                            required
                          />
                          <label htmlFor="cook_recipe_ings">Ingredients</label>
                          <textarea
                            id="cook_recipe_ings"
                            className="vital-input"
                            rows={3}
                            value={cookRecipe.ingredients}
                            onChange={(e) => setCookRecipe({ ...cookRecipe, ingredients: e.target.value })}
                            placeholder="Ground turkey, beans, chili powder"
                          />
                          <label htmlFor="cook_recipe_url">Recipe link</label>
                          <input
                            id="cook_recipe_url"
                            className="vital-input"
                            type="text"
                            inputMode="url"
                            value={cookRecipe.url}
                            onChange={(e) => setCookRecipe({ ...cookRecipe, url: e.target.value })}
                            placeholder="https://"
                          />
                          <label htmlFor="cook_recipe_notes">How you cook it</label>
                          <textarea
                            id="cook_recipe_notes"
                            className="vital-input"
                            rows={3}
                            value={cookRecipe.notes}
                            onChange={(e) => setCookRecipe({ ...cookRecipe, notes: e.target.value })}
                            placeholder="Brown the turkey, simmer 20 minutes"
                            maxLength={400}
                          />
                          <div className="vital-grid">
                            <div>
                              <label htmlFor="cook_recipe_servings">Plates this makes</label>
                              <input
                                id="cook_recipe_servings"
                                className="vital-input"
                                type="number"
                                min="1"
                                max="24"
                                value={cookRecipe.servings}
                                onChange={(e) => setCookRecipe({ ...cookRecipe, servings: e.target.value })}
                              />
                            </div>
                            <div>
                              <label htmlFor="cook_recipe_kcal">Calories</label>
                              <input
                                id="cook_recipe_kcal"
                                className="vital-input"
                                type="number"
                                min="0"
                                value={cookRecipe.calories}
                                onChange={(e) => setCookRecipe({ ...cookRecipe, calories: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <label htmlFor="cook_recipe_p">Protein</label>
                              <input
                                id="cook_recipe_p"
                                className="vital-input"
                                type="number"
                                min="0"
                                step="0.1"
                                value={cookRecipe.protein_g}
                                onChange={(e) => setCookRecipe({ ...cookRecipe, protein_g: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <label htmlFor="cook_recipe_c">Carbs</label>
                              <input
                                id="cook_recipe_c"
                                className="vital-input"
                                type="number"
                                min="0"
                                step="0.1"
                                value={cookRecipe.carbs_g}
                                onChange={(e) => setCookRecipe({ ...cookRecipe, carbs_g: e.target.value })}
                              />
                            </div>
                            <div>
                              <label htmlFor="cook_recipe_f">Fat</label>
                              <input
                                id="cook_recipe_f"
                                className="vital-input"
                                type="number"
                                min="0"
                                step="0.1"
                                value={cookRecipe.fat_g}
                                onChange={(e) => setCookRecipe({ ...cookRecipe, fat_g: e.target.value })}
                              />
                            </div>
                            <div>
                              <label htmlFor="cook_recipe_fiber">Fiber</label>
                              <input
                                id="cook_recipe_fiber"
                                className="vital-input"
                                type="number"
                                min="0"
                                step="0.1"
                                value={cookRecipe.fiber_g}
                                onChange={(e) => setCookRecipe({ ...cookRecipe, fiber_g: e.target.value })}
                              />
                            </div>
                          </div>
                          {Number(cookRecipe.servings) > 1 && Number(cookRecipe.calories) > 0 && (
                            <p className="vital-muted">
                              One plate saves as {macrosLabel(
                                Number(cookRecipe.calories) / Math.max(1, Number(cookRecipe.servings) || 1),
                                Number(cookRecipe.protein_g || 0) / Math.max(1, Number(cookRecipe.servings) || 1)
                              )}.
                            </p>
                          )}
                          {foodError && <p className="vital-err">{foodError}</p>}
                          <div className="vital-cook-add-actions">
                            <button
                              type="button"
                              className="vital-btn vital-btn-quiet"
                              disabled={cookBusy || !cookRecipe.name.trim() || cookRecipe.calories === '' || cookRecipe.protein_g === ''}
                              onClick={(event) => handleSaveCookRecipe(event, { logAfter: false })}
                            >
                              {cookBusy ? 'Saving…' : 'Save recipe'}
                            </button>
                            <button type="submit" className="vital-btn" disabled={cookBusy || !cookRecipe.name.trim() || cookRecipe.calories === '' || cookRecipe.protein_g === ''}>
                              {cookBusy ? 'Saving…' : 'Save and log'}
                            </button>
                          </div>
                        </form>
                      ) : cookHits.length > 0 ? (
                        <div className="vital-matches vital-cook-hits">
                          {cookHits.map((hit) => (
                            <button
                              key={hit.id || hit.title}
                              type="button"
                              onClick={() => { setCookPick(hit); setCookQuery(''); }}
                            >
                              <span>
                                {hit.title}
                                <i>{hit.saved ? 'Yours' : (hit.recipeSource || 'Recipe')}</i>
                              </span>
                              <em>{macrosLabel(hit.kcal, hit.protein)}</em>
                            </button>
                          ))}
                        </div>
                      ) : cookQuery.trim().length >= 2 ? (
                        <p className="vital-muted">No recipe for that. Add one, or try chili, tacos, eggs.</p>
                      ) : idea ? (
                        <>
                          <h2>{idea.title}</h2>
                          <p className="vital-plate-macros">{macrosLabel(idea.kcal, idea.protein)}</p>
                          {idea.why ? <p>{idea.why}</p> : null}
                          {idea.notes ? <p className="vital-plate-notes">{idea.notes}</p> : null}
                          {idea.ingredients.length > 0 && (
                            <p className="vital-plate-ings">{idea.ingredients.join(' · ')}</p>
                          )}
                          <div className="vital-plate-actions">
                            {idea.recipeUrl && (
                              <a
                                className="vital-btn vital-btn-quiet"
                                href={idea.recipeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Recipe{idea.recipeSource ? ` · ${idea.recipeSource}` : ''}
                              </a>
                            )}
                            {idea.items.length > 0 && (
                              <button type="button" className="vital-btn" disabled={cookBusy} onClick={() => logCookPlate(idea)}>
                                {cookBusy ? 'Logging…' : 'Log this plate'}
                              </button>
                            )}
                            {members.length > 1 && idea.items.length > 0 && (
                              <button
                                type="button"
                                className="vital-btn vital-btn-quiet"
                                onClick={() => {
                                  const next = {};
                                  members.forEach((row) => { next[row.id] = 1; });
                                  setServePortions(next);
                                  setServeCook(idea);
                                }}
                              >
                                Serve
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        <p className="vital-muted">Search a recipe, or add one you cook.</p>
                      )}
                    </div>
                  )}
                </div>

                <aside className="vital-journal">
                  <div className="vital-card vital-journal-card">
                    <div className="vital-card-head">
                      <p className="vital-kicker">{logYesterday ? 'Yesterday' : 'Today'}</p>
                      <span>
                        {calorieTarget
                          ? `${Math.round(journalEaten.calories).toLocaleString()} / ${calorieTarget.toLocaleString()} kcal · ${Math.round(journalEaten.protein)}g protein`
                          : `${Math.round(journalEaten.calories)} kcal · ${Math.round(journalEaten.protein)}g protein`}
                      </span>
                    </div>
                    <div className="vital-meal-board">
                      {MEALS.filter((item) => item.id !== 'drink').map((group) => {
                        const rows = journalFoods.filter((row) => row.meal === group.id || (group.id === 'snack' && row.meal === 'drink'));
                        const mealKcal = rows.reduce((sum, row) => sum + Number(row.calories || 0), 0);
                        const mealProtein = rows.reduce((sum, row) => sum + Number(row.protein_g || 0), 0);
                        return (
                          <div key={group.id} className="vital-meal-col">
                            <div className="vital-meal-col-head">
                              <strong>{group.label}</strong>
                              <span>{rows.length ? `${Math.round(mealKcal)} · ${Math.round(mealProtein)}g` : ''}</span>
                              <button type="button" className="vital-add-dot" onClick={() => focusLog(group.id)} aria-label={`Add ${group.label}`}>
                                +
                              </button>
                            </div>
                            {rows.length === 0 && (
                              <button type="button" className="vital-meal-empty" onClick={() => focusLog(group.id)}>
                                Add
                              </button>
                            )}
                            {rows.map((row) => (
                              <div key={row.id} className="vital-food-pill">
                                <div>
                                  <strong>{row.name}</strong>
                                  <p className="vital-food-pill-meta">
                                    {row.calories} kcal · {Math.round(Number(row.protein_g) || 0)}g
                                    {row.meal === 'drink' ? ' · drink' : ''}
                                  </p>
                                </div>
                                <div className="vital-row-actions">
                                  <button type="button" className="vital-text-btn" onClick={() => setEditFood(row)}>Size</button>
                                  {members.length > 1 && (
                                    <button
                                      type="button"
                                      className="vital-text-btn"
                                      onClick={() => {
                                        const next = {};
                                        members.filter((personRow) => personRow.id !== memberId).forEach((personRow) => {
                                          next[personRow.id] = 1;
                                        });
                                        setServePortions(next);
                                        setServeFood(row);
                                      }}
                                    >
                                      Serve
                                    </button>
                                  )}
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
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                    {!logYesterday && (todayWorkouts.length > 0 || todaySteps > 0) && (
                      <button type="button" className="vital-move-jump" onClick={() => setTab('move')}>
                        {todaySteps > 0 ? `${todaySteps.toLocaleString()} steps` : ''}
                        {todaySteps > 0 && todayMinutes ? ' · ' : ''}
                        {todayMinutes ? `${todayMinutes} min logged` : ''}
                        {' · open Move'}
                      </button>
                    )}
                  </div>
                </aside>
              </section>
            )}

            {tab === 'move' && (
              <section className="vital-move-page">
                <form onSubmit={handleMove} className="vital-card vital-move">
                  <div className="vital-card-head">
                    <p className="vital-kicker">{child ? 'Play' : 'Training'}</p>
                    <span>{todayMinutes ? `${todayMinutes} min logged` : 'Doesn’t add calories back'}</span>
                  </div>
                  <div className="vital-week-strip" aria-label="This week’s movement">
                    {weekStrip.map((day) => (
                      <div key={day.day} className={`vital-week-day${day.isToday ? ' is-today' : ''}${day.strength ? ' is-strength' : ''}`}>
                        <i style={{ height: `${Math.max(day.minutes ? 18 : 4, Math.min(48, day.minutes / 2))}px` }} />
                        <span>{day.label}</span>
                        <em>{day.minutes || (day.steps ? `${Math.round(day.steps / 1000)}k` : '·')}</em>
                      </div>
                    ))}
                  </div>
                  <div className="vital-steps">
                    <div className="vital-steps-head">
                      <strong>Steps</strong>
                      <span>{todaySteps.toLocaleString()} of {stepGoal.toLocaleString()}</span>
                    </div>
                    <div className="vital-meter" aria-hidden="true">
                      <div className="vital-meter-fill" style={{ width: `${Math.min(100, (todaySteps / stepGoal) * 100)}%` }} />
                    </div>
                    <div className="vital-meals">
                      {STEP_PRESETS.map((count) => (
                        <button key={count} type="button" className={todaySteps === count ? 'is-active' : ''} onClick={() => handleSteps(count)}>
                          {(count / 1000).toFixed(0)}k
                        </button>
                      ))}
                    </div>
                    <div className="vital-steps-enter">
                      <input
                        className="vital-input"
                        type="number"
                        min="100"
                        max="100000"
                        step="100"
                        placeholder="Or type today’s count"
                        value={stepInput}
                        onChange={(e) => setStepInput(e.target.value)}
                      />
                      <button type="button" className="vital-btn vital-btn-quiet" onClick={() => handleSteps()} disabled={!stepInput}>
                        Save steps
                      </button>
                    </div>
                  </div>
                  <p className="vital-kicker">Workout</p>
                  <div className="vital-move-kinds">
                    {moveKinds.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`vital-move-tile${moveKind === item.id ? ' is-active' : ''}`}
                        onClick={() => setMoveKind(item.id)}
                      >
                        <MoveGlyph kind={item.id} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <input
                    className="vital-input"
                    value={moveNote}
                    onChange={(e) => setMoveNote(e.target.value)}
                    placeholder="Optional — Push day, 5K, pickup soccer"
                    maxLength={80}
                  />
                  <div className="vital-move-controls">
                    <div className="vital-meals">
                      {MOVE_MINUTES.map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          className={Number(moveMinutes) === mins ? 'is-active' : ''}
                          onClick={() => setMoveMinutes(String(mins))}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>
                    <label className="vital-sr" htmlFor="move_min">Minutes</label>
                    <input
                      id="move_min"
                      className="vital-input vital-input-mini"
                      type="number"
                      min="1"
                      max="480"
                      value={moveMinutes}
                      onChange={(e) => setMoveMinutes(e.target.value)}
                      required
                    />
                    <div className="vital-meals">
                      {[
                        { id: 'easy', label: 'Easy' },
                        { id: 'moderate', label: 'Mod' },
                        { id: 'hard', label: 'Hard' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={moveEffort === item.id ? 'is-active' : ''}
                          onClick={() => setMoveEffort(item.id)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {moveError && <p className="vital-err">{moveError}</p>}
                  <div className="vital-composer-actions">
                    <button type="submit" className="vital-btn">
                      Log {moveKinds.find((item) => item.id === moveKind)?.label?.toLowerCase() || 'workout'}
                    </button>
                    {lastMove && (
                      <button
                        type="button"
                        className="vital-btn vital-btn-quiet"
                        onClick={() => logShortcut({
                          kind: lastMove.kind,
                          minutes: lastMove.minutes,
                          effort: lastMove.effort,
                          label: lastMove.note || `${lastMove.kind[0].toUpperCase()}${lastMove.kind.slice(1)} ${lastMove.minutes}`,
                        })}
                      >
                        Repeat last
                      </button>
                    )}
                  </div>
                  {savedMoves.length > 0 && (
                    <div className="vital-chips">
                      {savedMoves.slice(0, 8).map((row) => (
                        <button key={row.id || row.label} type="button" className="vital-chip" onClick={() => logShortcut(row)}>
                          {row.label}
                        </button>
                      ))}
                    </div>
                  )}
                </form>
                {!logYesterday && (todayWorkouts.length > 0 || todaySteps > 0) && (
                  <div className="vital-card vital-journal-move">
                    {todaySteps > 0 && (
                      <div className="vital-food-pill">
                        <div>
                          <strong>Steps</strong>
                          <span>{todaySteps.toLocaleString()} of {stepGoal.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                    {todayWorkouts.map((row) => (
                      <div key={row.id} className="vital-food-pill">
                        <div>
                          <strong>{row.note || (row.kind[0].toUpperCase() + row.kind.slice(1))}</strong>
                          <span>{row.minutes} min · ~{row.kcal_est} kcal work</span>
                        </div>
                        <button
                          type="button"
                          className="vital-text-btn"
                          onClick={async () => {
                            await deleteVitalActivity(row.id);
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

            {tab === 'week' && (
              <section className="vital-bento">
                <div className="vital-card vital-bento-score">
                  <p className="vital-kicker">This week</p>
                  <p className="vital-number">{insights.weekScore}<span>/5</span></p>
                  <p className="vital-hero-sub">{weekLine}</p>
                  {insights.streak ? (
                    <p className="vital-muted">{insights.streak}-day logging streak</p>
                  ) : null}
                </div>

                <form onSubmit={handleWeight} className="vital-card vital-bento-weight">
                  <div className="vital-card-head">
                    <p className="vital-kicker">Weight</p>
                    <span>{insights.weekDeltaLabel || insights.etaLabel || 'Trend'}</span>
                  </div>
                  <p className="vital-number vital-number-move">{insights.currentLabel}</p>
                  <p className="vital-hero-sub">
                    {todayWeight ? 'Today' : (insights.lostLabel || 'Log a weigh-in to start the trend.')}
                    {todayWeight && insights.lostLabel ? ` · ${insights.lostLabel}` : ''}
                    {insights.remainingLabel ? ` · ${insights.remainingLabel}` : ''}
                  </p>
                  {insights.weightPoints.length > 1 && (
                    <VitalChart
                      values={insights.weightPoints.map((kg) => (units === 'metric' ? kg : kgToLb(kg)))}
                      color="#3d5a80"
                      height={88}
                    />
                  )}
                  <div className="vital-weigh-row">
                    <label className="vital-sr" htmlFor="weigh_in">{todayWeight ? 'Update today’s weight' : 'Today’s weight'}</label>
                    <input
                      id="weigh_in"
                      className="vital-input"
                      type="number"
                      min="0"
                      step="0.1"
                      value={weightInput}
                      onChange={(e) => setWeightInput(e.target.value)}
                      placeholder={units === 'metric' ? 'kg' : 'lb'}
                      required
                    />
                    <button type="submit" className="vital-btn">{todayWeight ? 'Update' : 'Save'}</button>
                  </div>
                  {weightError && <p className="vital-err">{weightError}</p>}
                </form>

                <div className="vital-card vital-bento-metric">
                  <p className="vital-kicker">{child ? 'Play' : 'Move'}</p>
                  <VitalRing
                    value={child ? insights.moveMinutes : insights.moveModerate}
                    max={insights.moveGoal || (child ? 420 : 150)}
                    unit="min"
                    caption={child ? `${insights.moveMinutes} of ${insights.moveGoal}` : `${insights.moveModerate} / ${insights.moveGoal} mod. min`}
                    color="var(--vital-move)"
                    size={92}
                  />
                </div>
                <div className="vital-card vital-bento-metric">
                  <p className="vital-kicker">Steps</p>
                  <p className="vital-number">{Math.round((insights.weekSteps || 0) / 1000)}k</p>
                  <p className="vital-muted">This week{insights.lastWeekSteps ? ` · was ${Math.round(insights.lastWeekSteps / 1000)}k` : ''}</p>
                </div>
                {!child && (
                  <div className="vital-card vital-bento-metric">
                    <p className="vital-kicker">Strength</p>
                    <p className="vital-number">{insights.strengthDays}/{insights.strengthGoal}</p>
                    <p className="vital-muted">Lift days this week</p>
                  </div>
                )}
                <div className="vital-card vital-bento-metric">
                  <p className="vital-kicker">On target</p>
                  <p className="vital-number">{insights.onTarget}/{insights.loggedDays || 0}</p>
                  <p className="vital-muted">{simple ? 'Protein days' : 'Days on target'}</p>
                </div>

                <div className="vital-card vital-bento-half">
                  <p className="vital-kicker">Week vs last week</p>
                  <div className="vital-compare">
                    <div>
                      <span>Avg energy</span>
                      <strong>{insights.avgKcal || '—'}</strong>
                      {insights.prevAvg ? <em>was {insights.prevAvg}</em> : null}
                    </div>
                    <div>
                      <span>Movement</span>
                      <strong>{insights.moveMinutes} min</strong>
                      {insights.lastMoveMinutes ? <em>was {insights.lastMoveMinutes}</em> : null}
                    </div>
                    {insights.fiberTarget != null && (
                      <div>
                        <span>Avg fiber</span>
                        <strong>{insights.avgFiber}g</strong>
                        <em>/ {insights.fiberTarget}g</em>
                      </div>
                    )}
                  </div>
                  {(insights.weekdayAvg != null || insights.weekendAvg != null) && (
                    <div className="vital-compare vital-compare-split">
                      <div>
                        <span>Weekdays</span>
                        <strong>{insights.weekdayAvg ?? '—'}</strong>
                      </div>
                      <div>
                        <span>Weekends</span>
                        <strong>{insights.weekendAvg ?? '—'}</strong>
                      </div>
                    </div>
                  )}
                  {insights.intakePace && <p className="vital-muted">{insights.intakePace}</p>}
                </div>

                {adaptive && (
                  <div className="vital-card vital-bento-wide vital-adaptive">
                    <p className="vital-kicker">From the scale</p>
                    <h2>{adaptive.title}</h2>
                    <p>{adaptive.body}</p>
                    {adaptive.action && (
                      <button
                        type="button"
                        className="vital-btn"
                        onClick={async () => {
                          const result = await nudgeVitalCalories({
                            member_id: member.id,
                            calories: adaptive.calories,
                            mode: adaptive.action,
                          });
                          if (!result.success) setWeightError(result.error);
                          else router.refresh();
                        }}
                      >
                        {adaptive.action === 'hold'
                          ? `Hold at ${adaptive.calories.toLocaleString()} kcal`
                          : `Nudge to ${adaptive.calories.toLocaleString()} kcal`}
                      </button>
                    )}
                  </div>
                )}

                {!simple && (
                  <div className="vital-card vital-bento-wide">
                    <p className="vital-kicker">Energy · 14 days</p>
                    <VitalChart values={insights.energyPoints} target={insights.target} color="#0d7377" height={128} />
                    <p className="vital-muted">
                      {insights.intakePace || 'Dashed line is the daily target. The week that wins is the average, not Tuesday.'}
                    </p>
                  </div>
                )}

                {members.length > 1 && (
                  <div className="vital-card vital-bento-wide">
                    <p className="vital-kicker">Household this week</p>
                    <div className="vital-house-grid">
                      {houseWeek.map((row) => (
                        <button
                          key={row.person.id}
                          type="button"
                          className="vital-house-card"
                          onClick={() => selectMember(row.person.id)}
                        >
                          <span className="vital-avatar" style={{ background: row.person.accent }}>{row.person.display_name.slice(0, 1)}</span>
                          <span>
                            <strong>{row.person.display_name}</strong>
                            <em>{row.logged} day{row.logged === 1 ? '' : 's'}{row.weekMinutes ? ` · ${row.weekMinutes} min` : ''}</em>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {kitchen.length > 0 && (
                  <div className="vital-card vital-bento-wide">
                    <p className="vital-kicker">Kitchen</p>
                    <div className="vital-tile-grid">
                      {kitchen.slice(0, 12).map((row) => (
                        <div key={row.id} className="vital-tile">
                          <strong>{row.name}</strong>
                          <span>{row.calories} kcal · {row.times_logged}×</span>
                          <span className="vital-row-actions">
                            <button type="button" className="vital-text-btn" onClick={() => setEditKitchen({ ...row })}>Edit</button>
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
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {moves.length > 0 && (
                  <div className="vital-card vital-bento-wide">
                    <p className="vital-kicker">Saved moves</p>
                    <div className="vital-chips">
                      {moves.map((row) => (
                        <span key={row.id} className="vital-chip vital-chip-row">
                          {row.label}
                          <button
                            type="button"
                            className="vital-text-btn"
                            onClick={async () => {
                              await deleteVitalMove(row.id);
                              router.refresh();
                            }}
                          >
                            Remove
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {tab === 'plan' && (
              <form onSubmit={handlePlan} className="vital-plan-board">
                <div className="vital-card">
                  <div className="vital-card-head">
                    <p className="vital-kicker">Body</p>
                    <div className="vital-meals">
                      {['us', 'metric'].map((id) => (
                        <button key={id} type="button" className={plan.units === id ? 'is-active' : ''} onClick={() => setPlan((prev) => ({ ...prev, units: id }))}>
                          {id === 'us' ? 'lb / in' : 'kg / cm'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="vital-muted">
                    {child
                      ? 'We estimate what a growing body typically needs. This is not a diet. A pediatrician should sign off before any calorie cut.'
                      : 'Targets use Mifflin–St Jeor. Movement is logged separately and is not extra food.'}
                  </p>
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
                      <label htmlFor="activity_level">Baseline movement</label>
                      <select id="activity_level" className="vital-input" value={plan.activity_level} onChange={(e) => setPlan({ ...plan, activity_level: e.target.value })}>
                        {ACTIVITY_LEVELS.map((level) => (
                          <option key={level.id} value={level.id}>{level.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="step_goal_body">Daily step goal</label>
                      <input id="step_goal_body" className="vital-input" type="number" min="1000" max="40000" step="500" value={plan.step_goal} onChange={(e) => setPlan({ ...plan, step_goal: e.target.value })} />
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
                </div>

                <div className="vital-card">
                  <p className="vital-kicker">{child ? 'Play' : 'Move goals'}</p>
                  <p className="vital-muted">
                    {child
                      ? 'About 60 minutes of play a day. It is health, not a calorie diet.'
                      : 'Lift twice this week on Move. Steps are a health target. Neither one adds food back.'}
                  </p>
                </div>

                {!child && (
                  <div className="vital-card">
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
                          onClick={() => setPlan((prev) => ({ ...prev, intent: item.id, method: prev.method || defaultMethod(item.id) }))}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <label htmlFor="weekly_change">Weekly pace ({plan.units === 'metric' ? 'kg' : 'lb'})</label>
                    <input
                      id="weekly_change"
                      className="vital-input"
                      type="number"
                      min="0"
                      step="0.1"
                      value={plan.weekly_change}
                      onChange={(e) => setPlan({ ...plan, weekly_change: e.target.value })}
                      placeholder={plan.units === 'metric' ? String(weeklyHint) : (weeklyHint * 2.2046).toFixed(1)}
                    />
                    <p className="vital-muted">
                      {(plan.intent === 'lose' || plan.intent === 'gain') && weeklyHint > 0
                        ? `A sustainable clip is about ${plan.units === 'metric' ? `${weeklyHint} kg` : `${(weeklyHint * 2.2046).toFixed(1)} lb`} a week.`
                        : 'Leave blank to hold steady.'}
                    </p>
                    <p className="vital-kicker">Method</p>
                    <div className="vital-meals">
                      {PLAN_METHODS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={plan.method === item.id ? 'is-active' : ''}
                          onClick={() => setPlan((prev) => ({ ...prev, method: item.id }))}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <p className="vital-muted">{PLAN_METHODS.find((item) => item.id === plan.method)?.hint}</p>
                    <div className="vital-grid">
                      <div>
                        <label htmlFor="calorie_override">{plan.method === 'custom' ? 'Calories' : 'Calories (optional)'}</label>
                        <input id="calorie_override" className="vital-input" type="number" min="800" max="6000" value={plan.calorie_override} onChange={(e) => setPlan({ ...plan, calorie_override: e.target.value })} required={plan.method === 'custom'} />
                      </div>
                      <div>
                        <label htmlFor="protein_override">{plan.method === 'custom' ? 'Protein g' : 'Protein g (optional)'}</label>
                        <input id="protein_override" className="vital-input" type="number" min="20" max="400" value={plan.protein_override} onChange={(e) => setPlan({ ...plan, protein_override: e.target.value })} />
                      </div>
                      <div>
                        <label htmlFor="fiber_target_g">Fiber g (optional)</label>
                        <input id="fiber_target_g" className="vital-input" type="number" min="0" max="80" value={plan.fiber_target_g} onChange={(e) => setPlan({ ...plan, fiber_target_g: e.target.value })} placeholder={plan.method === 'simple' ? '28–35' : ''} />
                      </div>
                    </div>
                  </div>
                )}

                {planError && <p className="vital-err">{planError}</p>}
                <div className="vital-plan-actions">
                  <button type="submit" className="vital-btn" disabled={planBusy}>
                    {planBusy ? 'Saving…' : memberPlan ? 'Update plan' : 'Set the plan'}
                  </button>
                  <button type="button" className="vital-text-btn" onClick={() => setShowOnboard(true)}>
                    Walk through setup again
                  </button>
                </div>
              </form>
            )}

          </>
        )}
      </main>
      )}

      {!onboardOpen && showPerson && (
        <div className="vital-overlay" onPointerDown={(e) => { if (e.target === e.currentTarget) setShowPerson(false); }}>
          <form className="vital-sheet" onSubmit={addPerson}>
            <button type="button" className="vital-sheet-close" onClick={() => setShowPerson(false)} aria-label="Close">×</button>
            <h2>Add to the household</h2>
            <p>A name is enough to start logging. Age and a plan can wait.</p>
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

      {showQuickEdit && (
        <div className="vital-overlay" onPointerDown={(e) => { if (e.target === e.currentTarget) setShowQuickEdit(false); }}>
          <div className="vital-sheet">
            <button type="button" className="vital-sheet-close" onClick={() => setShowQuickEdit(false)} aria-label="Close">×</button>
            <h2>Quick add</h2>
            <p>Pin the foods you reach for every day. That row on Eat follows this order.</p>
            {pinPool.length === 0 && <p className="vital-muted">Save a custom food first, then pin it here.</p>}
            {pinPool.map((row) => {
              const key = row.id || row.name;
              const on = pinIds.includes(row.name) || pinIds.includes(row.id);
              return (
                <div key={key} className="vital-row">
                  <div>
                    <strong>{row.name}</strong>
                    <span>{row.calories} kcal</span>
                  </div>
                  <button
                    type="button"
                    className={`vital-chip${on ? ' is-pinned' : ''}`}
                    onClick={() => setPinIds((prev) => (
                      on ? prev.filter((id) => id !== row.id && id !== row.name) : [...prev, row.name].slice(0, 12)
                    ))}
                  >
                    {on ? 'Pinned' : 'Pin'}
                  </button>
                </div>
              );
            })}
            <button type="button" className="vital-btn" onClick={() => savePins(pinIds)}>
              Save quick add
            </button>
          </div>
        </div>
      )}

      {editKitchen && (
        <div className="vital-overlay" onPointerDown={(e) => { if (e.target === e.currentTarget) setEditKitchen(null); }}>
          <form className="vital-sheet" onSubmit={handleKitchenEdit}>
            <button type="button" className="vital-sheet-close" onClick={() => setEditKitchen(null)} aria-label="Close">×</button>
            <h2>Edit kitchen item</h2>
            <label htmlFor="edit_name">Name</label>
            <input id="edit_name" className="vital-input" value={editKitchen.name} onChange={(e) => setEditKitchen({ ...editKitchen, name: e.target.value })} required />
            <div className="vital-grid">
              <div>
                <label htmlFor="edit_kcal">Calories</label>
                <input id="edit_kcal" className="vital-input" type="number" min="0" value={editKitchen.calories} onChange={(e) => setEditKitchen({ ...editKitchen, calories: e.target.value })} required />
              </div>
              <div>
                <label htmlFor="edit_p">Protein</label>
                <input id="edit_p" className="vital-input" type="number" min="0" step="0.1" value={editKitchen.protein_g} onChange={(e) => setEditKitchen({ ...editKitchen, protein_g: e.target.value })} />
              </div>
              <div>
                <label htmlFor="edit_c">Carbs</label>
                <input id="edit_c" className="vital-input" type="number" min="0" step="0.1" value={editKitchen.carbs_g} onChange={(e) => setEditKitchen({ ...editKitchen, carbs_g: e.target.value })} />
              </div>
              <div>
                <label htmlFor="edit_f">Fat</label>
                <input id="edit_f" className="vital-input" type="number" min="0" step="0.1" value={editKitchen.fat_g} onChange={(e) => setEditKitchen({ ...editKitchen, fat_g: e.target.value })} />
              </div>
              <div>
                <label htmlFor="edit_fiber">Fiber</label>
                <input id="edit_fiber" className="vital-input" type="number" min="0" step="0.1" value={editKitchen.fiber_g || ''} onChange={(e) => setEditKitchen({ ...editKitchen, fiber_g: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="vital-btn">Save food</button>
          </form>
        </div>
      )}

      {serveFood && (
        <div className="vital-overlay" onPointerDown={(e) => { if (e.target === e.currentTarget) setServeFood(null); }}>
          <div className="vital-sheet">
            <button type="button" className="vital-sheet-close" onClick={() => setServeFood(null)} aria-label="Close">×</button>
            <h2>Serve {serveFood.name}</h2>
            <p>Same plate, different portions. Kids still get food logged — not a calorie diet.</p>
            {members.filter((row) => row.id !== memberId).map((row) => (
              <div key={row.id} className="vital-row vital-serve-row">
                <div>
                  <strong>{row.display_name}</strong>
                  <span>{row.kind === 'child' ? 'Child' : 'Adult'}</span>
                </div>
                <div className="vital-meals">
                  {FAMILY_SERVINGS.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={Number(servePortions[row.id]) === size ? 'is-active' : ''}
                      onClick={() => setServePortions((prev) => ({ ...prev, [row.id]: prev[row.id] === size ? 0 : size }))}
                    >
                      {size === 1 ? '1×' : `${size}×`}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button
              type="button"
              className="vital-btn"
              onClick={async () => {
                const portions = Object.entries(servePortions)
                  .filter(([, servings]) => Number(servings) > 0)
                  .map(([id, servings]) => ({ member_id: id, servings }));
                const result = await serveVitalFood({ food_id: serveFood.id, portions });
                if (!result.success) setFoodError(result.error);
                else {
                  setServeFood(null);
                  router.refresh();
                }
              }}
            >
              Serve to household
            </button>
          </div>
        </div>
      )}

      {editFood && (
        <div className="vital-overlay" onPointerDown={(e) => { if (e.target === e.currentTarget) setEditFood(null); }}>
          <div className="vital-sheet">
            <button type="button" className="vital-sheet-close" onClick={() => setEditFood(null)} aria-label="Close">×</button>
            <h2>Resize {editFood.name}</h2>
            <p>This scales the logged amount. 0.5× is a half portion of what is already in the journal.</p>
            <div className="vital-meals">
              {FAMILY_SERVINGS.filter((size) => size !== 1).map((size) => (
                <button
                  key={size}
                  type="button"
                  className="vital-chip"
                  onClick={async () => {
                    const result = await updateVitalFood({ id: editFood.id, scale: size });
                    if (!result.success) setFoodError(result.error);
                    else {
                      setEditFood(null);
                      router.refresh();
                    }
                  }}
                >
                  {size === 1 ? '1×' : `${size}×`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {serveCook && (
        <div className="vital-overlay" onPointerDown={(e) => { if (e.target === e.currentTarget) setServeCook(null); }}>
          <div className="vital-sheet">
            <button type="button" className="vital-sheet-close" onClick={() => setServeCook(null)} aria-label="Close">×</button>
            <h2>Serve {serveCook.title}</h2>
            <p className="vital-plate-macros">{macrosLabel(serveCook.kcal, serveCook.protein)}</p>
            <p>Logs the whole plate for whoever ate it. Kids still get food logged — not a calorie diet.</p>
            {members.map((row) => (
              <div key={row.id} className="vital-row vital-serve-row">
                <div>
                  <strong>{row.display_name}</strong>
                  <span>{row.id === memberId ? 'You' : row.kind === 'child' ? 'Child' : 'Adult'}</span>
                </div>
                <div className="vital-meals">
                  {FAMILY_SERVINGS.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={Number(servePortions[row.id]) === size ? 'is-active' : ''}
                      onClick={() => setServePortions((prev) => ({ ...prev, [row.id]: prev[row.id] === size ? 0 : size }))}
                    >
                      {size === 1 ? '1×' : `${size}×`}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button
              type="button"
              className="vital-btn"
              disabled={cookBusy}
              onClick={() => logCookPlate(
                serveCook,
                Object.entries(servePortions)
                  .filter(([, servings]) => Number(servings) > 0)
                  .map(([id, servings]) => ({ member_id: id, servings }))
              )}
            >
              {cookBusy ? 'Logging…' : 'Serve to household'}
            </button>
          </div>
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
