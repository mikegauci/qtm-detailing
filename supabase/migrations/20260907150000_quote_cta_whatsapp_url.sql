-- Point quote CTAs and WhatsApp contact URL to the WhatsApp message link

UPDATE public.site_settings
SET value = jsonb_set(
  value,
  '{contact,whatsappUrl}',
  '"https://wa.me/message/ACBWHSZMFJGVE1"'
)
WHERE key = 'main';

UPDATE public.page_sections
SET
  content = jsonb_set(
    content,
    '{primaryCta,href}',
    '"https://wa.me/message/ACBWHSZMFJGVE1"'
  ),
  updated_at = now()
WHERE section_key IN ('hero', 'cta-band')
  AND content->'primaryCta'->>'href' = '/contact';
