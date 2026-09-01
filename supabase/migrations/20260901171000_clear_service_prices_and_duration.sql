-- Services are quote-based; clear stored prices and durations from CMS.
UPDATE public.services
SET
  price = 0,
  price_suv = 0,
  price_van = 0,
  estimated_duration_minutes = 0;
