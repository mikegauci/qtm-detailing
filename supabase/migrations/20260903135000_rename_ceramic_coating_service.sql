-- Rename ceramic coating service and add title subline.

ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS title_subline text;

UPDATE public.services
SET
  name = 'Ceramic Coating Packages',
  title_subline = '(1-Year & 3-Year options)'
WHERE slug = 'ceramic-paint-protection';
