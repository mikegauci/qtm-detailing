-- Replace time-based scheduling with start/end dates
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS end_date date;

UPDATE public.bookings
SET end_date = booking_date
WHERE end_date IS NULL;

ALTER TABLE public.bookings
  ALTER COLUMN end_date SET DEFAULT CURRENT_DATE;
