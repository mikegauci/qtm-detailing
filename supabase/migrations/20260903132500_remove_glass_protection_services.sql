-- Remove deprecated glass protection services, package, and comparison feature.

DELETE FROM public.packages
WHERE name = 'Signature Detail + Glass';

DELETE FROM public.comparison_features
WHERE label = 'Exterior Glass Ceramic Coating';

DELETE FROM public.services
WHERE slug IN ('exterior-glass-ceramic', 'signature-detail-glass-protection');

UPDATE public.packages
SET includes = '[true, true, false, false]'::jsonb
WHERE name = 'Complete Detail';

UPDATE public.packages
SET includes = '[true, true, true, false]'::jsonb
WHERE name = 'Complete Paint Enhancement';

UPDATE public.packages
SET includes = '[true, true, true, true]'::jsonb
WHERE name = 'Signature Detail';

UPDATE public.services SET sort_order = 7 WHERE slug = 'engine-bay-detail';
UPDATE public.services SET sort_order = 8 WHERE slug = 'signature-detail';
