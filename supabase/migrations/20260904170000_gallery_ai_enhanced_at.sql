ALTER TABLE public.gallery_photos
  ADD COLUMN IF NOT EXISTS ai_enhanced_at timestamptz;

COMMENT ON COLUMN public.gallery_photos.ai_enhanced_at IS
  'Set when the published image was processed with OpenAI (enhance and/or blank plate).';
