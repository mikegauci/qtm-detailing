-- Vehicle reference photos for customer records
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS storage_path text;
