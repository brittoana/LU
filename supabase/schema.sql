-- Luma — banco multiusuário com isolamento por conta.
-- Execute no Supabase: SQL Editor → New query → cole todo o arquivo → Run.
-- Pode ser executado novamente com segurança em um projeto Luma já inicializado.

-- ─────────────────────────────────────────────────────────────────────────────
-- Tabelas
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Guarda o diagnóstico/formulário inicial completo do usuário em JSONB.
-- O conteúdo inclui salário, outras rendas, despesas fixas, parcelamentos e
-- o resultado calculado pelo Luma.
create table if not exists public.financial_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  type text not null check (type in ('income', 'expense', 'debt')),
  status text not null check (status in ('realized', 'receivable', 'scheduled')),
  amount numeric(14, 2) not null check (amount >= 0),
  category text not null default '',
  description text not null default '',
  account text not null default '',
  date date not null,
  recurring boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists transactions_user_date_idx
  on public.transactions (user_id, date desc);

create table if not exists public.investments (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  kind text,
  amount numeric(14, 2) not null check (amount >= 0),
  invested_at date not null,
  available_at date not null,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists investments_user_idx
  on public.investments (user_id, available_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- Permissões + RLS
-- Cada conta autenticada acessa somente linhas cujo dono é o próprio auth.uid().
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.financial_profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.investments enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.financial_profiles from anon, authenticated;
revoke all on table public.transactions from anon, authenticated;
revoke all on table public.investments from anon, authenticated;

grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.financial_profiles to authenticated;
grant select, insert, update, delete on table public.transactions to authenticated;
grant select, insert, update, delete on table public.investments to authenticated;

-- profiles
drop policy if exists "profiles: own" on public.profiles;
drop policy if exists "profiles: select own" on public.profiles;
drop policy if exists "profiles: insert own" on public.profiles;
drop policy if exists "profiles: update own" on public.profiles;

create policy "profiles: select own"
on public.profiles for select
to authenticated
using ((select auth.uid()) is not null and id = (select auth.uid()));

create policy "profiles: insert own"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) is not null and id = (select auth.uid()));

create policy "profiles: update own"
on public.profiles for update
to authenticated
using ((select auth.uid()) is not null and id = (select auth.uid()))
with check ((select auth.uid()) is not null and id = (select auth.uid()));

-- financial_profiles
drop policy if exists "financial_profiles: own" on public.financial_profiles;
drop policy if exists "financial_profiles: select own" on public.financial_profiles;
drop policy if exists "financial_profiles: insert own" on public.financial_profiles;
drop policy if exists "financial_profiles: update own" on public.financial_profiles;
drop policy if exists "financial_profiles: delete own" on public.financial_profiles;

create policy "financial_profiles: select own"
on public.financial_profiles for select
to authenticated
using ((select auth.uid()) is not null and user_id = (select auth.uid()));

create policy "financial_profiles: insert own"
on public.financial_profiles for insert
to authenticated
with check ((select auth.uid()) is not null and user_id = (select auth.uid()));

create policy "financial_profiles: update own"
on public.financial_profiles for update
to authenticated
using ((select auth.uid()) is not null and user_id = (select auth.uid()))
with check ((select auth.uid()) is not null and user_id = (select auth.uid()));

create policy "financial_profiles: delete own"
on public.financial_profiles for delete
to authenticated
using ((select auth.uid()) is not null and user_id = (select auth.uid()));

-- transactions
drop policy if exists "transactions: own" on public.transactions;
drop policy if exists "transactions: select own" on public.transactions;
drop policy if exists "transactions: insert own" on public.transactions;
drop policy if exists "transactions: update own" on public.transactions;
drop policy if exists "transactions: delete own" on public.transactions;

create policy "transactions: select own"
on public.transactions for select
to authenticated
using ((select auth.uid()) is not null and user_id = (select auth.uid()));

create policy "transactions: insert own"
on public.transactions for insert
to authenticated
with check ((select auth.uid()) is not null and user_id = (select auth.uid()));

create policy "transactions: update own"
on public.transactions for update
to authenticated
using ((select auth.uid()) is not null and user_id = (select auth.uid()))
with check ((select auth.uid()) is not null and user_id = (select auth.uid()));

create policy "transactions: delete own"
on public.transactions for delete
to authenticated
using ((select auth.uid()) is not null and user_id = (select auth.uid()));

-- investments
drop policy if exists "investments: own" on public.investments;
drop policy if exists "investments: select own" on public.investments;
drop policy if exists "investments: insert own" on public.investments;
drop policy if exists "investments: update own" on public.investments;
drop policy if exists "investments: delete own" on public.investments;

create policy "investments: select own"
on public.investments for select
to authenticated
using ((select auth.uid()) is not null and user_id = (select auth.uid()));

create policy "investments: insert own"
on public.investments for insert
to authenticated
with check ((select auth.uid()) is not null and user_id = (select auth.uid()));

create policy "investments: update own"
on public.investments for update
to authenticated
using ((select auth.uid()) is not null and user_id = (select auth.uid()))
with check ((select auth.uid()) is not null and user_id = (select auth.uid()));

create policy "investments: delete own"
on public.investments for delete
to authenticated
using ((select auth.uid()) is not null and user_id = (select auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- Perfil automático no cadastro
-- Função fica em schema não exposto e não pode ser chamada diretamente pelos
-- papéis públicos do Data API.
-- ─────────────────────────────────────────────────────────────────────────────
create schema if not exists private;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- Fotos de perfil
-- O bucket é público somente para leitura da imagem; escrita/alteração/exclusão
-- ficam restritas à pasta cujo nome é o UUID do próprio usuário.
-- ─────────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "avatars: leitura publica" on storage.objects;
create policy "avatars: leitura publica"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'avatars');

drop policy if exists "avatars: enviar propria" on storage.objects;
create policy "avatars: enviar propria"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (select auth.uid()) is not null
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "avatars: atualizar propria" on storage.objects;
create policy "avatars: atualizar propria"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and (select auth.uid()) is not null
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'avatars'
  and (select auth.uid()) is not null
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "avatars: apagar propria" on storage.objects;
create policy "avatars: apagar propria"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (select auth.uid()) is not null
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
