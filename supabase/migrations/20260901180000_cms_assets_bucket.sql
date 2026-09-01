-- CMS-managed marketing images (services, hero, about page)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cms-assets',
  'cms-assets',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Public read cms assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'cms-assets');

CREATE POLICY "Admins insert cms assets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'cms-assets'
  AND has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins update cms assets"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'cms-assets' AND has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'cms-assets' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete cms assets"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'cms-assets' AND has_role(auth.uid(), 'admin'));
