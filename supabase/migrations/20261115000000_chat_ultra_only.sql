-- Community chat belongs to Ultra only. Ultra is stored as the 'expert' membership tier.
-- Apply after 20261022010000_memberships_chat.sql. The membership table is not changed:
-- Pro keeps reading its own row and its other paid features. Only chat access narrows.
-- react_mentor_paid_member() (pro or expert) stays as it is for other paid features.
begin;

-- Active, MFA-verified Ultra member. The database decides; the browser plan is never trusted.
create or replace function public.react_mentor_ultra_member()
returns boolean language sql stable security definer set search_path='' as $$
 select public.react_mentor_session_allowed() and exists(
  select 1 from public.react_mentor_memberships where user_id=auth.uid() and expires_at>now() and tier='expert'
 );
$$;
revoke all on function public.react_mentor_ultra_member() from public, anon;
grant execute on function public.react_mentor_ultra_member() to authenticated;

-- Reads: only Ultra sees messages and who is online.
drop policy if exists "paid chat read" on public.react_mentor_chat_messages;
drop policy if exists "paid presence read" on public.react_mentor_chat_presence;
create policy "ultra chat read" on public.react_mentor_chat_messages for select to authenticated
 using((select public.react_mentor_ultra_member()));
create policy "ultra presence read" on public.react_mentor_chat_presence for select to authenticated
 using(last_seen>now()-interval '90 seconds' and (select public.react_mentor_ultra_member()));

-- Writes: same RPCs as before, only the membership check changes to Ultra.
create or replace function public.react_mentor_send_message(message_body text)
returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); display text; message_id uuid;
begin
 if not public.react_mentor_ultra_member() then raise exception 'Membership required' using errcode='42501'; end if;
 if message_body is null or char_length(btrim(message_body)) not between 1 and 2000 then raise exception 'Invalid message' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended('mentor-chat:'||uid::text,0));
 if exists(select 1 from public.react_mentor_chat_messages where author_id=uid and created_at>now()-interval '2 seconds')
 or (select count(*) from public.react_mentor_chat_messages where author_id=uid and created_at>now()-interval '1 minute')>=20 then
  raise exception 'Too many messages' using errcode='PT429';
 end if;
 select display_name into display from public.react_mentor_profiles where user_id=uid;
 if display is null then raise exception 'Profile required' using errcode='42501'; end if;
 insert into public.react_mentor_chat_messages(author_id,author_name,body) values(uid,display,btrim(message_body)) returning id into message_id;
 return message_id;
end;
$$;
create or replace function public.react_mentor_chat_heartbeat(leaving boolean default false)
returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();
begin
 if not public.react_mentor_ultra_member() then raise exception 'Membership required' using errcode='42501'; end if;
 if leaving then delete from public.react_mentor_chat_presence where user_id=uid; return; end if;
 -- The database supplies timestamps. Repeated calls cannot move presence into the future.
 insert into public.react_mentor_chat_presence(user_id,last_seen) values(uid,now())
 on conflict(user_id) do update set last_seen=now() where react_mentor_chat_presence.last_seen<now()-interval '15 seconds';
end;
$$;
revoke all on function public.react_mentor_send_message(text),public.react_mentor_chat_heartbeat(boolean) from public,anon;
grant execute on function public.react_mentor_send_message(text),public.react_mentor_chat_heartbeat(boolean) to authenticated;
commit;
