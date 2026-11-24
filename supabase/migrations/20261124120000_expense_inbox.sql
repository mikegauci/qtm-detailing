-- Invoices emailed to finance@ arrive here (via a Resend inbound webhook) and wait
-- for an admin to review them before they become real finance_expenses rows.
create table if not exists public.expense_inbox (
  id uuid primary key default gen_random_uuid(),
  resend_email_id text not null unique,
  from_email text not null,
  subject text not null default '',
  received_at timestamptz not null default now(),
  attachment_paths text[] not null default '{}',
  vendor text,
  invoice_number text,
  invoice_date date,
  amount numeric(10, 2),
  suggested_category text,
  description text,
  ai_notes text,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'dismissed')),
  expense_id uuid references public.finance_expenses (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint expense_inbox_attachment_paths_max check (cardinality(attachment_paths) <= 10)
);

create index if not exists expense_inbox_status_idx
  on public.expense_inbox (status, received_at desc);

alter table public.expense_inbox enable row level security;

drop policy if exists "Admins manage expense inbox" on public.expense_inbox;
create policy "Admins manage expense inbox" on public.expense_inbox
  for all
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));
