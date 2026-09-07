-- Pricing CMS tables

CREATE TABLE IF NOT EXISTS public.pricing_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  heading text,
  intro text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pricing_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.pricing_sections(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  tiers jsonb NOT NULL DEFAULT '[]',
  includes text[] NOT NULL DEFAULT '{}',
  note text,
  warning text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(section_id, slug)
);

ALTER TABLE public.pricing_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pricing sections public read" ON public.pricing_sections
  FOR SELECT USING (true);
CREATE POLICY "Admins manage pricing sections" ON public.pricing_sections
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Pricing items public read" ON public.pricing_items
  FOR SELECT USING (true);
CREATE POLICY "Admins manage pricing items" ON public.pricing_items
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Seed page_sections for pricing hero and important info
INSERT INTO public.page_sections (page_key, section_key, content)
VALUES
  (
    'pricing',
    'hero',
    '{
      "eyebrow": "Premium Detailing Services & Pricing",
      "title": "Starting rates by vehicle size",
      "description": "Professional detailing tailored to your vehicle''s size, condition, materials and individual requirements."
    }'::jsonb
  ),
  (
    'pricing',
    'important-info',
    '{
      "eyebrow": "Pricing",
      "title": "Important Pricing Information",
      "paragraphs": [
        "All prices shown are starting prices and are based on the vehicle''s size, condition and individual requirements.",
        "Vehicle size classifications may vary depending on the vehicle''s overall dimensions and type.",
        "Vehicles requiring additional labour due to:"
      ],
      "bullets": [
        "Heavy contamination",
        "Severe paint defects",
        "Excessive soiling",
        "Heavy staining",
        "Pet hair",
        "Strong odours",
        "Excessive dirt",
        "Specialist treatment"
      ],
      "closingParagraphs": [
        "may incur an additional charge.",
        "Classic, vintage and older vehicles, as well as vehicles with delicate or sensitive materials, will be assessed individually and treated using the most appropriate products and techniques.",
        "Any additional work or costs will always be discussed and agreed with the customer before work begins.",
        "For a personalised quotation, please send us your vehicle make, model and a few clear photos of its current condition."
      ],
      "ctaLabel": "Request a Quote",
      "ctaHref": "https://wa.me/message/ACBWHSZMFJGVE1"
    }'::jsonb
  )
ON CONFLICT (page_key, section_key) DO NOTHING;

-- Seed pricing sections
INSERT INTO public.pricing_sections (slug, heading, intro, sort_order)
VALUES
  ('core-detailing', 'Core Detailing', NULL, 0),
  ('paintwork', 'Paintwork', NULL, 1),
  (
    'protection',
    'Protection',
    'Our ceramic coating packages include extensive preparation and paint correction before protection is applied.',
    2
  ),
  ('specialist', 'Specialist Service', NULL, 3),
  (
    'signature',
    'Signature Detail',
    'Includes Premium Interior Deep Clean, full paint correction, ceramic coating, wheel protection, front and rear windscreen protection, and panoramic roof protection where applicable.',
    4
  )
ON CONFLICT (slug) DO NOTHING;

-- Seed pricing items
INSERT INTO public.pricing_items (section_id, slug, title, description, tiers, includes, note, warning, sort_order)
SELECT s.id, v.slug, v.title, v.description, v.tiers, v.includes, v.note, v.warning, v.sort_order
FROM public.pricing_sections s
CROSS JOIN (
  VALUES
    (
      'core-detailing',
      'interior-deep-clean',
      'Premium Interior Deep Clean',
      'A professional deep clean tailored to your vehicle''s interior materials, age and condition.',
      '[{"label":"Small (S)","price":160},{"label":"Medium (M)","price":205},{"label":"Large (L)","price":250}]'::jsonb,
      ARRAY[
        'Thorough interior vacuum',
        'Deep cleaning of carpets & floor areas',
        'Upholstery cleaning where appropriate',
        'Plastics & interior trim cleaning & treatment',
        'Leather cleaning & conditioning where applicable',
        'Steam cleaning where suitable',
        'Detailed finishing'
      ],
      'Includes a complimentary basic exterior wash, ensuring your vehicle leaves looking fresh inside and out.',
      'Vehicles with excessive soiling, heavy staining, pet hair, strong odours or requiring specialist treatment may require additional time and incur an additional charge.',
      0
    ),
    (
      'core-detailing',
      'exterior-detail',
      'Exterior Detail',
      'A thorough exterior clean designed to safely refresh and maintain your vehicle''s appearance.',
      '[{"label":"Small (S)","price":150},{"label":"Medium (M)","price":175},{"label":"Large (L)","price":200}]'::jsonb,
      ARRAY[
        'Safe pre-wash',
        'Professional hand wash',
        'Deep wheel & rim cleaning',
        'Wheel arches & under-arches',
        'Exterior cleaning',
        'Exterior detailing & finishing'
      ],
      NULL,
      NULL,
      1
    ),
    (
      'core-detailing',
      'complete-detail',
      'Complete Detail',
      'The complete inside-and-out refresh.',
      '[{"label":"Small (S)","price":290},{"label":"Medium (M)","price":360},{"label":"Large (L)","price":430}]'::jsonb,
      ARRAY['Premium Interior Deep Clean', 'Exterior Detail'],
      'Ideal for customers wanting their entire vehicle professionally cleaned and refreshed.',
      NULL,
      2
    ),
    (
      'paintwork',
      'paint-enhancement',
      'Paint Enhancement',
      'A more intensive exterior treatment designed to improve gloss, clarity and the overall appearance of the paintwork.',
      '[{"label":"Small (S)","price":450},{"label":"Medium (M)","price":675},{"label":"Large (L)","price":900}]'::jsonb,
      ARRAY[
        'Safe pre-wash & hand wash',
        'Deep wheel & rim cleaning',
        'Wheel arches & under-arches',
        'Iron fallout removal',
        'Tar removal',
        'Clay bar treatment',
        'Machine paint enhancement',
        'Professional finishing'
      ],
      NULL,
      'Paint condition varies significantly between vehicles. Heavily scratched, oxidised or neglected paintwork requiring additional correction will be assessed individually and quoted accordingly.',
      0
    ),
    (
      'paintwork',
      'complete-paint-enhancement',
      'Complete Paint Enhancement',
      'The complete inside-and-out paint and interior treatment.',
      '[{"label":"Small (S)","price":600},{"label":"Medium (M)","price":830},{"label":"Large (L)","price":1100}]'::jsonb,
      ARRAY['Paint Enhancement', 'Premium Interior Deep Clean'],
      NULL,
      NULL,
      1
    ),
    (
      'protection',
      'premium-wax-protection',
      'Premium Wax Protection',
      'Applied following suitable paint preparation.',
      '[{"label":"From","price":150}]'::jsonb,
      ARRAY[]::text[],
      NULL,
      NULL,
      0
    ),
    (
      'protection',
      'ceramic-1-year',
      '1-Year Ceramic Coating',
      '',
      '[{"label":"Extra Small (XS)","price":750},{"label":"Small (S)","price":950},{"label":"Medium (M)","price":1150},{"label":"Large (L)","price":1250}]'::jsonb,
      ARRAY[
        'Full paint correction',
        'Wheel protection',
        'Front windscreen ceramic protection',
        'Rear windscreen ceramic protection',
        'Panoramic roof ceramic protection, where applicable',
        '1-Year Ceramic Paint Protection'
      ],
      NULL,
      NULL,
      1
    ),
    (
      'protection',
      'ceramic-3-year',
      '3-Year Ceramic Coating',
      '',
      '[{"label":"Extra Small (XS)","price":900},{"label":"Small (S)","price":1100},{"label":"Medium (M)","price":1300},{"label":"Large (L)","price":1400}]'::jsonb,
      ARRAY[
        'Full paint correction',
        'Wheel protection',
        'Front windscreen ceramic protection',
        'Rear windscreen ceramic protection',
        'Panoramic roof ceramic protection, where applicable',
        '3-Year Ceramic Paint Protection'
      ],
      NULL,
      NULL,
      2
    ),
    (
      'protection',
      'side-window-ceramic',
      'Optional Side Window Ceramic Protection',
      'Side windows can be protected as an additional service.',
      '[{"label":"Per side window","price":40},{"label":"All 4 side windows","price":160}]'::jsonb,
      ARRAY[]::text[],
      NULL,
      NULL,
      3
    ),
    (
      'specialist',
      'engine-bay-clean',
      'Engine Bay Detail — Clean',
      'A careful engine bay treatment using appropriate products and techniques around sensitive components.',
      '[{"label":"From","price":89}]'::jsonb,
      ARRAY[
        'Safe cleaning of the engine bay',
        'Removal of dirt, dust and built-up grime',
        'Cleaning of accessible areas and components',
        'Careful treatment around sensitive areas',
        'Detailed finishing'
      ],
      NULL,
      NULL,
      0
    ),
    (
      'specialist',
      'engine-bay-clean-protection',
      'Engine Bay Detail — Clean + Protection',
      'Everything included in the Engine Bay Detail clean, plus:',
      '[{"label":"From","price":110}]'::jsonb,
      ARRAY[
        'Protective coating applied to suitable surfaces',
        'Enhanced appearance and finish',
        'Additional protection to help maintain treated surfaces'
      ],
      NULL,
      NULL,
      1
    ),
    (
      'signature',
      'signature-detail-1-year',
      'Signature Detail — 1-Year Ceramic',
      '',
      '[{"label":"Extra Small (XS)","price":860},{"label":"Small (S)","price":1060},{"label":"Medium (M)","price":1305},{"label":"Large (L)","price":1450}]'::jsonb,
      ARRAY[]::text[],
      NULL,
      NULL,
      0
    ),
    (
      'signature',
      'signature-detail-3-year',
      'Signature Detail — 3-Year Ceramic',
      '',
      '[{"label":"Extra Small (XS)","price":1010},{"label":"Small (S)","price":1210},{"label":"Medium (M)","price":1455},{"label":"Large (L)","price":1600}]'::jsonb,
      ARRAY[]::text[],
      NULL,
      NULL,
      1
    )
) AS v(section_slug, slug, title, description, tiers, includes, note, warning, sort_order)
WHERE s.slug = v.section_slug
ON CONFLICT (section_id, slug) DO NOTHING;
