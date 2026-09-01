-- Seed all page section content for full CMS (idempotent upsert)

INSERT INTO page_sections (page_key, section_key, content, updated_at)
VALUES
  (
    'home',
    'featured-services',
    '{"eyebrow":"Our Services","title":"Precision detailing, tailored to you","description":"From daily drivers to supercars, every vehicle receives the same obsessive attention to detail."}'::jsonb,
    now()
  ),
  (
    'services',
    'hero',
    '{"eyebrow":"Premium Detailing Services","title":"Every detail, perfected","description":"Professional automotive detailing services tailored to your vehicle''s needs."}'::jsonb,
    now()
  ),
  (
    'services',
    'packages-heading',
    '{"eyebrow":"Packages","title":"Bundle and save","description":"Our packages combine the most popular services at a better value."}'::jsonb,
    now()
  ),
  (
    'services',
    'faq-heading',
    '{"eyebrow":"FAQ","title":"Common questions","description":"Everything you need to know before booking."}'::jsonb,
    now()
  ),
  (
    'services',
    'paint-protection-intro',
    '{"heading":"Paint Protection","intro":"Protection can be added to any suitable Paint Enhancement service."}'::jsonb,
    now()
  ),
  (
    'services',
    'pricing-info',
    '{"title":"Important Pricing Information","paragraphs":["Pricing varies depending on vehicle size, condition and individual requirements.","Vehicles requiring additional labour due to heavy contamination, severe paint defects, excessive soiling, staining, pet hair, odours or specialist treatment may incur an additional charge.","Classic, vintage and older vehicles, as well as vehicles with delicate or sensitive materials, will be assessed individually and treated using appropriate products and techniques.","Any additional costs will always be discussed and agreed with the customer before work begins.","Message us for a personalised quotation for your vehicle."]}'::jsonb,
    now()
  ),
  (
    'about',
    'intro',
    '{"eyebrow":"About QTM Detailing","title":"Passion for perfection","description":"Founded with a simple mission: deliver showroom-grade results that last. Every vehicle that enters our studio receives the same obsessive attention, whether it''s a daily commuter or a weekend supercar.","mission":"QTM stands for Quad Tang Muto, meaning \"What I touch, I change.\" Our team combines years of experience in automotive care with continuous training on the latest products and techniques. We believe detailing is a craft, and your car deserves nothing less than mastery.","mobileImage":"/about-page-mobile.jpg","desktopImage":"/about-page.jpg"}'::jsonb,
    now()
  ),
  (
    'about',
    'process-steps',
    '{"eyebrow":"Our Process","title":"Four steps to showroom finish","description":"A transparent, repeatable process that delivers consistent results every time.","steps":[{"step":"01","title":"Consultation","description":"We inspect your vehicle, discuss your goals, and recommend the right services for your budget and timeline."},{"step":"02","title":"Preparation","description":"Thorough wash, decontamination, and paint depth measurement ensure we start with a clean, assessed surface."},{"step":"03","title":"Treatment","description":"Our technicians apply correction, coating, or interior services using studio-grade equipment and premium products."},{"step":"04","title":"Inspection","description":"Final quality check under dedicated lighting. We walk you through the results and provide aftercare guidance."}]}'::jsonb,
    now()
  ),
  (
    'about',
    'equipment',
    '{"eyebrow":"Equipment","title":"Studio-grade tools","description":"We invest in professional equipment and premium products so your results speak for themselves.","items":["Rupes & Flex polishers","Gyeon & Koch Chemie products","Paint depth gauges & IR curing","Climate-controlled studio"]}'::jsonb,
    now()
  ),
  (
    'contact',
    'hero',
    '{"eyebrow":"Contact","title":"Request a quote","description":"Tell us about your vehicle and the services you''re interested in. WhatsApp is the fastest way to reach us — or use the form below and we''ll get back within 24 hours."}'::jsonb,
    now()
  ),
  (
    'gallery',
    'hero',
    '{"eyebrow":"Gallery","title":"Our latest work","description":"Real transformations straight from our studio. Click any project to view before and after."}'::jsonb,
    now()
  )
ON CONFLICT (page_key, section_key)
DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = now();
