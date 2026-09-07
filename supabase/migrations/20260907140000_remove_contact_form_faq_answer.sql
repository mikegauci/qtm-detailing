UPDATE faqs
SET answer = 'Message us on WhatsApp with your vehicle details and preferred service for the fastest response. We''ll respond within 24 hours with availability and a personalised quote.'
WHERE question = 'How do I book an appointment?'
  AND answer LIKE '%contact form%';

UPDATE page_sections
SET content = jsonb_set(
  content,
  '{description}',
  '"Tell us about your vehicle and the services you''re interested in. WhatsApp is the fastest way to reach us. We''ll get back within 24 hours."'::jsonb
),
updated_at = now()
WHERE page_key = 'contact'
  AND section_key = 'hero'
  AND content->>'description' LIKE '%form below%';
