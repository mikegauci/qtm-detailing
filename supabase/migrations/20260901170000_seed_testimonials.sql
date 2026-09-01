-- Seed default testimonials (migrated from static content)
INSERT INTO public.reviews (customer_name, vehicle, comment, rating, is_published)
SELECT * FROM (VALUES
  (
    'Simon Cutajar',
    'BMW 420D',
    'Absolutely blown away by the paint correction. Swirls I had for years are completely gone. QTM Detailing treated my car like their own.',
    5,
    true
  ),
  (
    'Roberta Gauci Attard',
    'Audi A1',
    'The ceramic coating has made washing so easy. Water just beads off. Professional team and spotless workshop.',
    5,
    true
  ),
  (
    'Vince Bartolo',
    'VW T-Roc',
    'Great detailing experience in Malta. Attention to detail is unmatched — interior smells brand new and paint depth is incredible.',
    5,
    true
  ),
  (
    'Erika Zammit Martins',
    'Toyota C-HR',
    'Booked the Signature package for my daily. Car looked better than when I collected it from the dealer.',
    5,
    true
  )
) AS v(customer_name, vehicle, comment, rating, is_published)
WHERE NOT EXISTS (SELECT 1 FROM public.reviews LIMIT 1);
