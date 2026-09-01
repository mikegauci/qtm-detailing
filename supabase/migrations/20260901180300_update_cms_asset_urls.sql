-- Point services and page sections at Supabase Storage URLs after cms-assets migration

UPDATE public.services SET image_url = 'https://lfjzalbrmiizkkfkiiwm.supabase.co/storage/v1/object/public/cms-assets/services/premium-interior-deep-clean.jpg' WHERE slug = 'premium-interior-deep-clean';
UPDATE public.services SET image_url = 'https://lfjzalbrmiizkkfkiiwm.supabase.co/storage/v1/object/public/cms-assets/services/exterior-detail.jpg' WHERE slug = 'exterior-detail';
UPDATE public.services SET image_url = 'https://lfjzalbrmiizkkfkiiwm.supabase.co/storage/v1/object/public/cms-assets/services/complete-detail.jpg' WHERE slug = 'complete-detail';
UPDATE public.services SET image_url = 'https://lfjzalbrmiizkkfkiiwm.supabase.co/storage/v1/object/public/cms-assets/services/paint-enhancement.jpg' WHERE slug = 'paint-enhancement';
UPDATE public.services SET image_url = 'https://lfjzalbrmiizkkfkiiwm.supabase.co/storage/v1/object/public/cms-assets/services/complete-paint-enhancement.jpg' WHERE slug = 'complete-paint-enhancement';
UPDATE public.services SET image_url = 'https://lfjzalbrmiizkkfkiiwm.supabase.co/storage/v1/object/public/cms-assets/services/premium-wax-protection.jpg' WHERE slug = 'premium-wax-protection';
UPDATE public.services SET image_url = 'https://lfjzalbrmiizkkfkiiwm.supabase.co/storage/v1/object/public/cms-assets/services/ceramic-paint-protection.jpg' WHERE slug = 'ceramic-paint-protection';
UPDATE public.services SET image_url = 'https://lfjzalbrmiizkkfkiiwm.supabase.co/storage/v1/object/public/cms-assets/services/exterior-glass-ceramic.jpg' WHERE slug = 'exterior-glass-ceramic';
UPDATE public.services SET image_url = 'https://lfjzalbrmiizkkfkiiwm.supabase.co/storage/v1/object/public/cms-assets/services/engine-bay-detail.jpg' WHERE slug = 'engine-bay-detail';
UPDATE public.services SET image_url = 'https://lfjzalbrmiizkkfkiiwm.supabase.co/storage/v1/object/public/cms-assets/services/signature-detail.jpg' WHERE slug = 'signature-detail';
UPDATE public.services SET image_url = 'https://lfjzalbrmiizkkfkiiwm.supabase.co/storage/v1/object/public/cms-assets/services/signature-detail-glass-protection.jpg' WHERE slug = 'signature-detail-glass-protection';

UPDATE public.page_sections
SET content = jsonb_set(
  jsonb_set(
    content,
    '{mobileImage}',
    '"https://lfjzalbrmiizkkfkiiwm.supabase.co/storage/v1/object/public/cms-assets/about/about-page-mobile.jpg"'
  ),
  '{desktopImage}',
  '"https://lfjzalbrmiizkkfkiiwm.supabase.co/storage/v1/object/public/cms-assets/about/about-page.jpg"'
)
WHERE page_key = 'about' AND section_key = 'intro';

UPDATE public.page_sections
SET content = jsonb_set(
  jsonb_set(
    content,
    '{mobileImage}',
    '"https://lfjzalbrmiizkkfkiiwm.supabase.co/storage/v1/object/public/cms-assets/hero/hero-mobile.jpg"'
  ),
  '{desktopImage}',
  '"https://lfjzalbrmiizkkfkiiwm.supabase.co/storage/v1/object/public/cms-assets/hero/hero-desktop.jpg"'
)
WHERE page_key = 'home' AND section_key = 'hero';
