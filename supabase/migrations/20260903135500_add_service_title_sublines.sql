-- Add title sublines for multi-option services.

UPDATE public.services
SET title_subline = '(Clean / Clean + Protection)'
WHERE slug = 'engine-bay-detail';

UPDATE public.services
SET title_subline = '(1-Year & 3-Year ceramic options)'
WHERE slug = 'signature-detail';
