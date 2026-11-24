-- Expenses Max pays for alone (e.g. equipment) stay in the books but are not
-- deducted from the profit split with Mike. Utilities ignore this flag.
alter table public.finance_expenses
  add column if not exists shared boolean not null default true;

-- The AI's guess for emailed invoices (false = looks like Max-only equipment).
alter table public.expense_inbox
  add column if not exists suggested_shared boolean not null default true;
