-- One permissive SELECT policy per role, so each read evaluates a single policy.
drop policy "Users read their own profile" on public.profiles;
drop policy "Anyone reads public profiles" on public.profiles;
create policy "Read own or public profiles" on public.profiles
  for select to authenticated using ((select auth.uid()) = id or is_public);
create policy "Read public profiles" on public.profiles
  for select to anon using (is_public);

drop policy "Users read their own favorites" on public.favorites;
drop policy "Anyone reads favorites of public profiles" on public.favorites;
create policy "Read own or public favorites" on public.favorites
  for select to authenticated
  using (
    (select auth.uid()) = user_id
    or exists (select 1 from public.profiles p where p.id = favorites.user_id and p.is_public)
  );
create policy "Read public favorites" on public.favorites
  for select to anon
  using (exists (select 1 from public.profiles p where p.id = favorites.user_id and p.is_public));
