-- Align package feature bullets with bundle service definitions.

UPDATE public.packages
SET features = ARRAY[
  'Premium Interior Deep Clean',
  'Exterior Detail'
]
WHERE name = 'Complete Detail';

UPDATE public.packages
SET features = ARRAY[
  'Paint Enhancement',
  'Exterior Detail',
  'Premium Interior Deep Clean'
]
WHERE name = 'Complete Paint Enhancement';

UPDATE public.packages
SET features = ARRAY[
  'Paint Enhancement',
  'Exterior Detail',
  'Premium Interior Deep Clean',
  '1-Year Ceramic Paint Protection'
]
WHERE name = 'Signature Detail';

UPDATE public.packages
SET features = ARRAY[
  'Paint Enhancement',
  'Exterior Detail',
  'Premium Interior Deep Clean',
  '1-Year Ceramic Paint Protection',
  'Exterior Glass Ceramic Coating'
]
WHERE name = 'Signature Detail + Glass';
