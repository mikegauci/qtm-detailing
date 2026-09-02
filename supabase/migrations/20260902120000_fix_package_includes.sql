-- Align package comparison matrix with bundle service definitions.
-- Paint Enhancement packages also include exterior treatment in the matrix.

UPDATE public.packages
SET includes = '[true, true, false, false, false]'::jsonb
WHERE name = 'Complete Detail';

UPDATE public.packages
SET includes = '[true, true, true, false, false]'::jsonb
WHERE name = 'Complete Paint Enhancement';

UPDATE public.packages
SET includes = '[true, true, true, true, false]'::jsonb
WHERE name = 'Signature Detail';

UPDATE public.packages
SET includes = '[true, true, true, true, true]'::jsonb
WHERE name = 'Signature Detail + Glass';
