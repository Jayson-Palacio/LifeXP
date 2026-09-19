-- Kaeluma security and atomic game-state migration
-- Run this once in the Supabase SQL editor after supabase_migration.sql.

alter table public.app_settings add column if not exists created_at timestamptz not null default now();
alter table public.missions add column if not exists is_active boolean not null default true;
alter table public.missions add column if not exists category text not null default 'General';
alter table public.missions add column if not exists image text;

-- Settings are logically one row per family. Resolve any historic duplicates before
-- adding the constraint (the completed setup row wins).
delete from public.app_settings older
using public.app_settings newer
where older.user_id = newer.user_id
  and older.id <> newer.id
  and (newer.setup_complete, newer.created_at) > (older.setup_complete, older.created_at);
create unique index if not exists app_settings_one_row_per_user on public.app_settings(user_id);

create index if not exists completions_owner_child_mission_submitted_idx on public.completions(user_id, child_id, mission_id, submitted_at desc);
create index if not exists redemptions_owner_child_reward_redeemed_idx on public.redemptions(user_id, child_id, reward_id, redeemed_at desc);

-- Only reads are made directly from the browser. All game mutations are handled by
-- the narrowly scoped functions below, which check the authenticated family owner.
drop policy if exists "Users can manage their own app_settings" on public.app_settings;
drop policy if exists "Users can manage their own children" on public.children;
drop policy if exists "Users can manage their own missions" on public.missions;
drop policy if exists "Users can manage their own completions" on public.completions;
drop policy if exists "Users can manage their own rewards" on public.rewards;
drop policy if exists "Users can manage their own redemptions" on public.redemptions;

create policy "Users can read their own app_settings" on public.app_settings for select using (auth.uid() = user_id);
create policy "Users can read their own children" on public.children for select using (auth.uid() = user_id);
create policy "Users can read their own missions" on public.missions for select using (auth.uid() = user_id);
create policy "Users can read their own completions" on public.completions for select using (auth.uid() = user_id);
create policy "Users can read their own rewards" on public.rewards for select using (auth.uid() = user_id);
create policy "Users can read their own redemptions" on public.redemptions for select using (auth.uid() = user_id);

revoke insert, update, delete on public.app_settings, public.children, public.missions, public.completions, public.rewards, public.redemptions from anon, authenticated;

create or replace function public.kaeluma_submit_mission(p_child_id uuid, p_mission_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_child children; v_mission missions; v_settings app_settings;
  v_completion completions; v_status text; v_period_start timestamptz; v_completed integer; v_streak integer;
begin
  if v_user is null then raise exception 'Unauthorized'; end if;
  select * into v_child from children where id = p_child_id and user_id = v_user for update;
  select * into v_mission from missions where id = p_mission_id and user_id = v_user;
  select * into v_settings from app_settings where user_id = v_user;
  if not found or v_child is null or v_mission is null or not coalesce(v_mission.is_active, true) then raise exception 'Mission unavailable'; end if;
  if v_mission.assigned_to is not null and not p_child_id = any(v_mission.assigned_to) then raise exception 'Mission is not assigned to this player'; end if;
  if v_mission.frequency = 'date_range' and (current_date < v_mission.start_date or current_date > v_mission.end_date) then raise exception 'Mission is not active today'; end if;
  if v_mission.frequency = 'weekly' and coalesce(array_length(v_mission.specific_days, 1), 0) > 0 and not extract(dow from now())::integer = any(v_mission.specific_days) then raise exception 'Mission is not active today'; end if;
  v_period_start := case v_mission.frequency when 'weekly' then date_trunc('week', now()) when 'monthly' then date_trunc('month', now()) else date_trunc('day', now()) end;
  select count(*) into v_completed from completions where user_id = v_user and child_id = p_child_id and mission_id = p_mission_id and status <> 'rejected' and submitted_at >= v_period_start;
  if v_completed >= coalesce(v_mission.max_completions_per_period, 1) then raise exception 'Mission limit reached'; end if;
  v_status := case when coalesce(v_settings.require_approval, true) then 'pending' else 'approved' end;
  insert into completions(user_id, mission_id, child_id, status) values (v_user, p_mission_id, p_child_id, v_status) returning * into v_completion;
  if v_status = 'approved' then
    v_streak := case when v_child.last_completion_date is null or v_child.last_completion_date::date = current_date then coalesce(v_child.streak, 0) + case when v_child.last_completion_date is null then 1 else 0 end when v_child.last_completion_date::date < current_date - 1 then 1 else coalesce(v_child.streak, 0) + 1 end;
    update children set xp = coalesce(total_xp_earned, xp, 0) + v_mission.xp_reward, total_xp_earned = coalesce(total_xp_earned, xp, 0) + v_mission.xp_reward, coins = coalesce(coins, 0) + v_mission.coin_reward, streak = v_streak, last_completion_date = now() where id = p_child_id returning * into v_child;
  end if;
  return jsonb_build_object('completion', to_jsonb(v_completion), 'child', to_jsonb(v_child));
end $$;

create or replace function public.kaeluma_undo_mission(p_completion_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_completion completions;
begin
  delete from completions where id = p_completion_id and user_id = v_user and status = 'pending' returning * into v_completion;
  if v_completion is null then raise exception 'Pending completion not found'; end if;
  return to_jsonb(v_completion);
end $$;

create or replace function public.kaeluma_redeem_reward(p_child_id uuid, p_reward_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_child children; v_reward rewards; v_redemption redemptions; v_count integer;
begin
  if v_user is null then raise exception 'Unauthorized'; end if;
  select * into v_child from children where id = p_child_id and user_id = v_user for update;
  select * into v_reward from rewards where id = p_reward_id and user_id = v_user and is_active = true;
  if v_child is null or v_reward is null then raise exception 'Reward unavailable'; end if;
  if v_reward.assigned_to is not null and not p_child_id = any(v_reward.assigned_to) then raise exception 'Reward is not assigned to this player'; end if;
  if v_child.coins < v_reward.cost then raise exception 'Not enough coins'; end if;
  select count(*) into v_count from redemptions where user_id = v_user and child_id = p_child_id and reward_id = p_reward_id and status <> 'refunded';
  if v_reward.max_total_redemptions is not null and v_count >= v_reward.max_total_redemptions then raise exception 'Total reward limit reached'; end if;
  if v_reward.max_daily_redemptions is not null and (select count(*) from redemptions where user_id = v_user and child_id = p_child_id and reward_id = p_reward_id and status <> 'refunded' and redeemed_at >= date_trunc('day', now())) >= v_reward.max_daily_redemptions then raise exception 'Daily reward limit reached'; end if;
  insert into redemptions(user_id, reward_id, child_id, status) values (v_user, p_reward_id, p_child_id, 'pending') returning * into v_redemption;
  update children set coins = coins - v_reward.cost where id = p_child_id returning * into v_child;
  return jsonb_build_object('redemption', to_jsonb(v_redemption), 'child', to_jsonb(v_child));
end $$;

create or replace function public.kaeluma_review_completion(p_completion_id uuid, p_approved boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_completion completions; v_child children; v_mission missions; v_streak integer;
begin
  select * into v_completion from completions where id = p_completion_id and user_id = v_user and status = 'pending' for update;
  if v_completion is null then raise exception 'Pending completion not found'; end if;
  if not p_approved then update completions set status = 'rejected', reviewed_at = now() where id = p_completion_id returning * into v_completion; return jsonb_build_object('completion', to_jsonb(v_completion)); end if;
  select * into v_child from children where id = v_completion.child_id and user_id = v_user for update;
  select * into v_mission from missions where id = v_completion.mission_id and user_id = v_user;
  v_streak := case when v_child.last_completion_date is null or v_child.last_completion_date::date = current_date then coalesce(v_child.streak, 0) + case when v_child.last_completion_date is null then 1 else 0 end when v_child.last_completion_date::date < current_date - 1 then 1 else coalesce(v_child.streak, 0) + 1 end;
  update completions set status = 'approved', reviewed_at = now() where id = p_completion_id returning * into v_completion;
  update children set xp = coalesce(total_xp_earned, xp, 0) + v_mission.xp_reward, total_xp_earned = coalesce(total_xp_earned, xp, 0) + v_mission.xp_reward, coins = coalesce(coins, 0) + v_mission.coin_reward, streak = v_streak, last_completion_date = now() where id = v_child.id returning * into v_child;
  return jsonb_build_object('completion', to_jsonb(v_completion), 'child', to_jsonb(v_child));
end $$;

create or replace function public.kaeluma_review_redemption(p_redemption_id uuid, p_fulfilled boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_redemption redemptions; v_child children; v_reward rewards;
begin
  select * into v_redemption from redemptions where id = p_redemption_id and user_id = v_user and status = 'pending' for update;
  if v_redemption is null then raise exception 'Pending redemption not found'; end if;
  if p_fulfilled then update redemptions set status = 'fulfilled' where id = p_redemption_id returning * into v_redemption;
  else
    select * into v_child from children where id = v_redemption.child_id and user_id = v_user for update;
    select * into v_reward from rewards where id = v_redemption.reward_id and user_id = v_user;
    update redemptions set status = 'refunded' where id = p_redemption_id returning * into v_redemption;
    update children set coins = coins + v_reward.cost where id = v_child.id returning * into v_child;
  end if;
  return jsonb_build_object('redemption', to_jsonb(v_redemption), 'child', to_jsonb(v_child));
end $$;

create or replace function public.kaeluma_adjust_child_coins(p_child_id uuid, p_amount integer)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_child children;
begin
  if p_amount < -100000 or p_amount > 100000 then raise exception 'Invalid coin adjustment'; end if;
  select * into v_child from children where id = p_child_id and user_id = v_user for update;
  if v_child is null then raise exception 'Player not found'; end if;
  update children set coins = greatest(0, coins + p_amount) where id = p_child_id returning * into v_child;
  return to_jsonb(v_child);
end $$;

create or replace function public.kaeluma_update_child_appearance(p_child_id uuid, p_field text, p_value text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_child children;
begin
  if p_field = 'theme' then
    update children set theme = left(p_value, 80) where id = p_child_id and user_id = v_user returning * into v_child;
  elsif p_field = 'ring_style' then
    update children set ring_style = left(p_value, 80) where id = p_child_id and user_id = v_user returning * into v_child;
  else raise exception 'Invalid appearance field'; end if;
  if v_child is null then raise exception 'Player not found'; end if;
  return to_jsonb(v_child);
end $$;

grant execute on function public.kaeluma_submit_mission(uuid, uuid), public.kaeluma_undo_mission(uuid), public.kaeluma_redeem_reward(uuid, uuid), public.kaeluma_review_completion(uuid, boolean), public.kaeluma_review_redemption(uuid, boolean), public.kaeluma_adjust_child_coins(uuid, integer), public.kaeluma_update_child_appearance(uuid, text, text) to authenticated;
