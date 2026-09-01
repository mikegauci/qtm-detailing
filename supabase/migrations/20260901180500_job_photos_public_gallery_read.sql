-- Allow public read access to published gallery images in the job-photos bucket.
CREATE POLICY "Public read published gallery images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'job-photos'
  AND (storage.foldername(name))[1] = 'gallery'
);

-- Public URLs (/object/public/...) only work when the bucket is public.
UPDATE storage.buckets
SET public = true
WHERE name = 'job-photos';
