-- Temporary policy for one-time public asset migration script.
-- Remove after running: node scripts/migrate-cms-assets.mjs

CREATE POLICY "Temp anon upload cms assets"
ON storage.objects FOR INSERT TO anon
WITH CHECK (bucket_id = 'cms-assets');

CREATE POLICY "Temp anon update cms assets"
ON storage.objects FOR UPDATE TO anon
USING (bucket_id = 'cms-assets')
WITH CHECK (bucket_id = 'cms-assets');
