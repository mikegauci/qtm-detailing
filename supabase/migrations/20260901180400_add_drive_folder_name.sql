ALTER TABLE public.job_photos
  ADD COLUMN IF NOT EXISTS drive_folder_name text;
