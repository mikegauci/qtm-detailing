-- Remove temporary anon upload policies after migration

DROP POLICY IF EXISTS "Temp anon upload cms assets" ON storage.objects;
DROP POLICY IF EXISTS "Temp anon update cms assets" ON storage.objects;
