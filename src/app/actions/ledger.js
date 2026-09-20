'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '../../lib/authz';
import { listEnvelopes, normalizeEnvelopes, SPEND_CATEGORIES } from '../../lib/ledger';

const CATEGORY_IDS = new Set(SPEND_CATEGORIES.map((row) => row.id));

function fail(error) {
  return { success: false, error };
}

function num(value) {
  if (value === '' || value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function ledgerUser() {
  const { user, supabase } = await requireUser();
  if (!user) return { error: 'Please log in.' };
  return { user, supabase };
}

export async function saveLedgerSettings(payload) {
  const auth = await ledgerUser();
  if (auth.error) return fail(auth.error);

  const monthlyIncome = num(payload?.monthly_income);
  if (monthlyIncome == null || monthlyIncome < 0 || monthlyIncome > 10000000) {
    return fail('Enter a monthly take-home of $0 or more.');
  }

  const yearlyGoal = payload?.yearly_goal === '' || payload?.yearly_goal == null
    ? null
    : num(payload.yearly_goal);
  if (yearlyGoal != null && (yearlyGoal < 0 || yearlyGoal > 100000000)) {
    return fail('Yearly savings goal looks off.');
  }

  const row = {
    owner_id: auth.user.id,
    monthly_income: monthlyIncome,
    yearly_goal: yearlyGoal,
    currency: 'USD',
    updated_at: new Date().toISOString(),
  };

  if (payload?.allocations && typeof payload.allocations === 'object') {
    const envelopes = normalizeEnvelopes(payload.envelopes);
    const allowed = listEnvelopes({ envelopes, allocations: payload.allocations });
    const allocations = {};
    for (const cat of allowed) {
      const amount = num(payload.allocations[cat.id]);
      if (amount != null && amount > 0 && amount <= 10000000) {
        allocations[cat.id] = Math.round(amount * 100) / 100;
      }
    }
    row.envelopes = envelopes.map(({ id, name }) => ({ id, name }));
    row.allocations = allocations;
  }

  const { error } = await auth.supabase
    .from('ledger_settings')
    .upsert(row, { onConflict: 'owner_id' });

  if (error) {
    if (/allocations|envelopes|schema cache|does not exist/i.test(error.message || '')) {
      return fail('Run kaeluma_catchup.sql in the Supabase SQL editor so Ledger can save.');
    }
    return fail(error.message);
  }
  revalidatePath('/ledger');
  revalidatePath('/apps');
  return { success: true };
}

export async function addLedgerEntry(payload) {
  const auth = await ledgerUser();
  if (auth.error) return fail(auth.error);

  const amount = num(payload?.amount);
  if (amount == null || amount <= 0 || amount > 10000000) {
    return fail('Enter an amount above $0.');
  }

  const kind = payload?.kind === 'income' ? 'income' : 'spend';
  const loggedOn = String(payload?.logged_on || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(loggedOn)) return fail('Pick a date.');

  const { data: settings } = await auth.supabase
    .from('ledger_settings')
    .select('*')
    .maybeSingle();
  const allowed = new Set(listEnvelopes(settings).map((row) => row.id));
  const category = kind === 'income'
    ? 'pay'
    : (allowed.has(payload?.category) || CATEGORY_IDS.has(payload?.category) ? payload.category : 'other');

  const note = String(payload?.note || '').trim().slice(0, 80) || null;

  const { error } = await auth.supabase.from('ledger_entries').insert({
    owner_id: auth.user.id,
    logged_on: loggedOn,
    amount,
    kind,
    category,
    note,
  });

  if (error) return fail(error.message);
  revalidatePath('/ledger');
  return { success: true };
}

export async function deleteLedgerEntry(id) {
  const auth = await ledgerUser();
  if (auth.error) return fail(auth.error);
  if (!id) return fail('Nothing to remove.');

  const { error } = await auth.supabase
    .from('ledger_entries')
    .delete()
    .eq('id', id)
    .eq('owner_id', auth.user.id);

  if (error) return fail(error.message);
  revalidatePath('/ledger');
  return { success: true };
}
