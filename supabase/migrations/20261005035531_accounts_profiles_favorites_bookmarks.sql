-- Profiles: one per auth user, private by default.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 60),
  handle text unique check (handle ~ '^[a-z0-9][a-z0-9-]{2,29}$'),
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- A public profile needs a handle to be addressable at /u/[handle].
  constraint public_profile_requires_handle check (not is_public or handle is not null)
);

-- Saved events and vendor bookmarks, scoped per show year so each Celebration starts clean.
create table public.favorites (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  show_year smallint not null check (show_year between 2023 and 2100),
  event_id text not null check (char_length(event_id) between 1 and 64),
  created_at timestamptz not null default now(),
  primary key (user_id, show_year, event_id)
);

create table public.vendor_bookmarks (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  show_year smallint not null check (show_year between 2023 and 2100),
  vendor_id text not null check (char_length(vendor_id) between 1 and 64),
  created_at timestamptz not null default now(),
  primary key (user_id, show_year, vendor_id)
);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.favorites enable row level security;
alter table public.vendor_bookmarks enable row level security;

create policy "Users read their own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "Anyone reads public profiles" on public.profiles
  for select to anon, authenticated using (is_public);
create policy "Users update their own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Users read their own favorites" on public.favorites
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Anyone reads favorites of public profiles" on public.favorites
  for select to anon, authenticated
  using (exists (select 1 from public.profiles p where p.id = favorites.user_id and p.is_public));
create policy "Users add their own favorites" on public.favorites
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users remove their own favorites" on public.favorites
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users read their own vendor bookmarks" on public.vendor_bookmarks
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users add their own vendor bookmarks" on public.vendor_bookmarks
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users remove their own vendor bookmarks" on public.vendor_bookmarks
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Explicit grants (RLS still decides which rows). Profiles are created by trigger, never by clients.
grant select on public.profiles to anon, authenticated;
grant update (display_name, handle, is_public) on public.profiles to authenticated;
grant select on public.favorites to anon, authenticated;
grant insert, delete on public.favorites to authenticated;
grant select, insert, delete on public.vendor_bookmarks to authenticated;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

-- Create a profile for every new user, seeding the name from the OAuth provider when present.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'user_name'), 60)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Cap rows per user per show so a buggy or abusive client can't grow tables without bound.
create function public.enforce_saved_item_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  existing integer;
begin
  execute format('select count(*) from %I.%I where user_id = $1 and show_year = $2', tg_table_schema, tg_table_name)
    into existing
    using new.user_id, new.show_year;
  if existing >= 2000 then
    raise exception 'Saved item limit reached' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger favorites_limit before insert on public.favorites
  for each row execute function public.enforce_saved_item_limit();
create trigger vendor_bookmarks_limit before insert on public.vendor_bookmarks
  for each row execute function public.enforce_saved_item_limit();

-- Cheap query for the keep-alive cron (free-tier projects pause after 7 idle days).
create function public.ping()
returns timestamptz
language sql
stable
set search_path = ''
as $$ select now() $$;

revoke execute on function public.ping() from public;
grant execute on function public.ping() to anon;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.enforce_saved_item_limit() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
