create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  vehicle text,
  service_interest text,
  message text,
  source text default 'website'
);

alter table public.leads enable row level security;

create policy "anon can submit leads"
  on public.leads
  for insert
  to anon
  with check (true);
