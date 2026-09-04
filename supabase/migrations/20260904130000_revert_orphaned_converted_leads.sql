-- Revert leads stuck as "converted" when their customer no longer exists
UPDATE public.leads l
SET status = 'contacted'
WHERE l.status = 'converted'
  AND NOT EXISTS (
    SELECT 1 FROM public.customers c WHERE c.email = l.email
  );
