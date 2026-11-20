-- Allow up to 10 attachments per expense. invoice_path is kept (unused) so the
-- currently deployed build keeps working until this change ships; drop it later.
alter table public.finance_expenses
  add column if not exists invoice_paths text[] not null default '{}';

update public.finance_expenses
set invoice_paths = array[invoice_path]
where invoice_path is not null and cardinality(invoice_paths) = 0;

alter table public.finance_expenses
  drop constraint if exists finance_expenses_invoice_paths_max;
alter table public.finance_expenses
  add constraint finance_expenses_invoice_paths_max check (cardinality(invoice_paths) <= 10);
