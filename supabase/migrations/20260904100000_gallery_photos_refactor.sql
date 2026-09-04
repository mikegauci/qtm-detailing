-- Gallery photos are standalone content, not tied to bookings/customers.
ALTER TABLE public.job_photos RENAME TO gallery_photos;

ALTER TABLE public.gallery_photos
  DROP COLUMN booking_id,
  DROP COLUMN title,
  DROP COLUMN description;

DROP POLICY IF EXISTS "Admins can view all photos" ON public.gallery_photos;
DROP POLICY IF EXISTS "Admins delete job photos" ON public.gallery_photos;
DROP POLICY IF EXISTS "Admins insert job photos" ON public.gallery_photos;
DROP POLICY IF EXISTS "Admins update job photos" ON public.gallery_photos;
DROP POLICY IF EXISTS "Published photos are public" ON public.gallery_photos;
DROP POLICY IF EXISTS "Job photos public read" ON public.gallery_photos;
DROP POLICY IF EXISTS "Admins manage job photos" ON public.gallery_photos;

CREATE POLICY "Gallery photos public read" ON public.gallery_photos
  FOR SELECT USING (publish_to_gallery = true);

CREATE POLICY "Admins manage gallery photos" ON public.gallery_photos
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Unused add-ons feature, never built.
DROP TABLE IF EXISTS public.booking_addons;
DROP TABLE IF EXISTS public.protection_addons;

-- Storage policies for the new gallery-photos bucket.
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-photos', 'gallery-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read published gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete job photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins read job photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload job photos" ON storage.objects;

CREATE POLICY "Public read gallery photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery-photos');

CREATE POLICY "Admins manage gallery photo objects" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'gallery-photos' AND has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'gallery-photos' AND has_role(auth.uid(), 'admin'));
