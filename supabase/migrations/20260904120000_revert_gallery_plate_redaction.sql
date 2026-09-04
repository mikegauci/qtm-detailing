-- Revert manual license plate redaction columns.
ALTER TABLE public.gallery_photos
  DROP COLUMN IF EXISTS plate_redactions,
  DROP COLUMN IF EXISTS plates_redacted,
  DROP COLUMN IF EXISTS plate_review_needed;
