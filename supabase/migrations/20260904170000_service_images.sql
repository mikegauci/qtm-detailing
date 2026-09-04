-- Service multi-photo support with vertical focal point
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS images jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.services
SET images = jsonb_build_array(
  jsonb_build_object('url', image_url, 'focalY', 50)
)
WHERE image_url IS NOT NULL
  AND image_url != ''
  AND images = '[]'::jsonb;
