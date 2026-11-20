-- Server-only immutable course release objects. No account/progress/billing tables change.
-- This migration never changes an existing bucket's settings: a public collision requires
-- operator review. Service-role access stays on trusted servers, never in browser clients.
begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('devatlas-course-content','devatlas-course-content',false,16777216,
  array['application/json','application/octet-stream'])
on conflict(id) do nothing;

do $$
begin
  if exists(select 1 from storage.buckets where id='devatlas-course-content' and public is distinct from false) then
    raise exception 'Existing devatlas-course-content bucket is public; operator review required';
  end if;
end;
$$;

-- Restrictive policy also prevents an unrelated broad permissive policy from exposing
-- this private bucket. Other buckets keep their existing policies and behavior.
drop policy if exists "devatlas courses server only" on storage.objects;
create policy "devatlas courses server only" on storage.objects
  as restrictive for all to anon,authenticated
  using(bucket_id <> 'devatlas-course-content')
  with check(bucket_id <> 'devatlas-course-content');
commit;
