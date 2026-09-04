-- Date-range bookings no longer use time-slot overlap; drop the old constraint.
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_no_overlap;

-- End date must not precede start date.
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_end_date_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_end_date_check
  CHECK (end_date IS NULL OR end_date >= booking_date);

-- Revert converted leads whose customer no longer exists (email or phone match).
UPDATE public.leads l
SET status = 'contacted'
WHERE l.status = 'converted'
  AND NOT EXISTS (
    SELECT 1
    FROM public.customers c
    WHERE (l.email IS NOT NULL AND c.email = l.email)
       OR (l.phone IS NOT NULL AND c.phone = l.phone)
  );
