-- Optional invoice lines so one expense can mix split items (supplies) with
-- Max-only items (equipment). Each item: {"description": text, "amount": number, "shared": bool}.
-- When items are present they add up to `amount` and decide the split; otherwise
-- the expense-level `shared` flag does.
alter table public.finance_expenses
  add column if not exists items jsonb not null default '[]'::jsonb;

alter table public.finance_expenses
  drop constraint if exists finance_expenses_items_is_array;
alter table public.finance_expenses
  add constraint finance_expenses_items_is_array check (jsonb_typeof(items) = 'array');

-- The AI's line-by-line reading of an emailed invoice, same shape.
alter table public.expense_inbox
  add column if not exists items jsonb not null default '[]'::jsonb;
