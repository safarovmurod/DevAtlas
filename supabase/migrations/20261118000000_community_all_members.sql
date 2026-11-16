-- Community chat for every signed-in member (owner decision 2026-11-17), with photos,
-- videos and code blocks. Apply after 20261115000000_chat_ultra_only.sql.
-- The application switch is FEATURE_PLAN.privateCommunity in src/lib/billing/plans.ts.
-- Idempotent: safe to run more than once.
--
-- Security model:
--  * Only authenticated, non-banned sessions (react_mentor_session_allowed()) read or write.
--  * anon has no access to tables, functions or the media bucket.
--  * Writes go only through SECURITY DEFINER RPCs with fixed search_path; the author,
--    display name and timestamps come from the database, never from the browser.
--  * Media lives in a PRIVATE bucket; people read it only through short signed URLs.
--  * Text is stored and returned as plain text. The UI never renders it as HTML.
begin;

-- 1. Who may use the chat: any allowed (signed-in, MFA-satisfied, not banned) session.
create or replace function public.react_mentor_community_member()
returns boolean language sql stable security definer set search_path='' as $$
 select public.react_mentor_session_allowed();
$$;
revoke all on function public.react_mentor_community_member() from public, anon;
grant execute on function public.react_mentor_community_member() to authenticated;

-- 2. Message kinds and attachments.
alter table public.react_mentor_chat_messages add column if not exists kind text not null default 'text';
alter table public.react_mentor_chat_messages add column if not exists code_language text;
alter table public.react_mentor_chat_messages add column if not exists attachment_path text;
alter table public.react_mentor_chat_messages add column if not exists attachment_mime text;
alter table public.react_mentor_chat_messages drop constraint if exists react_mentor_chat_messages_body_check;
alter table public.react_mentor_chat_messages drop constraint if exists mentor_chat_body_check;
alter table public.react_mentor_chat_messages add constraint mentor_chat_body_check check(
 (kind='text' and char_length(btrim(body)) between 1 and 2000)
 or (kind='code' and char_length(btrim(body)) between 1 and 8000)
 or (kind in ('image','video') and char_length(body) between 0 and 2000)
);
alter table public.react_mentor_chat_messages drop constraint if exists mentor_chat_kind_check;
alter table public.react_mentor_chat_messages add constraint mentor_chat_kind_check check(
 kind in ('text','code','image','video')
 and (code_language is null or (kind='code' and code_language ~ '^[a-z0-9+#-]{1,20}$'))
 and ((kind in ('image','video')) = (attachment_path is not null))
 and ((attachment_path is null) = (attachment_mime is null))
);

-- 3. Reads: every community member.
drop policy if exists "paid chat read" on public.react_mentor_chat_messages;
drop policy if exists "paid presence read" on public.react_mentor_chat_presence;
drop policy if exists "ultra chat read" on public.react_mentor_chat_messages;
drop policy if exists "ultra presence read" on public.react_mentor_chat_presence;
drop policy if exists "member chat read" on public.react_mentor_chat_messages;
drop policy if exists "member presence read" on public.react_mentor_chat_presence;
create policy "member chat read" on public.react_mentor_chat_messages for select to authenticated
 using((select public.react_mentor_community_member()));
create policy "member presence read" on public.react_mentor_chat_presence for select to authenticated
 using(last_seen>now()-interval '90 seconds' and (select public.react_mentor_community_member()));
revoke all on public.react_mentor_chat_messages,public.react_mentor_chat_presence from public,anon,authenticated;
grant select on public.react_mentor_chat_messages,public.react_mentor_chat_presence to authenticated;

-- 4. Private media bucket: 25 MB hard cap, only these types. Images are limited to 5 MB
--    when a post is created (react_mentor_send_post) and by the API before signing.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('community-media','community-media',false,26214400,
 array['image/jpeg','image/png','image/webp','video/mp4','video/webm'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,
 allowed_mime_types=excluded.allowed_mime_types;

-- At most 20 uploads per member per hour.
create or replace function public.react_mentor_community_upload_allowed()
returns boolean language sql stable security definer set search_path='' as $$
 select public.react_mentor_community_member() and (
  select count(*) from storage.objects
  where bucket_id='community-media' and owner_id=auth.uid()::text and created_at>now()-interval '1 hour'
 )<20;
$$;
revoke all on function public.react_mentor_community_upload_allowed() from public, anon;
grant execute on function public.react_mentor_community_upload_allowed() to authenticated;

drop policy if exists "community media upload own folder" on storage.objects;
drop policy if exists "community media read members" on storage.objects;
drop policy if exists "community media delete own" on storage.objects;
create policy "community media upload own folder" on storage.objects for insert to authenticated
 with check(bucket_id='community-media'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp|mp4|webm)$'
  and (select public.react_mentor_community_upload_allowed()));
create policy "community media read members" on storage.objects for select to authenticated
 using(bucket_id='community-media' and (select public.react_mentor_community_member()));
create policy "community media delete own" on storage.objects for delete to authenticated
 using(bucket_id='community-media' and owner_id=(select auth.uid())::text);

-- 5. Writes.
create or replace function public.react_mentor_community_rate_check(uid uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
 perform pg_advisory_xact_lock(hashtextextended('mentor-chat:'||uid::text,0));
 if exists(select 1 from public.react_mentor_chat_messages where author_id=uid and created_at>now()-interval '2 seconds')
 or (select count(*) from public.react_mentor_chat_messages where author_id=uid and created_at>now()-interval '1 minute')>=20 then
  raise exception 'Too many messages' using errcode='PT429';
 end if;
end;
$$;
revoke all on function public.react_mentor_community_rate_check(uuid) from public, anon, authenticated;

create or replace function public.react_mentor_send_message(message_body text)
returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); display text; message_id uuid;
begin
 if not public.react_mentor_community_member() then raise exception 'Membership required' using errcode='42501'; end if;
 if message_body is null or char_length(btrim(message_body)) not between 1 and 2000 then raise exception 'Invalid message' using errcode='22023'; end if;
 perform public.react_mentor_community_rate_check(uid);
 select display_name into display from public.react_mentor_profiles where user_id=uid;
 if display is null then raise exception 'Profile required' using errcode='42501'; end if;
 insert into public.react_mentor_chat_messages(author_id,author_name,body) values(uid,display,btrim(message_body)) returning id into message_id;
 return message_id;
end;
$$;

create or replace function public.react_mentor_send_post(
 post_kind text, post_body text, post_code_language text default null, post_attachment_path text default null)
returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); display text; message_id uuid; object_mime text; object_size bigint; clean text:=coalesce(post_body,'');
begin
 if not public.react_mentor_community_member() then raise exception 'Membership required' using errcode='42501'; end if;
 if post_kind not in ('text','code','image','video') then raise exception 'Invalid kind' using errcode='22023'; end if;
 if post_kind in ('text','code') then clean:=btrim(clean); end if;
 if (post_kind='text' and char_length(clean) not between 1 and 2000)
 or (post_kind='code' and char_length(clean) not between 1 and 8000)
 or (post_kind in ('image','video') and char_length(clean)>2000)
 or (post_code_language is not null and (post_kind<>'code' or post_code_language !~ '^[a-z0-9+#-]{1,20}$')) then
  raise exception 'Invalid message' using errcode='22023';
 end if;
 if post_kind in ('image','video') then
  if post_attachment_path is null or post_attachment_path !~ ('^'||uid::text||'/[0-9a-f-]{36}\.(jpg|png|webp|mp4|webm)$') then
   raise exception 'Invalid attachment' using errcode='22023';
  end if;
  select o.metadata->>'mimetype',(o.metadata->>'size')::bigint into object_mime,object_size
  from storage.objects o where o.bucket_id='community-media' and o.name=post_attachment_path and o.owner_id=uid::text;
  if object_mime is null
  or (post_kind='image' and (object_mime not in ('image/jpeg','image/png','image/webp') or object_size>5242880))
  or (post_kind='video' and (object_mime not in ('video/mp4','video/webm') or object_size>26214400))
  or exists(select 1 from public.react_mentor_chat_messages where attachment_path=post_attachment_path) then
   raise exception 'Invalid attachment' using errcode='22023';
  end if;
 elsif post_attachment_path is not null then
  raise exception 'Invalid attachment' using errcode='22023';
 end if;
 perform public.react_mentor_community_rate_check(uid);
 select display_name into display from public.react_mentor_profiles where user_id=uid;
 if display is null then raise exception 'Profile required' using errcode='42501'; end if;
 insert into public.react_mentor_chat_messages(author_id,author_name,body,kind,code_language,attachment_path,attachment_mime)
 values(uid,display,clean,post_kind,post_code_language,post_attachment_path,object_mime)
 returning id into message_id;
 return message_id;
end;
$$;

-- Deletes the caller's own message and returns its attachment path (the API then removes
-- the stored file with the caller's own storage permission).
create or replace function public.react_mentor_delete_message(message_id uuid)
returns text language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); removed_path text; found_id uuid;
begin
 if not public.react_mentor_community_member() then raise exception 'Membership required' using errcode='42501'; end if;
 delete from public.react_mentor_chat_messages where id=message_id and author_id=uid
 returning id,attachment_path into found_id,removed_path;
 if found_id is null then raise exception 'Not found' using errcode='P0002'; end if;
 return removed_path;
end;
$$;

create or replace function public.react_mentor_chat_heartbeat(leaving boolean default false)
returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();
begin
 if not public.react_mentor_community_member() then raise exception 'Membership required' using errcode='42501'; end if;
 if leaving then delete from public.react_mentor_chat_presence where user_id=uid; return; end if;
 insert into public.react_mentor_chat_presence(user_id,last_seen) values(uid,now())
 on conflict(user_id) do update set last_seen=now() where react_mentor_chat_presence.last_seen<now()-interval '15 seconds';
end;
$$;
revoke all on function public.react_mentor_send_message(text),public.react_mentor_chat_heartbeat(boolean),
 public.react_mentor_send_post(text,text,text,text),public.react_mentor_delete_message(uuid) from public,anon;
grant execute on function public.react_mentor_send_message(text),public.react_mentor_chat_heartbeat(boolean),
 public.react_mentor_send_post(text,text,text,text),public.react_mentor_delete_message(uuid) to authenticated;
commit;
